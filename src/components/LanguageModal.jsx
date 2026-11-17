import React, { useState } from 'react';
import { Globe, Search, Check, X, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

export default function LanguageModal({ isOpen, onClose, language, setLanguage, t }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = SUPPORTED_LANGUAGES.filter((l) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
      <div className="parchment-card rounded-3xl max-w-2xl w-full overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="indigo-glass px-6 py-5 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c88d28]/20 border border-[#c88d28]/50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#f0c76e]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-wide">
                {t.chooseLanguage} (15 Indian Languages)
              </h2>
              <p className="text-xs text-[#f7f1e3]/75">
                UI, Voice Recognition, Speech Readout & AI Product Translations adapt automatically
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#c88d28]/25 bg-[#f7f1e3]/70">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7c5c43] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchLanguage}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 border border-[#c88d28]/30 text-sm text-[#2c1d13] placeholder-[#8c7058] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
            />
          </div>
        </div>

        {/* 15 Language Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#1b365d] text-[#f7f1e3] border-[#c88d28] shadow-md'
                    : 'bg-white/80 hover:bg-white text-[#2c1d13] border-[#c88d28]/25 hover:border-[#b54426]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-bold leading-snug">{lang.nativeName}</div>
                    <div className={`text-xs font-semibold ${isSelected ? 'text-[#f0c76e]' : 'text-[#7c5c43]'}`}>
                      {lang.name}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#c88d28] text-[#11233e] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className={`text-[10px] mt-1.5 ${isSelected ? 'text-[#f7f1e3]/75' : 'text-[#8c7058]'}`}>
                  {lang.region}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 bg-[#efe4cf]/80 border-t border-[#c88d28]/25 flex items-center justify-between text-[11px] text-[#6d4f38]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#b54426]" />
            AI translates any craft listing live into all 15 languages
          </span>
          <span className="font-semibold">Voice + Text Ready</span>
        </div>
      </div>
    </div>
  );
}
