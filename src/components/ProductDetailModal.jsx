import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Star,
  ShoppingBag,
  Zap,
  Globe,
  Sparkles,
  Send,
  Volume2,
  Award,
  Layers,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { getLanguageMeta } from '../i18n/languages';
import { translateProductContent, askCraftConcierge, getProviderMeta } from '../ai/aiService';
import { generateCertificateHash } from '../utils/orderEngine';
import { speakText } from '../utils/speechEngine';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  language,
  t,
}) {
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [question, setQuestion] = useState('');
  const [conciergeLog, setConciergeLog] = useState([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    setTranslated(null);
    setShowCert(false);
    setQuestion('');
    setConciergeLog([]);
  }, [product?.id, language]);

  if (!product) return null;

  const langMeta = getLanguageMeta(language);
  const certHash = generateCertificateHash(product);
  const displayTitle = translated?.title || product.name;
  const displayDesc = translated?.description || product.description;
  const displayCare = translated?.careGuide || product.careGuide || 'Wipe gently with a soft dry cloth.';

  const handleTranslate = async () => {
    setTranslating(true);
    const res = await translateProductContent({
      title: product.name,
      description: product.description,
      careGuide: product.careGuide,
      targetLanguageName: `${langMeta.name} (${langMeta.nativeName})`,
    });
    if (res?.data) {
      setTranslated({ ...res.data, live: res.live, provider: res.provider });
    }
    setTranslating(false);
  };

  const handleAsk = async (qText) => {
    const cleanQ = (qText || question).trim();
    if (!cleanQ) return;
    setQuestion('');
    setAsking(true);
    setConciergeLog((prev) => [...prev, { role: 'user', text: cleanQ }]);

    const res = await askCraftConcierge({
      product,
      question: cleanQ,
      targetLanguageName: `${langMeta.name} (${langMeta.nativeName})`,
    });

    setConciergeLog((prev) => [
      ...prev,
      {
        role: 'ai',
        text: res.answer,
        badge: res.live ? `Live ${getProviderMeta(res.provider).name}` : 'Smart Heritage Guide',
      },
    ]);
    setAsking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-up">
      <div className="parchment-card rounded-3xl max-w-4xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Bar */}
        <div className="indigo-glass px-5 sm:px-6 py-4 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Award className="w-5 h-5 text-[#f0c76e] shrink-0" />
            <span className="font-display text-lg sm:text-xl font-bold truncate">
              {product.category} • {product.location}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Image + Certificate */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#c88d28]/35 aspect-[4/3]">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1b365d]/90 text-[#f0c76e] text-[10px] font-bold border border-[#c88d28]/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {product.tag}
              </span>
            </div>

            {/* Digital GI & Authenticity Certificate Toggle */}
            <button
              type="button"
              onClick={() => setShowCert(!showCert)}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#1b365d] to-[#264b80] text-[#f7f1e3] border border-[#c88d28]/50 flex items-center justify-between text-xs font-bold shadow cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#f0c76e]" />
                {t.giCertificate}
              </span>
              <span className="text-[#f0c76e]">{showCert ? 'Hide' : 'Verify →'}</span>
            </button>

            {showCert && (
              <div className="p-4 rounded-2xl bg-[#faf3e3] border-2 border-double border-[#c88d28] space-y-2 text-xs animate-fade-up">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold text-[#1b365d]">Certificate of Authenticity</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="font-mono text-[11px] bg-white/80 px-2.5 py-1 rounded-lg border border-[#c88d28]/30 text-[#8e3118] font-bold">
                  ID: {certHash}
                </div>
                <p className="text-[11px] text-[#5c4330] leading-relaxed">
                  Certifies that <strong>{product.name}</strong> is handcrafted directly by master artisan{' '}
                  <strong>{product.artisanName}</strong> in <strong>{product.location}</strong> under KarigarBazaar’s{' '}
                  <strong>0% Middleman Direct Payout</strong> pledge.
                </p>
              </div>
            )}

            {/* Specs */}
            <div className="p-3.5 rounded-2xl parchment-surface space-y-2 text-xs text-[#3c2a1e]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#b54426] shrink-0" />
                <span>
                  <strong>Materials:</strong> {(product.materials || ['Authentic Handmade Material']).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1b365d] shrink-0" />
                <span>
                  <strong>Crafting Effort:</strong> {product.craftingTime || 'Handcrafted in small batch'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Care:</strong> {displayCare}
                </span>
              </div>
            </div>
          </div>

          {/* Right Story, Live Translation & AI Craft Concierge */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8e3118]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {product.artisanName} • {product.location}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c1d13] mt-1.5 leading-tight">
                {displayTitle}
              </h2>
            </div>

            {/* Audio & Live 15-Language AI Translation Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating}
                className="btn-indigo inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {translating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 text-[#f0c76e]" />}
                <span>
                  {translating ? 'Translating...' : `${t.translateWithAi} (${langMeta.nativeName})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => speakText(`${displayTitle}. ${displayDesc}`, language)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/85 hover:bg-white border border-[#c88d28]/35 text-xs font-bold text-[#2c1d13] cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#b54426]" />
                <span>Listen ({langMeta.nativeName})</span>
              </button>
            </div>

            <p className="text-sm text-[#3c2a1e] leading-relaxed p-4 rounded-2xl parchment-surface whitespace-pre-line">
              {displayDesc}
            </p>

            {/* Price & Purchase CTA */}
            <div className="p-4 rounded-2xl bg-white/90 border border-[#c88d28]/35 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 block">
                  {t.directToArtisan}
                </span>
                <span className="font-display text-3xl font-bold text-[#1b365d]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#ede1ca] hover:bg-[#e3d2b3] text-[#2c1d13] text-xs font-extrabold transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#b54426]" />
                  <span>{t.addToCart}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBuyNow(product);
                  }}
                  className="btn-terracotta inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#f0c76e]" />
                  <span>{t.buyNow}</span>
                </button>
              </div>
            </div>

            {/* AI Craft Concierge Q&A */}
            <div className="rounded-2xl border border-[#1b365d]/25 bg-[#1b365d]/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1b365d] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#b54426]" />
                  {t.askConcierge}
                </span>
                <span className="text-[10px] font-bold text-[#6d4f38]">Answers in {langMeta.nativeName}</span>
              </div>

              {/* Quick chips */}
              <div className="flex flex-wrap gap-1.5">
                {['How do I care for this craft?', 'Is this good for gifting?', 'Verify GI authenticity'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAsk(chip)}
                    disabled={asking}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#faf4e8] border border-[#c88d28]/35 text-[11px] font-semibold text-[#3c2a1e] cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat log */}
              {conciergeLog.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {conciergeLog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs ${
                        msg.role === 'user'
                          ? 'bg-[#1b365d] text-white ml-8'
                          : 'bg-white border border-[#c88d28]/30 text-[#2c1d13] mr-4'
                      }`}
                    >
                      {msg.badge && (
                        <span className="text-[10px] font-bold text-[#b54426] block mb-0.5">{msg.badge}</span>
                      )}
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about heritage, dimensions, care, gifting..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#c88d28]/35 text-xs text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#1b365d]/30"
                />
                <button
                  type="submit"
                  disabled={asking}
                  className="btn-indigo px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
