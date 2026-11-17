import React, { useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, RefreshCw, ShieldCheck, Clock, Layers, MapPin, HeartHandshake } from 'lucide-react';
import { enhanceCraftStory, getProviderMeta } from '../ai/aiService';
import { getLanguageMeta } from '../i18n/languages';

export default function AiStoryEnhancer({
  currentDescription,
  productName,
  category,
  artisanName,
  location,
  language,
  onApplyEnhanced,
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [outputMode, setOutputMode] = useState('en'); // 'en' | 'regional'
  const [applied, setApplied] = useState(false);

  const langMeta = getLanguageMeta(language);

  const handleGenerate = async () => {
    setLoading(true);
    setApplied(false);
    const targetLangName = outputMode === 'regional' ? `${langMeta.name} (${langMeta.nativeName})` : 'English';
    const res = await enhanceCraftStory({
      rawNotes: currentDescription,
      productName,
      category,
      artisanName,
      location,
      targetLanguageName: targetLangName,
    });
    setResult(res);
    setLoading(false);
  };

  const handleApply = () => {
    if (!result?.data) return;
    onApplyEnhanced(result.data);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  const providerLabel = result?.live
    ? `Live ${getProviderMeta(result.provider).name} (${result.model})`
    : 'Smart Offline Heritage Engine';

  return (
    <div className="rounded-2xl border border-[#c88d28]/40 bg-gradient-to-br from-[#faf4e8] via-[#f4e8d4] to-[#ede0c8] p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b365d] to-[#b54426] text-[#f7f1e3] flex items-center justify-center shadow">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-extrabold text-[#2c1d13]">
                AI Craft Storyteller & Attribute Analyzer
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1b365d]/12 text-[#1b365d] border border-[#1b365d]/20">
                Grok / Gemini Ready
              </span>
            </div>
            <p className="text-[11px] text-[#6d4f38]">
              Turns raw spoken or typed notes into museum-grade craft copy, materials, GI badge & care guide
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {language !== 'en' && (
            <div className="inline-flex rounded-xl bg-white/80 p-0.5 border border-[#c88d28]/30 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setOutputMode('en')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  outputMode === 'en' ? 'bg-[#1b365d] text-white' : 'text-[#6d4f38]'
                }`}
              >
                English Copy
              </button>
              <button
                type="button"
                onClick={() => setOutputMode('regional')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  outputMode === 'regional' ? 'bg-[#b54426] text-white' : 'text-[#6d4f38]'
                }`}
              >
                {langMeta.nativeName}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="btn-indigo inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#f0c76e]" />}
            <span>{loading ? 'Crafting Story...' : 'Enhance with AI'}</span>
          </button>
        </div>
      </div>

      {result?.data && (
        <div className="p-4 rounded-2xl bg-white/90 border border-[#c88d28]/30 space-y-3.5 animate-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              {providerLabel}
            </span>
            {result.data.giTagLabel && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1b365d] bg-[#1b365d]/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#b54426]" />
                {result.data.giTagLabel}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#8e3118]">
              Suggested Title: <span className="text-[#2c1d13]">{result.data.enhancedTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3c2a1e] leading-relaxed bg-[#faf5ec] p-3 rounded-xl border border-[#c88d28]/20">
              {result.data.enhancedDescription}
            </p>
          </div>

          {/* Extracted Attribute Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f7f1e3]/70 border border-[#c88d28]/20">
              <Layers className="w-3.5 h-3.5 text-[#b54426] shrink-0" />
              <span className="truncate">
                <strong>Materials:</strong> {(result.data.materials || []).join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f7f1e3]/70 border border-[#c88d28]/20">
              <Clock className="w-3.5 h-3.5 text-[#1b365d] shrink-0" />
              <span className="truncate">
                <strong>Effort:</strong> {result.data.craftingTime}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f7f1e3]/70 border border-[#c88d28]/20">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">
                <strong>Cluster:</strong> {result.data.origin}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f7f1e3]/70 border border-[#c88d28]/20">
              <HeartHandshake className="w-3.5 h-3.5 text-[#c88d28] shrink-0" />
              <span className="truncate">
                <strong>Care:</strong> {result.data.careGuide}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleApply}
              className="btn-terracotta inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{applied ? 'Applied to Listing!' : 'Apply Story, Title & Attributes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
