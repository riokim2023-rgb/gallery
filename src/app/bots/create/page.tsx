"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Bot, ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function CreateBot() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "당신은 업로드된 자료를 바탕으로 질문에 정확하게 답변하는 친절한 AI 어시스턴트입니다."
  );
  const [answerMode, setAnswerMode] = useState("normal");
  const [tone, setTone] = useState("friendly");
  const [expertise, setExpertise] = useState("expert");
  const [showCitations, setShowCitations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      setError("챗봇 이름을 입력해 주세요.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create new bot ID
      const botsRef = collection(db, "bots");
      const newBotDoc = doc(botsRef);
      const botId = newBotDoc.id;

      // Save bot details
      await setDoc(newBotDoc, {
        id: botId,
        ownerId: user.uid,
        name: name,
        description: description,
        systemPrompt: systemPrompt,
        answerMode: answerMode,
        tone: tone,
        expertise: expertise,
        showCitations: showCitations,
        status: "active",
        createdAt: serverTimestamp(),
      });

      // Initialize analytics
      await setDoc(doc(db, "analytics", botId), {
        botId: botId,
        totalQuestions: 0,
        totalDocuments: 0,
        lastUsedAt: serverTimestamp(),
      });

      router.push(`/bots/${botId}`);
    } catch (err: any) {
      console.error(err);
      setError("챗봇 생성 도중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p>인증 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold text-lg">새 AI 챗봇 만들기</h1>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 z-10">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bot Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">챗봇 이름</label>
              <input
                type="text"
                required
                maxLength={40}
                placeholder="예: 우리 미술관 안내 봇, 회사 FAQ 도우미"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white transition-all text-sm outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">챗봇 설명</label>
              <textarea
                placeholder="이 챗봇이 어떤 역할을 하는지 간단히 설명해 주세요."
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white transition-all text-sm outline-none resize-none"
              />
            </div>

            {/* Tone, Expertise, and Citations Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">챗봇 답변 톤</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white text-sm outline-none"
                >
                  <option value="friendly">친절하고 상냥하게</option>
                  <option value="professional">전문적이고 객관적으로</option>
                  <option value="casual">편안하고 친근하게</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">전문성 설정</label>
                <select
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white text-sm outline-none"
                >
                  <option value="expert">분야 최고 전문가</option>
                  <option value="general">일반 도우미 비서</option>
                  <option value="support">CS 고객 상담원</option>
                </select>
              </div>

              <div className="flex flex-col justify-end pb-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={showCitations}
                    onChange={(e) => setShowCitations(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-500 bg-slate-900 focus:ring-0 focus:ring-offset-0"
                  />
                  답변 출처 표시하기
                </label>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                시스템 프롬프트 (챗봇 지침 설정)
              </label>
              <textarea
                required
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="어떻게 답변할지 명령을 적어주세요. 예: 전문적이고 공손하게 대답할 것."
                className="w-full min-h-[140px] p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white transition-all text-sm outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                이 가이드는 AI 챗봇이 답변을 작성할 때 반드시 준수할 대원칙이 됩니다.
              </p>
            </div>

            {/* Answer Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">답변 길이 모드</label>
              <div className="grid grid-cols-3 gap-4">
                <label className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${answerMode === "short" ? "bg-indigo-500/5 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-800/80"}`}>
                  <input
                    type="radio"
                    name="answerMode"
                    value="short"
                    checked={answerMode === "short"}
                    onChange={(e) => setAnswerMode(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm mb-1">간결한 답변 (Short)</span>
                  <span className="text-xs text-slate-500">3~5문장 내외로 요약하여 빠르게 핵심 위주로 전달합니다.</span>
                </label>

                <label className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${answerMode === "normal" ? "bg-indigo-500/5 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-800/80"}`}>
                  <input
                    type="radio"
                    name="answerMode"
                    value="normal"
                    checked={answerMode === "normal"}
                    onChange={(e) => setAnswerMode(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm mb-1">일반 답변 (Normal)</span>
                  <span className="text-xs text-slate-500">500자 내외의 일반적인 가이드를 제공하며 균형 잡힌 설명을 합니다.</span>
                </label>

                <label className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${answerMode === "deep" ? "bg-indigo-500/5 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-800/80"}`}>
                  <input
                    type="radio"
                    name="answerMode"
                    value="deep"
                    checked={answerMode === "deep"}
                    onChange={(e) => setAnswerMode(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm mb-1">상세한 답변 (Deep)</span>
                  <span className="text-xs text-slate-500">1000자 이상의 분석 리포트 형태로 상세하고 깊이 있는 대답을 생성합니다.</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex items-center justify-end gap-4">
              <Link
                href="/dashboard"
                className="px-5 h-11 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-600/15 disabled:opacity-50 transition-all duration-300 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    챗봇 만들기 완료
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
