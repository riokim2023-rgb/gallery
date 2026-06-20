import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import OpenAI from "openai";

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  }
  return new OpenAI({ apiKey });
};

// Helper to get or create Assistant & Vector Store
async function getOrCreateAssistant(openai: OpenAI, botId: string, botData: any) {
  let { openaiAssistantId, openaiVectorStoreId } = botData;

  const botDocRef = doc(db, "bots", botId);

  // If Vector Store doesn't exist, create it
  if (!openaiVectorStoreId) {
    const vectorStore = await openai.vectorStores.create({
      name: `${botData.name} - Vector Store`,
    });
    openaiVectorStoreId = vectorStore.id;
    await updateDoc(botDocRef, { openaiVectorStoreId });
  }

  // If Assistant doesn't exist, create it
  if (!openaiAssistantId) {
    const assistant = await openai.beta.assistants.create({
      name: botData.name,
      description: botData.description,
      instructions: botData.systemPrompt,
      model: "gpt-4o-mini",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [openaiVectorStoreId],
        },
      },
    });
    openaiAssistantId = assistant.id;
    await updateDoc(botDocRef, { openaiAssistantId });
  }

  return { openaiAssistantId, openaiVectorStoreId };
}

export async function POST(req: NextRequest) {
  try {
    const { docId, botId } = await req.json();

    if (!docId || !botId) {
      return NextResponse.json({ message: "docId와 botId가 필요합니다." }, { status: 400 });
    }

    const openai = getOpenAIClient();

    // 1. Fetch document metadata
    const docRef = doc(db, "documents", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({ message: "문서를 찾을 수 없습니다." }, { status: 404 });
    }
    const docData = docSnap.data();

    // Update status to processing
    await updateDoc(docRef, { status: "processing" });

    // 2. Fetch bot info
    const botRef = doc(db, "bots", botId);
    const botSnap = await getDoc(botRef);
    if (!botSnap.exists()) {
      await updateDoc(docRef, { status: "failed" });
      return NextResponse.json({ message: "챗봇을 찾을 수 없습니다." }, { status: 404 });
    }
    const botData = botSnap.data();

    // 3. Get or create Assistant and Vector Store
    const { openaiVectorStoreId } = await getOrCreateAssistant(openai, botId, botData);

    // 4. Download file from Firebase Storage
    const storageRef = ref(storage, docData.storagePath);
    const downloadUrl = await getDownloadURL(storageRef);
    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) {
      throw new Error("Firebase Storage에서 파일을 다운로드하지 못했습니다.");
    }
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileToUpload: File;
    const fileExt = docData.fileName.split(".").pop()?.toLowerCase();
    const isAudio = ["mp3", "wav", "m4a"].includes(fileExt || "");

    if (isAudio) {
      // Audio File -> STT via Whisper first
      const audioFile = new File([buffer], docData.fileName, { type: fileRes.headers.get("Content-Type") || "audio/mpeg" });
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });

      // Create a virtual text file from transcription
      const textBuffer = Buffer.from(transcription.text);
      const txtFileName = `${docData.fileName.replace(/\.[^/.]+$/, "")}_transcription.txt`;
      fileToUpload = new File([textBuffer], txtFileName, { type: "text/plain" });
    } else {
      // Document File -> upload directly
      fileToUpload = new File([buffer], docData.fileName, { type: fileRes.headers.get("Content-Type") || "application/octet-stream" });
    }

    // 5. Upload file to OpenAI Files API
    const openaiFile = await openai.files.create({
      file: fileToUpload,
      purpose: "assistants",
    });

    // 6. Attach to Vector Store
    await openai.vectorStores.files.create(openaiVectorStoreId, {
      file_id: openaiFile.id,
    });

    // 7. Update document status to indexed
    await updateDoc(docRef, {
      status: "indexed",
      openaiFileId: openaiFile.id,
    });

    // Update analytics document count
    const analyticsRef = doc(db, "analytics", botId);
    const analyticsSnap = await getDoc(analyticsRef);
    if (analyticsSnap.exists()) {
      const currentDocs = analyticsSnap.data().totalDocuments || 0;
      await updateDoc(analyticsRef, {
        totalDocuments: currentDocs + 1,
        lastUsedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, fileId: openaiFile.id });
  } catch (err: any) {
    console.error("Document processing error:", err);
    try {
      const { docId } = await req.json();
      if (docId) {
        await updateDoc(doc(db, "documents", docId), { status: "failed" });
      }
    } catch (_) {}
    return NextResponse.json({ message: err.message || "문서 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { docId, botId } = await req.json();

    if (!docId || !botId) {
      return NextResponse.json({ message: "docId와 botId가 필요합니다." }, { status: 400 });
    }

    const docRef = doc(db, "documents", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({ message: "문서를 찾을 수 없습니다." }, { status: 404 });
    }
    const docData = docSnap.data();

    // If there is an OpenAI File linked, delete it
    if (docData.openaiFileId) {
      try {
        const openai = getOpenAIClient();
        
        // 1. Detach from Vector Store first
        const botSnap = await getDoc(doc(db, "bots", botId));
        if (botSnap.exists() && botSnap.data().openaiVectorStoreId) {
          const vsId = botSnap.data().openaiVectorStoreId;
          await openai.vectorStores.files.del(vsId, docData.openaiFileId);
        }

        // 2. Delete the file from OpenAI
        await openai.files.del(docData.openaiFileId);
      } catch (err) {
        console.error("OpenAI file deletion failed:", err);
      }
    }

    // Update analytics count
    const analyticsRef = doc(db, "analytics", botId);
    const analyticsSnap = await getDoc(analyticsRef);
    if (analyticsSnap.exists()) {
      const currentDocs = analyticsSnap.data().totalDocuments || 0;
      await updateDoc(analyticsRef, {
        totalDocuments: Math.max(0, currentDocs - 1),
        lastUsedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Document deletion cleanup error:", err);
    return NextResponse.json({ message: err.message || "문서 삭제 정리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
