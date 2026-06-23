"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, RotateCcw, AlertTriangle, Image as ImageIcon, Upload, Download, RefreshCw } from "lucide-react";

export default function Lab() {
  const [activeMode, setActiveMode] = useState("urban");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sketchStyle, setSketchStyle] = useState("어반스케치");
  const [lineWeight, setLineWeight] = useState("보통");
  const [detailLevel, setDetailLevel] = useState("보통");
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const [generating, setGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes = [
    { id: "urban", name: "Urban Sketch", active: true, ko: "어반스케치" },
    { id: "portrait", name: "Portrait Sketch", active: false, badge: "Coming Soon", ko: "인물화" },
    { id: "watercolor", name: "Watercolor Sketch", active: false, badge: "Coming Soon", ko: "수채화" },
    { id: "coloring", name: "AI Coloring", active: false, badge: "Coming Soon", ko: "AI 컬러링" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        setResultImage(null);
        setErrorMsg(null);

        // Get dimensions of the uploaded image
        const img = new window.Image();
        img.onload = () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setErrorMsg("Please upload an image first.");
      return;
    }
    setGenerating(true);
    setErrorMsg(null);
    setResultImage(null);

    try {
      const response = await fetch("/api/generate-sketch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadedImage,
          style: sketchStyle,
          lineWeight: lineWeight,
          detailLevel: detailLevel,
          width: imageDimensions?.width,
          height: imageDimensions?.height,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setResultImage(data.url);
      } else {
        setErrorMsg(data.error || "Could not generate sketch. Please try again.");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Could not generate image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      if (resultImage.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = resultImage;
        const matches = resultImage.match(/^data:image\/([a-zA-Z+]+);base64,/);
        const ext = matches ? matches[1] : "png";
        a.download = `ohyeondangil_sketch_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fetch image to bypass CORS and download
        const response = await fetch(resultImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ohyeondangil_sketch_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      // Fallback: open in new tab
      window.open(resultImage, "_blank");
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResultImage(null);
    setSketchStyle("어반스케치");
    setLineWeight("보통");
    setDetailLevel("보통");
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrawAnother = () => {
    setUploadedImage(null);
    setResultImage(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 flex flex-col canvas-texture animate-fade-in">
      {/* Title */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full border-b border-stone-100 dark:border-stone-900">
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">CREATIVE DRAWING LAB</span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-950 dark:text-white leading-tight">
            Creative Drawing Lab
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-light leading-relaxed">
            갤러리 오현단길이 제시하는 디지털 창작 실험실입니다. 
            인공지능 이미지 처리 및 생성 모델을 활용하여, 아날로그 드로잉의 질감을 화면 위에 재현합니다.
          </p>
        </div>

        {/* Extensions Mode Tabs */}
        <div className="flex flex-wrap gap-3 mt-10 border-b border-stone-150 dark:border-stone-900 pb-4">
          {modes.map((mode) => (
            <button
              key={mode.id}
              disabled={!mode.active}
              onClick={() => setActiveMode(mode.id)}
              className={`px-5 py-2.5 text-xs tracking-wider uppercase transition-all relative flex items-center gap-2 rounded-none border ${
                activeMode === mode.id
                  ? "border-stone-900 bg-stone-900 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-stone-950 font-semibold"
                  : mode.active
                  ? "border-stone-200 text-stone-600 hover:border-stone-400 dark:border-stone-850 dark:text-stone-400 dark:hover:border-stone-600"
                  : "border-stone-100 text-stone-300 dark:border-stone-900 dark:text-stone-700 cursor-not-allowed"
              }`}
            >
              <span>{mode.name}</span>
              <span className="text-[9px] font-normal lowercase opacity-80">({mode.ko})</span>
              {mode.badge && (
                <span className="px-1.5 py-0.5 text-[8px] bg-stone-100 text-stone-500 dark:bg-stone-900 dark:text-stone-500 tracking-normal scale-90">
                  {mode.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Urban Sketch Generator Main panel */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left panel: Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-stone-50 dark:bg-stone-900/30 p-8 border border-stone-100 dark:border-stone-900 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-500" />
                <h3 className="font-serif text-xl text-stone-900 dark:text-white font-normal">
                  Urban Sketch Generator
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                사진을 업로드하면 어반스케치 스타일의 드로잉으로 변환됩니다.
              </p>
            </div>

            <div className="space-y-5">
              {/* 1. Image Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                  1. 이미지 업로드 (JPG, PNG)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                />
                
                {!uploadedImage ? (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full h-32 border border-dashed border-stone-200 dark:border-stone-850 hover:border-gold-500 text-stone-400 hover:text-gold-500 flex flex-col items-center justify-center gap-2 transition-colors bg-white dark:bg-stone-950"
                  >
                    <Upload className="h-6 w-6 stroke-[1.25]" />
                    <span className="text-xs font-light">클릭하여 사진 올리기</span>
                  </button>
                ) : (
                  <div className="relative border border-stone-200 dark:border-stone-850 p-2 bg-white dark:bg-stone-950">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleDrawAnother}
                      className="absolute top-4 right-4 bg-stone-900/80 text-white hover:bg-stone-950 px-2.5 py-1 text-[9px] tracking-wider uppercase font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Sketch Style Selection */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                  2. 스케치 스타일 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["어반스케치", "연필 드로잉", "아크릴화"].map((styleOpt) => (
                    <button
                      key={styleOpt}
                      type="button"
                      onClick={() => setSketchStyle(styleOpt)}
                      className={`py-2 text-[10px] font-medium tracking-wide uppercase border text-center transition-all ${
                        sketchStyle === styleOpt
                          ? "border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                          : "border-stone-200 dark:border-stone-850 text-stone-500 dark:text-stone-400 hover:border-stone-400"
                      }`}
                    >
                      {styleOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Line Weight Selection */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                  3. 선 굵기 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["얇게", "보통", "굵게"].map((weightOpt) => (
                    <button
                      key={weightOpt}
                      type="button"
                      onClick={() => setLineWeight(weightOpt)}
                      className={`py-2 text-[10px] font-medium tracking-wide uppercase border text-center transition-all ${
                        lineWeight === weightOpt
                          ? "border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                          : "border-stone-200 dark:border-stone-850 text-stone-500 dark:text-stone-400 hover:border-stone-400"
                      }`}
                    >
                      {weightOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Detail Level Selection */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                  4. 디테일 레벨 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["간단하게", "보통", "상세하게"].map((detailOpt) => (
                    <button
                      key={detailOpt}
                      type="button"
                      onClick={() => setDetailLevel(detailOpt)}
                      className={`py-2 text-[10px] font-medium tracking-wide uppercase border text-center transition-all ${
                        detailLevel === detailOpt
                          ? "border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                          : "border-stone-200 dark:border-stone-850 text-stone-500 dark:text-stone-400 hover:border-stone-400"
                      }`}
                    >
                      {detailOpt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-500 font-light text-center">
                {errorMsg}
              </p>
            )}

            {/* Generate Trigger Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !uploadedImage}
              className="w-full py-4 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs tracking-[0.25em] uppercase hover:bg-gold-600 font-semibold transition-all disabled:opacity-50 rounded-none flex items-center justify-center gap-2"
            >
              {generating ? "Generating..." : "SKETCH GENERATE"}
            </button>
          </div>

          {/* Right panel: Result Canvas Display */}
          <div className="lg:col-span-7 flex flex-col justify-between border border-dashed border-stone-200 dark:border-stone-850 p-6 min-h-[500px] bg-stone-50/20 relative">
            
            {generating && (
              <div className="absolute inset-0 bg-white/85 dark:bg-stone-950/85 backdrop-blur-xs flex flex-col justify-center items-center gap-4 z-25">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light tracking-widest uppercase animate-pulse">
                  Converting photo into hand-drawn sketch...
                </p>
              </div>
            )}

            {!resultImage ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 max-w-sm mx-auto">
                <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-full w-fit">
                  <ImageIcon className="h-8 w-8 text-stone-300 dark:text-stone-700" />
                </div>
                <h4 className="font-serif text-base text-stone-700 dark:text-stone-300">Generated Sketch Panel</h4>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-light leading-relaxed">
                  좌측에서 원본 사진을 올리고 스타일 옵션을 선택한 뒤 [SKETCH GENERATE] 버튼을 누르면 AI가 변환한 어반 스케치 결과물이 이곳에 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-6 w-full">
                {/* Result frame */}
                <div className="flex-1 flex items-center justify-center border-8 border-stone-150 dark:border-stone-900 bg-white p-3 shadow-md max-h-[420px] overflow-hidden">
                  <img
                    src={resultImage}
                    alt="AI Generated Urban Sketch"
                    className="max-h-[380px] w-auto object-contain max-w-full"
                  />
                </div>

                {/* Operations footer */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="py-3.5 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-gold-600 transition-all flex items-center justify-center gap-2 rounded-none"
                  >
                    <Download className="h-3.5 w-3.5" />
                    DOWNLOAD
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-3.5 border border-stone-200 text-stone-700 dark:border-stone-850 dark:text-stone-300 text-[10px] tracking-[0.2em] uppercase hover:border-stone-400 transition-all flex items-center justify-center gap-2 rounded-none"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    RESET
                  </button>
                  <button
                    type="button"
                    onClick={handleDrawAnother}
                    className="py-3.5 border border-stone-200 text-stone-700 dark:border-stone-850 dark:text-stone-300 text-[10px] tracking-[0.2em] uppercase hover:border-stone-400 transition-all flex items-center justify-center gap-2 rounded-none"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    다른 이미지
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upgrades guide */}
      <section className="bg-stone-50 dark:bg-stone-900/30 py-20 border-t border-stone-100 dark:border-stone-900 transition-colors">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-stone-900 dark:text-white">Creative Drawing Lab Roadmap</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              크리에이티브 드로잉 랩은 어반스케치 필터 모델을 시작으로, 인물 스케치 및 제주 감성 수채화 변환, 
              그리고 스케치 도안 위에 AI가 색을 입히는 가상 채색 서비스까지 고도화를 목표로 하고 있습니다.
            </p>
          </div>
          <div className="border border-stone-200 dark:border-stone-850 p-6 bg-white dark:bg-stone-950 space-y-4">
            <div className="flex items-center gap-2 text-gold-500 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4" />
              <span>UPCOMING SEMINAR</span>
            </div>
            <h4 className="font-serif text-base text-stone-900 dark:text-white">AI 프롬프트 페인팅과 아크릴 텍스처 실습</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              참여자가 입력한 단어로 생성한 AI 시안을 보고, 직접 캔버스 위에 모델링 페이스트와 붓을 들어 물리적 질감으로 재생산하는 독특한 결합 세미나입니다.
            </p>
            <Link href="/visit" className="text-xs text-stone-900 dark:text-white font-medium hover:text-gold-500 transition-colors inline-flex items-center gap-1">
              Apply to join <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
