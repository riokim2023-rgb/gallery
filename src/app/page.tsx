"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Bot, FileText, Upload, Share2, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              RAG Bot Builder
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all duration-300 shadow-md shadow-indigo-600/15"
              >
                대시보드 바로가기
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 h-10 flex items-center text-slate-400 hover:text-white font-medium text-sm transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/login?signup=true"
                  className="px-4 h-10 flex items-center rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-medium text-sm transition-colors"
                >
                  시작하기
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-7xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          코딩 없이 10분 만에 끝내는 AI 챗봇 만들기
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6">
          보유한 문서를 업로드하고{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            맞춤형 AI 챗봇
          </span>
          을 생성하세요
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
          PDF, 텍스트, 음성 파일을 올리기만 하면 RAG 기술이 적용된 AI 챗봇이 탄생합니다.
          웹사이트 삽입, 링크 공유, QR 코드 배포까지 한 번에 해결하세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center max-w-md">
          <Link
            href={user ? "/dashboard" : "/login?signup=true"}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-xl shadow-indigo-600/20 transition-all duration-300"
          >
            지금 무료로 시작하기
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left mt-10">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 group">
            <div className="p-3 bg-indigo-600/10 rounded-xl w-fit mb-6 text-indigo-400 group-hover:bg-indigo-600/20 transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">다양한 파일 형식 지원</h3>
            <p className="text-slate-400 leading-relaxed">
              PDF, TXT, DOCX는 물론이고 MP3, WAV와 같은 음성 파일까지 자동으로 텍스트를 추출하여 데이터베이스화합니다.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 group">
            <div className="p-3 bg-purple-600/10 rounded-xl w-fit mb-6 text-purple-400 group-hover:bg-purple-600/20 transition-colors">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">정밀한 RAG 답변 생성</h3>
            <p className="text-slate-400 leading-relaxed">
              업로드한 문서를 스마트하게 청킹하고 분석하여 사용자의 질문에 정확한 출처(Citation)와 함께 자료 기반 답변을 제공합니다.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-pink-500/30 transition-all duration-300 group">
            <div className="p-3 bg-pink-600/10 rounded-xl w-fit mb-6 text-pink-400 group-hover:bg-pink-600/20 transition-colors">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">간편한 외부 배포</h3>
            <p className="text-slate-400 leading-relaxed">
              생성된 챗봇은 독립된 공유용 웹 링크, QR 코드, 그리고 기존 홈페이지에 즉시 삽입 가능한 Iframe 임베드 태그를 함께 제공합니다.
            </p>
          </div>
        </div>

        {/* Security & Reliability */}
        <div className="mt-20 py-8 px-6 rounded-2xl bg-slate-900/30 border border-slate-800/50 flex flex-col sm:flex-row items-center gap-4 text-left max-w-3xl">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">사용자별 완벽한 데이터 격리 및 보안</h4>
            <p className="text-sm text-slate-400 mt-0.5">
              Firebase Auth와 엄격한 Security Rules 설정을 통해 귀하의 모든 업로드 파일과 대화 로그는 철저히 타인으로부터 암호화되어 분리 보관됩니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 text-slate-500 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 RAG Bot Builder. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">이용약관</a>
            <a href="#" className="hover:text-slate-300 transition-colors">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
