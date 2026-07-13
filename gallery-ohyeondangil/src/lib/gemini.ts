/**
 * Gemini API Wrapper with OpenAI Fallback
 * Orchestrates the AI Docent response generation for artworks at Gallery Ohyeondangil.
 */

const SYSTEM_PROMPT = `당신은 제주시 이도1동 삼성혈 문화의 거리에 위치한 컨템포러리 살롱이자 대안 예술 플랫폼인 '갤러리 오현단길(Gallery Ohyeondangil)'의 공식 AI 도슨트(AI Docent)입니다.

관람객의 질문에 답변할 때 다음의 철학과 규칙을 반드시 준수하여 깊은 예술적 환대를 전해주세요:

1. 예술적 철학과 어조:
   - 제주의 돌담 성곽 아래 위치한 공간의 고유한 장소성, '비어 있는 여백(Margin)', '응시(Observation)', '감정적인 색채 표현(Emotional Color Expression)'을 답변에 자연스럽게 녹여내세요.
   - 정형화된 안내 텍스트를 넘어, 차분하고 세련되며 시적인 살롱 문체를 유지하세요.

2. 답변 분량 및 언어:
   - 한국어로 작성하세요.
   - 글자 수는 공백 포함 **400자 이하**여야 합니다.
   - 단락은 **최대 3문단**으로 간결하게 구성해 여백의 미를 살리세요.

3. 상황별 맥락:
   - 관람객이 특정 작품에 대해 물을 경우, 해당 작품의 정보(작가명, 재료, 질감 등)를 바탕으로 교감하듯 해설해 주세요.`;

interface DocentRequest {
  artworkName: string;
  artworkArtist: string;
  artworkMedium: string;
  artworkDescription?: string;
  question: string;
  visitorName: string;
}

/**
 * Generates an AI Docent response based on the artwork details and visitor's question.
 */
export async function generateDocentResponse(req: DocentRequest): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const promptText = `
[작품 정보]
- 작품명: ${req.artworkName}
- 작가: ${req.artworkArtist}
- 재료: ${req.artworkMedium}
- 작품 설명: ${req.artworkDescription || "정보 없음"}

[관람객 정보]
- 이름: ${req.visitorName || "방문자"}

[질문 내용]
"${req.question}"

위 정보를 바탕으로, 갤러리 오현단길의 예술 철학을 담아 여백이 느껴지는 따뜻하고 아름다운 도슨트 해설을 들려주세요.`;

  // 1. Try Gemini API first if key is available
  if (geminiKey && !geminiKey.includes("your_gemini")) {
    try {
      console.log("Generating response using Gemini API...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${SYSTEM_PROMPT}\n\n${promptText}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let answer = data.candidates[0].content.parts[0].text.trim();
        // Trim backticks or extra docent tags if any
        return answer;
      } else {
        console.warn("Gemini API call failed, attempting OpenAI fallback...", data.error || data);
      }
    } catch (error) {
      console.warn("Error calling Gemini API, attempting OpenAI fallback...", error);
    }
  }

  // 2. Fall back to OpenAI API if available
  if (openaiKey && !openaiKey.includes("your_openai")) {
    try {
      console.log("Generating response using OpenAI API Fallback (gpt-4o-mini)...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: promptText,
            },
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      const data = await response.json();
      if (response.ok && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      } else {
        console.warn("OpenAI API call failed as fallback:", data.error || data);
      }
    } catch (error) {
      console.warn("Error during OpenAI fallback:", error);
    }
  }

  // 3. Static fallback response if both APIs are unavailable
  console.warn("No AI API keys configured or call failed. Using static docent fallback.");
  return `안녕하세요, ${req.visitorName || "관람객"}님. 갤러리 오현단길에 남겨주신 소중한 시선과 질문에 머리 숙여 감사드립니다.

우리가 응시하는 이곳, 오현단의 돌담 끝에는 언제나 비어 있는 여백과 따스한 온기가 함께 머물고 있습니다. 문의하신 '${req.artworkName}'은 그 고요한 여백을 채색해 나가는 기록입니다.

비록 지금은 서면으로 가볍게 닿았으나, 갤러리 1층의 하얀 테이블에서 따뜻한 차 한 잔과 함께 더 깊은 여백의 이야기를 나눌 수 있기를 고대하겠습니다. 편히 쉬어가시길 바랍니다.`;
}
