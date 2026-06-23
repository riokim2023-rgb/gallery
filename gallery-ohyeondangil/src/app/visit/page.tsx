"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Calendar, CheckCircle } from "lucide-react";

export default function Visit() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Gallery Visit (전시 관람)",
    date: "",
    time: "13:00",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.date) {
      alert("모든 필수 입력 사항을 기입해주세요.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="flex-1 flex flex-col canvas-texture animate-fade-in">
      {/* Title */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-stone-100 dark:border-stone-900">
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-600 dark:text-gold-500 font-semibold block">VISIT & RESERVATION</span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-950 dark:text-white leading-tight">
            방문 안내 및 예약
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg font-light leading-relaxed">
            제주 구도심 돌담 성곽 아래, 경사길 모퉁이에 위치한 갤러리 오현단길은 언제나 활짝 열려있습니다. 
            클래스 참여 및 전시 관람, 공간 대관 문의를 원스톱으로 접수할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Info & Form */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Spatial Information */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-stone-900 dark:text-white font-normal">Contact & Space Info</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                오현단길은 넓은 화이트 커뮤니티 테이블을 중심으로 운영되므로 클래스 및 방문 슬롯 예약 시 더욱 여유롭고 프라이빗하게 예술적 경험을 즐기실 수 있습니다.
              </p>
            </div>

            <div className="space-y-6 text-sm text-stone-600 dark:text-stone-400 font-light">
              {/* Addr */}
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">ADDRESS</span>
                  <p>제주특별자치도 제주시 중앙로 21길 18 1층</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    * 삼성혈문화의 거리
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">HOURS</span>
                  <p>화요일 — 일요일 (Tue - Sun) | 13:00 - 20:00 (방문예약)</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    * 매주 월요일은 정기 휴무 및 전시 교체일입니다.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">CONTACT</span>
                  <p>대표번호: <a href="tel:064-752-1112" className="hover:text-gold-500 transition-colors">064-752-1112</a></p>
                  <p>이메일: contact@ohyeondangil.art</p>
                </div>
              </div>
            </div>

            {/* Simulated static Map box */}
            <div className="border border-stone-200 dark:border-stone-850 p-6 bg-stone-50/50 dark:bg-stone-900/10 space-y-4">
              <span className="text-[10px] tracking-wider uppercase text-stone-400 block font-semibold">TRANSPORT & PARKING</span>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                <strong>대중교통:</strong> 제주국제공항에서 버스 315, 325, 415번 탑승 후 '중앙로 사거리' 또는 '오현단 정류장'에서 하차하여 오현 성곽 방면으로 도보 5분 소요됩니다.<br /><br />
                <strong>주차안내:</strong> 건물 바로 옆 경사길 주차가 불가하므로 인근 '제이각 공영 주차장' 또는 '오현단 공영 주차장'을 이용해 주시면 편리합니다.
              </p>
            </div>
          </div>

          {/* Reservation Form */}
          <div className="lg:col-span-7 bg-stone-50 dark:bg-stone-900/20 p-8 md:p-12 border border-stone-100 dark:border-stone-900">
            {submitted ? (
              <div className="text-center py-16 space-y-6 animate-fade-in">
                <div className="p-4 bg-gold-500/10 text-gold-500 rounded-full w-fit mx-auto">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h3 className="font-serif text-2xl text-stone-900 dark:text-white font-normal">예약이 완료되었습니다</h3>
                <div className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed max-w-md mx-auto space-y-2">
                  <p><strong>예약자:</strong> {formData.name}님</p>
                  <p><strong>유형:</strong> {formData.type}</p>
                  <p><strong>일시:</strong> {formData.date} | {formData.time}</p>
                  <p className="pt-4 text-stone-400">
                    입력하신 연락처({formData.phone})로 예약 확인 문자가 발송되었습니다. 
                    갤러리 오현단길 하얀 테이블에서 뵙겠습니다.
                  </p>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 border border-stone-200 hover:border-gold-500 text-xs tracking-widest uppercase hover:text-gold-500 transition-all"
                  >
                    New Reservation
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-stone-200 dark:border-stone-850">
                  <Calendar className="h-5 w-5 text-gold-500" />
                  <h3 className="font-serif text-lg text-stone-900 dark:text-white font-normal">Online Booking System</h3>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    예약자명 / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="성함을 입력해주세요"
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-sm text-stone-900 dark:text-white focus:border-gold-500 focus:outline-none rounded-none"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    이메일 주소 / Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@mail.com"
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-sm text-stone-900 dark:text-white focus:border-gold-500 focus:outline-none rounded-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    연락처 / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-sm text-stone-900 dark:text-white focus:border-gold-500 focus:outline-none rounded-none"
                  />
                </div>

                {/* Booking Type */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                    예약 구분 / Booking Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-sm text-stone-900 dark:text-white focus:border-gold-500 focus:outline-none rounded-none"
                  >
                    <option>Gallery Visit (전시 관람)</option>
                    <option>Urban Sketching (어반스케치)</option>
                    <option>Acrylic Painting (아크릴화)</option>
                    <option>Drawing (드로잉)</option>
                    <option>Portrait Drawing (연필 인물화)</option>
                    <option>Oil Pastel (오일파스텔)</option>
                    <option>AI & Art</option>
                    <option>One-Day Workshop (원데이 클래스)</option>
                    <option>Venue Rental (공간 대관)</option>
                    <option>Exhibition & Collaboration Inquiry (전시 및 협업 문의)</option>
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                      날짜 선택 / Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-sm text-stone-900 dark:text-white focus:border-gold-500 focus:outline-none rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-600 block font-semibold">
                      시간 슬롯 / Time *
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-sm text-stone-900 dark:text-white focus:border-gold-500 focus:outline-none rounded-none"
                    >
                      <option>13:00</option>
                      <option>14:00</option>
                      <option>15:00</option>
                      <option>16:00</option>
                      <option>17:00</option>
                      <option>18:00</option>
                      <option>19:00</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-stone-950 text-white dark:bg-gold-500 dark:text-stone-950 text-xs tracking-[0.25em] uppercase hover:bg-gold-600 font-semibold transition-all rounded-none"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
