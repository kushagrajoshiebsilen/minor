import React from 'react';
import { Hammer, ShoppingBag, ArrowRight, ArrowLeft, Mic, Camera, TrendingUp, ShieldCheck, Sparkles, Globe } from 'lucide-react';

export default function RoleSelectorView({ onSelectRole, onBack, phone, t }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14 animate-fade-up">
      {/* Top Heading */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-[#c88d28]/45 text-[#f7f1e3] text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#f0c76e]" />
          <span>Verified Session: +91 {phone || 'Guest'}</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#faf4e8] drop-shadow-md">
          {t.chooseRoleTitle}
        </h1>
        <p className="text-sm sm:text-base text-[#f7f1e3]/85 mt-2 max-w-2xl mx-auto">
          {t.chooseRoleSubtitle}
        </p>
      </div>

      {/* Dual Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Karigar (Artisan) Card */}
        <div className="parchment-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-6 group hover:-translate-y-1 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#b54426] to-[#8e3118] text-[#faf4e8] flex items-center justify-center shadow-lg border border-[#f0c76e]/40">
                <Hammer className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#b54426]/12 text-[#8e3118] border border-[#b54426]/25">
                0% Commission • Direct Payout
              </span>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c1d13]">
                {t.karigarTitle}
              </h2>
              <p className="text-sm text-[#5c4330] mt-2 leading-relaxed">
                {t.karigarDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2 text-xs font-semibold text-[#3c2a1e]">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl parchment-surface">
                <Mic className="w-4 h-4 text-[#b54426] shrink-0" />
                <span>Voice-First Guided Listing in 15 Indian Languages</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl parchment-surface">
                <Camera className="w-4 h-4 text-[#1b365d] shrink-0" />
                <span>AI Vision Photo Scan + Museum Backdrop Photo Studio</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl parchment-surface">
                <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Live Price Benchmarking vs Amazon, FabIndia, Etsy & ONDC</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectRole('karigar')}
            className="btn-terracotta w-full py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.karigarCta}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Buyer (Customer) Card */}
        <div className="parchment-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-6 group hover:-translate-y-1 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b365d] to-[#11233e] text-[#f0c76e] flex items-center justify-center shadow-lg border border-[#c88d28]/50">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#1b365d]/12 text-[#1b365d] border border-[#1b365d]/25">
                GI-Tagged Authenticity
              </span>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c1d13]">
                {t.buyerTitle}
              </h2>
              <p className="text-sm text-[#5c4330] mt-2 leading-relaxed">
                {t.buyerDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2 text-xs font-semibold text-[#3c2a1e]">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl parchment-surface">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Verified Digital GI & Artisan Authenticity Certificate</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl parchment-surface">
                <Globe className="w-4 h-4 text-[#1b365d] shrink-0" />
                <span>1-Click Live AI Translation & Craft Concierge Q&A</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl parchment-surface">
                <Sparkles className="w-4 h-4 text-[#b54426] shrink-0" />
                <span>Direct Artisan Checkout + Live 5-Stage Workshop Tracking</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectRole('buyer')}
            className="btn-indigo w-full py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.buyerCta}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mt-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#f7f1e3] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.back}</span>
        </button>
      </div>
    </div>
  );
}
