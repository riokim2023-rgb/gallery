import Link from "next/link";
import { ArrowUpRight, ArrowRight, Compass, Sparkles, MapPin, Calendar, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col canvas-texture">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-end px-6 py-16 md:py-24 max-w-7xl mx-auto w-full">
        {/* Background Decorative Gold Accent */}
        <div className="absolute top-1/4 right-10 w-[300px] h-[300px] bg-gold-200/20 dark:bg-gold-900/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end z-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold-500/30 bg-gold-50/50 dark:bg-stone-900/50 text-gold-600 dark:text-gold-500 text-[10px] tracking-[0.2em] uppercase font-medium">
              <Sparkles className="h-3 w-3" />
              Jeju Contemporary Art Salon
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.2] tracking-tight text-stone-950 dark:text-white">
              감상에서 창작으로,<br />
              제주 골목에서 시작되는<br />
              <span className="italic font-light text-gold-500">예술적 발견</span>
            </h1>
            
            <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg font-light leading-relaxed max-w-xl">
              갤러리 오현단길은 제주 구도심의 고요한 골목길 모퉁이에 위치한 작은 예술 플랫폼입니다. 
              관람을 넘어, 흰색 테이블에 함께 모여 앉아 그리고, 배우고, AI 프로젝트와 같은 새로운 실험을 나눕니다.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/class"
                className="px-8 py-4 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs tracking-[0.25em] uppercase hover:bg-gold-600 dark:hover:bg-gold-600 dark:hover:text-white transition-all duration-300 flex items-center gap-3"
              >
                Explore Classes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/space"
                className="px-8 py-4 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white text-xs tracking-[0.25em] uppercase hover:border-gold-500 hover:text-gold-500 transition-all duration-300"
              >
                Discover Space
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="border border-stone-100 dark:border-stone-900 p-6 bg-white/50 dark:bg-stone-900/30 backdrop-blur-sm space-y-4">
              <span className="text-[10px] tracking-[0.25em] uppercase text-stone-400 font-semibold block">CURRENT EXHIBITION</span>
              <h3 className="font-serif text-lg text-stone-900 dark:text-white">JIAF 2026: 제주 국제 아트페어 특별전</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                제주의 자연에서 얻은 색감과 아날로그적인 회화 텍스처를 중심으로 한 입체 미술 전시.
              </p>
              <a href="https://jiaf.co.kr/" target="_blank" rel="noopener noreferrer" className="text-xs tracking-wider text-gold-500 hover:text-gold-600 transition-colors flex items-center gap-1 font-medium pt-2">
                VIEW DETAILS <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE VISUAL REFERENCE (Actual Space Images showcase) */}
      <section className="bg-stone-50 dark:bg-stone-900/20 py-24 border-t border-b border-stone-100 dark:border-stone-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">THE ATMOSPHERE</span>
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 dark:text-white">
                오현단길의 물리적 공간
              </h2>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-light leading-relaxed max-w-md">
              대형 통유리창으로 가득 채워진 제주 구도심의 모퉁이 공간. 따뜻한 조명 아래서 흘러나오는 
              예술적 질감과 중앙의 하얀 살롱 테이블은 당신의 창작 세포를 깨웁니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Image card 1: Exterior */}
            <div className="group overflow-hidden bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 transition-all hover:shadow-lg">
              <div className="h-80 overflow-hidden relative">
                <img
                  src="/images/exterior.jpg"
                  alt="Gallery Ohyeondangil Exterior"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500">Exterior</span>
                <h4 className="font-serif text-base text-stone-900 dark:text-white">구도심의 정겨운 모퉁이 길목</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  옛 제주 돌담길 옆, 아늑하고 클래식한 매력을 가득 머금은 빌딩 코너에 위치하고 있습니다.
                </p>
              </div>
            </div>

            {/* Image card 2: Interior Table */}
            <div className="group overflow-hidden bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 transition-all hover:shadow-lg">
              <div className="h-80 overflow-hidden relative">
                <img
                  src="/images/interior_table.jpg"
                  alt="Gallery Ohyeondangil Interior Community Table"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500">Art Salon</span>
                <h4 className="font-serif text-base text-stone-900 dark:text-white">소통이 흘러넘치는 타원형 테이블</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  단순히 서서 보는 관람 방식을 넘어, 중앙의 하얀 테이블에 둘러앉아 예술을 토론하고 실습합니다.
                </p>
              </div>
            </div>

            {/* Image card 3: Interior Wall */}
            <div className="group overflow-hidden bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 transition-all hover:shadow-lg">
              <div className="h-80 overflow-hidden relative">
                <img
                  src="/images/interior_wall.jpg"
                  alt="Gallery Ohyeondangil Wall Artworks"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500">Texture Painting</span>
                <h4 className="font-serif text-base text-stone-900 dark:text-white">황금빛 회화의 입체적 에너지</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  벽면에 수놓아진 강렬한 황금빛 텍스처 작품들이 미니멀한 공간에 고급스러운 생기를 불어넣습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC ACTIVITIES (Exhibition, Class, AI Project) */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
            <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">WHAT WE DO</span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight text-stone-900 dark:text-white">
              우리가 확장하는<br />예술적 범위
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-light leading-relaxed">
              박제된 미술이 아닌, 매일 조금씩 숨 쉬며 성장하는 플랫폼입니다. 회화부터 디지털 드로잉, 가상과 실제의 경계를 허무는 AI 실험까지 아우릅니다.
            </p>
            <div className="pt-4">
              <Link 
                href="/class" 
                className="text-xs tracking-[0.2em] uppercase text-stone-900 dark:text-white hover:text-gold-500 transition-colors inline-flex items-center gap-2 border-b border-stone-200 dark:border-stone-850 pb-2 font-medium"
              >
                View all programs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-12">
            {/* Activity 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12 border-b border-stone-100 dark:border-stone-900">
              <span className="md:col-span-2 text-2xl font-serif text-stone-300 dark:text-stone-700">01</span>
              <div className="md:col-span-10 space-y-3">
                <h3 className="font-serif text-xl text-stone-900 dark:text-white">Art Exhibitions & Sales (전시 및 판매)</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  지역 내외 신진 작가들의 현대적 시각을 담은 참신한 전시를 기획합니다. 
                  대형 기획 전시뿐만 아니라, 작가들과 대중이 소통하며 소장할 수 있는 합리적인 원화 및 판화 숍을 함께 기획 및 개발하고 있습니다.
                </p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12 border-b border-stone-100 dark:border-stone-900">
              <span className="md:col-span-2 text-2xl font-serif text-stone-300 dark:text-stone-700">02</span>
              <div className="md:col-span-10 space-y-3">
                <h3 className="font-serif text-xl text-stone-900 dark:text-white">Urban Sketching & Workshops (어반스케치와 워크숍)</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  제주 구도심의 아름다운 역사 유적지 '오현단'의 돌담과 옛 목관아가 내려다보이는 거리에서 직접 펜을 들고 골목의 정취를 종이에 기록하는 클래스입니다. 
                  오현단길 돌담의 금빛 질감을 아크릴 물감과 나이프로 구현하는 다양한 기법의 텍스처 워크숍도 함께 열립니다.
                </p>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
              <span className="md:col-span-2 text-2xl font-serif text-stone-300 dark:text-stone-700">03</span>
              <div className="md:col-span-10 space-y-3">
                <h3 className="font-serif text-xl text-stone-900 dark:text-white">AI & Digital Art Experiments (AI 및 디지털 예술 융합)</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  생성형 AI 기술을 활용하여 예술 창작의 정의를 실험합니다. 
                  텍스트 프롬프트를 입력하면 갤러리 오현단길 고유의 회화 기법을 학습한 가상 화가가 그림을 그리는 인터랙티브 미디어 프로젝트와 워크숍을 정기적으로 개최합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC INTERACTIVE COMPONENT: AI playground mini widget */}
      <section className="bg-stone-950 text-white py-24 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 border border-stone-800 text-gold-500 text-[10px] tracking-[0.2em] uppercase font-semibold">
            <Sparkles className="h-3 w-3" />
            AI Art Lab Preview
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            가상 화가와 대화하며 그리는 제주
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
            갤러리 오현단길이 시도하는 AI & Art 융합 프로젝트의 일부를 미리 체험해보세요. 제주의 자연과 바람의 키워드를 던져주시면 가상의 AI 모델이 그림을 완성합니다.
          </p>

          <div className="pt-4">
            <Link
              href="/lab"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-stone-950 text-xs tracking-[0.2em] uppercase hover:bg-gold-500 hover:text-stone-950 transition-all font-semibold"
            >
              Go to AI Playground
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. VISIT & SCHEDULE DETAILS */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full border-t border-stone-100 dark:border-stone-900 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="p-3 bg-stone-50 dark:bg-stone-900 w-fit rounded-none">
              <MapPin className="h-6 w-6 text-gold-500" />
            </div>
            <h4 className="font-serif text-lg text-stone-900 dark:text-white">Location</h4>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              제주특별자치도 제주시 중앙로 21길 18 1층<br />
              (이도1동, 삼성혈 문화의 거리)
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-stone-50 dark:bg-stone-900 w-fit rounded-none">
              <Clock className="h-6 w-6 text-gold-500" />
            </div>
            <h4 className="font-serif text-lg text-stone-900 dark:text-white">Opening Hours</h4>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              화요일 — 일요일 (Tue - Sun)<br />
              13:00 - 20:00 (방문예약)<br />
              <span className="text-stone-400 dark:text-stone-600">* 매주 월요일 정기 휴무 및 전시 교체일</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-stone-50 dark:bg-stone-900 w-fit rounded-none">
              <Calendar className="h-6 w-6 text-gold-500" />
            </div>
            <h4 className="font-serif text-lg text-stone-900 dark:text-white">Salon Reservation</h4>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              원데이 체험 및 취미미술 클래스, AI 아트 융합 세미나는 쾌적한 테이블 인원(최대 8인) 관리를 위해 온라인 예약제로 우선 운영됩니다.
            </p>
            <div className="pt-2">
              <Link href="/visit" className="text-xs text-gold-500 hover:text-gold-600 transition-colors tracking-widest font-semibold uppercase flex items-center gap-1">
                Book a slot <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
