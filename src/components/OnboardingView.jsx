import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, Globe, Sparkles, Check, KeyRound } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

export default function OnboardingView({ language, setLanguage, phone, setPhone, onContinue, t }) {
  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [error, setError] = useState('');
  const [otpStage, setOtpStage] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const cleaned = phoneInput.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError(t.invalidPhone);
      return;
    }
    setError('');
    setPhone(cleaned);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpInput(code); // Auto-prefill for smooth SIH demo
    setOtpStage(true);
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otpInput.trim().length !== 4) {
      setError('Please enter the 4-digit verification OTP.');
      return;
    }
    setError('');
    onContinue();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-up">
      <div className="parchment-card rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Regal Brand Storytelling Column */}
        <div className="lg:col-span-5 indigo-glass p-7 sm:p-9 text-[#f7f1e3] flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c88d28]/20 border border-[#c88d28]/45 text-[#f0c76e] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart India Hackathon 2026</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-[#faf4e8]">
              {t.welcomeTitle}
            </h1>

            <p className="text-sm text-[#f7f1e3]/80 leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* Heritage Pillars */}
          <div className="space-y-3 pt-4 border-t border-white/15 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#b54426]/30 border border-[#b54426]/50 flex items-center justify-center text-base">
                🎙️
              </span>
              <div>
                <div className="font-bold text-[#faf4e8]">15 Indian Regional Languages</div>
                <div className="text-[#f7f1e3]/70">Voice-first listing, regional speech & live AI translation</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#c88d28]/25 border border-[#c88d28]/50 flex items-center justify-center text-base">
                ✨
              </span>
              <div>
                <div className="font-bold text-[#faf4e8]">Provider-Agnostic AI (Grok / Gemini)</div>
                <div className="text-[#f7f1e3]/70">Vision craft scan, luxury storytelling & fair pricing</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-base">
                🏛️
              </span>
              <div>
                <div className="font-bold text-[#faf4e8]">0% Middleman • GI Verified</div>
                <div className="text-[#f7f1e3]/70">100% direct payout to Indian artisan workshops</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Onboarding Column */}
        <div className="lg:col-span-7 p-6 sm:p-9 space-y-6">
          {/* 15 Language Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d4f38] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#b54426]" />
                <span>1. {t.chooseLanguage} (15 Languages)</span>
              </label>
              <span className="text-[11px] font-semibold text-[#1b365d]">
                Tap any script
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                      active
                        ? 'bg-[#1b365d] text-[#faf4e8] border-[#c88d28] shadow-md scale-[1.02]'
                        : 'bg-white/75 hover:bg-white text-[#2c1d13] border-[#c88d28]/30'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold leading-tight truncate">{lang.nativeName}</div>
                    <div className={`text-[10px] truncate ${active ? 'text-[#f0c76e]' : 'text-[#7c5c43]'}`}>
                      {lang.name}
                    </div>
                    {active && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#c88d28] text-[#11233e] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Number / OTP Verification */}
          <div className="pt-4 border-t border-[#c88d28]/25">
            {!otpStage ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d4f38] flex items-center gap-1.5 mb-2">
                    <Phone className="w-4 h-4 text-[#b54426]" />
                    <span>2. {t.mobileLabel}</span>
                  </label>

                  <div className="flex items-stretch rounded-2xl overflow-hidden border-2 border-[#c88d28]/35 bg-white/95 focus-within:border-[#b54426] transition">
                    <div className="px-4 bg-[#efe4cf]/70 text-[#2c1d13] font-bold text-sm flex items-center gap-1.5 border-r border-[#c88d28]/25">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value.replace(/\D/g, ''));
                        setError('');
                      }}
                      placeholder={t.mobilePlaceholder}
                      className="flex-1 px-4 py-3.5 text-base font-bold tracking-wider text-[#2c1d13] placeholder-[#a08872] focus:outline-none bg-transparent"
                    />
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-[#b54426] mt-2">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-terracotta w-full py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.sendOtp}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4 animate-fade-up">
                <div className="p-4 rounded-2xl bg-emerald-950/5 border border-emerald-700/25 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>+91 {phone}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#c88d28]/20 text-[#6d4f38]">
                    {t.otpHint} <strong className="text-[#1b365d] font-mono">{generatedOtp}</strong>
                  </span>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d4f38] flex items-center gap-1.5 mb-2">
                    <KeyRound className="w-4 h-4 text-[#b54426]" />
                    <span>{t.otpTitle}</span>
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/95 border-2 border-[#c88d28]/40 text-center text-2xl font-extrabold tracking-[0.6em] text-[#1b365d] focus:outline-none focus:border-[#b54426]"
                  />
                  {error && <p className="text-xs font-semibold text-[#b54426] mt-2">{error}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpStage(false)}
                    className="px-4 py-3.5 rounded-2xl bg-white/80 border border-[#c88d28]/30 text-xs font-bold text-[#6d4f38] hover:bg-white transition cursor-pointer"
                  >
                    {t.changeNumber}
                  </button>
                  <button
                    type="submit"
                    className="btn-terracotta flex-1 py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t.verifyContinue}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
