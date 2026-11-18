import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from '../i18n/languages';

export default function EditorialLandingView({
  onStartSelling,
  onBrowseCrafts,
  onEnquire,
  language = 'en',
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const t = getTranslations(language);

  const craftTallCards = [
    {
      title: 'Terracotta & Clay',
      place: 'Khurja & Alwar',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&h=1100&q=80',
    },
    {
      title: 'Pit Loom Textiles',
      place: 'Varanasi & Chanderi',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&h=1100&q=80',
    },
    {
      title: 'Mud Resist Block Print',
      place: 'Bagru & Ajrakhpur',
      image: 'https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95?auto=format&fit=crop&w=700&h=1100&q=80',
    },
    {
      title: 'Lathe-Turned Wood',
      place: 'Channapatna & Saharanpur',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=700&h=1100&q=80',
    },
    {
      title: 'Folk Scrolls on Canvas',
      place: 'Mithila & Raghurajpur',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&h=1100&q=80',
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO SECTION (full-width workbench background with left-to-right cream gradient) */}
      <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
        {/* Left-to-right cream gradient overlay for hero focus */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F6EFE4] via-[#F6EFE4]/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B5532A]">
              {t.heroSubtitle}
            </span>

            {/* One big serif H1 */}
            <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-[#2B3A67] leading-[1.05]">
              {t.heroTitle}
            </h1>

            {/* One line below it */}
            <p className="text-lg text-[#2B3A67]/85 leading-relaxed font-normal">
              {t.heroDesc}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={onStartSelling}
                className="btn-terracotta"
              >
                <span>{t.startSelling}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onBrowseCrafts}
                className="btn-secondary"
              >
                <span>{t.browseCrafts}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM IN ONE LINE (Plain cream) */}
      <section className="w-full bg-[#F6EFE4]/90 backdrop-blur-xs border-t border-[#E4D9C8] py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-display text-2xl sm:text-3xl italic text-[#2B3A67] leading-relaxed">
            {t.problemQuote}
          </p>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Cream cloth texture with a thin thread line) */}
      <section id="how-it-works" className="w-full bg-cream-cloth backdrop-blur-xs border-t border-[#E4D9C8] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
              {t.stepsSubtitle}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#2B3A67] mt-2">
              {t.stepsTitle}
            </h2>
          </div>

          {/* Thin thread line connecting the 3 steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="hidden md:block absolute top-12 left-12 right-12 h-[1px] bg-[#D9A441]/60 -z-0" />

            {/* Step 1: Speak */}
            <div className="relative z-10 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-sm bg-[#F6EFE4] border border-[#D9A441] text-[#B5532A] flex items-center justify-center font-display text-lg font-bold shadow-xs">
                1
              </div>
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-[#E4D9C8] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80"
                  alt="Speak in regional dialect"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#2B3A67]">
                {t.step1Title}
              </h3>
              <p className="text-sm text-[#2B3A67]/80 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>

            {/* Step 2: Snap */}
            <div className="relative z-10 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-sm bg-[#F6EFE4] border border-[#D9A441] text-[#B5532A] flex items-center justify-center font-display text-lg font-bold shadow-xs">
                2
              </div>
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-[#E4D9C8] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=80"
                  alt="Snap a phone photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#2B3A67]">
                {t.step2Title}
              </h3>
              <p className="text-sm text-[#2B3A67]/80 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>

            {/* Step 3: Sell */}
            <div className="relative z-10 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-sm bg-[#F6EFE4] border border-[#D9A441] text-[#B5532A] flex items-center justify-center font-display text-lg font-bold shadow-xs">
                3
              </div>
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-[#E4D9C8] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80"
                  alt="Sell directly to buyers"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#2B3A67]">
                {t.step3Title}
              </h3>
              <p className="text-sm text-[#2B3A67]/80 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BEFORE / AFTER PHOTO SLIDER (Plain cream) */}
      <section className="w-full bg-[#F6EFE4]/90 backdrop-blur-xs border-t border-[#E4D9C8] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
              {t.sliderSubtitle}
            </span>
            <h2 className="font-display text-4xl font-semibold text-[#2B3A67] mt-2">
              {t.sliderTitle}
            </h2>
            <p className="text-sm text-[#2B3A67]/75 mt-2">
              {t.sliderDesc}
            </p>
          </div>

          {/* Interactive slider */}
          <div className="relative aspect-[16/10] max-w-4xl mx-auto overflow-hidden rounded-sm border border-[#E4D9C8] select-none shadow-sm bg-white">
            {/* After image */}
            <img
              src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85"
              alt="Studio clean craft"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-[#2B3A67]/90 text-white text-xs px-3 py-1 rounded-sm tracking-wider uppercase font-medium">
              {t.sliderAfter}
            </div>

            {/* Before image (clipped by slider) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=70"
                alt="Workbench raw snap"
                className="absolute inset-0 w-full h-full object-cover filter contrast-90 brightness-95"
                style={{ width: '100%', minWidth: '100%' }}
              />
              <div className="absolute top-4 left-4 bg-[#B5532A]/90 text-white text-xs px-3 py-1 rounded-sm tracking-wider uppercase font-medium">
                {t.sliderBefore}
              </div>
            </div>

            {/* Divider line and handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-[#2B3A67] shadow flex items-center justify-center text-xs font-bold text-[#2B3A67]">
                ↔
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              aria-label="Before after comparison slider"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />
          </div>
        </div>
      </section>

      {/* 5. SHOP BY CRAFT (5 tall photo cards) */}
      <section className="w-full bg-cream-cloth backdrop-blur-xs border-t border-[#E4D9C8] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                {t.shopByCraftSubtitle}
              </span>
              <h2 className="font-display text-4xl font-semibold text-[#2B3A67] mt-2">
                {t.shopByCraftTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onBrowseCrafts}
              className="text-sm font-semibold text-[#B5532A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewFullCatalogue}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {craftTallCards.map((card) => (
              <div
                key={card.title}
                onClick={onBrowseCrafts}
                className="group relative h-96 rounded-sm overflow-hidden border border-[#E4D9C8] cursor-pointer bg-white"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B3A67]/85 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs text-[#D9A441] tracking-wider uppercase font-medium">
                    {card.place}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-white mt-1">
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ARTISAN OF THE MONTH (Plain cream) */}
      <section className="w-full bg-[#F6EFE4]/90 backdrop-blur-xs border-t border-[#E4D9C8] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 aspect-[4/5] rounded-sm overflow-hidden border border-[#E4D9C8] bg-white">
              <img
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80"
                alt="Sitadevi Paswan at her workspace"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                {t.artisanMonthSubtitle}
              </span>

              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#2B3A67] leading-tight">
                Sitadevi Paswan
              </h2>

              <p className="text-sm font-medium text-[#2B3A67]/70">
                Mithila Master Painter • Jitwarpur, Bihar
              </p>

              <blockquote className="border-l-2 border-[#D9A441] pl-5 italic text-[#2B3A67] text-lg font-display leading-relaxed">
                {t.artisanMonthQuote}
              </blockquote>

              <p className="text-sm text-[#2B3A67]/80 leading-relaxed">
                {t.artisanMonthBio}
              </p>

              <div>
                <button
                  type="button"
                  onClick={onBrowseCrafts}
                  className="btn-secondary"
                >
                  <span>{t.exploreArtisan}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOR BUYERS AND WHOLESALERS (Cream cloth texture) */}
      <section className="w-full bg-cream-cloth backdrop-blur-xs border-t border-[#E4D9C8] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
            {t.sourcingSubtitle}
          </span>

          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#2B3A67]">
            {t.sourcingTitle}
          </h2>

          <p className="text-base text-[#2B3A67]/80 leading-relaxed max-w-2xl mx-auto">
            {t.sourcingDesc}
          </p>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => onEnquire({ name: 'Bulk & Custom Sourcing', category: 'All Clusters' })}
              className="btn-terracotta"
            >
              <span>{t.enquireCustom}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER (Plain cream) */}
      <footer className="w-full bg-[#F6EFE4]/95 backdrop-blur-xs border-t border-[#E4D9C8] py-14">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#2B3A67]/75">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold text-[#2B3A67]">{t.appName}</span>
            <span>—</span>
            <span>{t.footerDesc}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onStartSelling}
              className="hover:text-[#B5532A] cursor-pointer"
            >
              {t.forArtisans}
            </button>
            <button
              type="button"
              onClick={onBrowseCrafts}
              className="hover:text-[#B5532A] cursor-pointer"
            >
              {t.shopCrafts}
            </button>
            <span className="text-[#D9A441]">●</span>
            <span>15 Indian Languages</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
