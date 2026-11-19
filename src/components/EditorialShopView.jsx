import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Globe, Store } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageMeta, getTranslations, getBuyerTranslations } from '../i18n/languages';

export default function EditorialShopView({
  products = [],
  onEnquire,
  language = 'en',
  setLanguage,
  onSwitchToSeller,
  onNavigateHome,
  onOpenLogin,
  onLogout,
  isSellerLoggedIn = false,
  isBuyerLoggedIn = false,
  buyerPhone = '',
  artisanProfile,
}) {
  const t = getTranslations(language);
  const buyerT = getBuyerTranslations(language);
  const langMeta = getLanguageMeta(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [langOpen, setLangOpen] = useState(false);

  const baseCategories = ['All', 'Pottery', 'Textiles', 'Block Print', 'Wood', 'Painting'];

  const showcaseProducts = useMemo(
    () => [
      {
        id: 'showcase-1',
        name: buyerT.showcase1Name,
        badge: buyerT.showcase1Badge,
        category: 'Pottery',
        artisanName: 'Ramu Prajapati',
        location: 'Khurja, Uttar Pradesh',
        price: 1100,
        image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
        description: 'Wheel-thrown blue ceramic glazed tableware crafted with mineral ash glaze.',
      },
      {
        id: 'showcase-2',
        name: buyerT.showcase2Name,
        badge: buyerT.showcase2Badge,
        category: 'Textiles',
        artisanName: 'Shamji Vankar',
        location: 'Bhujodi, Kutch',
        price: 1650,
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
        description: 'Naturally dyed, rain-fed organic Kala cotton handwoven on traditional pit looms.',
      },
      {
        id: 'showcase-3',
        name: buyerT.showcase3Name,
        badge: buyerT.showcase3Badge,
        category: 'Pottery',
        artisanName: 'Sitadevi Paswan',
        location: 'Jitwarpur, Bihar',
        price: 850,
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
        description: 'Hand-shaped riverbed clay tumblers baked with rice husk and wood ash.',
      },
      {
        id: 'showcase-4',
        name: buyerT.showcase4Name,
        badge: buyerT.showcase4Badge,
        category: 'Textiles',
        artisanName: 'Kabir Ansari',
        location: 'Varanasi, UP',
        price: 4200,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
        description: 'Rich royal purple pure silk handloom saree with real zari kadwa jaal embroidery.',
      },
    ],
    [buyerT]
  );

  const allAvailableCrafts = useMemo(() => {
    const customListings = (products || []).map((p, idx) => ({
      id: p.id || `custom-${idx}`,
      name: p.title || p.name || 'Artisan Creation',
      badge: p.badge || 'Artisan Guild',
      category: p.category || 'Handcrafted',
      artisanName: p.artisan || p.artisanName || artisanProfile?.name || 'Sitadevi Paswan',
      location: p.location || artisanProfile?.location || 'Madhya Pradesh',
      price: p.price || 950,
      image:
        p.image ||
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      description: p.description || 'Directly handcrafted by traditional master artisans.',
    }));
    const showcaseIds = new Set(showcaseProducts.map((s) => s.id));
    const dedupedCustom = customListings.filter((c) => !showcaseIds.has(c.id));
    return [...showcaseProducts, ...dedupedCustom];
  }, [products, artisanProfile, showcaseProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allAvailableCrafts.filter((p) => {
      const matchesCat =
        selectedCategory === 'All' ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Pottery' && p.badge?.includes('thrown')) ||
        (selectedCategory === 'Textiles' && (p.badge?.includes('Loom') || p.badge?.includes('fired')));
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.artisanName?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
      );
    });
  }, [allAvailableCrafts, searchQuery, selectedCategory]);

  return (
    <div
      className="min-h-screen w-full relative flex flex-col text-[#2C1D13] font-body select-none overflow-x-hidden"
      style={{ backgroundColor: '#F5E6C8' }}
    >
      {/* ── Full-page artisan background texture ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          opacity: 0.92,
        }}
      />
      {/* Warm parchment overlay to soften background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F9EDD5]/55" />

      {/* ── SVG Corner Leaf Vines ── */}
      {/* Top-left vine */}
      <svg className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-10 opacity-80" viewBox="0 0 120 120" fill="none">
        <path d="M0,0 Q40,20 30,60 Q20,90 60,110" stroke="#5A7A3A" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <ellipse cx="22" cy="28" rx="10" ry="6" fill="#6B8E45" opacity="0.7" transform="rotate(-30 22 28)"/>
        <ellipse cx="34" cy="52" rx="9" ry="5" fill="#5A7A3A" opacity="0.6" transform="rotate(-10 34 52)"/>
        <ellipse cx="42" cy="78" rx="11" ry="6" fill="#6B8E45" opacity="0.65" transform="rotate(20 42 78)"/>
        <ellipse cx="58" cy="100" rx="8" ry="5" fill="#5A7A3A" opacity="0.55" transform="rotate(40 58 100)"/>
      </svg>
      {/* Top-right vine */}
      <svg className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-10 opacity-80" viewBox="0 0 120 120" fill="none" style={{transform:'scaleX(-1)'}}>
        <path d="M0,0 Q40,20 30,60 Q20,90 60,110" stroke="#5A7A3A" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <ellipse cx="22" cy="28" rx="10" ry="6" fill="#6B8E45" opacity="0.7" transform="rotate(-30 22 28)"/>
        <ellipse cx="34" cy="52" rx="9" ry="5" fill="#5A7A3A" opacity="0.6" transform="rotate(-10 34 52)"/>
        <ellipse cx="42" cy="78" rx="11" ry="6" fill="#6B8E45" opacity="0.65" transform="rotate(20 42 78)"/>
      </svg>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* NAVBAR                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-20 w-full">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

          {/* Logo */}
          <button type="button" onClick={onNavigateHome} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-[#B5532A] flex items-center justify-center text-white font-serif font-bold text-sm shadow group-hover:scale-105 transition">
              K
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[#2C1D13]">
              Karigar<span className="text-[#B5532A]">Bazaar</span>
            </span>
          </button>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-[#4A3B2C]">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[#2C1D13] font-bold">{t.shopCrafts || 'Shop crafts'}</span>
              <div className="h-0.5 w-full bg-[#B5532A] rounded-full" />
            </div>
            <button type="button" onClick={onNavigateHome} className="hover:text-[#B5532A] transition cursor-pointer">
              {t.howItWorks || 'How it works'}
            </button>
          </nav>

          {/* Right: language + auth */}
          <div className="flex items-center gap-3">

            {/* Language selector */}
            {setLanguage && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-[#DECDB3] text-xs font-semibold text-[#2C1D13] hover:border-[#B5532A] transition cursor-pointer shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 text-[#B5532A]" />
                  <span>{langMeta.name}</span>
                  <span className="text-[10px] text-[#7A6752]">▾</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#DECDB3] rounded-xl p-1.5 shadow-xl z-50 min-w-[140px] max-h-52 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                        className={`w-full px-3 py-1.5 text-xs text-left rounded-lg transition font-medium ${
                          language === l.code
                            ? 'bg-[#B5532A] text-white font-bold'
                            : 'text-[#2C1D13] hover:bg-[#FAF3E7]'
                        }`}
                      >
                        {l.nativeName} ({l.name})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Auth area */}
            {isSellerLoggedIn && onSwitchToSeller ? (
              <button
                type="button"
                onClick={onSwitchToSeller}
                className="px-3.5 py-1.5 rounded-full bg-[#2E2C22] hover:bg-[#1C1A14] text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-[#E3B778]" />
                <span>{buyerT.sellerStudio}</span>
              </button>
            ) : isBuyerLoggedIn ? (
              <div className="flex items-center gap-2 bg-white/70 border border-[#DECDB3] px-3 py-1 rounded-full shadow-sm">
                <span className="text-xs font-semibold text-[#7A6752]">
                  🛍️ {buyerT.buyerLabel}{' '}
                  <span className="font-bold text-[#2C1D13]">
                    {buyerPhone ? `+91 ${buyerPhone.slice(-10)}` : 'Logged In'}
                  </span>
                </span>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-[11px] text-[#B5532A] hover:underline font-bold cursor-pointer pl-1.5 border-l border-[#DECDB3]"
                  >
                    {buyerT.logout}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-xs font-bold text-[#B5532A] hover:underline flex items-center gap-1 cursor-pointer tracking-wide uppercase"
              >
                <span>{buyerT.login}</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pb-4">

        {/* ── HERO: Left text + Right elephant illustration ── */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 pb-2">

          {/* LEFT: Headline + search + filter */}
          <div className="w-full lg:w-[48%] space-y-4">
            {/* Catalogue label */}
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#9B6A42] uppercase">
              <span className="text-[#B5532A]">—</span>
              <span>{buyerT.directCatalogue}</span>
              <span className="text-[#B5532A]">—</span>
            </div>

            {/* Big headline */}
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#2C1D13] leading-[1.1] tracking-tight">
              {buyerT.handcraftedCrafts}
            </h1>

            {/* Subtitle with terracotta underline */}
            <div className="relative inline-block">
              <p className="text-sm text-[#5C4433] max-w-sm font-medium leading-relaxed">
                {buyerT.shopSubtitle}
              </p>
              <div className="mt-1.5 w-24 h-0.5 bg-[#B5532A] rounded-full" />
            </div>

            {/* Search bar */}
            <div className="relative flex items-center max-w-sm mt-1">
              <Search className="w-4 h-4 text-[#9B7B5A] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={buyerT.searchPlaceholder}
                className="w-full pl-11 pr-14 py-3 rounded-full border border-[#D4B896] bg-white/90 text-sm text-[#2C1D13] placeholder-[#A08060] focus:outline-none focus:border-[#B5532A] shadow-md"
              />
              <button
                type="button"
                className="absolute right-1.5 w-9 h-9 rounded-full bg-[#2E2C22] hover:bg-[#1C1A14] flex items-center justify-center text-white transition cursor-pointer shadow"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Category filter pills — BELOW search, left-aligned */}
            <div className="flex items-center gap-2 flex-wrap">
              {baseCategories.map((cat) => {
                const active = selectedCategory === cat;
                const displayName = buyerT.categories?.[cat] || cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap border ${
                      active
                        ? 'bg-[#2E2C22] text-white border-[#2E2C22] shadow'
                        : 'bg-white/80 border-[#C9B08A] text-[#5C4433] hover:border-[#B5532A] hover:text-[#B5532A]'
                    }`}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Illustrated elephant + painted pot composition */}
          <div className="w-full lg:w-[50%] flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg h-56 sm:h-64 lg:h-72 select-none">

              {/* Warm golden radial glow behind illustration */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 70% 60% at 60% 50%, rgba(227,183,120,0.35) 0%, transparent 70%)',
                }}
              />

              {/* Palace silhouette — ghosted Taj-style backdrop */}
              <div className="absolute bottom-0 right-6 w-40 h-32 opacity-20 pointer-events-none">
                <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M80 10 L85 30 L90 10 L95 30 L80 10Z" fill="#8B5E34"/>
                  <rect x="60" y="30" width="40" height="60" rx="2" fill="#8B5E34" opacity="0.6"/>
                  <rect x="30" y="50" width="30" height="40" rx="2" fill="#8B5E34" opacity="0.5"/>
                  <rect x="100" y="50" width="30" height="40" rx="2" fill="#8B5E34" opacity="0.5"/>
                  <rect x="10" y="70" width="20" height="20" rx="1" fill="#8B5E34" opacity="0.4"/>
                  <rect x="130" y="70" width="20" height="20" rx="1" fill="#8B5E34" opacity="0.4"/>
                  <ellipse cx="80" cy="30" rx="8" ry="5" fill="#8B5E34" opacity="0.6"/>
                  <ellipse cx="45" cy="50" rx="5" ry="4" fill="#8B5E34" opacity="0.5"/>
                  <ellipse cx="115" cy="50" rx="5" ry="4" fill="#8B5E34" opacity="0.5"/>
                </svg>
              </div>

              {/* Foliage branches */}
              <svg className="absolute top-2 left-4 w-20 h-20 opacity-70 pointer-events-none" viewBox="0 0 80 80">
                <path d="M10,70 Q30,40 50,20" stroke="#5A7A3A" strokeWidth="1.5" fill="none"/>
                <ellipse cx="30" cy="45" rx="12" ry="7" fill="#6B8E45" opacity="0.7" transform="rotate(-25 30 45)"/>
                <ellipse cx="45" cy="28" rx="10" ry="6" fill="#5A7A3A" opacity="0.65" transform="rotate(-45 45 28)"/>
              </svg>
              <svg className="absolute top-0 right-8 w-16 h-16 opacity-60 pointer-events-none" viewBox="0 0 80 80">
                <path d="M70,60 Q50,35 30,15" stroke="#5A7A3A" strokeWidth="1.5" fill="none"/>
                <ellipse cx="50" cy="38" rx="11" ry="6" fill="#6B8E45" opacity="0.7" transform="rotate(25 50 38)"/>
                <ellipse cx="35" cy="20" rx="9" ry="5" fill="#5A7A3A" opacity="0.6" transform="rotate(45 35 20)"/>
              </svg>

              {/* Main composition: painted pot + decorated elephant */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-4 px-4">

                {/* Painted terracotta pot */}
                <div className="relative shrink-0 mb-2">
                  <div className="w-28 h-32 sm:w-32 sm:h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-[#C68345]/60">
                    <img
                      src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=85"
                      alt="Traditional painted terracotta pot"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  {/* Small decorative gold ring */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-[#D9A441] rounded-full shadow" />
                </div>

                {/* Royal decorated Indian elephant — MAIN hero */}
                <div className="relative shrink-0">
                  <div className="w-48 h-44 sm:w-56 sm:h-52 lg:w-60 lg:h-56 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D9A441]/70">
                    <img
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=85"
                      alt="Royal decorated Indian elephant"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  {/* Gold border glow */}
                  <div className="absolute inset-0 rounded-3xl pointer-events-none shadow-[0_0_30px_rgba(217,164,65,0.3)]" />
                  {/* Decorative caption */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#B5532A] text-white text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full shadow uppercase">
                    100% Direct Payout
                  </div>
                </div>
              </div>

              {/* Small folk star ornament */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#D9A441] text-lg opacity-60 select-none pointer-events-none">✦</div>
            </div>
          </div>
        </div>

        {/* Thin decorative separator */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-[#D4B896]/60" />
          <span className="text-[#D9A441] text-sm opacity-70">✦</span>
          <div className="flex-1 h-px bg-[#D4B896]/60" />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PRODUCT GRID                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="relative pb-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white/70 border border-[#DECDB3] rounded-3xl p-6">
              <h3 className="font-display text-xl font-bold text-[#2C1D13]">{buyerT.noCraftsFound}</h3>
              <p className="text-xs text-[#7A6752] mt-1">{buyerT.noCraftsSub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onEnquire && onEnquire(p)}
                  className="rounded-3xl overflow-hidden border border-[#D4B896] bg-white/95 shadow-md group hover:shadow-2xl transition duration-300 flex flex-col cursor-pointer"
                >
                  {/* Card image — taller aspect matching reference */}
                  <div className="relative overflow-hidden bg-[#FAF4E9]" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Dark badge top-left */}
                    {p.badge && (
                      <span className="absolute top-3 left-3 bg-[#1E1B15]/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide shadow">
                        {p.badge}
                      </span>
                    )}

                    {/* Terracotta arrow button bottom-right */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); if (onEnquire) onEnquire(p); }}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#B5532A] hover:bg-[#8E3B18] text-white flex items-center justify-center shadow-lg transition transform group-hover:scale-110 cursor-pointer"
                      title={buyerT.enquireTitle}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Folk leaf corner */}
                    <div className="absolute bottom-2 left-2.5 text-xs opacity-40 pointer-events-none select-none">🌿</div>
                  </div>

                  {/* Card info */}
                  <div className="p-3.5 space-y-0.5 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B5532A] uppercase tracking-wider">
                        {buyerT.categories?.[p.category] || p.category}
                      </span>
                      <span className="font-display font-bold text-sm text-[#2C1D13]">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-[#2C1D13] leading-snug line-clamp-1 group-hover:text-[#B5532A] transition">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-[#8A7055]">
                      {p.artisanName} · {p.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Click-outside to close language dropdown */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </div>
  );
}
