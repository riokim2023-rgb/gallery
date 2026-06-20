import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  }
  return new OpenAI({ apiKey });
};

export async function POST(req: NextRequest) {
  try {
    const { botId, conversationId, message } = await req.json();

    if (!botId || !conversationId || !message) {
      return NextResponse.json({ message: "botId, conversationId, message가 모두 필요합니다." }, { status: 400 });
    }

    const openai = getOpenAIClient();

    // 1. Fetch bot data
    const botRef = doc(db, "bots", botId);
    const botSnap = await getDoc(botRef);
    if (!botSnap.exists()) {
      return NextResponse.json({ message: "챗봇을 찾을 수 없습니다." }, { status: 404 });
    }
    const botData = botSnap.data();
    const assistantId = botData.openaiAssistantId;

    if (!assistantId) {
      return NextResponse.json({ message: "챗봇 학습이 아직 완료되지 않았습니다. 문서를 업로드해 주세요." }, { status: 400 });
    }

    // 2. Fetch conversation data (or check for existing threadId)
    const convRef = doc(db, "conversations", conversationId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) {
      return NextResponse.json({ message: "대화 세션을 찾을 수 없습니다." }, { status: 404 });
    }
    const convData = convSnap.data();
    let threadId = convData.openaiThreadId;

    // If no thread exists for this conversation, create one
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      await updateDoc(convRef, { openaiThreadId: threadId });
    }

    // 3. Add user message to the OpenAI thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // 4. Run the assistant on the thread
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
      instructions: `지침: ${botData.systemPrompt || ""}\n\n답변 스타일 규정:\n1. 답변 길이 모드: ${
        botData.answerMode === "short"
          ? "3~5문장으로 아주 간략하게 답하세요."
          : botData.answerMode === "deep"
          ? "1000자 이상의 풍부한 분량과 상세 분석 보고서 형식으로 대답하세요."
          : "500자 내외의 일반적인 분량으로 답하세요."
      }\n2. 반드시 업로드된 파일의 문맥(context)을 최우선으로 사용하여 답변해야 합니다.\n3. 파일 내에서 관련 정보를 전혀 찾을 수 없는 경우, 질문에 억지로 답을 지어내거나 추측하지 마세요. 반드시 다음과 같이 고정된 형태로 부드럽게 답변하십시오: "업로드된 자료에서 관련 정보를 찾지 못했습니다."\n4. 질문자가 모르는 내용을 물어보면 절대로 허위 사실을 지어내어 답변하지 마십시오(Hallucination 금지).`,
    });

    if (run.status !== "completed") {
      throw new Error(`OpenAI Run failed with status: ${run.status}`);
    }

    // 5. Retrieve the messages
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = threadMessages.data[0];

    let reply = "";
    if (latestMessage.content[0].type === "text") {
      reply = latestMessage.content[0].text.value;
    }

    // 6. Resolve citations to filenames
    const citations: string[] = [];
    const annotations = latestMessage.content[0].type === "text" ? latestMessage.content[0].text.annotations : [];
    
    if (annotations && annotations.length > 0) {
      // Find matching files from documents collection
      const fileIds = annotations
        .filter((ann: any) => ann.type === "file_citation")
        .map((ann: any) => ann.file_citation.file_id);

      if (fileIds.length > 0) {
        try {
          const docsRef = collection(db, "documents");
          const q = query(docsRef, where("openaiFileId", "in", fileIds));
          const querySnap = await getDocs(q);
          
          querySnap.forEach((doc) => {
            const data = doc.data();
            if (data.fileName && !citations.includes(data.fileName)) {
              citations.push(data.fileName);
            }
          });
        } catch (err) {
          console.error("Citation name lookup failed:", err);
        }
      }
    }

    // 7. Save assistant reply to Firestore messages
    const messageDoc = await addDoc(collection(db, "messages"), {
      conversationId,
      role: "assistant",
      content: reply,
      citations,
      createdAt: serverTimestamp(),
    });

    // 8. Update Analytics
    const analyticsRef = doc(db, "analytics", botId);
    const analyticsSnap = await getDoc(analyticsRef);
    if (analyticsSnap.exists()) {
      const currentQuestions = analyticsSnap.data().totalQuestions || 0;
      await updateDoc(analyticsRef, {
        totalQuestions: currentQuestions + 1,
        lastUsedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({
      messageId: messageDoc.id,
      reply,
      citations,
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ message: err.message || "답변 처리 도중 오류가 발생했습니다." }, { status: 500 });
  }
}
