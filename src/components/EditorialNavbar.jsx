import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { getLanguageMeta } from '../i18n/languages';

export default function EditorialNavbar({
  currentRoute,
  onNavigate,
  language,
  onOpenLanguage,
  artisanName,
  onOpenLogin,
}) {
  const langMeta = getLanguageMeta(language);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F6EFE4]/95 backdrop-blur-xs border-b border-[#E4D9C8]">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Real KarigarBazaar Logo at Left */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <span className="w-8 h-8 rounded-sm bg-[#B5532A] text-white flex items-center justify-center font-display text-lg font-bold">
            K
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-[#2B3A67]">
            KarigarBazaar
          </span>
        </button>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#2B3A67]">
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className={`transition hover:text-[#B5532A] cursor-pointer ${
              currentRoute === 'shop' ? 'text-[#B5532A] font-semibold' : ''
            }`}
          >
            Shop crafts
          </button>
          <button
            type="button"
            onClick={() => onNavigate('artisan')}
            className={`transition hover:text-[#B5532A] cursor-pointer ${
              currentRoute === 'artisan' ? 'text-[#B5532A] font-semibold' : ''
            }`}
          >
            For artisans
          </button>
          <a
            href="#how-it-works"
            onClick={(e) => {
              if (currentRoute !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="transition hover:text-[#B5532A] cursor-pointer"
          >
            How it works
          </a>
        </nav>

        {/* Right: Language switcher and Login */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenLanguage}
            className="flex items-center gap-1.5 text-xs text-[#2B3A67] hover:text-[#B5532A] border border-[#E4D9C8] px-3 py-1.5 rounded-sm bg-white/70 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#D9A441]" />
            <span className="font-medium">{langMeta.nativeName}</span>
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="text-xs font-semibold uppercase tracking-wider text-[#2B3A67] hover:text-[#B5532A] transition cursor-pointer flex items-center gap-1"
          >
            {artisanName ? (
              <span className="truncate max-w-[120px]">{artisanName}</span>
            ) : (
              <span>Login</span>
            )}
            <ArrowRight className="w-3 h-3 text-[#B5532A]" />
          </button>
        </div>
      </div>
    </header>
  );
}
