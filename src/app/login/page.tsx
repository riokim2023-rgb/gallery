"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMsg("");
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const currentUser = userCredential.user;

      // Check if user already exists in Firestore to avoid overwriting metadata/plan
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || "이름 없음",
          photoUrl: currentUser.photoURL || "",
          plan: "free",
          createdAt: new Date().toISOString(),
        });
      } else {
        // Update user name/avatar if they exist and are different
        await setDoc(
          userRef,
          {
            email: currentUser.email,
            name: currentUser.displayName || userSnap.data()?.name || "이름 없음",
            photoUrl: currentUser.photoURL || userSnap.data()?.photoUrl || "",
          },
          { merge: true }
        );
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("로그인 팝업이 닫혔습니다. 다시 시도해주세요.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("로그인 요청이 취소되었습니다.");
      } else {
        setError(err.message || "구글 로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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

            {/* Google Login Button */}
            {!isResetPassword && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                  className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold shadow-md disabled:opacity-50 transition-all duration-300 mb-6 text-sm cursor-pointer border border-slate-200"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      구글 로그인 중...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google로 시작하기
                    </>
                  )}
                </button>

                <div className="relative flex py-2 items-center mb-6">
                  <div className="flex-grow border-t border-slate-800/80"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500">
                    또는 이메일로 {isSignUp ? "가입" : "로그인"}
                  </span>
                  <div className="flex-grow border-t border-slate-800/80"></div>
                </div>
              </>
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
                      disabled={loading || googleLoading}
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-650 transition-all text-sm outline-none disabled:opacity-50"
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
                    disabled={loading || googleLoading}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-650 transition-all text-sm outline-none disabled:opacity-50"
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
                      disabled={loading || googleLoading}
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-650 transition-all text-sm outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
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
                  disabled={loading || googleLoading}
                  className="text-indigo-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:no-underline"
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
                    disabled={loading || googleLoading}
                    className="text-indigo-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:no-underline"
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
                      disabled={loading || googleLoading}
                      className="text-indigo-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:no-underline"
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
                      disabled={loading || googleLoading}
                      className="text-xs text-slate-500 hover:text-indigo-400 transition-colors bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:hover:text-slate-500"
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
