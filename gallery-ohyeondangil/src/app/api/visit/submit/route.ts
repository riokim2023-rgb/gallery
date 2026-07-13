import { NextRequest, NextResponse } from "next/server";
import { saveReservationToNotion } from "@/lib/notion";
import { sendNotification } from "@/lib/notification";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, type, date, time } = await req.json();

    if (!name || !phone || !email || !date || !time) {
      return NextResponse.json(
        { error: "필수 입력 항목(이름, 연락처, 이메일, 날짜, 시간)이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 1. Save reservation entry to Notion Database
    const notionSaved = await saveReservationToNotion({
      name,
      phone,
      email,
      type,
      date,
      time,
    });

    // 2. Construct Discord/Slack real-time notification layout
    const notificationText = `📅 **[새로운 방문 예약 접수]**
• **예약자**: ${name} 님
• **연락처**: ${phone}
• **이메일**: ${email}
• **예약 구분**: ${type}
• **예약 일시**: ${date} | ${time}
• **Notion 저장 상태**: ${notionSaved ? "성공 ✅" : "실패(또는 미설정) ❌"}`;

    // 3. Dispatch the real-time notification
    await sendNotification(notificationText);

    return NextResponse.json({
      success: true,
      notionSaved,
    });
  } catch (error: any) {
    console.error("API route /api/visit/submit error:", error);
    return NextResponse.json(
      { error: error.message || "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
