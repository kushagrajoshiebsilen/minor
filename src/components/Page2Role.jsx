import React from 'react';
import { ArrowLeft, ArrowRight, Hammer, ShoppingBag, Sparkles, ShieldCheck, Truck, Users } from 'lucide-react';

export default function Page2Role({
  onSelectRole,
  onBack,
  phone,
  t
}) {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative">
      {/* Glow effects */}
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-4xl">
        
        {/* Navigation back and header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backBtn}</span>
          </button>

          {phone && (
            <div className="text-xs text-stone-500">
              Verified phone: <span className="font-bold text-stone-800">+91 {phone}</span>
            </div>
          )}
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif mb-3">
            {t.page2Title}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
            {t.page2Subtitle}
          </p>
        </div>

        {/* 2 Big Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* OPTION 1: KARIGAR (ARTISAN) */}
          <div 
            onClick={() => onSelectRole('karigar')}
            className="group relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-stone-200 hover:border-amber-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Artisan Portal
              </span>
            </div>

            <div>
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-6 shadow-md shadow-orange-500/25 group-hover:scale-110 transition-transform">
                <Hammer className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-stone-900 font-serif mb-2.5 group-hover:text-amber-800 transition-colors">
                {t.asKarigar}
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                {t.asKarigarDesc}
              </p>

              {/* Key Highlights */}
              <div className="space-y-2.5 mb-8 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Direct pan-India market reach without middlemen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Instant product listing with photos & pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Direct UPI & bank payments for your craft</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 group-hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{t.continueAsKarigar}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* OPTION 2: BUYER (CUSTOMER) */}
          <div 
            onClick={() => onSelectRole('buyer')}
            className="group relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-stone-200 hover:border-orange-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
                Customer Marketplace
              </span>
            </div>

            <div>
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center text-white mb-6 shadow-md shadow-orange-500/25 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-stone-900 font-serif mb-2.5 group-hover:text-orange-800 transition-colors">
                {t.asBuyer}
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                {t.asBuyerDesc}
              </p>

              {/* Key Highlights */}
              <div className="space-y-2.5 mb-8 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>100% Authentic GI-tagged handmade crafts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Live search & filter by craft type & artisan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Amazon-style Add to Cart & Secure UPI/Card checkout</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3.5 px-5 rounded-2xl bg-orange-600 group-hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{t.continueAsBuyer}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
