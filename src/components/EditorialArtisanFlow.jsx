import React, { useState, useEffect } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Share2,
  Sliders,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageMeta } from '../i18n/languages';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';
import { inspectCraftImage } from '../ai/aiService';

export default function EditorialArtisanFlow({
  artisanProfile,
  onProfileUpdate,
  language,
  setLanguage,
  onPublishCraft,
  onFinishFlow,
}) {
  // Flow stages: 'capture' | 'processing' | 'review' | 'matches'
  const [stage, setStage] = useState('capture');

  // Artisan registration/profile prompt if not yet filled
  const [profileOpen, setProfileOpen] = useState(
    !artisanProfile.name || !artisanProfile.location
  );
  const [profName, setProfName] = useState(artisanProfile.name || 'Sitadevi Paswan');
  const [profCity, setProfCity] = useState(artisanProfile.location || 'Jitwarpur, Bihar');

  // Capture Inputs
  const [capturedPhoto, setCapturedPhoto] = useState(
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  );
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [waveformLevels, setWaveformLevels] = useState([12, 24, 18, 30, 16, 28, 22, 14]);

  // Processing checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Cleaning workbench photo & refining lighting', done: false },
    { id: 2, label: 'Transcribing voice in regional dialect', done: false },
    { id: 3, label: 'Writing craft story & specifications', done: false },
    { id: 4, label: 'Selecting heritage craft category', done: false },
    { id: 5, label: 'Checking fair benchmark market prices', done: false },
  ]);

  // Review editable fields
  const [showOriginalPhoto, setShowOriginalPhoto] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDesc, setReviewDesc] = useState('');
  const [reviewCategory, setReviewCategory] = useState('Pottery');
  const [reviewTags, setReviewTags] = useState('Terracotta, Wheel-thrown, Eco-friendly');
  const [reviewMaterial, setReviewMaterial] = useState('Natural Riverbed Clay, Wood Ash');
  const [reviewMinPrice, setReviewMinPrice] = useState('650');
  const [reviewMaxPrice, setReviewMaxPrice] = useState('950');

  // Simulated Buyer Matches
  const buyerMatches = [
    {
      name: 'Aditi Sharma',
      type: 'Interior Designer',
      city: 'Bengaluru, Karnataka',
      need: 'Looking for 12 authentic handmade terracotta surahis for a heritage resort lobby.',
      score: 96,
      avatar: 'AS',
    },
    {
      name: 'Ananya Roy',
      type: 'Boutique Curator',
      city: 'Kolkata, West Bengal',
      need: 'Regular sourcing of regional unglazed vessels for sustainable lifestyle retail.',
      score: 91,
      avatar: 'AR',
    },
    {
      name: 'FabIndia Craft Sourcing',
      type: 'Artisan Partner',
      city: 'New Delhi',
      need: 'Direct cluster order with 0% middleman deduction.',
      score: 87,
      avatar: 'FC',
    },
  ];

  const langMeta = getLanguageMeta(language);

  // Live waveform animation when recording
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setWaveformLevels(
          Array.from({ length: 12 }, () => Math.floor(10 + Math.random() * 32))
        );
      }, 120);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Mic recording handler
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is supported in Chrome, Edge, and modern Android browsers.');
      return;
    }
    setIsRecording(true);
    const rec = createSpeechRecognizer({
      language,
      onResult: (text) => {
        setSpokenTranscript((prev) => (prev ? `${prev} ${text}` : text));
      },
      onEnd: () => setIsRecording(false),
      onError: () => setIsRecording(false),
    });
    try {
      rec?.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start processing flow
  const handleStartProcessing = async () => {
    setStage('processing');

    // Simulate step by step progress
    const steps = [
      { id: 1, delay: 600 },
      { id: 2, delay: 1200 },
      { id: 3, delay: 1800 },
      { id: 4, delay: 2400 },
      { id: 5, delay: 3000 },
    ];

    steps.forEach(({ id, delay }) => {
      setTimeout(() => {
        setChecklist((prev) =>
          prev.map((item) => (item.id === id ? { ...item, done: true } : item))
        );
      }, delay);
    });

    // Run AI inspection in parallel
    try {
      const res = await inspectCraftImage({
        imageDataUrl: capturedPhoto,
        location: artisanProfile.location || 'India',
        targetLanguageName: langMeta.name,
      });

      setTimeout(() => {
        if (res?.data) {
          setReviewTitle(res.data.productName || 'Handcrafted Earthen Vessel');
          setReviewDesc(
            res.data.description ||
              spokenTranscript ||
              'Authentic clay craft shaped slowly by hand, using mineral-rich riverbed terracotta and dried under open sun before wood firing.'
          );
          setReviewCategory(res.data.category || 'Pottery');
          setReviewMaterial(
            (res.data.materials || ['Riverbed Terracotta', 'Organic Slip']).join(', ')
          );
          const basePrice = res.data.suggestedPrice || 750;
          setReviewMinPrice(String(Math.round(basePrice * 0.85)));
          setReviewMaxPrice(String(Math.round(basePrice * 1.25)));
        } else {
          setReviewTitle('Khurja Hand-Turned Terracotta Surahi');
          setReviewDesc(
            spokenTranscript ||
              'Natural porous clay water carafe crafted on a stone wheel. Keeps water naturally chilled without refrigeration.'
          );
          setReviewCategory('Pottery');
          setReviewMaterial('Natural Riverbed Clay, Wood Ash');
          setReviewMinPrice('650');
          setReviewMaxPrice('950');
        }
        setStage('review');
      }, 3400);
    } catch {
      setTimeout(() => {
        setReviewTitle('Khurja Hand-Turned Terracotta Surahi');
        setReviewDesc(
          spokenTranscript ||
            'Natural porous red clay water vessel hand-turned on a stone wheel and pit-fired for natural evaporative cooling.'
        );
        setStage('review');
      }, 3400);
    }
  };

  const handleApproveCraft = () => {
    const newCraft = {
      id: `craft-${Date.now()}`,
      name: reviewTitle || 'Handcrafted Piece',
      category: reviewCategory,
      description: reviewDesc,
      price: Number(reviewMinPrice) || 650,
      priceMin: Number(reviewMinPrice) || 600,
      priceMax: Number(reviewMaxPrice) || 950,
      image: capturedPhoto,
      artisanName: artisanProfile.name || 'Master Artisan',
      location: artisanProfile.location || 'India',
      badge: 'Artisan direct',
      materials: reviewMaterial.split(',').map((s) => s.trim()),
      tags: reviewTags.split(',').map((s) => s.trim()),
    };

    onPublishCraft(newCraft);
    setStage('matches');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profName.trim() || !profCity.trim()) return;
    onProfileUpdate({ name: profName.trim(), location: profCity.trim() });
    setProfileOpen(false);
  };

  return (
    <div className="w-full bg-[#F6EFE4] min-h-[90vh]">
      {/* 1. ARTISAN REGISTRATION / PROFILE MODAL (collected once) */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-[#E4D9C8] rounded-sm p-8 space-y-6">
            <div>
              <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                Artisan atelier setup
              </span>
              <h2 className="font-display text-3xl font-semibold text-[#2B3A67] mt-1">
                Your workshop profile
              </h2>
              <p className="text-xs text-[#2B3A67]/75 mt-1">
                Tell us your name and workshop city once. You will never need to type them again.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="e.g. Sitadevi Paswan"
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Workshop City & State
                </label>
                <input
                  type="text"
                  required
                  value={profCity}
                  onChange={(e) => setProfCity(e.target.value)}
                  placeholder="e.g. Jitwarpur, Bihar"
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <button type="submit" className="btn-terracotta w-full mt-2">
                Save & continue to workshop
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STAGE 1: CAPTURE SCREEN (Two very large tiles side by side: Snap & Speak) */}
      {stage === 'capture' && (
        <section className="max-w-7xl mx-auto px-6 py-14">
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#E4D9C8] gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#B5532A]">
                Craft workspace
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#2B3A67] mt-1">
                Namaste, {artisanProfile.name || profName}
              </h1>
              <p className="text-sm text-[#2B3A67]/75 mt-1">
                Workshop: {artisanProfile.location || profCity} • No typing needed
              </p>
            </div>

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="text-xs text-[#2B3A67] hover:text-[#B5532A] underline cursor-pointer self-start sm:self-auto"
            >
              Edit workshop details
            </button>
          </div>

          {/* Two Very Large Tiles Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TILE 1: SNAP (Camera / Upload) */}
            <div className="bg-white border border-[#E4D9C8] rounded-sm p-8 flex flex-col justify-between space-y-6 min-h-[460px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                    Step A
                  </span>
                  <span className="text-xs text-[#D9A441] font-medium">Workshop Snap</span>
                </div>
                <h2 className="font-display text-3xl font-semibold text-[#2B3A67] mt-1">
                  Snap your craft
                </h2>
                <p className="text-xs text-[#2B3A67]/75 mt-1">
                  Take a photo on your workbench in natural light. We clean and light it for you.
                </p>
              </div>

              {/* Photo preview container */}
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-[#E4D9C8] bg-[#F6EFE4] flex items-center justify-center">
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Captured Craft"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-[#2B3A67]/60">
                    <Camera className="w-12 h-12 mx-auto stroke-1 mb-2 text-[#D9A441]" />
                    <span className="text-xs">No craft photo selected yet</span>
                  </div>
                )}
              </div>

              {/* Camera / Upload trigger */}
              <label className="btn-secondary w-full py-3.5 cursor-pointer flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-[#B5532A]" />
                <span>Take or choose photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* TILE 2: SPEAK (Mic with live waveform & language selector) */}
            <div className="bg-white border border-[#E4D9C8] rounded-sm p-8 flex flex-col justify-between space-y-6 min-h-[460px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                    Step B
                  </span>
                  {/* Language select */}
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs font-semibold text-[#2B3A67] bg-[#F6EFE4] border border-[#E4D9C8] px-2.5 py-1 rounded-sm cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
                <h2 className="font-display text-3xl font-semibold text-[#2B3A67] mt-1">
                  Speak in your dialect
                </h2>
                <p className="text-xs text-[#2B3A67]/75 mt-1">
                  Tell how many days it took, the clay or silk used, and special techniques.
                </p>
              </div>

              {/* Waveform & Status area */}
              <div className="aspect-[4/3] rounded-sm border border-[#E4D9C8] bg-cream-cloth p-6 flex flex-col items-center justify-center space-y-4 text-center">
                {/* Live Waveform */}
                <div className="h-16 flex items-center gap-1.5 justify-center">
                  {waveformLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 rounded-full transition-all duration-100"
                      style={{
                        height: isRecording ? `${lvl}px` : '6px',
                        backgroundColor: isRecording ? '#B5532A' : '#D9A441',
                      }}
                    />
                  ))}
                </div>

                <p className="text-xs font-medium text-[#2B3A67]/80">
                  {isRecording
                    ? `Listening in ${langMeta.nativeName}... speak naturally`
                    : spokenTranscript
                    ? `“${spokenTranscript.slice(0, 120)}...”`
                    : `Tap below to start speaking in ${langMeta.nativeName}`}
                </p>
              </div>

              {/* Mic toggle */}
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`w-full py-3.5 rounded-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition ${
                  isRecording
                    ? 'bg-[#B5532A] text-white'
                    : 'bg-[#F6EFE4] border border-[#E4D9C8] text-[#2B3A67] hover:border-[#B5532A]'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#B5532A]" />}
                <span>{isRecording ? 'Stop recording' : 'Start speaking'}</span>
              </button>
            </div>
          </div>

          {/* Single primary button: Create my catalogue */}
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleStartProcessing}
              className="btn-terracotta px-12 py-4 text-base font-semibold"
            >
              <span>Create my catalogue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* STAGE 2: PROCESSING SCREEN (Vertical checklist ticking off) */}
      {stage === 'processing' && (
        <section className="max-w-2xl mx-auto px-6 py-24">
          <div className="bg-white border border-[#E4D9C8] rounded-sm p-10 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                Craft atelier AI assistant
              </span>
              <h2 className="font-display text-4xl font-semibold text-[#2B3A67]">
                Preparing your piece
              </h2>
              <p className="text-xs text-[#2B3A67]/75">
                Translating spoken words and enhancing workshop photo
              </p>
            </div>

            {/* Vertical checklist */}
            <div className="space-y-4 pt-4 border-t border-[#E4D9C8]">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-sm border transition-all ${
                    item.done
                      ? 'bg-[#F6EFE4]/60 border-[#D9A441] text-[#2B3A67]'
                      : 'border-[#E4D9C8] text-[#2B3A67]/50'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#B5532A]" />
                    ) : (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D9A441]" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STAGE 3: REVIEW SCREEN (Catalogue card on left with before/after toggle, editable fields on right, sticky Approve bar) */}
      {stage === 'review' && (
        <section className="max-w-7xl mx-auto px-6 py-12 pb-32">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B5532A]">
              Step 3 of 4
            </span>
            <h2 className="font-display text-4xl font-semibold text-[#2B3A67] mt-1">
              Review your craft entry
            </h2>
            <p className="text-xs text-[#2B3A67]/75 mt-1">
              Check the details generated from your photo and dialect. You can edit any field.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Catalogue card with Before / After image toggle */}
            <div className="lg:col-span-5 bg-white border border-[#E4D9C8] rounded-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2B3A67]">Catalogue Card Preview</span>
                {/* Toggle button */}
                <button
                  type="button"
                  onClick={() => setShowOriginalPhoto(!showOriginalPhoto)}
                  className="text-xs text-[#B5532A] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showOriginalPhoto ? 'Show cleaned studio photo' : 'Show original workshop snap'}</span>
                </button>
              </div>

              {/* Image */}
              <div className="aspect-[4/5] rounded-sm overflow-hidden border border-[#E4D9C8] bg-black/5 relative">
                <img
                  src={capturedPhoto}
                  alt={reviewTitle}
                  className={`w-full h-full object-cover transition ${
                    showOriginalPhoto ? 'filter contrast-90 brightness-95' : ''
                  }`}
                />
                <span className="absolute top-3 left-3 bg-[#2B3A67]/90 text-white text-[11px] px-2.5 py-0.5 rounded-sm">
                  {showOriginalPhoto ? 'Original snap' : 'AI studio lighting'}
                </span>
              </div>

              {/* Preview card text */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs text-[#B5532A] uppercase font-semibold tracking-wider">
                  {reviewCategory}
                </span>
                <h3 className="font-display text-xl font-semibold text-[#2B3A67]">
                  {reviewTitle || 'Handcrafted Piece'}
                </h3>
                <p className="text-xs text-[#2B3A67]/75 line-clamp-2">{reviewDesc}</p>
                <div className="pt-2 text-sm font-semibold text-[#2B3A67]">
                  ₹{reviewMinPrice} – ₹{reviewMaxPrice}
                </div>
              </div>
            </div>

            {/* Right: Editable fields */}
            <div className="lg:col-span-7 bg-white border border-[#E4D9C8] rounded-sm p-8 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Craft Story & Description
                </label>
                <textarea
                  rows={4}
                  value={reviewDesc}
                  onChange={(e) => setReviewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                    Craft Category
                  </label>
                  <select
                    value={reviewCategory}
                    onChange={(e) => setReviewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
                  >
                    <option value="Pottery">Pottery</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Block Print">Block Print</option>
                    <option value="Wood">Wood</option>
                    <option value="Painting">Painting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                    Key Materials
                  </label>
                  <input
                    type="text"
                    value={reviewMaterial}
                    onChange={(e) => setReviewMaterial(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                    Direct Payout Range (Min ₹)
                  </label>
                  <input
                    type="number"
                    value={reviewMinPrice}
                    onChange={(e) => setReviewMinPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                    Direct Payout Range (Max ₹)
                  </label>
                  <input
                    type="number"
                    value={reviewMaxPrice}
                    onChange={(e) => setReviewMaxPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={reviewTags}
                  onChange={(e) => setReviewTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
                />
              </div>
            </div>
          </div>

          {/* Sticky Approve bar at bottom */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E4D9C8] py-4 px-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-xs text-[#2B3A67]">
                Ready to publish as <strong className="text-[#B5532A]">{reviewTitle}</strong>
              </div>

              <button
                type="button"
                onClick={handleApproveCraft}
                className="btn-terracotta px-8 py-3 font-semibold"
              >
                <span>Approve and find buyers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 4: MATCHES SCREEN (Ranked buyer cards with score bar and Share button) */}
      {stage === 'matches' && (
        <section className="max-w-4xl mx-auto px-6 py-14">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
              Catalogue published
            </span>
            <h2 className="font-display text-4xl font-semibold text-[#2B3A67]">
              Matched buyers for your craft
            </h2>
            <p className="text-xs text-[#2B3A67]/75">
              These verified buyers and retail curators are actively looking for {reviewCategory}
            </p>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {buyerMatches.map((buyer) => (
              <div
                key={buyer.name}
                className="bg-white border border-[#E4D9C8] rounded-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-[#F6EFE4] border border-[#D9A441] text-[#2B3A67] flex items-center justify-center font-display font-bold text-lg shrink-0">
                    {buyer.avatar}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-semibold text-[#2B3A67]">
                        {buyer.name}
                      </h3>
                      <span className="text-xs text-[#B5532A] font-medium">
                        • {buyer.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#2B3A67]/60">{buyer.city}</p>
                    <p className="text-xs text-[#2B3A67]/80 pt-1 leading-relaxed">
                      {buyer.need}
                    </p>
                  </div>
                </div>

                {/* Score bar & Share button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-[#E4D9C8]">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#2B3A67]">
                      Match Score: {buyer.score}%
                    </span>
                    <div className="w-28 h-1.5 bg-[#E4D9C8] rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#B5532A]"
                        style={{ width: `${buyer.score}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: reviewTitle,
                          text: `Craft catalogue from ${artisanProfile.name} on KarigarBazaar`,
                          url: window.location.href,
                        });
                      } else {
                        alert(`Direct catalogue link copied to share with ${buyer.name}!`);
                      }
                    }}
                    className="btn-secondary py-2 px-3.5 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#B5532A]" />
                    <span>Share catalogue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setStage('capture');
                setSpokenTranscript('');
              }}
              className="btn-secondary"
            >
              List another craft
            </button>
            <button
              type="button"
              onClick={onFinishFlow}
              className="btn-terracotta"
            >
              <span>View in marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
