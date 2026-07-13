"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { artworks } from "@/lib/artworks";
import { ArrowLeft, Send, Sparkles, MessageSquare, Phone, User, Compass, HelpCircle, Loader2 } from "lucide-react";

interface Message {
  sender: "user" | "docent";
  text: string;
}

export default function TalkDetail({ params }: { params: Promise<{ artworkId: string }> }) {
  const resolvedParams = use(params);
  const artworkId = Number(resolvedParams.artworkId);
  const artwork = artworks.find((art) => art.id === artworkId);

  // Form States
  const [visitorName, setVisitorName] = useState("");
  const [contact, setContact] = useState("");
  const [questionType, setQuestionType] = useState("감상");
  const [interestLevel, setInterestLevel] = useState("단순감상");
  const [questionText, setQuestionText] = useState("");

  // Chat/Flow States
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpText, setFollowUpText] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!artwork) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <p className="text-stone-500 dark:text-stone-400 font-light">작품을 찾을 수 없습니다.</p>
        <Link href="/talk" className="px-6 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:text-gold-500 hover:border-gold-500 transition-all">
          Go Back
        </Link>
      </div>
    );
  }

  // Handle Initial Form + Question Submission
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !contact.trim() || !questionText.trim()) {
      alert("모든 필수 항목을 기입해 주세요.");
      return;
    }

    setIsLoading(true);
    setIsFormSubmitted(true);

    // Add user's question to the visual chat immediately
    const userMsg: Message = { sender: "user", text: questionText };
    setMessages([userMsg]);

    try {
      const response = await fetch("/api/talk/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworkId,
          question: questionText,
          name: visitorName,
          contact,
          type: questionType,
          interestLevel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: "docent", text: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "docent",
            text: `죄송합니다. 도슨트 해설을 불러오는 과정에 문제가 발생했습니다: ${data.error || "알 수 없는 오류"}`,
          },
        ]);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "docent",
          text: "죄송합니다. 네트워크 에러로 인해 대화를 연결하지 못했습니다. 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subsequent follow-up questions
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim()) return;

    const followUpQuestion = followUpText.trim();
    setFollowUpText("");

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: followUpQuestion }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/talk/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworkId,
          question: followUpQuestion,
          name: visitorName,
          contact,
          type: "기타",
          interestLevel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: "docent", text: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "docent", text: `도슨트와 대화가 지연되고 있습니다: ${data.error}` },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "docent", text: "통신 오류가 발생했습니다. 다시 질문해 주세요." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] canvas-texture animate-fade-in">
      {/* LEFT COLUMN: Artwork Visual & Information */}
      <div className="lg:w-1/2 border-r border-stone-100 dark:border-stone-900 p-6 md:p-12 flex flex-col justify-between space-y-8 bg-stone-50/20 dark:bg-stone-950/20">
        <div className="space-y-6">
          <Link
            href="/talk"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-950 dark:hover:text-white text-xs tracking-wider uppercase transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Artworks
          </Link>

          <div className="space-y-4">
            <span className="text-[9px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">
              TALK TO ARTWORK
            </span>
            <h2 className="font-serif text-3xl font-normal text-stone-950 dark:text-white leading-tight">
              {artwork.title}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light">
              작가: {artwork.artist} | {artwork.size}
            </p>
          </div>

          <div className="border border-stone-100 dark:border-stone-900 p-2 bg-stone-50 dark:bg-stone-900/10">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-auto object-cover max-h-[45vh]"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] tracking-wider uppercase text-stone-400 font-semibold">작품 소개</h4>
            <p className="text-stone-600 dark:text-stone-400 text-xs md:text-sm font-light leading-relaxed">
              {artwork.description || "이 작품은 갤러리 오현단길 하얀 테이블을 중심으로 엮인 이야기를 담고 있습니다."}
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-[11px] font-light">
              재료: {artwork.medium}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 dark:border-stone-900 text-[10px] text-stone-400 dark:text-stone-600 tracking-wider space-y-1">
          <p>OPEN GALLERY OS — v1.0 MVP | TALK</p>
          <p>제주특별자치도 제주시 이도1동 삼성혈 문화의 거리</p>
        </div>
      </div>

      {/* RIGHT COLUMN: Chat Terminal / Form */}
      <div className="lg:w-1/2 flex flex-col justify-between bg-white dark:bg-stone-950">
        
        {/* Terminal Header */}
        <div className="border-b border-stone-100 dark:border-stone-900 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
            <h3 className="font-serif text-sm text-stone-900 dark:text-white tracking-wide">
              {isFormSubmitted ? `Docent with ${visitorName}` : "AI Docent Activation"}
            </h3>
          </div>
          <span className="text-[9px] tracking-widest text-stone-400 dark:text-stone-600 uppercase font-mono">
            {isFormSubmitted ? "SESSION ACTIVE" : "AUTHENTICATION REQUIRED"}
          </span>
        </div>

        {/* Dynamic Inner Panel */}
        {!isFormSubmitted ? (
          /* STEP 1: Identification & Question Form */
          <div className="flex-1 p-6 md:p-12 overflow-y-auto max-w-2xl mx-auto w-full justify-center flex flex-col space-y-8">
            <div className="space-y-3">
              <span className="p-1.5 bg-stone-50 dark:bg-stone-900 text-stone-400 dark:text-stone-500 rounded w-fit block">
                <HelpCircle className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-xl text-stone-900 dark:text-white">대화 시작을 위한 관람 정보 입력</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                도슨트와의 대화 기록 및 작가의 후속 대답(필요 시)을 전달받기 위해 아래 내용을 간단히 입력해 주세요. 
                모든 내용은 Notion 데이터베이스에 안전하게 기입되어 시장 조사 자료로 활용됩니다.
              </p>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-6">
              {/* Name & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    성함 / Name *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-stone-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="성함을 기입해 주세요"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-stone-50/50 dark:bg-stone-900/10 border border-stone-200 dark:border-stone-850 text-xs focus:border-gold-500 focus:outline-none rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    연락처 / Phone (또는 Email) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-stone-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="010-0000-0000"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-stone-50/50 dark:bg-stone-900/10 border border-stone-200 dark:border-stone-850 text-xs focus:border-gold-500 focus:outline-none rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    질문 성격 / Inquiry Type
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-900/10 border border-stone-200 dark:border-stone-850 text-xs text-stone-700 dark:text-stone-300 focus:border-gold-500 focus:outline-none rounded-none"
                  >
                    <option value="감상">감상 및 비평</option>
                    <option value="구매문의">소장/구매 문의</option>
                    <option value="대관문의">클래스/대관 문의</option>
                    <option value="기타">기타 문의</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    작품 관심도 / Interest Level
                  </label>
                  <select
                    value={interestLevel}
                    onChange={(e) => setInterestLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-900/10 border border-stone-200 dark:border-stone-850 text-xs text-stone-700 dark:text-stone-300 focus:border-gold-500 focus:outline-none rounded-none"
                  >
                    <option value="단순감상">단순 감상 및 둘러보기</option>
                    <option value="관심있음">관심 있음 (향후 소식 받기)</option>
                    <option value="매우관심">매우 관심 있음 (즉각 상담 필요)</option>
                  </select>
                </div>
              </div>

              {/* First Question */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                  작품에 대한 첫 질문 / Your Question *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={`예: "${artwork.title}"의 금빛 텍스처는 어떤 감정을 묘사하고자 한 것인가요?`}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-900/10 border border-stone-200 dark:border-stone-850 text-xs focus:border-gold-500 focus:outline-none rounded-none resize-none"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-4 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs tracking-[0.25em] uppercase hover:bg-gold-600 font-semibold transition-all rounded-none flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Connect to Docent (도슨트 연결)
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Active Chat Interface */
          <div className="flex-1 flex flex-col justify-between h-[calc(100vh-10rem)]">
            {/* Message Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] p-4 border text-xs md:text-sm font-light leading-relaxed ${
                        isUser
                          ? "bg-stone-50 dark:bg-stone-900 text-stone-850 dark:text-stone-200 border-stone-200 dark:border-stone-850"
                          : "bg-white dark:bg-stone-950 text-stone-950 dark:text-white border-gold-500/30 shadow-sm"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1 text-[9px] tracking-wider uppercase text-gold-600 dark:text-gold-500 font-semibold mb-2">
                          <Compass className="h-3 w-3 animate-spin-slow" />
                          AI Docent Reply
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="max-w-[80%] p-4 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-900 text-xs text-stone-400 dark:text-stone-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
                    <span>AI 도슨트가 대답을 고르고 있습니다...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Follow-up input form */}
            <form
              onSubmit={handleFollowUpSubmit}
              className="p-4 md:p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/10 flex gap-3"
            >
              <input
                type="text"
                disabled={isLoading}
                placeholder="추가 질문을 입력해 주세요..."
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                className="flex-1 px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs focus:border-gold-500 focus:outline-none rounded-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !followUpText.trim()}
                className="px-5 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs font-semibold uppercase hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
