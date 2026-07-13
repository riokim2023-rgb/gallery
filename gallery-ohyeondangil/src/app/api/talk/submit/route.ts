import { NextRequest, NextResponse } from "next/server";
import { artworks } from "@/lib/artworks";
import { generateDocentResponse } from "@/lib/gemini";
import { saveQuestionToNotion } from "@/lib/notion";
import { sendNotification } from "@/lib/notification";

export async function POST(req: NextRequest) {
  try {
    const { artworkId, question, name, contact, type, interestLevel } = await req.json();

    if (!question || !name || !contact) {
      return NextResponse.json(
        { error: "필수 입력 항목(질문, 성함, 연락처)이 누락되었습니다." },
        { status: 400 }
      );
    }

    // Find the referenced artwork
    const artwork = artworks.find((art) => art.id === Number(artworkId));
    const artworkName = artwork ? artwork.title : "일반 갤러리 문의";
    const artworkArtist = artwork ? artwork.artist : "갤러리 오현단길";
    const artworkMedium = artwork ? artwork.medium : "공간 및 커뮤니티";
    const artworkDescription = artwork ? artwork.description : "갤러리 전반 및 작가 협업에 관한 대화";

    // 1. Generate AI Docent Response
    const aiAnswer = await generateDocentResponse({
      artworkName,
      artworkArtist,
      artworkMedium,
      artworkDescription,
      question,
      visitorName: name,
    });

    // 2. Save entry to Notion Database
    const notionSaved = await saveQuestionToNotion({
      artworkName,
      question,
      aiAnswer,
      name,
      contact,
      type: type || "감상",
      interestLevel: interestLevel || "단순감상",
    });

    // 3. Construct real-time Discord/Slack notification layout
    const notificationText = `🔔 **[새로운 작품 질문 접수]**
• **질문자**: ${name} 님
• **연락처**: ${contact}
• **질문 구분**: ${type || "감상"} (관심도: ${interestLevel || "단순감상"})
• **대상 작품**: ${artworkName} (${artworkArtist})
• **질문 내용**:
> ${question}
• **AI 도슨트 답변**:
> ${aiAnswer}
• **Notion 저장 상태**: ${notionSaved ? "성공 ✅" : "실패(또는 미설정) ❌"}`;

    // 4. Dispatch the real-time notification
    await sendNotification(notificationText);

    return NextResponse.json({
      answer: aiAnswer,
      notionSaved,
    });
  } catch (error: any) {
    console.error("API route /api/talk/submit error:", error);
    return NextResponse.json(
      { error: error.message || "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
