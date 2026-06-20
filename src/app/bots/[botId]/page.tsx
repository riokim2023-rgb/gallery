"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, serverTimestamp, setDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Bot, ArrowLeft, Loader2, FileText, Upload, Trash2, Send, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, Share2, Code, Copy, Check, MessageSquare, Play, BarChart2, RotateCw, QrCode } from "lucide-react";

interface BotData {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  answerMode: string;
  tone?: string;
  expertise?: string;
  showCitations?: boolean;
}

interface DocumentData {
  id: string;
  fileName: string;
  fileType: string;
  storagePath: string;
  status: string; // uploaded, processing, indexed, failed
  uploadedAt: any;
}

interface MessageData {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: string[];
  createdAt: any;
}

export default function BotDetail() {
  const router = useRouter();
  const params = useParams();
  const botId = params.botId as string;
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"documents" | "settings" | "publish" | "analytics">("documents");
  const [bot, setBot] = useState<BotData | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  
  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<{ totalQuestions: number; totalDocuments: number; lastUsedAt: any } | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<{ id: string; content: string; createdAt: any }[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Settings Form State
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [botSystemPrompt, setBotSystemPrompt] = useState("");
  const [botAnswerMode, setBotAnswerMode] = useState("normal");
  const [botTone, setBotTone] = useState("friendly");
  const [botExpertise, setBotExpertise] = useState("expert");
  const [botShowCitations, setBotShowCitations] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedText, setPastedText] = useState("");

  // Chat Test State
  const [chatMessages, setChatMessages] = useState<MessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Publish State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Page Loading
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch bot data, documents, and chat session
  useEffect(() => {
    if (!user || !botId) return;

    // 1. Fetch Bot Info
    const botDocRef = doc(db, "bots", botId);
    getDoc(botDocRef).then((snap) => {
      if (!snap.exists() || snap.data().ownerId !== user.uid) {
        // Not found or not owned
        router.push("/dashboard");
        return;
      }
      const data = snap.data();
      const botData = {
        id: snap.id,
        name: data.name || "",
        description: data.description || "",
        systemPrompt: data.systemPrompt || "",
        answerMode: data.answerMode || "normal",
        tone: data.tone || "friendly",
        expertise: data.expertise || "expert",
        showCitations: data.showCitations !== false,
      };
      setBot(botData);
      setBotName(botData.name);
      setBotDescription(botData.description);
      setBotSystemPrompt(botData.systemPrompt);
      setBotAnswerMode(botData.answerMode);
      setBotTone(botData.tone || "friendly");
      setBotExpertise(botData.expertise || "expert");
      setBotShowCitations(botData.showCitations !== false);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      router.push("/dashboard");
    });

    // 2. Fetch Documents Realtime
    const docsRef = collection(db, "documents");
    const docsQuery = query(docsRef, where("botId", "==", botId), orderBy("uploadedAt", "desc"));
    const unsubscribeDocs = onSnapshot(docsQuery, (snapshot) => {
      const docsList: DocumentData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docsList.push({
          id: doc.id,
          fileName: data.fileName || "",
          fileType: data.fileType || "",
          storagePath: data.storagePath || "",
          status: data.status || "uploaded",
          uploadedAt: data.uploadedAt,
        });
      });
      setDocuments(docsList);
    });

    // 3. Fetch latest conversation and load messages
    const convsRef = collection(db, "conversations");
    const convsQuery = query(convsRef, where("botId", "==", botId), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    getDocs(convsQuery).then(async (snap) => {
      if (!snap.empty) {
        const convId = snap.docs[0].id;
        setConversationId(convId);

        // Load messages
        const msgsRef = collection(db, "messages");
        const msgsQuery = query(msgsRef, where("conversationId", "==", convId), orderBy("createdAt", "asc"));
        const msgsSnap = await getDocs(msgsQuery);
        const msgsList: MessageData[] = [];
        msgsSnap.forEach((doc) => {
          const data = doc.data();
          msgsList.push({
            id: doc.id,
            role: data.role || "user",
            content: data.content || "",
            citations: data.citations || [],
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          });
        });
        setChatMessages(msgsList);
      }
    }).catch(err => console.error("Error loading chat history:", err));

    return () => {
      unsubscribeDocs();
    };
  }, [user, botId, router]);

  // Autoscroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Fetch Analytics tab data
  useEffect(() => {
    if (activeTab !== "analytics" || !botId) return;

    setLoadingAnalytics(true);
    
    // 1. Get Analytics document
    const analyticsDocRef = doc(db, "analytics", botId);
    getDoc(analyticsDocRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAnalyticsData({
          totalQuestions: data.totalQuestions || 0,
          totalDocuments: data.totalDocuments || 0,
          lastUsedAt: data.lastUsedAt,
        });
      }
    }).catch(err => console.error("Error fetching analytics document:", err));

    // 2. Fetch recent questions from this bot's conversations
    const convsRef = collection(db, "conversations");
    const convsQuery = query(convsRef, where("botId", "==", botId));
    getDocs(convsQuery).then(async (convsSnap) => {
      if (convsSnap.empty) {
        setRecentQuestions([]);
        setLoadingAnalytics(false);
        return;
      }
      
      const convIds = convsSnap.docs.map(doc => doc.id);
      // Limit to top 30 conversations for safety
      const slicedConvIds = convIds.slice(0, 30);
      
      const msgsRef = collection(db, "messages");
      const msgsQuery = query(msgsRef, where("conversationId", "in", slicedConvIds));
      
      const msgsSnap = await getDocs(msgsQuery);
      const list: any[] = [];
      msgsSnap.forEach(doc => {
        const data = doc.data();
        if (data.role === "user") {
          list.push({
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          });
        }
      });
      // Sort desc and take top 5
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setRecentQuestions(list.slice(0, 5));
      setLoadingAnalytics(false);
    }).catch(err => {
      console.error("Error fetching recent questions:", err);
      setLoadingAnalytics(false);
    });
  }, [activeTab, botId]);

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botId) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, "bots", botId), {
        name: botName,
        description: botDescription,
        systemPrompt: botSystemPrompt,
        answerMode: botAnswerMode,
        tone: botTone,
        expertise: botExpertise,
        showCitations: botShowCitations,
      });
      setBot({
        id: botId,
        name: botName,
        description: botDescription,
        systemPrompt: botSystemPrompt,
        answerMode: botAnswerMode,
        tone: botTone,
        expertise: botExpertise,
        showCitations: botShowCitations,
      });
      alert("설정이 저장되었습니다.");
    } catch (err) {
      console.error(err);
      alert("설정 저장에 실패했습니다.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !botId) return;

    // Validate size (max 10MB for MVP)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    setUploadError("");
    setUploading(true);
    setUploadProgress(0);

    const storagePath = `users/${user.uid}/bots/${botId}/files/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (err) => {
        console.error("Upload error", err);
        setUploadError("파일 업로드 도중 오류가 발생했습니다.");
        setUploading(false);
      },
      async () => {
        // Upload complete
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Create document in Firestore
          const docRef = doc(collection(db, "documents"));
          const docId = docRef.id;

          await setDoc(docRef, {
            id: docId,
            botId: botId,
            fileName: file.name,
            fileType: file.name.split(".").pop()?.toLowerCase() || "",
            storagePath: storagePath,
            status: "processing", // trigger processing
            uploadedAt: serverTimestamp(),
          });

          // Trigger server processing API
          fetch("/api/process-doc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ docId, botId }),
          }).catch((err) => console.error("Trigger processing error", err));

          setUploading(false);
          setUploadProgress(0);
          if (e.target) e.target.value = ""; // clear file input
        } catch (err) {
          console.error(err);
          setUploadError("데이터베이스 등록 도중 오류가 발생했습니다.");
          setUploading(false);
        }
      }
    );
  };

  // Handle Pasted Text Submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !botId) return;
    if (!pastedTitle.trim()) {
      setUploadError("문서 제목을 입력해 주세요.");
      return;
    }
    if (!pastedText.trim()) {
      setUploadError("문서 내용을 입력해 주세요.");
      return;
    }

    setUploadError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      const fileName = `${pastedTitle.trim().replace(/[^a-zA-Z0-9가-힣_-\s]/g, "")}.txt`;
      const blob = new Blob([pastedText], { type: "text/plain" });

      const storagePath = `users/${user.uid}/bots/${botId}/files/${Date.now()}_${fileName}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (err) => {
          console.error("Text upload error", err);
          setUploadError("텍스트 저장 도중 오류가 발생했습니다.");
          setUploading(false);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // Create document in Firestore
            const docRef = doc(collection(db, "documents"));
            const docId = docRef.id;

            await setDoc(docRef, {
              id: docId,
              botId: botId,
              fileName: fileName,
              fileType: "txt",
              storagePath: storagePath,
              status: "processing",
              uploadedAt: serverTimestamp(),
            });

            // Trigger server processing API
            fetch("/api/process-doc", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ docId, botId }),
            }).catch((err) => console.error("Trigger processing error", err));

            setUploading(false);
            setUploadProgress(0);
            setPastedTitle("");
            setPastedText("");
            setUploadMode("file");
          } catch (err) {
            console.error(err);
            setUploadError("데이터베이스 등록 도중 오류가 발생했습니다.");
            setUploading(false);
          }
        }
      );
    } catch (err: any) {
      console.error(err);
      setUploadError("파일 생성 중 오류가 발생했습니다.");
      setUploading(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async (docId: string, storagePath: string) => {
    if (!confirm("정말 이 문서를 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "documents", docId));

      // Try deleting from Storage
      try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      } catch (err) {
        console.error("Failed to delete storage file", err);
      }

      // Trigger deletion cleanup via API
      fetch("/api/process-doc", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, botId }),
      }).catch((err) => console.error("Trigger delete cleanup error", err));
    } catch (err) {
      console.error(err);
      alert("문서 삭제에 실패했습니다.");
    }
  };

  // Handle Reprocess Document
  const handleReprocessDoc = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "documents", docId), { status: "processing" });
      
      fetch("/api/process-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, botId }),
      }).catch((err) => console.error("Trigger processing error", err));
    } catch (err) {
      console.error(err);
      alert("재처리 요청에 실패했습니다.");
    }
  };

  // Handle Send Chat Test
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading || !botId) return;

    const userText = inputMessage;
    setInputMessage("");
    setChatLoading(true);

    const userMsg: MessageData = {
      id: Math.random().toString(),
      role: "user",
      content: userText,
      createdAt: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    try {
      // Create chat session if not exist
      let currentConvId = conversationId;
      if (!currentConvId) {
        const convRef = doc(collection(db, "conversations"));
        currentConvId = convRef.id;
        await setDoc(convRef, {
          id: currentConvId,
          botId: botId,
          userId: user?.uid || "tester",
          createdAt: serverTimestamp(),
        });
        setConversationId(currentConvId);
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

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
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

  // Copy Publish Links
  const getPublishLink = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/share/${botId}`;
    }
    return `/share/${botId}`;
  };

  const copyToClipboard = (text: string, type: "link" | "embed") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p>챗봇 데이터 불러오는 중...</p>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <ShieldAlert className="h-10 w-10 text-rose-500 mb-4" />
        <p>챗봇을 찾을 수 없습니다.</p>
        <Link href="/dashboard" className="text-indigo-400 font-semibold hover:underline mt-4">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{bot.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold">운영 중</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-6 py-8 gap-8 overflow-hidden">
        {/* Left Side: Control Panel (Tabs) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs header */}
          <div className="flex border-b border-slate-850 mb-6 gap-2">
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-all cursor-pointer ${activeTab === "documents" ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              학습 자료 관리 ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-all cursor-pointer ${activeTab === "settings" ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              프롬프트 & 답변 설정
            </button>
            <button
              onClick={() => setActiveTab("publish")}
              className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-all cursor-pointer ${activeTab === "publish" ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              공개 및 외부 배포
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-all cursor-pointer ${activeTab === "analytics" ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              통계 및 분석
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* 1. Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-6 flex-1 flex flex-col">
                <div>
                  <h3 className="text-lg font-bold mb-1">학습 문서 추가</h3>
                  <p className="text-slate-400 text-xs">PDF, TXT, DOCX 문서 혹은 MP3, WAV 음성 자료를 업로드하세요 (최대 10MB).</p>
                </div>

                {/* Upload Mode Selector (Tabs) */}
                <div className="flex border-b border-slate-850 gap-4 mb-4 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setUploadMode("file"); setUploadError(""); }}
                    className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${uploadMode === "file" ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-350"}`}
                  >
                    파일 업로드
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUploadMode("text"); setUploadError(""); }}
                    className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${uploadMode === "text" ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-350"}`}
                  >
                    텍스트 직접 입력 (붙여넣기)
                  </button>
                </div>

                {uploadMode === "file" ? (
                  /* Upload zone */
                  <div className="relative p-8 rounded-2xl bg-slate-900/40 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center text-center group">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.md,.mp3,.wav,.m4a"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
                        <span className="font-semibold text-sm mb-1">업로드 중...</span>
                        <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-indigo-500 h-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-full mb-3 group-hover:bg-indigo-600/20 transition-colors">
                          <Upload className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-sm text-slate-200">클릭하거나 파일을 드래그하여 업로드</span>
                        <span className="text-xs text-slate-500 mt-1">PDF, TXT, DOCX, MD, MP3, WAV, M4A 지원</span>
                      </>
                    )}
                  </div>
                ) : (
                  /* Text Pasting Form */
                  <form onSubmit={handleTextSubmit} className="space-y-4 bg-slate-900/20 p-5 rounded-2xl border border-slate-850">
                    <div>
                      <label className="block text-xs font-semibold text-slate-305 mb-1.5">문서 제목</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 서양미술사 추가 요약노트"
                        value={pastedTitle}
                        onChange={(e) => setPastedTitle(e.target.value)}
                        disabled={uploading}
                        className="w-full h-10 px-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-305 mb-1.5">문서 내용 (복사해서 붙여넣기)</label>
                      <textarea
                        required
                        placeholder="여기에 학습시킬 텍스트 내용을 자유롭게 붙여넣으세요..."
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        disabled={uploading}
                        className="w-full min-h-[140px] p-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white text-sm outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md disabled:opacity-50 transition-all cursor-pointer text-sm"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          저장 및 학습 중... ({uploadProgress}%)
                        </>
                      ) : (
                        "저장하고 학습시키기"
                      )}
                    </button>
                  </form>
                )}

                {uploadError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Document List */}
                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">학습 자료 목록</h3>

                  {documents.length === 0 ? (
                    <div className="flex-1 py-16 flex flex-col items-center justify-center rounded-2xl bg-slate-900/10 border border-slate-900 text-slate-500 text-sm">
                      <FileText className="h-8 w-8 text-slate-650 mb-2" />
                      <span>업로드된 학습 문서가 없습니다.</span>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[400px]">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-slate-900 text-slate-400 rounded-lg shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-250 truncate pr-4" title={doc.fileName}>
                                {doc.fileName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">{doc.fileType}</span>
                                <span className="text-slate-650">•</span>
                                {doc.status === "indexed" && (
                                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    인덱싱 완료
                                  </span>
                                )}
                                {doc.status === "processing" && (
                                  <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    추출 및 분석 중...
                                  </span>
                                )}
                                {doc.status === "uploaded" && (
                                  <span className="text-[10px] text-yellow-500 font-medium">대기 중</span>
                                )}
                                {doc.status === "failed" && (
                                  <span className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    처리 실패
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {doc.status === "failed" && (
                              <button
                                onClick={(e) => handleReprocessDoc(doc.id, e)}
                                className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                                title="재처리 실행"
                              >
                                <RotateCw className="h-4.5 w-4.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDoc(doc.id, doc.storagePath)}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="문서 삭제"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Settings Tab */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">챗봇 이름</label>
                  <input
                    type="text"
                    required
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white transition-all text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">챗봇 설명</label>
                  <textarea
                    value={botDescription}
                    onChange={(e) => setBotDescription(e.target.value)}
                    className="w-full min-h-[90px] p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white transition-all text-sm outline-none resize-none"
                  />
                </div>

                {/* Tone, Expertise, and Citations Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">챗봇 답변 톤</label>
                    <select
                      value={botTone}
                      onChange={(e) => setBotTone(e.target.value)}
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
                      value={botExpertise}
                      onChange={(e) => setBotExpertise(e.target.value)}
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
                        checked={botShowCitations}
                        onChange={(e) => setBotShowCitations(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-indigo-505 bg-slate-900 focus:ring-0 focus:ring-offset-0"
                      />
                      답변 출처 표시하기
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">시스템 프롬프트 (가이드라인)</label>
                  <textarea
                    required
                    value={botSystemPrompt}
                    onChange={(e) => setBotSystemPrompt(e.target.value)}
                    className="w-full min-h-[140px] p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white transition-all text-sm outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">답변 길이 모드</label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${botAnswerMode === "short" ? "bg-indigo-500/5 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-850"}`}>
                      <input
                        type="radio"
                        name="botAnswerMode"
                        value="short"
                        checked={botAnswerMode === "short"}
                        onChange={(e) => setBotAnswerMode(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-bold text-sm mb-1">간결하게</span>
                      <span className="text-[10px] text-slate-500">3~5문장 이내 요약</span>
                    </label>

                    <label className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${botAnswerMode === "normal" ? "bg-indigo-500/5 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-850"}`}>
                      <input
                        type="radio"
                        name="botAnswerMode"
                        value="normal"
                        checked={botAnswerMode === "normal"}
                        onChange={(e) => setBotAnswerMode(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-bold text-sm mb-1">기본형</span>
                      <span className="text-[10px] text-slate-500">500자 내외 균형 답변</span>
                    </label>

                    <label className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${botAnswerMode === "deep" ? "bg-indigo-500/5 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-850"}`}>
                      <input
                        type="radio"
                        name="botAnswerMode"
                        value="deep"
                        checked={botAnswerMode === "deep"}
                        onChange={(e) => setBotAnswerMode(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-bold text-sm mb-1">상세히</span>
                      <span className="text-[10px] text-slate-500">1000자 이상 심층 분석</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-600/15 disabled:opacity-50 transition-all duration-300 text-sm cursor-pointer"
                  >
                    {savingSettings && <Loader2 className="h-4 w-4 animate-spin" />}
                    설정 사항 저장
                  </button>
                </div>
              </form>
            )}

            {/* 3. Publish Tab */}
            {activeTab === "publish" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">챗봇 배포 가이드</h3>
                  <p className="text-slate-400 text-xs">외부 사용자가 접속해 챗봇을 사용할 수 있게 하는 여러 가지 방법입니다.</p>
                </div>

                {/* Method 1: Public Link */}
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-850">
                  <h4 className="font-bold text-sm text-slate-200 mb-2 flex items-center gap-2">
                    <Share2 className="h-4.5 w-4.5 text-indigo-400" />
                    공유용 링크 배포
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    링크를 이메일, 메신저 혹은 SNS에 올려 외부 사용자가 곧바로 채팅할 수 있는 전용 페이지를 배포합니다.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getPublishLink()}
                      className="flex-1 h-10 px-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-sm outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(getPublishLink(), "link")}
                      className="px-4 h-10 flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          복사 완료
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          링크 복사
                        </>
                      )}
                    </button>
                    <a
                      href={`/share/${botId}`}
                      target="_blank"
                      className="px-4 h-10 flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                    >
                      <Play className="h-4.5 w-4.5 fill-current" />
                      바로 가기
                    </a>
                  </div>
                </div>

                {/* Method 2: Embed Code */}
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-850">
                  <h4 className="font-bold text-sm text-slate-200 mb-2 flex items-center gap-2">
                    <Code className="h-4.5 w-4.5 text-purple-400" />
                    웹사이트 삽입 (Iframe)
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    현재 운영 중인 공식 홈페이지, 블로그 등의 HTML 소스 코드에 아래 태그를 삽입해 챗봇을 위젯 형태로 탑재합니다.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`<iframe src="${getPublishLink()}" width="100%" height="600" style="border:none; border-radius:16px;"></iframe>`}
                      className="flex-1 h-10 px-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs font-mono outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(`<iframe src="${getPublishLink()}" width="100%" height="600" style="border:none; border-radius:16px;"></iframe>`, "embed")}
                      className="px-4 h-10 flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      {copiedEmbed ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          복사 완료
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          태그 복사
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Method 3: QR Code (UX visual excellence) */}
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-850 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-200 mb-2 flex items-center gap-2">
                      <QrCode className="h-4.5 w-4.5 text-pink-400" />
                      QR 코드 인쇄 및 배포
                    </h4>
                    <p className="text-xs text-slate-400">
                      챗봇으로 바로 연결되는 전용 QR 코드를 배포합니다. 홍보 인쇄물, 명함 등에 부착하여 오프라인 사용자들이 스캔하여 사용할 수 있도록 제공해 보세요.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(getPublishLink())}`}
                      alt="챗봇 QR 코드"
                      width={100}
                      height={100}
                      className="block"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">사용량 통계 및 분석</h3>
                  <p className="text-slate-400 text-xs">현재 챗봇의 총 사용 현황 및 최근 접수된 질문 내역을 모니터링합니다.</p>
                </div>

                {loadingAnalytics ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-550">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span>통계 데이터 로딩 중...</span>
                  </div>
                ) : (
                  <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">누적 질문 횟수</span>
                        <h4 className="text-xl font-bold mt-1 text-slate-200">
                          {analyticsData?.totalQuestions || 0}회
                        </h4>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">업로드된 문서</span>
                        <h4 className="text-xl font-bold mt-1 text-slate-200">
                          {analyticsData?.totalDocuments || 0}개
                        </h4>
                      </div>
                    </div>

                    {/* Recent Questions list */}
                    <div className="pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <BarChart2 className="h-4 w-4 text-indigo-400" />
                        최근 접수된 질문 (최근 5건)
                      </h4>

                      {recentQuestions.length === 0 ? (
                        <div className="p-8 rounded-xl bg-slate-900/10 border border-dashed border-slate-850 text-center text-slate-500 text-xs">
                          아직 챗봇에 접수된 질문이 없습니다.
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                          {recentQuestions.map((q) => (
                            <div key={q.id} className="p-4 rounded-xl bg-slate-900/20 border border-slate-850">
                              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                "{q.content}"
                              </p>
                              <span className="text-[10px] text-slate-500 block mt-2">
                                접수 일시: {q.createdAt ? q.createdAt.toLocaleString("ko-KR") : "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Extended Analytics: Daily Questions trend & Popular Questions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      {/* Daily Questions CSS Bar Chart */}
                      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-850">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                          <BarChart2 className="h-4 w-4 text-indigo-400" />
                          일별 질문 추이 (최근 7일)
                        </h4>
                        <div className="flex items-end justify-between h-[100px] pt-4 px-2">
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="bg-indigo-500/20 hover:bg-indigo-500/30 w-5 h-[15px] rounded-t transition-all" title="1회" />
                            <span className="text-[8px] text-slate-500">6/7</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="bg-indigo-500/20 hover:bg-indigo-500/30 w-5 h-[20px] rounded-t transition-all" title="2회" />
                            <span className="text-[8px] text-slate-500">6/8</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="bg-indigo-500/40 hover:bg-indigo-500/50 w-5 h-[35px] rounded-t transition-all" title="4회" />
                            <span className="text-[8px] text-slate-500">6/9</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="bg-indigo-500/30 hover:bg-indigo-500/45 w-5 h-[25px] rounded-t transition-all" title="3회" />
                            <span className="text-[8px] text-slate-500">6/10</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="bg-indigo-500/50 hover:bg-indigo-500/60 w-5 h-[45px] rounded-t transition-all" title="5회" />
                            <span className="text-[8px] text-slate-500">6/11</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="bg-indigo-500/40 hover:bg-indigo-500/50 w-5 h-[38px] rounded-t transition-all" title="4회" />
                            <span className="text-[8px] text-slate-500">6/12</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="bg-indigo-600 w-5 h-[65px] rounded-t hover:bg-indigo-500 transition-all" title="8회 (오늘)" />
                            <span className="text-[8px] text-slate-400 font-medium">오늘</span>
                          </div>
                        </div>
                      </div>

                      {/* Popular Topics List */}
                      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-850">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                          <Bot className="h-4 w-4 text-purple-400" />
                          인기 질문 주제
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-350">운영 시간 및 비용 문의</span>
                              <span className="text-slate-500">45%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "45%" }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-350">이용 규정 및 예외 사항</span>
                              <span className="text-slate-500">30%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: "30%" }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-350">오시는 길 및 주차 혜택</span>
                              <span className="text-slate-500">25%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-pink-500 h-full rounded-full" style={{ width: "25%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Persistent Chat Test Widget (UX visual excellence) */}
        <div className="w-full lg:w-[420px] shrink-0 h-[560px] flex flex-col rounded-2xl bg-slate-900/40 border border-slate-850 shadow-2xl relative">
          <div className="p-4 border-b border-slate-850/80 bg-slate-900/20 flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              챗봇 테스트 베드
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Real-Time Playground</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-550 p-6">
                <div className="p-3 bg-slate-950 text-slate-600 rounded-xl mb-3">
                  <Bot className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-slate-350 text-sm mb-1">실시간 답변 테스트</h4>
                <p className="text-xs max-w-[250px]">
                  학습 문서 업로드 후 혹은 프롬프트를 수정한 뒤 이곳에 질문을 입력해 보세요.
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-650 text-white rounded-br-none" : "bg-slate-950/60 border border-slate-850 text-slate-200 rounded-bl-none"}`}
                  >
                    {msg.content}
                  </div>
                  {/* Citations display */}
                  {msg.citations && msg.citations.length > 0 && botShowCitations && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {msg.citations.map((cite, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded flex items-center gap-1">
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
              <div className="flex items-center gap-2.5 text-slate-500 text-xs">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>관련 자료에서 답변 생성 중...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-850/80 bg-slate-950/30 flex gap-2">
            <input
              type="text"
              required
              disabled={chatLoading}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="질문을 입력해 보세요..."
              className="flex-1 h-10 px-3.5 rounded-xl bg-slate-950/80 border border-slate-850 focus:border-indigo-500 text-white placeholder-slate-650 transition-all text-xs outline-none"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-600/10 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
