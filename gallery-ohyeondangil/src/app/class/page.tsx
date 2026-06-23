import { Calendar, Users, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Class() {
  const classes = [
    {
      id: 1,
      title: "Urban Sketching (어반스케치)",
      tag: "Drawing & Watercolor",
      schedule: "주 1회, 총 4회 과정 (4 Sessions Course) | 매주 수요일 (Wed) 10:00 / 19:00",
      capacity: "정원 6명",
      price: "문의 후 안내 (Contact for Details)",
      materials: "개인 드로잉 펜, 스케치북, 워터컬러 키트 지참 (아뜰리에 내 별도 구매 가능)",
      image: "/images/street_view.jpg",
      description: "제주의 풍경과 일상을 관찰하고 기록하는 드로잉 클래스. Observe and record the atmosphere of Jeju through drawing. Suitable for beginners and experienced artists alike."
    },
    {
      id: 2,
      title: "Acrylic Painting (아크릴화)",
      tag: "Studio Painting",
      schedule: "주 1회, 총 4회 과정 (4 Sessions Course) | 매주 수요일 (Wed) 10:00 / 19:00",
      capacity: "정원 8명",
      price: "문의 후 안내 (Contact for Details)",
      materials: "개인 캔버스 및 아크릴 물감 지참 (아뜰리에 내 별도 구매 가능)",
      image: "/images/interior_wall.jpg",
      description: "기초부터 작품 제작까지 단계적으로 배우는 회화 수업. A studio-based painting class covering techniques from fundamentals to finished artworks."
    },
    {
      id: 3,
      title: "Drawing (드로잉)",
      tag: "Fine Art Foundation",
      schedule: "주 1회, 총 4회 과정 (4 Sessions Course) | 매주 수요일 (Wed) 10:00 / 19:00",
      capacity: "정원 6명",
      price: "문의 후 안내 (Contact for Details)",
      materials: "개인 소묘용 연필 및 드로잉북 지참 (아뜰리에 내 별도 구매 가능)",
      image: "/images/interior_table.jpg",
      description: "모든 그림의 기초가 되는 관찰력과 표현력을 배우는 수업. The foundation of all visual art. Learn observation, structure, proportion, and shading."
    },
    {
      id: 4,
      title: "Portrait Drawing (연필 인물화)",
      tag: "Academic Pencil Art",
      schedule: "주 1회, 총 4회 과정 (4 Sessions Course) | 매주 수요일 (Wed) 10:00 / 19:00",
      capacity: "정원 5명 (1:1 개별 지도)",
      price: "문의 후 안내 (Contact for Details)",
      materials: "개인 소묘 연필 세트 및 인물 전용 스케치 페이퍼 지참 (아뜰리에 내 별도 구매 가능)",
      image: "/images/interior_detail.jpg",
      description: "연필을 이용한 인물화 표현 과정. Learn facial structure, proportion, and realistic portrait rendering using pencil."
    },
    {
      id: 5,
      title: "Oil Pastel (오일파스텔)",
      tag: "Colorful Expression",
      schedule: "주 1회, 총 4회 과정 (4 Sessions Course) | 매주 수요일 (Wed) 10:00 / 19:00",
      capacity: "정원 8명",
      price: "문의 후 안내 (Contact for Details)",
      materials: "개인 오일파스텔 및 전용 페이퍼 지참 (아뜰리에 내 별도 구매 가능)",
      image: "/images/interior_table.jpg",
      description: "오일파스텔의 따뜻한 색감과 질감을 활용한 수업. Create expressive artworks using the unique texture and color of oil pastels."
    },
    {
      id: 6,
      title: "AI & Art",
      tag: "Digital Experiments & Workshop",
      schedule: "주말 원데이 워크숍 (Weekend One-Day Workshops) *예약 필수",
      capacity: "정원 10명",
      price: "문의 후 안내 (Contact for Details)",
      materials: "개인 태블릿/노트북 지참 (클라우드 GPU 환경 제공)",
      image: "/images/exterior.jpg",
      description: "생성형 AI와 예술을 결합한 창작 실험 프로그램. Creative workshops exploring the intersection of contemporary art and generative AI."
    }
  ];

  return (
    <div className="flex-1 flex flex-col canvas-texture animate-fade-in">
      {/* Title Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-stone-100 dark:border-stone-900">
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">CREATIVE CLASSES</span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-950 dark:text-white leading-tight">
            로컬 아뜰리에 창작 수업
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg font-light leading-relaxed">
            갤러리 오현단길은 누구나 아티스트가 될 수 있는 공간입니다. 
            구도심의 정취를 종이 위에 적어내려가는 드로잉 스케치부터, 
            실물 캔버스 위에 묵직한 텍스처를 얹어내는 질감 회화까지 준비되어 있습니다.
          </p>
        </div>
      </section>

      {/* Class list */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full space-y-20">
        {classes.map((cls, index) => (
          <div 
            key={cls.id} 
            className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
              index % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Image container */}
            <div className={`lg:col-span-6 ${index % 2 === 1 ? "lg:order-last" : ""} overflow-hidden border border-stone-100 dark:border-stone-900`}>
              <img
                src={cls.image}
                alt={cls.title}
                className="w-full h-[400px] object-cover transition-transform duration-500 hover:scale-102"
              />
            </div>

            {/* Content container */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-900 text-[10px] tracking-[0.2em] uppercase text-stone-600 dark:text-stone-400 font-semibold">
                {cls.tag}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-white leading-tight">
                {cls.title}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                {cls.description}
              </p>

              {/* Specs box */}
              <div className="grid grid-cols-2 gap-4 border-t border-stone-100 dark:border-stone-900 pt-6 text-xs text-stone-500 dark:text-stone-400">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-stone-400 dark:text-stone-600 block">SCHEDULE</span>
                  <div className="flex items-center gap-1.5 font-light text-stone-850 dark:text-stone-200">
                    <Calendar className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                    <span>{cls.schedule}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-stone-400 dark:text-stone-600 block">CAPACITY</span>
                  <div className="flex items-center gap-1.5 font-light text-stone-850 dark:text-stone-200">
                    <Users className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                    <span>{cls.capacity}</span>
                  </div>
                </div>

                <div className="space-y-1 col-span-2 border-t border-stone-50 dark:border-stone-900/50 pt-3">
                  <span className="text-[10px] uppercase text-stone-400 dark:text-stone-600 block">MATERIALS</span>
                  <div className="flex items-center gap-1.5 font-light text-stone-850 dark:text-stone-200">
                    <Award className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                    <span>{cls.materials}</span>
                  </div>
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-900 pt-6 gap-4">
                <span className="font-serif text-lg text-stone-900 dark:text-white font-medium">{cls.price}</span>
                <Link
                  href="/visit"
                  className="px-6 py-3.5 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs tracking-[0.2em] uppercase hover:bg-gold-600 font-semibold transition-all inline-flex items-center gap-2"
                >
                  Book Seat
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
