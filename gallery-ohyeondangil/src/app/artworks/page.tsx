import { Eye, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function Artworks() {
  const artworks = [
    {
      id: 1,
      title: "오현단의 햇살 I (Sunlight of Ohyeondan I)",
      artist: "오현단길 레지던시 작가",
      size: "70 × 70 cm",
      medium: "Canvas with Gold Leaf & Mixed Media",
      price: "1,200,000 KRW",
      status: "Available",
      image: "/images/interior_wall.jpg",
    },
    {
      id: 2,
      title: "제주 돌담의 텍스처 (Stone Wall Texture)",
      artist: "로컬 컬래버레이터",
      size: "50 × 50 cm",
      medium: "Acrylic & Modeling Paste on Canvas",
      price: "850,000 KRW",
      status: "Reserved",
      image: "/images/interior_detail.jpg",
    },
    {
      id: 3,
      title: "바람과 구도심 (Wind & Old Town)",
      artist: "오현단길 레지던시 작가",
      size: "90 × 60 cm",
      medium: "Mixed Media with Gold Relief",
      price: "1,500,000 KRW",
      status: "Available",
      image: "/images/interior_table.jpg",
    },
    {
      id: 4,
      title: "오현길 모퉁이 (Ohyuon Road Corner)",
      artist: "어반 스케치 강사 대표작",
      size: "40 × 40 cm",
      medium: "Pen and Acrylic on Wood Panel",
      price: "450,000 KRW",
      status: "Sold Out",
      image: "/images/exterior.jpg",
    },
  ];

  return (
    <div className="flex-1 flex flex-col canvas-texture animate-fade-in">
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-stone-100 dark:border-stone-900">
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">EXHIBITION & ONLINE SHOP</span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-950 dark:text-white leading-tight">
            Artworks (작품 목록)
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg font-light leading-relaxed">
            갤러리 오현단길에 전시 및 보관되어 있는 오리지널 원화 컬렉션입니다. 
            황금빛 텍스처 입체 회화, 어반 스케치 원작 등을 안전하게 감상하고 소장해 보세요.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {artworks.map((art) => (
            <div
              key={art.id}
              className="group border border-stone-100 dark:border-stone-900 bg-white dark:bg-stone-950 p-6 space-y-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="h-96 overflow-hidden relative border border-stone-50 dark:border-stone-900 bg-stone-50 dark:bg-stone-900">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-[9px] tracking-widest uppercase font-semibold border ${
                    art.status === "Available"
                      ? "bg-white/95 text-stone-900 border-stone-200"
                      : art.status === "Reserved"
                      ? "bg-gold-500/90 text-stone-950 border-gold-400"
                      : "bg-stone-900/95 text-stone-400 border-stone-850"
                  }`}>
                    {art.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-serif text-lg text-stone-900 dark:text-white group-hover:text-gold-500 transition-colors">
                      {art.title}
                    </h4>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-light mt-1">
                      {art.artist} | {art.size}
                    </p>
                  </div>
                  <span className="font-serif text-base text-stone-900 dark:text-white whitespace-nowrap">
                    {art.price}
                  </span>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  재료: {art.medium}. 갤러리 1층에서 직접 실물을 감상할 수 있습니다.
                </p>

                <div className="pt-2 flex gap-4">
                  <Link
                    href="/visit"
                    className="flex-1 py-3 text-center border border-stone-200 dark:border-stone-850 hover:border-gold-500 text-[10px] tracking-[0.2em] uppercase text-stone-850 dark:text-stone-200 hover:text-gold-500 font-medium transition-all"
                  >
                    Inquire Art
                  </Link>
                  <button
                    disabled={art.status !== "Available"}
                    className="px-4 py-3 border border-stone-950 bg-stone-950 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-stone-950 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-200 disabled:dark:bg-stone-900 disabled:dark:border-stone-850 disabled:dark:text-stone-600 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
