import React, { useState } from 'react';
import { 
  Search, MapPin, User, ShoppingBag, Zap, Star, ShieldCheck, 
  Sparkles, Filter, Check, ArrowLeft, ArrowRight, Eye, RefreshCw
} from 'lucide-react';

export default function Page3Buyer({
  buyerProfile,
  setBuyerProfile,
  products,
  onAddToCart,
  onBuyNow,
  onSwitchToKarigar,
  onBack,
  t
}) {
  const [name, setName] = useState(buyerProfile.name || 'Aditi Verma');
  const [location, setLocation] = useState(buyerProfile.location || 'New Delhi, India');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [addedAnimationId, setAddedAnimationId] = useState(null);

  const categories = [
    'All',
    'Pottery & Clay',
    'Handloom & Textiles',
    'Paintings & Art',
    'Metal & Brass',
    'Wood Carvings'
  ];

  // Save profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setBuyerProfile({ name, location });
    setIsEditingProfile(false);
  };

  // Filter products by search query and category
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesSearch = 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.artisanName.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const handleAddToCartWithFeedback = (product) => {
    onAddToCart(product);
    setAddedAnimationId(product.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      
      {/* Top Bar with Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-sm transition"
            title={t.backBtn}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                {t.buyerHeader}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
                Page 3: Buyer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {t.buyerSubheader}
            </p>
          </div>
        </div>

        {/* Switch to Karigar View */}
        <button
          onClick={onSwitchToKarigar}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs sm:text-sm font-bold shadow-sm transition"
        >
          <span>List Craft as Karigar</span>
          <ArrowRight className="w-4 h-4 text-amber-600" />
        </button>
      </div>

      {/* SECTION A & B: BUYER PROFILE (NAME & LOCATION) */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-stone-50 rounded-2xl p-4 sm:p-5 border border-amber-200/70 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-700">
            {/* a) Name */}
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 text-[11px] flex items-center justify-center font-bold">a</span>
              <User className="w-4 h-4 text-orange-600" />
              <span className="text-stone-500 font-medium">{t.buyerName}:</span>
              <span className="font-bold text-stone-900">{name || 'Guest Buyer'}</span>
            </div>

            {/* b) Location */}
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 text-[11px] flex items-center justify-center font-bold">b</span>
              <MapPin className="w-4 h-4 text-amber-600" />
              <span className="text-stone-500 font-medium">{t.buyerLocation}:</span>
              <span className="font-bold text-stone-900">{location || 'Select City'}</span>
            </div>
          </div>

          {/* Quick Edit Toggle */}
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs font-bold text-amber-800 hover:text-amber-900 underline underline-offset-2 self-start sm:self-auto"
          >
            {isEditingProfile ? 'Done Editing' : 'Change Buyer Details'}
          </button>
        </div>

        {/* Expandable form to change buyer name and location */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">a) {t.buyerName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.buyerNamePlaceholder}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">b) {t.buyerLocation}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.buyerLocationPlaceholder}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition"
              >
                Save Details
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION C: PRODUCT TO BE SEARCHED */}
      <div className="space-y-4 mb-8">
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 text-[11px] flex items-center justify-center font-bold">c</span>
            <label htmlFor="search-input" className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Product to be searched
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-amber-600" />
            </div>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl border-2 border-stone-300 focus:border-orange-600 bg-white text-stone-900 text-sm sm:text-base font-medium placeholder:text-stone-400 focus:outline-none shadow-md shadow-stone-200/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat === 'All' ? t.allCrafts : cat}
            </button>
          ))}
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <span>
            Showing <strong className="text-stone-900">{filteredProducts.length}</strong> handcrafted items
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Direct from Verified Artisans
          </span>
        </div>
      </div>

      {/* SECTION D: PRODUCT GRID (BUY OR ADD TO CART - AMAZON STYLE) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">No Crafts Found</h3>
          <p className="text-xs text-stone-500 mb-6">
            We couldn't find any products matching "{searchQuery}". Try searching for pottery, saree, silk, or painting.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-sm hover:bg-orange-700 transition"
          >
            Reset Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isJustAdded = addedAnimationId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200/90 hover:border-amber-400 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProductDetails(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {product.category}
                  </span>

                  {/* Badge */}
                  {product.tag && (
                    <span className="absolute top-3 right-3 bg-amber-600/95 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {product.tag}
                    </span>
                  )}

                  {/* Quick View overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/95 text-stone-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      View Craft Story
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Artisan attribution */}
                    <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1.5">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{product.location}</span>
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 shrink-0 font-bold text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-stone-400 font-normal">({product.reviews})</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 
                      onClick={() => setSelectedProductDetails(product)}
                      className="font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1 font-serif cursor-pointer mb-1.5"
                    >
                      {product.name}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                      {product.description}
                    </p>

                    {/* Artisan Name */}
                    <div className="text-[11px] text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg mb-4 flex items-center justify-between border border-stone-100">
                      <span>{t.madeBy} <strong className="text-stone-800">{product.artisanName}</strong></span>
                      <span className="text-emerald-700 font-semibold">{t.inStock}</span>
                    </div>
                  </div>

                  {/* Price & Actions (Amazon Style) */}
                  <div className="pt-3 border-t border-stone-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-xl font-extrabold text-stone-900 font-serif">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold ml-2">
                          {t.freeDelivery}
                        </span>
                      </div>
                    </div>

                    {/* Amazon-style 2 action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Add to Cart */}
                      <button
                        type="button"
                        onClick={() => handleAddToCartWithFeedback(product)}
                        className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isJustAdded
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-amber-100/80 hover:bg-amber-200 border-amber-300 text-amber-950'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
                            <span>{t.addToCart}</span>
                          </>
                        )}
                      </button>

                      {/* Buy Now (Direct to Amazon-style payment) */}
                      <button
                        type="button"
                        onClick={() => onBuyNow(product)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{t.buyNow}</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Product Details Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                {selectedProductDetails.category}
              </span>
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src={selectedProductDetails.image}
                  alt={selectedProductDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif">
                    {selectedProductDetails.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{selectedProductDetails.location}</span>
                    <span>•</span>
                    <span className="font-semibold text-stone-800">By {selectedProductDetails.artisanName}</span>
                  </div>

                  <div className="mt-4 text-2xl font-extrabold text-stone-900 font-serif">
                    ₹{selectedProductDetails.price.toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">
                    ✓ 100% Direct Artisan Price (No middleman commission)
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      handleAddToCartWithFeedback(selectedProductDetails);
                      setSelectedProductDetails(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.addToCart}</span>
                  </button>

                  <button
                    onClick={() => {
                      const prod = selectedProductDetails;
                      setSelectedProductDetails(null);
                      onBuyNow(prod);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{t.buyNow}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 text-xs text-stone-600 leading-relaxed">
              <h4 className="font-bold text-stone-900">Craft Details & Heritage</h4>
              <p>{selectedProductDetails.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
