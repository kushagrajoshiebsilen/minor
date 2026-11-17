import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Check, X, Sparkles, RefreshCw } from 'lucide-react';
import { getLivePriceAdvice, getProviderMeta } from '../ai/aiService';

export default function AiPriceAdvisorModal({
  isOpen,
  onClose,
  category,
  productName,
  description,
  currentPrice,
  location,
  onApplyPrice,
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    const res = await getLivePriceAdvice({
      category,
      productName,
      description,
      currentPrice,
      location,
    });
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, category, productName]);

  if (!isOpen) return null;

  const data = result?.data;
  const numericCurrent = Number(currentPrice) || 0;
  const rangeSpan = data ? Math.max(1, data.maxPrice - data.minPrice) : 1;
  const markerPct = data && numericCurrent > 0
    ? Math.min(100, Math.max(0, ((numericCurrent - data.minPrice) / rangeSpan) * 100))
    : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
      <div className="parchment-card rounded-3xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="indigo-glass px-6 py-5 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Live Market Price Advisor</h2>
              <p className="text-xs text-[#f7f1e3]/75">
                Fair direct-to-artisan pricing benchmarked against Amazon, FabIndia, Etsy & ONDC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {loading || !data ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#b54426] animate-spin mx-auto" />
              <p className="text-sm font-bold text-[#2c1d13]">Analyzing National Craft Benchmarks...</p>
              <p className="text-xs text-[#6d4f38]">Querying AI Fair-Trade Economist for {category}</p>
            </div>
          ) : (
            <>
              {/* Engine Status + Context */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl parchment-surface text-xs">
                <div>
                  <span className="text-[#7c5c43] block">Evaluating Craft:</span>
                  <strong className="text-[#2c1d13] text-sm">
                    {productName || category}
                  </strong>
                  <span className="text-[#7c5c43]"> • {category}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  {result.live ? `Live ${getProviderMeta(result.provider).name}` : 'Smart National Benchmarks'}
                </span>
              </div>

              {/* Min / Avg / Max Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#c88d28]/25">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c5c43] block">
                    Market Min
                  </span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-[#2c1d13]">
                    ₹{data.minPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#faf0d9] to-[#f1dfb9] border-2 border-[#c88d28]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8e3118] block">
                    Fair Direct Price
                  </span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-[#1b365d]">
                    ₹{data.recommendedFairPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#c88d28]/25">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c5c43] block">
                    Premium Export Max
                  </span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-[#2c1d13]">
                    ₹{data.maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Visual Position Spectrum */}
              <div className="p-4 rounded-2xl bg-white/85 border border-[#c88d28]/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#2c1d13]">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#b54426]" />
                    Price Position Spectrum
                  </span>
                  {numericCurrent > 0 && (
                    <span className="text-[#b54426]">Your Price: ₹{numericCurrent.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="relative h-3 rounded-full bg-gradient-to-r from-amber-300 via-emerald-500 to-[#1b365d]">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-[3px] border-[#b54426] shadow-md transition-all"
                    style={{ left: `${markerPct}%` }}
                  />
                </div>
                <p className="text-xs text-[#5c4330] font-medium">{data.priceVerdict}</p>
              </div>

              {/* Platform Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6d4f38]">
                  Cross-Platform Retail Comparison
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.platforms.map((plat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/85 border border-[#c88d28]/25 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{plat.logo || '🏷️'}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2c1d13] truncate">{plat.name}</div>
                          <div className="text-[10px] text-[#7c5c43] truncate">{plat.note}</div>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-[#1b365d] shrink-0">
                        ₹{Number(plat.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middleman Transparency Note */}
              <div className="p-4 rounded-2xl bg-[#1b365d]/10 border border-[#1b365d]/25 flex items-start gap-3 text-xs text-[#2c1d13]">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1b365d] block mb-0.5">0% Middleman Artisan Wage Protection</strong>
                  {data.artisanRetentionNote}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#efe4cf]/85 border-t border-[#c88d28]/25 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#c88d28]/35 text-xs font-bold text-[#6d4f38] hover:bg-[#faf5ec] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Analyze</span>
          </button>

          {data && (
            <button
              type="button"
              onClick={() => {
                onApplyPrice(data.recommendedFairPrice);
                onClose();
              }}
              className="btn-terracotta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Fair Price (₹{data.recommendedFairPrice.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
