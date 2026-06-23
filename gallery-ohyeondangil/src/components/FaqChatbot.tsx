"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Sparkles, Send } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  isQuickReplies?: boolean;
}

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const faqData = [
    {
      id: "hours",
      question: "🕒 운영 시간 및 휴무일은 어떻게 되나요?",
      answer: "갤러리 오현단길의 운영 시간은 화요일부터 일요일까지 13:00 - 20:00 입니다. 매주 월요일은 정기 휴무 및 전시 교체일입니다. 관람 및 수업은 예약을 통해 원활하게 참여하실 수 있습니다.",
      keywords: ["시간", "영업", "운영", "휴무", "요일", "월요일", "화요일", "주말", "오픈", "닫", "열"]
    },
    {
      id: "location",
      question: "📍 갤러리 위치와 주소는 어디인가요?",
      answer: "갤러리 오현단길은 '제주특별자치도 제주시 중앙로 21길 18 1층 (이도1동, 삼성혈 문화의 거리)'에 위치해 있습니다. 삼성혈 문화의 거리에 인접해 있어 주변의 역사적인 유적지와 연계된 문화 산책을 즐기시기 좋습니다.",
      keywords: ["위치", "주소", "어디", "찾아", "동네", "이도", "삼성혈"]
    },
    {
      id: "transit",
      question: "🚌 대중교통(버스)으로 가는 방법은 무엇인가요?",
      answer: "대중교통 이용 시 '시민회관' 정류소에서 하차 후 표구사거리 방향으로 도보 100m 거리에 위치해 있습니다. 제주시청 및 중앙로를 경유하는 365번, 447번 등의 버스를 편리하게 이용하실 수 있습니다.\n\n또한, 공항에서 오실 때는 버스 315, 325, 415번을 타고 '중앙로 사거리' 또는 '오현단 정류장'에서 하차하여 오현 성곽 방면으로 도보 5분 소요됩니다.",
      keywords: ["대중교통", "버스", "공항", "정류소", "하차", "시민회관", "경유", "노선", "교통"]
    },
    {
      id: "parking",
      question: "🚗 주차는 어디에 할 수 있나요?",
      answer: "갤러리 건물 바로 옆 경사길은 주차가 불가능하므로, 인근 '제이각 공영 주차장', '오현단 공영 주차장' 혹은 갤러리 인근 무료 주차장을 이용해 주시면 편리하게 주차하실 수 있습니다.",
      keywords: ["주차", "차", "유료주차장", "공영", "무료", "파킹"]
    },
    {
      id: "classes",
      question: "🎨 어떤 미술 수업(클래스)들이 개설되어 있나요?",
      answer: "갤러리 오현단길 아뜰리에에서는 다음과 같은 다양한 창작 드로잉/회화 프로그램이 운영되고 있습니다:\n\n• 어반스케치: 제주의 일상과 풍경을 담는 펜/수채화 수업\n• 아크릴화: 기초부터 캔버스 완성까지 스튜이오 기법 수업\n• 드로잉: 연필, 목탄, 콘테를 활용한 형태 및 관찰 기초 미술\n• 연필 인물화: 연필을 이용한 인물 골격 및 묘사 수업\n• 오일파스텔: 오일파스텔 특유의 밀도 높은 텍스처 표현 수업\n\n그 외 수채화, 천아트, 색연필화 등 다양한 과정이 준비되어 있어 수준에 맞춰 1:1 지도를 받으실 수 있습니다.",
      keywords: ["수업", "클래스", "종류", "과목", "어반스케치", "아크릴", "드로잉", "인물화", "색연필", "오일파스텔", "수채화", "천아트"]
    },
    {
      id: "price",
      question: "💰 수업 비용과 재료는 어떻게 준비하나요?",
      answer: "모든 정규 수업은 주 1회, 총 4회 과정을 기본으로 진행됩니다. 수강 비용은 과정별 난이도 및 커리큘럼에 따라 상이하므로 상세한 상담을 거쳐 안내해 드립니다. 수업에 필요한 캔버스, 물감, 펜 등 각종 재료는 개인 지참을 원칙으로 하며, 준비가 어려우신 경우 아뜰리에 내에서 별도로 구매하여 바로 수업에 참여하실 수도 있습니다.",
      keywords: ["비용", "가격", "수강료", "재료", "구매", "준비물", "얼마", "회비", "4회"]
    },
    {
      id: "oneday",
      question: "☕ 하루만 참여하는 원데이클래스도 가능한가요?",
      answer: "네, 가능합니다! 모든 수업은 1회 체험용 원데이클래스로도 운영 중입니다. 바쁜 일상 속 하루 동안 나만의 드로잉이나 페인팅 작품을 만들어 보실 수 있으며, 주말 워크숍 등의 형태로도 예약이 가능합니다.",
      keywords: ["체험", "원데이", "1회", "하루", "워크숍", "원데이클래스"]
    },
    {
      id: "admission",
      question: "🎟️ 갤러리 입장료가 있나요?",
      answer: "갤러리 오현단길의 전시는 누구나 편안히 예술을 즐기실 수 있도록 별도의 입장료 없이 '무료'로 개방되어 있습니다. 부담 없이 방문하시어 현대미술 전시와 공간의 정취를 느껴보세요.",
      keywords: ["입장료", "티켓", "요금", "무료", "관람", "비용", "전시", "공짜"]
    },
    {
      id: "booking",
      question: "📅 예약은 어떻게 진행하나요?",
      answer: "갤러리 홈페이지 상단 [RESERVATION] 메뉴 또는 [VISIT] 페이지의 온라인 예약 시스템을 통해 원스톱으로 원하시는 날짜와 시간대를 정해 관람, 수업, 원데이클래스, 공간 대관 등을 예약하실 수 있습니다. 대표번호(064-752-1112) 전화 문의를 통해서도 즉시 예약이 가능합니다.",
      keywords: ["예약", "신청", "전화", "대관", "대여", "접수"]
    },
    {
      id: "buy",
      question: "🖼️ 전시된 미술 작품 구매가 가능한가요?",
      answer: "네, 가능합니다! 갤러리에 전시된 오리지널 아티스트 작품들을 소장용으로 직접 구매하실 수 있습니다. 구매 절차 및 가격, 설치 공간 컨설팅 등은 갤러리 데스크 또는 대표번호/이메일을 통해 상세하게 개별 문의 주시면 안내해 드립니다.",
      keywords: ["구매", "구입", "소장", "판매", "가격", "사", "컬렉터", "컬렉션"]
    }
  ];

  const initializeChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "안녕하세요! 갤러리 오현단길 FAQ 챗봇입니다. 제주의 고풍스러운 구도심 속 현대미술 아뜰리에이자 살롱 공간인 오현단길에 대해 무엇이든 물어보세요! 아래에서 자주 묻는 질문을 선택하거나 직접 키워드를 입력하여 질문하실 수 있습니다."
      },
      {
        id: "quick-replies",
        sender: "bot",
        text: "",
        isQuickReplies: true
      }
    ]);
  };

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string, isFromUserClick = false) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev.filter(m => !m.isQuickReplies), // temporary remove quick replies
      { id: userMsgId, sender: "user", text }
    ]);

    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponseText = "";
      
      if (isFromUserClick) {
        // Find by exact question text match
        const matchedFaq = faqData.find(f => f.question === text);
        botResponseText = matchedFaq ? matchedFaq.answer : "해당 질문에 대한 답변을 찾지 못했습니다.";
      } else {
        // Find by keyword matching
        const cleanText = text.toLowerCase().replace(/\s+/g, "");
        const matchedFaq = faqData.find(f => 
          f.keywords.some(keyword => cleanText.includes(keyword))
        );
        
        if (matchedFaq) {
          botResponseText = matchedFaq.answer;
        } else {
          botResponseText = "죄송합니다. 입력하신 키워드에 적합한 답변을 찾지 못했습니다. 아래의 자주 묻는 질문들 중에서 선택하시거나, 상세 문의는 대표번호(064-752-1112)로 전화 주시면 친절히 안내해 드리겠습니다.";
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: botResponseText },
        { id: "quick-replies-" + Date.now(), sender: "bot", text: "", isQuickReplies: true }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleReset = () => {
    initializeChat();
  };

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-stone-950 text-gold-500 hover:bg-gold-500 hover:text-stone-950 dark:bg-gold-500 dark:text-stone-950 dark:hover:bg-white dark:hover:text-stone-950 shadow-2xl rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center border border-gold-500/20"
        aria-label="Open FAQ Chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[400px] h-[550px] bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 shadow-2xl flex flex-col transition-all duration-300 ease-in-out font-sans">
          
          {/* Header */}
          <div className="px-6 py-4 bg-stone-950 text-white flex items-center justify-between border-b border-gold-500/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-500" />
              <div className="text-left">
                <h3 className="font-serif text-sm font-normal tracking-wide text-stone-100">OHYEONDANGIL FAQ Bot</h3>
                <span className="text-[9px] text-stone-400 font-light block">갤러리 오현단길 안내 챗봇</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReset} 
                className="text-[10px] text-stone-400 hover:text-gold-500 transition-colors"
                title="대화 초기화"
              >
                초기화
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50/50 dark:bg-stone-900/10">
            {messages.map((msg) => {
              if (msg.isQuickReplies) {
                return (
                  <div key={msg.id} className="space-y-2 pt-2 animate-fade-in">
                    <span className="text-[10px] text-stone-400 dark:text-stone-600 block uppercase tracking-wider font-semibold">추천 질문 목록</span>
                    <div className="flex flex-wrap gap-2">
                      {faqData.map((faq) => (
                        <button
                          key={faq.id}
                          onClick={() => handleSendMessage(faq.question, true)}
                          className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-gold-500 dark:hover:border-gold-500 text-left text-xs font-light text-stone-700 dark:text-stone-300 hover:text-gold-600 dark:hover:text-gold-500 transition-all shadow-sm rounded-sm"
                        >
                          {faq.question.split(" ").slice(1).join(" ")}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isBot ? "justify-start" : "justify-end"} animate-fade-in`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${isBot ? "flex-row" : "flex-row-reverse"}`}>
                    
                    {/* Bot Avatar */}
                    {isBot && (
                      <div className="h-7 w-7 bg-stone-950 border border-gold-500/20 text-gold-500 rounded-full flex items-center justify-center shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 text-xs leading-relaxed font-light rounded-sm shadow-sm whitespace-pre-line ${
                        isBot
                          ? "bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-150 dark:border-stone-850"
                          : "bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-2 items-center">
                  <div className="h-7 w-7 bg-stone-950 border border-gold-500/20 text-gold-500 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 rounded-sm shadow-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-950 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="궁금한 키워드를 입력해 보세요 (예: 주차, 가격)"
              className="flex-1 px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-light text-stone-900 dark:text-white focus:outline-none focus:border-gold-500 rounded-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="p-2.5 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 hover:bg-gold-500 hover:text-stone-950 dark:hover:bg-stone-950 dark:hover:text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
