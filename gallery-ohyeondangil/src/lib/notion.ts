/**
 * Notion Integration Library
 * Communicates with the Notion API using raw fetch requests to maintain a zero-dependency, stable build.
 */

interface QuestionData {
  artworkName: string;
  question: string;
  aiAnswer: string;
  name: string;
  contact: string;
  type: string; // '감상' | '구매문의' | '대관문의' | '기타'
  interestLevel: string; // '단순감상' | '관심있음' | '매우관심'
}

interface ReservationData {
  name: string;
  phone: string;
  email: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

/**
 * Saves a visitor's question and the generated AI Docent answer to the Notion Database.
 */
export async function saveQuestionToNotion(data: QuestionData): Promise<boolean> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID_QUESTIONS;

  if (!apiKey || !databaseId || apiKey.includes("your_notion") || databaseId.includes("your_notion")) {
    console.warn("Notion credentials for questions are not configured. Skipping Notion save (development mode).");
    return false;
  }

  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          "Artwork Name": {
            title: [
              {
                text: {
                  content: data.artworkName,
                },
              },
            ],
          },
          "Question": {
            rich_text: [
              {
                text: {
                  content: data.question,
                },
              },
            ],
          },
          "AI Answer": {
            rich_text: [
              {
                text: {
                  content: data.aiAnswer,
                },
              },
            ],
          },
          "Name": {
            rich_text: [
              {
                text: {
                  content: data.name,
                },
              },
            ],
          },
          "Contact": {
            rich_text: [
              {
                text: {
                  content: data.contact,
                },
              },
            ],
          },
          "Type": {
            select: {
              name: data.type || "감상",
            },
          },
          "Requires Artist Follow-up": {
            checkbox: false,
          },
          "Interest Level": {
            select: {
              name: data.interestLevel || "단순감상",
            },
          },
          "Answer Status": {
            select: {
              name: "답변완료",
            },
          },
          "Timestamp": {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Notion API Error (Questions):", result);
      return false;
    }

    console.log("Question saved to Notion successfully.");
    return true;
  } catch (error) {
    console.error("Error saving question to Notion:", error);
    return false;
  }
}

/**
 * Saves a visitor's reservation details to the Notion Database.
 */
export async function saveReservationToNotion(data: ReservationData): Promise<boolean> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID_RESERVATIONS;

  if (!apiKey || !databaseId || apiKey.includes("your_notion") || databaseId.includes("your_notion")) {
    console.warn("Notion credentials for reservations are not configured. Skipping Notion save (development mode).");
    return false;
  }

  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          "Name": {
            title: [
              {
                text: {
                  content: data.name,
                },
              },
            ],
          },
          "Phone": {
            rich_text: [
              {
                text: {
                  content: data.phone,
                },
              },
            ],
          },
          "Email": {
            rich_text: [
              {
                text: {
                  content: data.email,
                },
              },
            ],
          },
          "Type": {
            select: {
              name: data.type || "Gallery Visit (전시 관람)",
            },
          },
          "Date": {
            date: {
              start: data.date, // format: YYYY-MM-DD
            },
          },
          "Time": {
            rich_text: [
              {
                text: {
                  content: data.time || "13:00",
                },
              },
            ],
          },
          "Timestamp": {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Notion API Error (Reservations):", result);
      return false;
    }

    console.log("Reservation saved to Notion successfully.");
    return true;
  } catch (error) {
    console.error("Error saving reservation to Notion:", error);
    return false;
  }
}
