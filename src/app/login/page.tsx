"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Bot, Mail, Lock, User, Sparkles, Loader2, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check if signup param is present in URL
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isResetPassword) {
        if (!email.trim()) {
          throw new Error("이메일을 입력해주세요.");
        }
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg("입력하신 이메일로 비밀번호 재설정 메일을 발송했습니다. 메일함을 확인해 주세요.");
      } else if (isSignUp) {
        // Sign Up
        if (!name.trim()) {
          throw new Error("이름을 입력해주세요.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const currentUser = userCredential.user;

        // Update profile
        await updateProfile(currentUser, { displayName: name });

        // Save user to Firestore
        await setDoc(doc(db, "users", currentUser.uid), {
          id: currentUser.uid,
          email: currentUser.email,
          name: name,
          photoUrl: "",
          plan: "free",
          createdAt: new Date().toISOString(),
        });
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else if (err.code === "auth/invalid-credential") {
        setError("이메일 또는 비밀번호가 잘못되었습니다.");
      } else if (err.code === "auth/weak-password") {
        setError("비밀번호는 최소 6자 이상이어야 합니다.");
      } else {
        setError(err.message || "오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p>인증 정보를 확인하는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header-like top navigation */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          메인 페이지로 돌아가기
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8 text-center">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-600/20">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                RAG Bot Builder
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {isSignUp ? "새로운 계정을 생성하세요" : "계정에 로그인하세요"}
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md shadow-2xl">
            {error && (
              <div className="p-3.5 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3.5 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && !isResetPassword && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">이름</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-650 transition-all text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">이름 (이메일 주소)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-650 transition-all text-sm outline-none"
                  />
                </div>
              </div>

              {!isResetPassword && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-650 transition-all text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-600/15 disabled:opacity-50 transition-all duration-300 mt-2 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    {isResetPassword ? (
                      "비밀번호 재설정 이메일 전송"
                    ) : isSignUp ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        가입 완료하고 시작하기
                      </>
                    ) : (
                      "로그인"
                    )}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-sm text-slate-400">
              {isResetPassword ? (
                <button
                  onClick={() => {
                    setIsResetPassword(false);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-indigo-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  로그인 화면으로 돌아가기
                </button>
              ) : isSignUp ? (
                <>
                  이미 계정이 있으신가요?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-indigo-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    로그인하기
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div>
                    처음이신가요?{" "}
                    <button
                      onClick={() => {
                        setIsSignUp(true);
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="text-indigo-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      새 계정 만들기
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setIsResetPassword(true);
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="text-xs text-slate-500 hover:text-indigo-400 transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p>로딩 중...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
