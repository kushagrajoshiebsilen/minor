import React, { useState } from 'react';
import { Globe, Search, Check, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

export default function LanguageModal({ isOpen, onClose, language, setLanguage }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E4D9C8] rounded-sm max-w-2xl w-full overflow-hidden max-h-[88vh] flex flex-col relative shadow-lg">
        {/* Header */}
        <div className="bg-[#F6EFE4] px-6 py-5 flex items-center justify-between border-b border-[#E4D9C8]">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#B5532A]" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#2B3A67]">
                Select regional language
              </h2>
              <p className="text-xs text-[#2B3A67]/75">
                Speech recognition, audio readout, and craft stories adapt across 15 languages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#2B3A67]/60 hover:text-[#2B3A67] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#E4D9C8] bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-[#2B3A67]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by language or state..."
              className="w-full pl-10 pr-4 py-2 border border-[#E4D9C8] rounded-sm text-xs text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
            />
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F6EFE4]/30">
          {filtered.map((lang) => {
            const active = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                className={`p-3.5 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
                  active
                    ? 'bg-white border-[#B5532A] shadow-xs'
                    : 'bg-white border-[#E4D9C8] hover:border-[#B5532A]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-display text-lg font-semibold text-[#2B3A67]">
                    {lang.nativeName}
                  </div>
                  {active && <Check className="w-4 h-4 text-[#B5532A] stroke-2" />}
                </div>
                <div className="text-xs text-[#2B3A67]/70 mt-1">{lang.name}</div>
                <div className="text-[11px] text-[#D9A441] mt-2 font-medium">
                  {lang.region}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
