import Link from "next/link";
import { artworks } from "@/lib/artworks";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function TalkLanding() {
  return (
    <div className="flex-1 flex flex-col canvas-texture animate-fade-in">
      {/* Header Intro Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-stone-100 dark:border-stone-900">
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">
            OPEN GALLERY OS — TALK MVP
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-950 dark:text-white leading-tight">
            Talk to Art (작품에게 묻기)
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg font-light leading-relaxed">
            갤러리가 닫혀 있는 시간에도 작품과 작가는 보이지 않는 대화를 나누고 있습니다. 
            원하는 작품을 선택하고, 작품 뒤에 숨겨진 이야기, 재료의 촉감, 혹은 마주한 여백에 대해 자유롭게 질문해 보세요. 
            이도1동 삼성혈 문화의 거리 정취 속에서 탄생한 **AI 도슨트**가 당신만의 고유한 관람을 돕기 위해 예술적 해설을 건넵니다.
          </p>
        </div>
      </section>

      {/* Selector Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="space-y-4 mb-12">
          <h3 className="font-serif text-2xl text-stone-900 dark:text-white font-normal">Select an Artwork</h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-light">대화를 나눌 작품을 하나 선택해 주세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {artworks.map((art) => (
            <div
              key={art.id}
              className="group border border-stone-100 dark:border-stone-900 bg-white dark:bg-stone-950 p-6 space-y-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="h-80 overflow-hidden relative border border-stone-50 dark:border-stone-900 bg-stone-50 dark:bg-stone-900">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-[9px] tracking-widest uppercase font-semibold border bg-white/95 text-stone-900 border-stone-200 dark:bg-stone-900/95 dark:text-gold-500 dark:border-stone-800">
                      Docent Available
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif text-lg text-stone-900 dark:text-white group-hover:text-gold-500 transition-colors">
                    {art.title}
                  </h4>
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-light">
                    {art.artist} | {art.medium} | {art.size}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed line-clamp-2">
                    {art.description}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/talk/${art.id}`}
                  className="w-full py-4 flex items-center justify-center gap-2 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs tracking-[0.2em] uppercase font-semibold hover:bg-stone-850 dark:hover:bg-gold-400 transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  Begin Conversation (대화 시작)
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
