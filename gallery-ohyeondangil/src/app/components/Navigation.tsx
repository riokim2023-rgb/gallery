"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Space", href: "/space", ko: "공간" },
    { name: "Artists", href: "/artists", ko: "작가" },
    { name: "Artworks", href: "/artworks", ko: "작품" },
    { name: "Class", href: "/class", ko: "수업" },
    { name: "Lab", href: "/lab", ko: "실험실" },
    { name: "Visit", href: "/visit", ko: "방문" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-100 dark:border-stone-900 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex flex-col justify-center">
          <span className="font-serif text-xl tracking-[0.25em] font-normal text-stone-900 dark:text-white transition-all group-hover:text-gold-500">
            GALLERY <span className="font-sans font-light text-sm tracking-[0.3em] ml-1 text-stone-500 dark:text-stone-400">OHYEONDANGIL</span>
          </span>
          <span className="text-[9px] tracking-[0.4em] font-light text-stone-400 dark:text-stone-600 uppercase mt-0.5">
            Jeju Art Salon & Platform
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group relative py-2 flex flex-col items-center"
              >
                <span className={`text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${
                  isActive ? "text-gold-500 font-semibold" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}>
                  {link.name}
                </span>
                <span className="text-[9px] font-light text-stone-300 dark:text-stone-600 tracking-wider scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-1">
                  {link.ko}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-gold-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button / Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/visit"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-[11px] font-medium tracking-[0.2em] uppercase border border-stone-200 dark:border-stone-850 hover:border-gold-500 hover:text-gold-500 rounded-none transition-all duration-300"
          >
            Reservation
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6 stroke-[1.25]" /> : <Menu className="h-6 w-6 stroke-[1.25]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[116px] z-50 bg-white dark:bg-stone-950 px-6 py-8 flex flex-col justify-between border-t border-stone-100 dark:border-stone-900 animate-fade-in transition-colors">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-baseline justify-between border-b border-stone-50 dark:border-stone-900 pb-3"
                >
                  <span className={`text-lg tracking-[0.15em] uppercase font-light ${
                    isActive ? "text-gold-500 font-normal" : "text-stone-800 dark:text-stone-200"
                  }`}>
                    {link.name}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-600 font-light tracking-widest">
                    {link.ko}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4">
            <Link
              href="/visit"
              onClick={() => setIsOpen(false)}
              className="w-full py-4 flex items-center justify-center text-xs tracking-[0.2em] uppercase bg-stone-900 text-white dark:bg-gold-500 dark:text-stone-950 font-medium transition-colors"
            >
              Book a Visit
            </Link>
            <div className="text-center text-[10px] text-stone-400 dark:text-stone-600 tracking-wider">
              OPEN TUE - SUN 13:00 - 20:00 (방문예약) | <a href="tel:064-752-1112" className="hover:text-gold-500 transition-colors">064-752-1112</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
