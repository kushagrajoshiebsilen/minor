import React from 'react';
import { 
  IndianRupee, TrendingUp, ShieldCheck, ArrowRight, X, 
  CheckCircle, Sparkles, BarChart3, AlertCircle, ShoppingCart 
} from 'lucide-react';
import { getMarketBenchmark } from '../data/marketPriceData';

export default function PriceComparerModal({
  isOpen,
  onClose,
  category,
  productName,
  currentPrice,
  onApplyPrice,
  language = 'hi'
}) {
  if (!isOpen) return null;

  const isHindi = language === 'hi';
  const benchmark = getMarketBenchmark(category, productName, currentPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'बाज़ार मूल्य तुलना (Market Price Comparer)' : 'National Market Price Comparer'}
              </h2>
              <p className="text-xs text-emerald-100">
                {isHindi 
                  ? 'विभिन्न प्लेटफॉर्मों से औसत व अधिकतम कीमत की तुलना करें' 
                  : 'Benchmark prices across Amazon, FabIndia, Etsy & ONDC'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Craft Context */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-stone-500 block">Product category benchmark:</span>
              <strong className="text-stone-900 text-sm">{category || 'General Craft'}</strong>
              {productName && <span className="text-stone-600"> • "{productName}"</span>}
            </div>

            {currentPrice && (
              <div className="text-right">
                <span className="text-stone-500 block">Your Current Price:</span>
                <strong className="text-orange-600 text-sm font-serif">₹{Number(currentPrice).toLocaleString('en-IN')}</strong>
              </div>
            )}
          </div>

          {/* 3 Metric Benchmark Cards: Min, Average, Max */}
          <div className="grid grid-cols-3 gap-3 text-center">
            
            {/* Minimum Price */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                {isHindi ? 'न्यूनतम बाज़ार भाव' : 'Min Market Price'}
              </span>
              <span className="text-base sm:text-xl font-extrabold text-stone-700 font-serif">
                ₹{benchmark.minPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Average Price */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                {isHindi ? 'औसत बाज़ार मूल्य' : 'Average Market Price'}
              </span>
              <span className="text-base sm:text-xl font-extrabold text-amber-900 font-serif">
                ₹{benchmark.avgPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Maximum Price */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                {isHindi ? 'अधिकतम प्रीमियम मूल्य' : 'Max Premium Price'}
              </span>
              <span className="text-base sm:text-xl font-extrabold text-stone-700 font-serif">
                ₹{benchmark.maxPrice.toLocaleString('en-IN')}
              </span>
            </div>

          </div>

          {/* Platform Comparisons Table */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center justify-between">
              <span>{isHindi ? 'विभिन्न ई-कॉमर्स प्लेटफॉर्मों पर कीमतें:' : 'Live Price Comparison Across Major Platforms:'}</span>
              <span className="text-[11px] text-stone-400 font-normal">Updated 2026 benchmarks</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benchmark.platforms.map((plat, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-stone-200 bg-white shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" role="img" aria-label={plat.name}>{plat.logo}</span>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900">{plat.name}</h5>
                      <span className="text-[10px] text-stone-500">{plat.note}</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-stone-900 font-serif">
                    ₹{plat.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fair Artisan Price Recommendation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold uppercase">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                {isHindi ? 'कारीगर के लिए अनुशंसित उचित मूल्य' : 'Recommended Fair Artisan Price'}
              </div>
              <div className="text-2xl font-extrabold text-emerald-950 font-serif">
                ₹{benchmark.recommendedFairPrice.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-emerald-800 max-w-sm leading-relaxed">
                {benchmark.markupExplanation}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onApplyPrice(benchmark.recommendedFairPrice);
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isHindi ? 'यह मूल्य लागू करें ✓' : 'Apply Fair Price ✓'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
