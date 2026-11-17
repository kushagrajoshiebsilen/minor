import React, { useState, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Camera,
  Sparkles,
  BarChart3,
  Upload,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Package,
  PlusCircle,
  Grid,
  ShieldCheck,
  MapPin,
  IndianRupee,
  RefreshCw,
  Trash2,
  ScanEye,
} from 'lucide-react';
import { INDIAN_CRAFT_CATEGORIES } from '../ai/craftKnowledgeBase';
import { ATELIER_PRESET_IMAGES } from '../data/heritageCatalog';
import { computeLocalPricingBenchmark } from '../data/pricingBenchmarks';
import { inspectCraftImage, getProviderMeta } from '../ai/aiService';
import { speakText, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';
import { getLanguageMeta } from '../i18n/languages';
import { ORDER_STATUS } from '../utils/orderEngine';
import VoiceListingWizard from './VoiceListingWizard';
import AiStoryEnhancer from './AiStoryEnhancer';
import AiPhotoStudioModal from './AiPhotoStudioModal';
import AiPriceAdvisorModal from './AiPriceAdvisorModal';
import KarigarOrdersHub from './KarigarOrdersHub';

export default function KarigarStudioView({
  karigarProfile,
  setKarigarProfile,
  products,
  onAddProduct,
  onDeleteProduct,
  orders,
  setOrders,
  onSwitchToBuyer,
  onBack,
  language,
  t,
}) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'catalog' | 'orders'
  const [name, setName] = useState(karigarProfile.name || '');
  const [location, setLocation] = useState(karigarProfile.location || '');
  const [category, setCategory] = useState(INDIAN_CRAFT_CATEGORIES[0]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(ATELIER_PRESET_IMAGES[0].url);
  const [price, setPrice] = useState('');
  const [craftMeta, setCraftMeta] = useState({
    materials: [],
    technique: '',
    craftingTime: '',
    careGuide: '',
    giTagLabel: 'Artisan Direct Verified',
  });

  const [listeningField, setListeningField] = useState(null);
  const [scanningVision, setScanningVision] = useState(false);
  const [visionStatus, setVisionStatus] = useState('');
  const [toast, setToast] = useState('');
  const [formError, setFormError] = useState('');

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
  const [isPriceAdvisorOpen, setIsPriceAdvisorOpen] = useState(false);

  const langMeta = getLanguageMeta(language);
  const benchmark = useMemo(
    () => computeLocalPricingBenchmark(category, productName, price),
    [category, productName, price]
  );

  const pendingOrdersCount = orders.filter((o) => o.status === ORDER_STATUS.PENDING_KARIGAR).length;
  const myProducts = products.filter((p) => p.isCustomListed);

  const handleFieldVoiceInput = (fieldKey, setter, isNumeric = false) => {
    if (listeningField === fieldKey) {
      setListeningField(null);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition works best in Chrome or Edge browser.');
      return;
    }
    setListeningField(fieldKey);
    const rec = createSpeechRecognizer({
      language,
      onResult: (spoken) => {
        let cleaned = spoken;
        if (isNumeric) {
          const digits = spoken.match(/\d+/g);
          if (digits) cleaned = digits.join('');
        }
        setter(cleaned);
      },
      onEnd: () => setListeningField(null),
      onError: () => setListeningField(null),
    });
    try {
      rec?.start();
    } catch {
      setListeningField(null);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiVisionScan = async () => {
    setScanningVision(true);
    setVisionStatus('');
    const res = await inspectCraftImage({
      imageDataUrl: image,
      location,
      targetLanguageName: 'English',
      currentCategory: category,
    });
    if (res?.data) {
      if (INDIAN_CRAFT_CATEGORIES.includes(res.data.category)) {
        setCategory(res.data.category);
      }
      setProductName(res.data.productName || productName);
      setDescription(res.data.description || description);
      if (res.data.suggestedPrice) {
        setPrice(String(res.data.suggestedPrice));
      }
      setCraftMeta((prev) => ({
        ...prev,
        materials: res.data.materials || prev.materials,
        technique: res.data.technique || prev.technique,
        giTagLabel: res.data.giTagLabel || prev.giTagLabel,
      }));
      setVisionStatus(
        res.live
          ? `Scanned via Live ${getProviderMeta(res.provider).name} Vision (${res.model})!`
          : 'Scanned via Smart Offline Craft Vision (Connect Grok/Gemini key for live visual inspection).'
      );
    }
    setScanningVision(false);
  };

  const handleVoiceWizardComplete = (data) => {
    if (data.name) setName(data.name);
    if (data.location) setLocation(data.location);
    if (data.productName) setProductName(data.productName);
    if (data.description) setDescription(data.description);
    if (data.image) setImage(data.image);
    if (data.price) setPrice(String(data.price));
    setKarigarProfile({ name: data.name || name, location: data.location || location });
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !productName.trim() || !description.trim() || !price) {
      setFormError('Please fill Artisan Name, Workshop City, Craft Name, Story, and Direct Price.');
      return;
    }
    setFormError('');
    setKarigarProfile({ name: name.trim(), location: location.trim() });

    const newCraft = {
      id: `craft-${Date.now()}`,
      name: productName.trim(),
      category,
      description: description.trim(),
      price: Number(price),
      image,
      artisanName: name.trim(),
      location: location.trim(),
      rating: 5.0,
      reviews: 1,
      tag: craftMeta.giTagLabel || 'Direct Artisan Heritage',
      giEligible: true,
      materials: craftMeta.materials.length > 0 ? craftMeta.materials : ['Authentic Handmade Materials'],
      technique: craftMeta.technique || `Traditional ${category}`,
      craftingTime: craftMeta.craftingTime || 'Handcrafted to Order',
      careGuide: craftMeta.careGuide || 'Handle gently and protect from moisture.',
      isCustomListed: true,
    };

    onAddProduct(newCraft);
    setProductName('');
    setDescription('');
    setPrice('');
    setToast(t.publishedToast);
    setTimeout(() => setToast(''), 4500);
  };

  const renderAudioControls = (fieldKey, promptText, setter, isNumeric = false) => (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => speakText(promptText, language)}
        title={`Read aloud in ${langMeta.name}`}
        className="p-1.5 rounded-lg bg-[#1b365d]/10 hover:bg-[#1b365d]/20 text-[#1b365d] transition cursor-pointer"
      >
        <Volume2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => handleFieldVoiceInput(fieldKey, setter, isNumeric)}
        title={`Speak in ${langMeta.nativeName}`}
        className={`p-1.5 rounded-lg transition cursor-pointer ${
          listeningField === fieldKey
            ? 'bg-[#b54426] text-white animate-mic-pulse'
            : 'bg-[#b54426]/12 hover:bg-[#b54426]/20 text-[#b54426]'
        }`}
      >
        {listeningField === fieldKey ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-up">
      {/* Studio Top Bar */}
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
                Karigar Atelier Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#b54426]/15 text-[#8e3118] border border-[#b54426]/25">
                0% Middleman Fee
              </span>
            </div>
            <p className="text-xs text-[#6d4f38] mt-0.5">
              Voice-guided listing in <strong>{langMeta.nativeName}</strong> • AI Vision Scan • Studio Photography • Live Price Intelligence
            </p>
          </div>
        </div>

        {/* Tab Bar + Switch to Buyer */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-[#ede1ca]/90 p-1 rounded-2xl border border-[#c88d28]/30">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'create' ? 'bg-[#1b365d] text-white shadow' : 'text-[#5c4330]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.tabNewCraft}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'catalog' ? 'bg-[#1b365d] text-white shadow' : 'text-[#5c4330]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{t.tabMyCatalog} ({myProducts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#1b365d] text-white shadow' : 'text-[#5c4330]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t.tabIncomingOrders}</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#b54426] text-white text-[10px] font-extrabold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onSwitchToBuyer}
            className="btn-terracotta inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            <span>View Buyer Bazaar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-emerald-50 border border-emerald-400/40 shadow-lg flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toast}</span>
          </div>
          <button
            type="button"
            onClick={onSwitchToBuyer}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-emerald-950 text-xs font-extrabold cursor-pointer shrink-0"
          >
            See Live in Bazaar →
          </button>
        </div>
      )}

      {/* TAB 1: CREATE NEW CRAFT */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Column */}
          <form onSubmit={handlePublish} className="lg:col-span-8 space-y-5">
            {/* Voice-First Hero Launchpad */}
            <div className="indigo-glass rounded-3xl p-5 sm:p-6 text-[#f7f1e3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#b54426] flex items-center justify-center shadow-lg border border-[#f0c76e]/40 shrink-0">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-[#faf4e8]">
                    Prefer Speaking Over Typing?
                  </h2>
                  <p className="text-xs text-[#f7f1e3]/80">
                    Our 6-step Voice Guide speaks to you in <strong>{langMeta.nativeName}</strong> and builds your listing hands-free.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="btn-terracotta inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold shrink-0 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>{t.voiceWizardBtn}</span>
              </button>
            </div>

            {/* Section 1: Artisan Profile */}
            <div className="parchment-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h3 className="font-display text-xl font-bold text-[#2c1d13] border-b border-[#c88d28]/25 pb-2.5">
                1. Artisan & Workshop Heritage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#5c4330]">{t.artisanName}</label>
                    {renderAudioControls('name', 'Please speak your full artisan name', setName)}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sitadevi Paswan"
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-[#c88d28]/35 text-sm font-semibold text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#5c4330]">{t.workshopCity}</label>
                    {renderAudioControls('location', 'Please speak your workshop city and state', setLocation)}
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Varanasi, Uttar Pradesh"
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-[#c88d28]/35 text-sm font-semibold text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Craft Photography + AI Vision Scan + Photo Studio */}
            <div className="parchment-card rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c88d28]/25 pb-2.5">
                <h3 className="font-display text-xl font-bold text-[#2c1d13]">
                  2. {t.craftPhoto} & AI Vision Scan
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAiVisionScan}
                    disabled={scanningVision}
                    className="btn-indigo inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60"
                  >
                    {scanningVision ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ScanEye className="w-3.5 h-3.5 text-[#f0c76e]" />}
                    <span>{scanningVision ? 'Scanning Craft...' : t.aiScanBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPhotoStudioOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c88d28]/20 hover:bg-[#c88d28]/30 border border-[#c88d28]/50 text-[#2c1d13] text-xs font-bold transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#8e3118]" />
                    <span>{t.photoStudioBtn}</span>
                  </button>
                </div>
              </div>

              {visionStatus && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{visionStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 rounded-2xl overflow-hidden border-2 border-[#c88d28]/35 aspect-[4/3] bg-black/10">
                  <img src={image} alt="Craft Preview" className="w-full h-full object-cover" />
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <label className="w-full py-3 px-4 rounded-xl bg-white/90 hover:bg-white border-2 border-dashed border-[#b54426]/45 text-xs font-bold text-[#8e3118] flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>{t.uploadPhoto} (JPG / PNG)</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <div>
                    <span className="text-[11px] font-bold text-[#6d4f38] block mb-1.5">
                      Or choose a curated craft sample:
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {ATELIER_PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => {
                            setImage(preset.url);
                            setCategory(preset.category);
                          }}
                          className={`rounded-xl overflow-hidden border-2 h-14 transition cursor-pointer ${
                            image === preset.url ? 'border-[#b54426] scale-105 shadow' : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                          title={preset.title}
                        >
                          <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Craft Details & AI Storyteller */}
            <div className="parchment-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h3 className="font-display text-xl font-bold text-[#2c1d13] border-b border-[#c88d28]/25 pb-2.5">
                3. Craft Details & AI Storyteller
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#5c4330] block mb-1.5">{t.craftCategory}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-[#c88d28]/35 text-sm font-bold text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
                  >
                    {INDIAN_CRAFT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#5c4330]">{t.craftTitle}</label>
                    {renderAudioControls('productName', 'Speak the name of your handcrafted item', setProductName)}
                  </div>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Banarasi Katan Silk Dupatta"
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-[#c88d28]/35 text-sm font-semibold text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#5c4330]">{t.craftStory}</label>
                  {renderAudioControls('description', 'Tell us the materials, crafting technique, and days taken', (txt) =>
                    setDescription((prev) => (prev ? `${prev} ${txt}` : txt))
                  )}
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write or speak casually in any language — e.g. '10 din lage, shuddh mitti aur prakritik rang se bana hai' — then click Enhance with AI..."
                  className="w-full px-4 py-3 rounded-xl bg-white/90 border border-[#c88d28]/35 text-sm text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
                />
              </div>

              {/* Embedded AI Story Enhancer */}
              <AiStoryEnhancer
                currentDescription={description}
                productName={productName}
                category={category}
                artisanName={name}
                location={location}
                language={language}
                onApplyEnhanced={(aiData) => {
                  if (aiData.enhancedTitle) setProductName(aiData.enhancedTitle);
                  if (aiData.enhancedDescription) setDescription(aiData.enhancedDescription);
                  setCraftMeta({
                    materials: aiData.materials || [],
                    technique: aiData.technique || '',
                    craftingTime: aiData.craftingTime || '',
                    careGuide: aiData.careGuide || '',
                    giTagLabel: aiData.giTagLabel || 'Artisan Heritage Verified',
                  });
                }}
              />
            </div>

            {/* Section 4: Fair Direct Price + Live Market Price Advisor */}
            <div className="parchment-card rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c88d28]/25 pb-2.5">
                <h3 className="font-display text-xl font-bold text-[#2c1d13]">
                  4. {t.craftPrice}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPriceAdvisorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow cursor-pointer transition"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t.priceAdvisorBtn}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#5c4330]">Your Direct Payout Price (₹ INR)</label>
                    {renderAudioControls('price', 'Speak your craft price in rupees', setPrice, true)}
                  </div>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-[#b54426] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={50}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={String(benchmark.recommendedFairPrice)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/95 border border-[#c88d28]/40 text-lg font-extrabold text-[#1b365d] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Fair Market Guide ({category})</span>
                    <button
                      type="button"
                      onClick={() => setPrice(String(benchmark.recommendedFairPrice))}
                      className="text-[11px] font-extrabold text-emerald-800 underline cursor-pointer"
                    >
                      Apply ₹{benchmark.recommendedFairPrice.toLocaleString('en-IN')}
                    </button>
                  </div>
                  <div className="text-emerald-800">
                    Range: ₹{benchmark.minPrice.toLocaleString('en-IN')} – ₹{benchmark.maxPrice.toLocaleString('en-IN')} • <strong>100% goes to you</strong>
                  </div>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-bold text-[#b54426] bg-[#b54426]/10 p-3 rounded-xl">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="btn-terracotta w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#f0c76e]" />
                <span>{t.publishCraft}</span>
              </button>
            </div>
          </form>

          {/* Right Sticky Live Preview Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div className="parchment-card rounded-3xl overflow-hidden">
              <div className="px-5 py-3 bg-[#1b365d] text-[#f7f1e3] flex items-center justify-between text-xs font-bold">
                <span>Live Buyer Card Preview</span>
                <span className="text-[#f0c76e]">{category}</span>
              </div>

              <div className="relative aspect-[4/3] bg-black/10">
                <img src={image} alt="Craft live preview" className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1b365d]/90 text-[#f0c76e] text-[10px] font-bold border border-[#c88d28]/50 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {craftMeta.giTagLabel}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h4 className="font-display text-xl font-bold text-[#2c1d13] leading-snug">
                    {productName || 'Your Handcrafted Masterpiece'}
                  </h4>
                  <p className="text-xs text-[#6d4f38] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#b54426]" />
                    <span>
                      {name || 'Master Artisan'} • {location || 'Craft Cluster, India'}
                    </span>
                  </p>
                </div>

                <p className="text-xs text-[#5c4330] line-clamp-3 leading-relaxed">
                  {description || 'Speak or type your craft story on the left, or click AI Vision Scan to auto-generate a museum-quality description.'}
                </p>

                <div className="pt-3 border-t border-[#c88d28]/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7c5c43] block">Direct Artisan Price</span>
                    <span className="font-display text-2xl font-bold text-[#1b365d]">
                      ₹{price ? Number(price).toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-[11px] font-extrabold">
                    0% Commission
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ATELIER CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {myProducts.length === 0 ? (
            <div className="parchment-card rounded-3xl p-10 text-center space-y-3">
              <h3 className="font-display text-2xl font-bold text-[#2c1d13]">Your Atelier Catalog is Empty</h3>
              <p className="text-xs sm:text-sm text-[#6d4f38]">
                Publish your first craft from the <strong>List New Craft</strong> tab to see it live here and in the National Bazaar.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="btn-terracotta px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProducts.map((p) => (
                <div key={p.id} className="parchment-card rounded-3xl overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-900/90 text-emerald-100 text-[10px] font-bold">
                      Live in Bazaar
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#b54426]">{p.category}</span>
                      <h4 className="font-display text-lg font-bold text-[#2c1d13] leading-snug">{p.name}</h4>
                      <p className="text-xs text-[#6d4f38] line-clamp-2 mt-1">{p.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#c88d28]/25">
                      <span className="font-display text-xl font-bold text-[#1b365d]">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INCOMING ORDERS */}
      {activeTab === 'orders' && (
        <KarigarOrdersHub orders={orders} setOrders={setOrders} t={t} />
      )}

      {/* Modals */}
      <VoiceListingWizard
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
        category={category}
        currentValues={{ name, location, productName, description, image, price }}
        onComplete={handleVoiceWizardComplete}
      />

      <AiPhotoStudioModal
        isOpen={isPhotoStudioOpen}
        onClose={() => setIsPhotoStudioOpen(false)}
        originalImage={image}
        onApplyEnhancedImage={(enhanced) => setImage(enhanced)}
      />

      <AiPriceAdvisorModal
        isOpen={isPriceAdvisorOpen}
        onClose={() => setIsPriceAdvisorOpen(false)}
        category={category}
        productName={productName}
        description={description}
        currentPrice={price}
        location={location}
        onApplyPrice={(fairPrice) => setPrice(String(fairPrice))}
      />
    </div>
  );
}
