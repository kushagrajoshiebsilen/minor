import React from 'react';
import { Globe, ShoppingBag, ArrowLeft, Sparkles, User, ShieldCheck } from 'lucide-react';
import { languages } from '../locales/translations';

export default function Header({
  currentPage,
  setCurrentPage,
  role,
  setRole,
  language,
  setLanguage,
  t,
  phone,
  cartCount,
  setIsCartOpen
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & SIH Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(1);
                }
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🏺</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-stone-900 font-serif">
                    {t.appTitle}
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    SIH 2026
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  Vocal for Local • Direct Artisan Marketplace
                </p>
              </div>
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-stone-500">
            <span className={`px-2.5 py-1 rounded-full ${currentPage === 1 ? 'bg-amber-600 text-white font-bold' : 'bg-stone-100 text-stone-700'}`}>
              1. {t.enterPhone}
            </span>
            <span className="text-stone-300">→</span>
            <span className={`px-2.5 py-1 rounded-full ${currentPage === 2 ? 'bg-amber-600 text-white font-bold' : 'bg-stone-100 text-stone-700'}`}>
              2. {role ? (role === 'karigar' ? 'Karigar' : 'Buyer') : 'Role Selection'}
            </span>
            <span className="text-stone-300">→</span>
            <span className={`px-2.5 py-1 rounded-full ${currentPage === 3 ? 'bg-amber-600 text-white font-bold' : 'bg-stone-100 text-stone-700'}`}>
              3. {role === 'karigar' ? 'Listing' : 'Marketplace'}
            </span>
          </div>

          {/* Right actions: Language, Phone indicator, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Language Quick Dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1.5 rounded-lg border border-stone-200 transition-colors">
                <Globe className="w-4 h-4 text-amber-700" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none cursor-pointer pr-1"
                  aria-label="Select interface language"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Phone Badge (if set) */}
            {phone && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 {phone}</span>
              </div>
            )}

            {/* Role switch pill if already on Page 3 */}
            {currentPage === 3 && (
              <button
                onClick={() => setCurrentPage(2)}
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                title="Switch between Karigar and Buyer view"
              >
                <User className="w-3.5 h-3.5 text-stone-600" />
                <span>Switch ({role === 'karigar' ? 'Karigar' : 'Buyer'})</span>
              </button>
            )}

            {/* Cart Button (Always visible or visible when buyer) */}
            {(role === 'buyer' || currentPage === 3) && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition flex items-center gap-1.5 shadow-sm"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5 text-amber-700" />
                <span className="hidden sm:inline text-xs font-bold">{t.viewCart}</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
