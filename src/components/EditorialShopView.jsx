import React, { useState, useMemo } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { CRAFT_CATEGORIES } from '../data/heritageCatalog';
import { getTranslations } from '../i18n/languages';

export default function EditorialShopView({ products, onEnquire, language = 'en' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const t = getTranslations(language);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.artisanName.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="w-full bg-[#F6EFE4]/85 backdrop-blur-xs min-h-[90vh] py-14">
      <div className="max-w-7xl mx-auto px-6">
        {/* Editorial Page Header: One big serif H1 */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#B5532A]">
            {t.directCatalogue}
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[#2B3A67] mt-1">
            {t.handcraftedCrafts}
          </h1>
          <p className="text-sm text-[#2B3A67]/80 mt-2 font-normal">
            {t.shopSubtitle}
          </p>
        </div>

        {/* Search bar + 5 craft filter chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E4D9C8] mb-10">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#2B3A67]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] placeholder-[#2B3A67]/40 focus:outline-none focus:border-[#B5532A]"
            />
          </div>

          {/* 5 Craft Filter Chips (+ All) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CRAFT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-medium tracking-wide transition cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#B5532A] text-white'
                      : 'bg-white border border-[#E4D9C8] text-[#2B3A67] hover:border-[#B5532A]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid: Consistent 4:5 photos, product name, craft, price range, one Enquire button */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E4D9C8] rounded-sm p-8">
            <h3 className="font-display text-2xl font-semibold text-[#2B3A67]">
              {t.noCraftsFound}
            </h3>
            <p className="text-xs text-[#2B3A67]/70 mt-1">
              {t.searchPlaceholder}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => {
              const minP = p.priceMin || Math.round(p.price * 0.85);
              const maxP = p.priceMax || Math.round(p.price * 1.25);
              return (
                <div key={p.id} className="craft-card flex flex-col justify-between">
                  {/* Image container: consistent 4:5 aspect ratio */}
                  <div>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#ECE3D2]">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {/* Max one badge per product card */}
                      {p.badge && (
                        <span className="absolute top-3 left-3 bg-[#2B3A67]/90 text-white text-[11px] px-2.5 py-0.5 rounded-sm tracking-wide">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-2">
                      <div className="text-xs text-[#B5532A] uppercase font-semibold tracking-wider">
                        {p.category}
                      </div>

                      <h3 className="font-display text-xl font-semibold text-[#2B3A67] leading-snug">
                        {p.name}
                      </h3>

                      <p className="text-xs text-[#2B3A67]/60">
                        {p.artisanName} • {p.location}
                      </p>

                      <p className="text-xs text-[#2B3A67]/75 line-clamp-2 pt-1 font-normal leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Price range & single Enquire button */}
                  <div className="p-5 pt-0 border-t border-[#E4D9C8]/60 mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#2B3A67]">
                      ₹{minP.toLocaleString('en-IN')} – ₹{maxP.toLocaleString('en-IN')}
                    </div>

                    <button
                      type="button"
                      onClick={() => onEnquire(p)}
                      className="btn-terracotta py-2 px-3 text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.enquire}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
