"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, deleteDoc, setDoc, serverTimestamp, limit } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Bot, FileText, MessageSquare, Plus, LogOut, Loader2, Trash2, ArrowRight, Sparkles, BarChart2, Copy, History } from "lucide-react";

interface BotData {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  status: string;
  createdAt: any;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bots, setBots] = useState<BotData[]>([]);
  const [stats, setStats] = useState({
    totalBots: 0,
    totalDocs: 0,
    totalQuestions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<{ id: string; type: string; title: string; time: string }[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch bots and compute stats
  useEffect(() => {
    if (!user) return;

    const botsRef = collection(db, "bots");
    const q = query(botsRef, where("ownerId", "==", user.uid), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const botsList: BotData[] = [];
      let docsCount = 0;
      let questionsCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        botsList.push({
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          systemPrompt: data.systemPrompt || "",
          status: data.status || "active",
          createdAt: data.createdAt,
        });
      });

      setBots(botsList);

      // Fetch additional stats (total documents, total questions in analytics)
      try {
        // Fetch total documents
        const docsSnap = await getDocs(
          query(collection(db, "documents"), where("botId", "in", botsList.length > 0 ? botsList.map(b => b.id) : ["placeholder"]))
        );
        docsCount = docsSnap.size;

        // Fetch total questions from analytics
        const analyticsSnap = await getDocs(
          query(collection(db, "analytics"), where("botId", "in", botsList.length > 0 ? botsList.map(b => b.id) : ["placeholder"]))
        );
        analyticsSnap.forEach((doc) => {
          questionsCount += doc.data().totalQuestions || 0;
        });

        // Fetch recent documents for activities
        const recentDocsSnap = await getDocs(
          query(
            collection(db, "documents"),
            where("botId", "in", botsList.length > 0 ? botsList.map(b => b.id) : ["placeholder"]),
            orderBy("uploadedAt", "desc"),
            limit(3)
          )
        );

        const activities: any[] = [];
        // Add bot creations
        botsList.slice(0, 3).forEach(b => {
          activities.push({
            id: `bot-${b.id}`,
            type: "bot",
            title: `'${b.name}' 챗봇 생성`,
            time: b.createdAt ? b.createdAt.toDate().toLocaleString("ko-KR") : "방금 전",
            rawTime: b.createdAt ? b.createdAt.toDate() : new Date(),
          });
        });

        // Add document uploads
        recentDocsSnap.forEach(d => {
          const data = d.data();
          activities.push({
            id: `doc-${d.id}`,
            type: "doc",
            title: `'${data.fileName}' 문서 학습`,
            time: data.uploadedAt ? data.uploadedAt.toDate().toLocaleString("ko-KR") : "방금 전",
            rawTime: data.uploadedAt ? data.uploadedAt.toDate() : new Date(),
          });
        });

        // Sort by rawTime desc and take top 5
        activities.sort((a, b) => b.rawTime.getTime() - a.rawTime.getTime());
        setRecentActivities(activities.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }

      setStats({
        totalBots: botsList.length,
        totalDocs: docsCount,
        totalQuestions: questionsCount,
      });
      setLoading(false);
    }, (err) => {
      console.error("Firestore listening error", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  const handleDeleteBot = async (botId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to bot detail
    if (!confirm("정말 이 챗봇을 삭제하시겠습니까? 관련 문서 및 대화 로그가 모두 삭제됩니다.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "bots", botId));
      // Optionally clean up documents, chunks, conversations, messages, analytics
      // Typically handled via Firebase Functions onDelete triggers, or here in client.
    } catch (err) {
      console.error("Failed to delete bot", err);
      alert("챗봇 삭제에 실패했습니다.");
    }
  };

  const handleCloneBot = async (bot: BotData, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page
    if (!confirm(`'${bot.name}' 챗봇을 복제하시겠습니까? (학습 문서 내역은 새롭게 다시 구성해야 합니다)`)) {
      return;
    }

    try {
      const botsRef = collection(db, "bots");
      const newBotDoc = doc(botsRef);
      const newBotId = newBotDoc.id;

      await setDoc(newBotDoc, {
        id: newBotId,
        ownerId: user?.uid,
        name: `${bot.name} (복제본)`,
        description: bot.description,
        systemPrompt: bot.systemPrompt,
        answerMode: bot.answerMode || "normal",
        status: "active",
        createdAt: serverTimestamp(),
      });

      // Initialize analytics
      await setDoc(doc(db, "analytics", newBotId), {
        botId: newBotId,
        totalQuestions: 0,
        totalDocuments: 0,
        lastUsedAt: serverTimestamp(),
      });

      alert("챗봇이 복제되었습니다.");
    } catch (err) {
      console.error("Failed to clone bot", err);
      alert("챗봇 복제에 실패했습니다.");
    }
  };

  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-95 transition-opacity">
              RAG Bot Builder
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:inline-block">
              <span className="font-semibold text-slate-200">{user?.displayName || user?.email}</span> 님 환영합니다
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 h-9 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 text-sm font-medium transition-all duration-350 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 z-10">
        {/* Welcome and Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">대시보드</h1>
            <p className="text-slate-400 text-sm mt-1">내가 생성한 RAG 챗봇 및 학습 상태를 확인합니다.</p>
          </div>
          <Link
            href="/bots/create"
            className="flex items-center gap-2 px-4 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-600/15 transition-all duration-300 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            새 챗봇 생성
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4">
            <div className="p-3.5 bg-indigo-600/10 text-indigo-400 rounded-xl">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">총 챗봇 수</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalBots}개</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4">
            <div className="p-3.5 bg-purple-600/10 text-purple-400 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">총 학습 문서 수</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalDocs}개</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-xl">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">누적 질문 수</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalQuestions}회</h3>
            </div>
          </div>
        </div>

        {/* Split Layout: Bot List vs Recent Activity */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Bots list */}
          <div className="flex-1 w-full min-w-0">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              내 챗봇 목록
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <span>챗봇 목록을 가져오는 중...</span>
              </div>
            ) : bots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-slate-900/20 border border-dashed border-slate-800/80 text-center px-4">
                <div className="p-4 bg-indigo-600/10 rounded-full text-indigo-400 mb-4">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-1">등록된 챗봇이 없습니다</h3>
                <p className="text-sm text-slate-400 max-w-sm mb-6">
                  첫 번째 AI 챗봇을 생성하고 문서를 업로드해 훈련시켜 보세요!
                </p>
                <Link
                  href="/bots/create"
                  className="flex items-center gap-2 px-4 h-10 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  챗봇 생성하기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bots.map((bot) => (
                  <Link
                    href={`/bots/${bot.id}`}
                    key={bot.id}
                    className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/50 hover:bg-slate-900/60 shadow-lg flex flex-col justify-between h-[180px] transition-all duration-300"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {bot.name}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleCloneBot(bot, e)}
                            className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                            title="챗봇 복제"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteBot(bot.id, e)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="챗봇 삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {bot.description || "등록된 설명이 없습니다."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-850/80 text-xs mt-4 text-slate-500 group-hover:text-slate-400 transition-colors">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        운영 중
                      </span>
                      <span className="flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                        상세 보기
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Recent Activity Panel (UX visual excellence) */}
          <div className="w-full lg:w-[320px] shrink-0 p-6 rounded-2xl bg-slate-900/30 border border-slate-850">
            <h2 className="text-base font-bold mb-5 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-400" />
              최근 활동 내역
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-650" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                기록된 활동 내역이 없습니다.
              </div>
            ) : (
              <div className="relative border-l border-slate-850 pl-4 space-y-6">
                {recentActivities.map((act) => (
                  <div key={act.id} className="relative">
                    {/* bullet indicator */}
                    <span className="absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-250 leading-relaxed">
                        {act.title}
                      </h4>
                      <span className="text-[10px] text-slate-550 block mt-1">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
