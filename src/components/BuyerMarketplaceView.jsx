import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  User,
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  Heart,
  Package,
  Store,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { INDIAN_CRAFT_CATEGORIES } from '../ai/craftKnowledgeBase';
import ProductDetailModal from './ProductDetailModal';
import BuyerOrdersHub from './BuyerOrdersHub';

export default function BuyerMarketplaceView({
  buyerProfile,
  setBuyerProfile,
  products,
  orders,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSwitchToKarigar,
  onBack,
  language,
  t,
}) {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'orders'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [giOnly, setGiOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'rating'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [buyerNameInput, setBuyerNameInput] = useState(buyerProfile.name || 'Aditi Sharma');
  const [buyerLocInput, setBuyerLocInput] = useState(buyerProfile.location || 'Bengaluru, Karnataka');

  const categories = ['All', ...INDIAN_CRAFT_CATEGORIES];

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (giOnly && !p.giEligible) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.artisanName.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tag || '').toLowerCase().includes(q)
      );
    });

    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, searchQuery, selectedCategory, giOnly, sortBy]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setBuyerProfile({ name: buyerNameInput.trim() || 'Conscious Buyer', location: buyerLocInput.trim() || 'India' });
    setEditingProfile(false);
  };

  const handleQuickAdd = (product) => {
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-up">
      {/* Top Marketplace Header Bar */}
      <div className="parchment-card rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-[#c88d28]/35 text-[#2c1d13] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2c1d13]">
                National Heritage Bazaar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#1b365d]/12 text-[#1b365d] border border-[#1b365d]/25">
                {products.length} Authentic Crafts
              </span>
            </div>
            <p className="text-xs text-[#6d4f38] mt-0.5">
              Direct from India’s master workshops • GI-Tag Verified • Live AI Translation & Concierge
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-[#ede1ca]/90 p-1 rounded-2xl border border-[#c88d28]/30">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'explore' ? 'bg-[#1b365d] text-white shadow' : 'text-[#5c4330]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t.tabExplore}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#1b365d] text-white shadow' : 'text-[#5c4330]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t.tabMyOrders} ({orders.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onSwitchToKarigar}
            className="btn-terracotta inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            <span>Sell as Karigar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Buyer Delivery Strip */}
      <div className="indigo-glass rounded-2xl px-5 py-3.5 text-[#f7f1e3] flex flex-wrap items-center justify-between gap-3">
        {!editingProfile ? (
          <>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#f0c76e]" />
                Buyer: <strong>{buyerProfile.name}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#e07a5f]" />
                Delivering to: <strong>{buyerProfile.location}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEditingProfile(true)}
              className="text-xs font-bold text-[#f0c76e] hover:underline cursor-pointer"
            >
              Edit Delivery Details
            </button>
          </>
        ) : (
          <form onSubmit={handleSaveProfile} className="w-full flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={buyerNameInput}
              onChange={(e) => setBuyerNameInput(e.target.value)}
              placeholder="Your Name"
              className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg bg-white/95 text-[#2c1d13] text-xs font-semibold"
            />
            <input
              type="text"
              value={buyerLocInput}
              onChange={(e) => setBuyerLocInput(e.target.value)}
              placeholder="Delivery City, State"
              className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg bg-white/95 text-[#2c1d13] text-xs font-semibold"
            />
            <button type="submit" className="btn-terracotta px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
              Save
            </button>
          </form>
        )}
      </div>

      {/* TAB 1: EXPLORE MARKETPLACE */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search & Filter Controls */}
          <div className="parchment-card rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7c5c43] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchCrafts}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 border border-[#c88d28]/35 text-sm text-[#2c1d13] placeholder-[#8c7058] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGiOnly(!giOnly)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-bold border transition cursor-pointer whitespace-nowrap ${
                    giOnly
                      ? 'bg-[#1b365d] text-[#f0c76e] border-[#c88d28]'
                      : 'bg-white/85 text-[#5c4330] border-[#c88d28]/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.giOnly}</span>
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/85 border border-[#c88d28]/30 text-xs font-bold text-[#2c1d13]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#b54426]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      active
                        ? 'bg-[#b54426] text-white shadow'
                        : 'bg-white/75 hover:bg-white text-[#5c4330] border border-[#c88d28]/25'
                    }`}
                  >
                    {cat === 'All' ? t.allCrafts : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="parchment-card rounded-3xl p-12 text-center space-y-2">
              <h3 className="font-display text-2xl font-bold text-[#2c1d13]">No Matching Crafts Found</h3>
              <p className="text-xs text-[#6d4f38]">Try clearing your search or switching craft categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isWished = wishlist.includes(product.id);
                const isAdded = addedId === product.id;
                return (
                  <div
                    key={product.id}
                    className="parchment-card rounded-3xl overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-black/10">
                        <img
                          src={product.image}
                          alt={product.name}
                          onClick={() => setSelectedProduct(product)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        />

                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1b365d]/90 text-[#f0c76e] text-[10px] font-bold border border-[#c88d28]/50 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {product.tag}
                        </span>

                        <button
                          type="button"
                          onClick={() => onToggleWishlist(product.id)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow transition cursor-pointer"
                          aria-label="Toggle wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isWished ? 'fill-[#b54426] text-[#b54426]' : 'text-[#5c4330]'
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/65 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#f0c76e]" />
                          <span>{t.viewStory}</span>
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold uppercase tracking-wider text-[#b54426]">
                            {product.category}
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#2c1d13]">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {product.rating} ({product.reviews})
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedProduct(product)}
                          className="font-display text-xl font-bold text-[#2c1d13] leading-snug cursor-pointer hover:text-[#b54426] transition"
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs font-semibold text-[#6d4f38] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1b365d] shrink-0" />
                          <span className="truncate">
                            {product.artisanName} • {product.location}
                          </span>
                        </p>

                        <p className="text-xs text-[#5c4330] line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & CTAs */}
                    <div className="px-5 pb-5 pt-3 border-t border-[#c88d28]/25 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 block">Direct Artisan Price</span>
                        <span className="font-display text-2xl font-bold text-[#1b365d]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(product)}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#ede1ca] hover:bg-[#e1cfa9] text-[#2c1d13]'
                          }`}
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5 text-[#b54426]" />}
                          <span>{isAdded ? t.added : t.addToCart}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onBuyNow(product)}
                          className="btn-terracotta inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#f0c76e]" />
                          <span>{t.buyNow}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE ORDER TRACKING */}
      {activeTab === 'orders' && (
        <BuyerOrdersHub orders={orders} onSwitchToKarigar={onSwitchToKarigar} t={t} />
      )}

      {/* Detailed Craft Inspection Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleQuickAdd}
        onBuyNow={onBuyNow}
        language={language}
        t={t}
      />
    </div>
  );
}
