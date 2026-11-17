import React from 'react';
import { Globe, ShoppingBag, Cpu, Sparkles, ShieldCheck, PlayCircle, Store, Hammer } from 'lucide-react';
import { getLanguageMeta } from '../i18n/languages';
import { getProviderMeta } from '../ai/aiService';

export default function AtelierHeader({
  currentPage,
  setCurrentPage,
  role,
  setRole,
  language,
  t,
  phone,
  cartCount,
  pendingOrdersCount,
  aiConfig,
  hasLiveAiKey,
  onOpenLanguage,
  onOpenAiSettings,
  onOpenCart,
  onReplayIntro,
}) {
  const langMeta = getLanguageMeta(language);
  const providerMeta = getProviderMeta(aiConfig?.provider || 'grok');

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3">
      <div className="max-w-7xl mx-auto indigo-glass rounded-2xl px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3 text-[#f7f1e3]">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setCurrentPage(currentPage > 1 ? 2 : 1)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c94e2d] via-[#b54426] to-[#c88d28] flex items-center justify-center shadow-lg border border-[#f0c76e]/40 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-xl leading-none">🏺</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-wide text-[#faf4e8] truncate">
                  {t.appName}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c88d28]/25 text-[#f4d07d] border border-[#c88d28]/45">
                  <Sparkles className="w-2.5 h-2.5" />
                  {t.badgeSih}
                </span>
              </div>
              <p className="text-[10px] text-[#f7f1e3]/70 hidden sm:block truncate">
                {t.tagline}
              </p>
            </div>
          </button>
        </div>

        {/* Center Quick Role Switcher (when inside workspace) */}
        {currentPage === 3 && (
          <div className="hidden lg:flex items-center bg-black/25 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setRole('karigar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                role === 'karigar'
                  ? 'bg-[#b54426] text-white shadow'
                  : 'text-[#f7f1e3]/75 hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>{t.navStudio}</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#f0c76e] text-[#11233e] text-[10px] font-extrabold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                role === 'buyer'
                  ? 'bg-[#c88d28] text-[#11233e] shadow'
                  : 'text-[#f7f1e3]/75 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t.navBazaar}</span>
            </button>
          </div>
        )}

        {/* Right Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Replay Intro */}
          <button
            type="button"
            onClick={onReplayIntro}
            title={t.replayIntro}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-semibold text-[#f7f1e3]/90 transition cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#f0c76e]" />
            <span className="hidden xl:inline">{t.replayIntro}</span>
          </button>

          {/* AI Provider Switcher Pill */}
          <button
            type="button"
            onClick={onOpenAiSettings}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-[#c88d28]/45 text-xs font-bold text-[#f7f1e3] transition cursor-pointer"
            title="Configure or hot-swap AI Engine (Grok, Gemini, Groq, OpenAI)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasLiveAiKey ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-[#f0c76e]'
              }`}
            />
            <Cpu className="w-3.5 h-3.5 text-[#f0c76e]" />
            <span className="hidden md:inline">{providerMeta.name}</span>
          </button>

          {/* 15-Language Picker Button */}
          <button
            type="button"
            onClick={onOpenLanguage}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-[#f7f1e3] transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#f0c76e]" />
            <span>{langMeta.nativeName}</span>
          </button>

          {/* Verified Phone Badge */}
          {phone && (
            <div className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>+91 {phone}</span>
            </div>
          )}

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#b54426] hover:bg-[#c94e2d] border border-[#f0c76e]/40 text-white shadow transition cursor-pointer"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#f0c76e] text-[#11233e] text-[10px] font-extrabold flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
