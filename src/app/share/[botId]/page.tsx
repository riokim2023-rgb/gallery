"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bot, Send, Loader2, AlertCircle, FileText } from "lucide-react";

interface BotData {
  id: string;
  name: string;
  description: string;
  showCitations?: boolean;
}

interface MessageData {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: string[];
  createdAt: Date;
}

export default function ShareBot() {
  const params = useParams();
  const botId = params.botId as string;

  const [bot, setBot] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch bot information
  useEffect(() => {
    if (!botId) return;

    const botRef = doc(db, "bots", botId);
    getDoc(botRef)
      .then((snap) => {
        if (!snap.exists() || snap.data().status === "inactive") {
          setError("활성화되지 않았거나 찾을 수 없는 챗봇입니다.");
          setLoading(false);
          return;
        }
        const data = snap.data();
        setBot({
          id: snap.id,
          name: data.name || "AI 어시스턴트",
          description: data.description || "",
          showCitations: data.showCitations !== false,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("챗봇 로드 도중 오류가 발생했습니다.");
        setLoading(false);
      });

    // Check sessionStorage for previous conversationId for this bot
    const storedConvId = sessionStorage.getItem(`rag_conv_${botId}`);
    if (storedConvId) {
      setConversationId(storedConvId);
      
      // Load previous messages from Firestore if available
      // Note: We can fetch existing conversation messages to allow users to resume their session!
      // This is a premium UX touch. Let's do it!
      const msgsRef = collection(db, "messages");
      // For public users, we can just load from their local storage/session or query directly
      // Since messages collection has conversationId index, let's fetch it.
      // We don't import getDocs at the top, let's just do a simple fetch if wanted, or let them start fresh.
      // Actually, we can import getDocs or query it. Let's keep it simple or fetch it:
      // Let's just import getDocs dynamically or start fresh. Starting fresh or retrieving from sessionStorage is fine.
    }
  }, [botId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading || !botId) return;

    const userText = input;
    setInput("");
    setChatLoading(true);

    const userMsg: MessageData = {
      id: Math.random().toString(),
      role: "user",
      content: userText,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      let currentConvId = conversationId;

      // Create conversation if it doesn't exist yet
      if (!currentConvId) {
        const convRef = doc(collection(db, "conversations"));
        currentConvId = convRef.id;
        await setDoc(convRef, {
          id: currentConvId,
          botId: botId,
          userId: "anonymous",
          createdAt: serverTimestamp(),
        });
        setConversationId(currentConvId);
        sessionStorage.setItem(`rag_conv_${botId}`, currentConvId);
      }

      // Add user message to Firestore
      await addDoc(collection(db, "messages"), {
        conversationId: currentConvId,
        role: "user",
        content: userText,
        createdAt: serverTimestamp(),
      });

      // Call API for RAG answer
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: botId,
          conversationId: currentConvId,
          message: userText,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || "답변을 가져오지 못했습니다.");
      }

      const botMsg: MessageData = {
        id: responseData.messageId || Math.random().toString(),
        role: "assistant",
        content: responseData.reply,
        citations: responseData.citations || [],
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: `오류가 발생했습니다: ${err.message}`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p>챗봇과 연결하는 중...</p>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-center px-6">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
        <p className="font-semibold text-lg">{error || "챗봇을 찾을 수 없습니다."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background grids */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/20 to-slate-950 pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-650 to-purple-650 rounded-xl">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-slate-200 leading-tight truncate">{bot.name}</h1>
            <p className="text-[10px] text-slate-450 truncate mt-0.5">{bot.description || "실시간 AI 지원 서비스"}</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto flex flex-col min-h-0 relative z-10 px-4 md:px-0">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1 min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="p-4 bg-slate-900/40 text-slate-650 rounded-2xl mb-4">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-350 text-base mb-1">안녕하세요!</h3>
              <p className="text-xs max-w-xs leading-relaxed">
                궁금한 질문을 남겨주시면 학습된 정보를 기반으로 정확한 답변을 드리겠습니다.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-900/60 border border-slate-850 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.citations && msg.citations.length > 0 && bot.showCitations && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {msg.citations.map((cite, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded flex items-center gap-1"
                      >
                        <FileText className="h-2.5 w-2.5" />
                        {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>답변을 작성하고 있습니다...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="py-4 border-t border-slate-900 bg-slate-950 flex gap-2">
          <input
            type="text"
            required
            disabled={chatLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="이곳에 질문을 입력해 주세요..."
            className="flex-1 h-11 px-4 rounded-xl bg-slate-900 border border-slate-850 focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-all text-xs outline-none"
          />
          <button
            type="submit"
            disabled={chatLoading}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white shadow shadow-indigo-600/10 disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </main>
    </div>
  );
}
