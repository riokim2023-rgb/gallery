import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export default function Artists() {
  const artists = [
    {
      id: 1,
      name: "강현우 (Hyun-woo Kang)",
      role: "Lead Resident Artist / Gold Relief Expert",
      bio: "오현단길 갤러리의 메인 아티스트로, 캔버스 위에 금박과 혼합 재료를 입체적으로 얹어내는 텍스처 작업을 다룹니다. 공간 전체에 전시된 황금빛 릴리프 시리즈의 주인공입니다.",
      email: "kang.hw@ohyeondangil.art",
      image: "/images/interior_wall.jpg", // Represented by wall painting art
    },
    {
      id: 2,
      name: "이민정 (Min-jung Lee)",
      role: "Urban Sketcher & Educator",
      bio: "제주의 사라져가는 구도심 골목길과 오랜 역사를 지닌 오현단의 풍경들을 펜과 미니 수채 물감으로 섬세하게 기록하는 드로잉 작가입니다. 토요 어반 스케치 수업을 이끌고 있습니다.",
      email: "lee.mj@ohyeondangil.art",
      image: "/images/street_view.jpg", // Represented by street view
    },
    {
      id: 3,
      name: "김서준 (Seo-jun Kim)",
      role: "AI & Media Collaboration Fellow",
      bio: "인공지능 이미지 생성 모델에 제주의 자연 질감을 합성하는 기술-예술 융합 창작자입니다. 기계와 아날로그의 물리적 충돌을 연구하는 오현단길 랩의 프로젝트를 담당하고 있습니다.",
      email: "kim.sj@ohyeondangil.art",
      image: "/images/interior_table.jpg", // Represented by community table workspace
    },
  ];

  return (
    <div className="flex-1 flex flex-col canvas-texture animate-fade-in">
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-stone-100 dark:border-stone-900">
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">RESIDENCY & COLLABORATION</span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-950 dark:text-white leading-tight">
            Artists (참여 작가)
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg font-light leading-relaxed">
            갤러리 오현단길은 작가들이 자유롭게 머물며 창작할 수 있는 소규모 레지던시를 연계 운영합니다. 
            아날로그 촉각 회화부터 디지털 기술 예술까지, 새로운 지평을 함께 열어가는 창작자들을 소개합니다.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6 w-full space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="group border border-stone-100 dark:border-stone-900 bg-white dark:bg-stone-950 p-6 space-y-6 hover:shadow-lg transition-all"
            >
              <div className="h-64 overflow-hidden relative border border-stone-50 dark:border-stone-900">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-102"
                />
              </div>
              <div className="space-y-3">
                <span className="text-[9px] tracking-widest text-gold-500 font-semibold uppercase block">
                  {artist.role}
                </span>
                <h3 className="font-serif text-lg text-stone-900 dark:text-white">
                  {artist.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed min-h-[80px]">
                  {artist.bio}
                </p>
                <div className="pt-4 border-t border-stone-50 dark:border-stone-900/50 flex items-center justify-between text-xs text-stone-400 dark:text-stone-600">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gold-500" />
                    {artist.email}
                  </span>
                  <Link href="/visit" className="hover:text-gold-500 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
