import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navigation from "./components/Navigation";
import FaqChatbot from "../components/FaqChatbot";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gallery Ohyeondangil | 제주의 작은 예술 플랫폼",
  description: "제주 구도심 모퉁이에서 만나는 예술적 발견. 전시, 워크숍, 어반 스케치, 그리고 AI 디지털 실험이 이루어지는 크리에이티브 공간입니다.",
  keywords: ["갤러리 오현단길", "제주 갤러리", "제주 미술 공간", "제주 어반스케치", "제주 원데이클래스", "제주 AI 아트"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-stone-900 selection:bg-gold-500/20 selection:text-gold-900 dark:bg-stone-950 dark:text-stone-100 transition-colors duration-300">
        {/* Top slim bar */}
        <div className="w-full bg-stone-900 text-stone-300 dark:bg-stone-950 dark:border-b dark:border-stone-900 text-[11px] tracking-[0.2em] uppercase py-2.5 px-6 flex justify-between items-center transition-colors">
          <span>Jeju Old Town, Contemporary Art Platform</span>
          <span className="hidden sm:inline">Open Tue - Sun, 13:00 - 20:00 (방문예약)</span>
        </div>

        {/* Global Navigation Component */}
        <Navigation />

        {/* Page Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Global Footer */}
        <footer className="border-t border-stone-100 dark:border-stone-900 py-16 px-6 bg-stone-50 dark:bg-stone-950/40 transition-colors">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2 space-y-6">
              <h2 className="font-serif text-2xl tracking-widest font-normal text-stone-900 dark:text-white">
                GALLERY <span className="text-gold-500 font-light font-sans text-xl">OHYEONDANGIL</span>
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed font-light">
                제주 구도심의 역사적 정취 속에서 창작자와 대중이 만나 이야기를 나누고, 새로운 예술적 실험(AI & Art)을 전개하는 열린 예술 플랫폼입니다.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-sm font-light">
                <li>
                  <Link href="/space" className="hover:text-gold-500 transition-colors">Space (공간)</Link>
                </li>
                <li>
                  <Link href="/artists" className="hover:text-gold-500 transition-colors">Artists (작가)</Link>
                </li>
                <li>
                  <Link href="/artworks" className="hover:text-gold-500 transition-colors">Artworks (작품)</Link>
                </li>
                <li>
                  <Link href="/class" className="hover:text-gold-500 transition-colors">Class (수업)</Link>
                </li>
                <li>
                  <Link href="/lab" className="hover:text-gold-500 transition-colors">Lab (실험실)</Link>
                </li>
                <li>
                  <Link href="/visit" className="hover:text-gold-500 transition-colors">Visit (오시는길)</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500">
                Contact & Address
              </h4>
              <address className="not-italic text-sm font-light text-stone-500 dark:text-stone-400 space-y-2 leading-relaxed">
                <p>제주특별자치도 제주시 중앙로 21길 18 1층 (이도1동, 삼성혈 문화의 거리)</p>
                <p>Tel: <a href="tel:064-752-1112" className="hover:text-gold-500 transition-colors">064-752-1112</a></p>
                <p>Email: contact@ohyeondangil.art</p>
              </address>
              <div className="pt-2 flex gap-4">
                <a href="https://www.instagram.com/jeju.gallery" target="_blank" rel="noopener noreferrer" className="text-xs text-stone-400 hover:text-gold-500 transition-colors tracking-wider">INSTAGRAM</a>
                <a href="#" className="text-xs text-stone-400 hover:text-gold-500 transition-colors tracking-wider">BLOG</a>
              </div>
            </div>
          </div>

          {/* Institutional Links & Copyright sub-footer */}
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-200 dark:border-stone-900 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-light text-stone-400 dark:text-stone-500">
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a 
                href="https://www.jfac.kr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 px-3.5 py-2 bg-white dark:bg-stone-900/30 border border-stone-200 dark:border-stone-900 text-[10px] font-medium tracking-wider text-stone-700 dark:text-stone-300 hover:scale-[1.03] hover:bg-stone-50 hover:dark:bg-stone-900/60 hover:text-stone-950 hover:dark:text-white hover:border-stone-300 hover:dark:border-stone-800 transition-all duration-300 rounded-sm shadow-sm"
              >
                <img 
                  src="/images/logo_jfac.png" 
                  alt="제주문화예술재단" 
                  className="h-5 w-auto object-contain"
                />
                <span>제주문화예술재단</span>
              </a>
              <a 
                href="https://jiaf.co.kr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 px-3.5 py-2 bg-white dark:bg-stone-900/30 border border-stone-200 dark:border-stone-900 text-[10px] font-medium tracking-wider text-stone-700 dark:text-stone-300 hover:scale-[1.03] hover:bg-stone-50 hover:dark:bg-stone-900/60 hover:text-stone-950 hover:dark:text-white hover:border-stone-300 hover:dark:border-stone-800 transition-all duration-300 rounded-sm shadow-sm"
              >
                <img 
                  src="/images/logo_jiaf.png" 
                  alt="제주화랑협회·JIAF" 
                  className="h-5 w-auto object-contain"
                />
                <span>제주화랑협회·JIAF</span>
              </a>
              <a 
                href="https://www.kawf.kr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 px-3.5 py-2 bg-white dark:bg-stone-900/30 border border-stone-200 dark:border-stone-900 text-[10px] font-medium tracking-wider text-stone-750 dark:text-stone-300 hover:scale-[1.03] hover:bg-stone-50 hover:dark:bg-stone-900/60 hover:text-stone-950 hover:dark:text-white hover:border-stone-300 hover:dark:border-stone-800 transition-all duration-300 rounded-sm shadow-sm"
              >
                <img 
                  src="/images/logo_kawf.png" 
                  alt="한국예술인복지재단" 
                  className="h-5 w-auto object-contain"
                />
                <span>한국예술인복지재단</span>
              </a>
            </div>
            <div className="tracking-wider text-center md:text-right">
              © 2026 Gallery Ohyeondangil. All rights reserved.
            </div>
          </div>
        </footer>
        <FaqChatbot />
      </body>
    </html>
  );
}
