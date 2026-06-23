import { ArrowRight, Compass, Home as HomeIcon, Layout, Shield } from "lucide-react";
import Link from "next/link";

export default function Space() {
  return (
    <div className="flex-1 flex flex-col canvas-texture animate-fade-in">
      {/* Header Info */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-stone-100 dark:border-stone-900">
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">SPACE PHILOSOPHY</span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-950 dark:text-white leading-tight">
            전시를 감상하는 벽면,<br />
            생각을 그리는 타원형 테이블
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg font-light leading-relaxed">
            갤러리 오현단길은 사각의 닫힌 전시실에서 벗어나고자 합니다. 
            제주 구도심 언덕길 모퉁이의 큰 통유리창으로 햇살이 들어오고, 
            중앙 테이블에서 피어나는 아날로그 창작과 따뜻한 소통이 바로 우리의 진정한 공간적 가치입니다.
          </p>
        </div>
      </section>

      {/* Detail Showcase Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full space-y-24">
        {/* Detail 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 overflow-hidden relative border border-stone-100 dark:border-stone-900">
            <img
              src="/images/interior_table.jpg"
              alt="Community Art Salon Table"
              className="w-full h-[450px] object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[9px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold">01 / ART SALON TABLE</span>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-white">화이트 타원형 테이블의 중심성</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              공간의 정중앙에 자리잡은 흰색 타원형 테이블과 현대적인 의자들은 이곳의 정체성을 단적으로 대변합니다. 
              일반적인 갤러리가 '관람객'과 '작품' 사이에 일방적이고 차가운 거리감을 두는 반면, 
              오현단길은 이곳에 마주 앉아 커피 한 잔을 마시며 수다를 떨고, 붓을 들어 나만의 제주를 드로잉하는 살롱식 만남을 권장합니다.
            </p>
          </div>
        </div>

        {/* Detail 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:flex-row-reverse">
          <div className="lg:col-span-6 lg:order-last overflow-hidden relative border border-stone-100 dark:border-stone-900">
            <img
              src="/images/interior_wall.jpg"
              alt="Golden Relief Painting Wall"
              className="w-full h-[450px] object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[9px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold">02 / GOLDEN TEXTURE</span>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-white">아날로그 텍스처와 따뜻한 조명</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              벽면을 장식하는 황금빛 텍스처의 입체 미술 작품들은 미니멀한 화이트톤 인테리어 속에서 빛의 각도에 따라 섬세하게 다른 깊이의 그림자를 만듭니다. 
              거친 질감의 에폭시 노출 콘크리트 바닥과 아날로그적인 회화의 조화는 디지털 시대에 인간의 손이 닿은 '물질적 감수성'을 강하게 환기시킵니다.
            </p>
          </div>
        </div>

        {/* Detail 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 overflow-hidden relative border border-stone-100 dark:border-stone-900">
            <img
              src="/images/street_view.jpg"
              alt="Jeju Old Town View from Alley"
              className="w-full h-[450px] object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[9px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold">03 / URBAN JUNCTION</span>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-white">제주 구도심 모퉁이길의 아날로그 정취</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              갤러리 오현단길이 들어선 자리는 유서 깊은 '오현단'의 옛 돌담길 성곽 모퉁이 경사로입니다. 
              세월이 깃든 노후 빌딩의 외관은 유지하되, 내부의 현대적인 아트웍과 화이트 월을 대형 전면 통유리창으로 외부에 드러냄으로써 
              역사적인 과거와 미래적인 크리에이티브가 도시의 골목 교차점에서 가장 경계 없이 어우러지는 풍경을 자아냅니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-stone-50 dark:bg-stone-900/30 py-20 text-center border-t border-stone-100 dark:border-stone-900 transition-colors">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-white">
            이 따뜻한 테이블에 함께 앉으시겠습니까?
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
            원데이 클래스, 어반 스케치, 그리고 AI 아트 실험 세미나 일정을 확인하고 예약하실 수 있습니다.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/class"
              className="px-6 py-3.5 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs tracking-[0.2em] uppercase hover:bg-gold-600 font-medium transition-all"
            >
              Reserve a Class
            </Link>
            <Link
              href="/visit"
              className="px-6 py-3.5 border border-stone-200 dark:border-stone-850 text-stone-900 dark:text-white text-xs tracking-[0.2em] uppercase hover:border-gold-500 hover:text-gold-500 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
