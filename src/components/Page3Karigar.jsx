import React, { useState, useMemo } from 'react';
import { 
  User, MapPin, Tag, FileText, Image as ImageIcon, IndianRupee, 
  Upload, CheckCircle, Sparkles, Eye, AlertCircle, ArrowLeft, ArrowRight,
  Mic, MicOff, Volume2, Wand2, BarChart3, HelpCircle
} from 'lucide-react';
import { samplePresetImages } from '../data/initialProducts';
import VoiceAssistantModal from './VoiceAssistantModal';
import DescriptionExplainerEnhancer from './DescriptionExplainerEnhancer';
import ImageStudioEnhancer from './ImageStudioEnhancer';
import PriceComparerModal from './PriceComparerModal';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechUtils';
import { getMarketBenchmark } from '../data/marketPriceData';

export default function Page3Karigar({
  karigarProfile,
  setKarigarProfile,
  products,
  onAddProduct,
  onSwitchToBuyer,
  onBack,
  language = 'hi',
  t
}) {
  const isHindi = language === 'hi';

  const [name, setName] = useState(karigarProfile.name || '');
  const [location, setLocation] = useState(karigarProfile.location || '');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(samplePresetImages[0].url);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Pottery & Clay');
  const [customImageName, setCustomImageName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isPriceComparerOpen, setIsPriceComparerOpen] = useState(false);

  // Field-level active listening state
  const [activeListeningField, setActiveListeningField] = useState(null); // 'name' | 'location' | 'productName' | 'description' | 'price'
  const [activeSpeakingField, setActiveSpeakingField] = useState(null);

  // Proactive Market Benchmark for upfront suggestion
  const currentBenchmark = useMemo(() => {
    return getMarketBenchmark(category, productName, price);
  }, [category, productName, price]);

  // Handle individual field audio prompt (Question)
  const handleFieldSpeak = (fieldName, questionText) => {
    setActiveSpeakingField(fieldName);
    speakText(questionText, language, () => {
      setActiveSpeakingField(null);
    });
  };

  // Handle individual field voice input (Answer)
  const handleFieldListen = (fieldName, setFieldValue, isNumeric = false) => {
    if (activeListeningField === fieldName) {
      // Toggle off
      setActiveListeningField(null);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert(isHindi 
        ? 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है। कृपया Chrome/Edge का उपयोग करें।' 
        : 'Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    setActiveListeningField(fieldName);
    const recognizer = createSpeechRecognizer({
      language,
      onResult: (spokenText) => {
        let clean = spokenText;
        if (isNumeric) {
          const digits = spokenText.match(/\d+/g);
          if (digits) clean = digits.join('');
        }
        setFieldValue(clean);
      },
      onEnd: () => {
        setActiveListeningField(null);
      },
      onError: () => {
        setActiveListeningField(null);
      }
    });

    if (recognizer) {
      try {
        recognizer.start();
      } catch (e) {
        setActiveListeningField(null);
      }
    }
  };

  // Handle local file upload
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Callback from Voice Assistant Modal
  const handleVoiceAssistantComplete = (voiceData) => {
    if (voiceData.name) setName(voiceData.name);
    if (voiceData.location) setLocation(voiceData.location);
    if (voiceData.productName) setProductName(voiceData.productName);
    if (voiceData.rawDescription) setDescription(voiceData.rawDescription);
    if (voiceData.image) setImage(voiceData.image);
    if (voiceData.price) setPrice(voiceData.price);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isHindi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name');
      return;
    }
    if (!location.trim()) {
      setError(isHindi ? 'कृपया अपना स्थान दर्ज करें' : 'Please enter your location');
      return;
    }
    if (!productName.trim()) {
      setError(isHindi ? 'कृपया उत्पाद का नाम दर्ज करें' : 'Please enter the product name');
      return;
    }
    if (!description.trim()) {
      setError(isHindi ? 'कृपया उत्पाद का विवरण दर्ज करें' : 'Please enter a description for the product');
      return;
    }
    if (!image) {
      setError(isHindi ? 'कृपया कोई फोटो अपलोड या चयन करें' : 'Please upload or select an image');
      return;
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      setError(isHindi ? 'कृपया सही कीमत दर्ज करें' : 'Please enter a valid price');
      return;
    }

    setError('');

    // Save profile
    setKarigarProfile({ name, location });

    // Create new product
    const newProduct = {
      id: `karigar-${Date.now()}`,
      name: productName,
      description,
      price: Number(price),
      image,
      category,
      artisanName: name,
      location,
      rating: 5.0,
      reviews: 1,
      tag: 'Direct from Karigar',
      isCustomKarigarItem: true
    };

    onAddProduct(newProduct);
    setSuccessMessage(t.productPublishedSuccess);

    // Reset product fields (keep artisan name & location)
    setProductName('');
    setDescription('');
    setPrice('');
    setCustomImageName('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 6000);
  };

  // Filter products listed by this karigar
  const myListedProducts = products.filter(p => p.artisanName === name && p.isCustomKarigarItem);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      
      {/* Header bar */}
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
                {t.karigarHeader}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Page 3: Karigar
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {t.karigarSubheader}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToBuyer}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Eye className="w-4 h-4 text-orange-600" />
            <span>Switch to Buyer View</span>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </button>
        </div>
      </div>

      {/* 🌟 FEATURE 1: DEDICATED VOICE MODE HERO BANNER */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 sm:p-6 text-white shadow-xl shadow-orange-600/20 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <Mic className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-bold uppercase mb-1">
              <Sparkles className="w-3 h-3" />
              {isHindi ? 'आवाज़ सहायक (Voice Assistance)' : 'Voice Mode for Artisans'}
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif">
              {isHindi ? 'क्या आप टाइप नहीं कर सकते? बोलकर पूरा फॉर्म भरें!' : "Don't know how to type? Speak to fill the whole form!"}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-0.5 max-w-xl">
              {isHindi 
                ? 'हमारा आवाज़ सहायक आपसे सवाल पूछेगा और आपके बोलने पर फॉर्म में स्वतः भर देगा।' 
                : 'Our voice assistant speaks questions out loud and listens to your spoken answers.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-orange-900 font-extrabold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
        >
          <Mic className="w-4 h-4 text-orange-600" />
          <span>{isHindi ? 'बोलकर फॉर्म भरें 🎙️' : 'Start Voice Assistant 🎙️'}</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-start gap-3 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">{successMessage}</p>
            <p className="text-xs text-emerald-700 mt-1">
              Buyers can now search and purchase this item in the Buyer Marketplace.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md">
          <form onSubmit={handlePublish} className="space-y-6">
            
            {/* SECTION 1: ARTISAN PROFILE */}
            <div className="pb-6 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-4 font-serif">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">1</span>
                {t.artistDetails}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* a) Name + Voice Controls */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                      <span className="text-amber-600 font-bold">a)</span>
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {t.karigarName} <span className="text-red-500">*</span>
                    </label>

                    {/* Field Voice Q&A Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFieldSpeak('name', isHindi ? 'कृपया अपना पूरा नाम बताएं।' : 'What is your full name?')}
                        className={`p-1 rounded-md transition ${activeSpeakingField === 'name' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-amber-700 hover:bg-stone-100'}`}
                        title="सवाल सुनें (Listen question)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldListen('name', setName)}
                        className={`p-1 rounded-md transition ${activeListeningField === 'name' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-orange-600 hover:bg-stone-100'}`}
                        title="बोलकर नाम भरें (Speak answer)"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.karigarNamePlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 ${
                      activeListeningField === 'name' ? 'border-red-400 bg-red-50/20' : 'border-stone-300'
                    }`}
                    required
                  />
                  {activeListeningField === 'name' && (
                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                      🎙️ आवाज़ सुन रहे हैं, अपना नाम बोलें...
                    </span>
                  )}
                </div>

                {/* b) Location + Voice Controls */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                      <span className="text-amber-600 font-bold">b)</span>
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {t.karigarLocation} <span className="text-red-500">*</span>
                    </label>

                    {/* Field Voice Q&A Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFieldSpeak('location', isHindi ? 'आपकी कार्यशाला या शहर का नाम क्या है?' : 'What is your workshop city and state?')}
                        className={`p-1 rounded-md transition ${activeSpeakingField === 'location' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-amber-700 hover:bg-stone-100'}`}
                        title="सवाल सुनें (Listen question)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldListen('location', setLocation)}
                        className={`p-1 rounded-md transition ${activeListeningField === 'location' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-orange-600 hover:bg-stone-100'}`}
                        title="बोलकर स्थान भरें (Speak answer)"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.karigarLocationPlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 ${
                      activeListeningField === 'location' ? 'border-red-400 bg-red-50/20' : 'border-stone-300'
                    }`}
                    required
                  />
                  {activeListeningField === 'location' && (
                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                      🎙️ आवाज़ सुन रहे हैं, अपना शहर बोलें...
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* SECTION 2: PRODUCT INFORMATION */}
            <div className="space-y-5">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">2</span>
                {t.productDetails}
              </h2>

              {/* c) Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                      <span className="text-amber-600 font-bold">c)</span>
                      <Tag className="w-3.5 h-3.5 text-stone-400" />
                      {t.productName} <span className="text-red-500">*</span>
                    </label>

                    {/* Field Voice Q&A Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFieldSpeak('productName', isHindi ? 'आप कौन सा हस्तशिल्प उत्पाद बेचना चाहते हैं?' : 'What handcrafted product are you listing?')}
                        className={`p-1 rounded-md transition ${activeSpeakingField === 'productName' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-amber-700 hover:bg-stone-100'}`}
                        title="सवाल सुनें (Listen question)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldListen('productName', setProductName)}
                        className={`p-1 rounded-md transition ${activeListeningField === 'productName' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-orange-600 hover:bg-stone-100'}`}
                        title="बोलकर उत्पाद का नाम बताएं (Speak answer)"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={t.productNamePlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 ${
                      activeListeningField === 'productName' ? 'border-red-400 bg-red-50/20' : 'border-stone-300'
                    }`}
                    required
                  />
                  {activeListeningField === 'productName' && (
                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                      🎙️ आवाज़ सुन रहे हैं, उत्पाद का नाम बोलें...
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    <option value="Pottery & Clay">{t.pottery || 'Pottery & Clay'}</option>
                    <option value="Handloom & Textiles">{t.handloom || 'Handloom & Textiles'}</option>
                    <option value="Paintings & Art">{t.paintings || 'Paintings & Art'}</option>
                    <option value="Metal & Brass">{t.metalcraft || 'Metal & Brass'}</option>
                    <option value="Wood Carvings">{t.wooden || 'Wood Carvings'}</option>
                  </select>
                </div>
              </div>

              {/* d) Description with EXPLAINER & AI ENHANCER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <span className="text-amber-600 font-bold">d)</span>
                    <FileText className="w-3.5 h-3.5 text-stone-400" />
                    {t.productDesc} <span className="text-red-500">*</span>
                  </label>

                  {/* Field Voice Q&A Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleFieldSpeak('description', isHindi ? 'इसे बनाने में कितने दिन लगे, क्या सामग्री इस्तेमाल की गई और क्या तकनीक है?' : 'How many days did it take, what materials were used, and what is the craft style?')}
                      className={`p-1 rounded-md transition ${activeSpeakingField === 'description' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-amber-700 hover:bg-stone-100'}`}
                      title="सवाल सुनें (Listen question)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldListen('description', setDescription)}
                      className={`p-1 rounded-md transition ${activeListeningField === 'description' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-orange-600 hover:bg-stone-100'}`}
                      title="बोलकर विवरण बताएं (Speak answer)"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.productDescPlaceholder}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-y ${
                    activeListeningField === 'description' ? 'border-red-400 bg-red-50/20' : 'border-stone-300'
                  }`}
                  required
                />
                {activeListeningField === 'description' && (
                  <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                    🎙️ आवाज़ सुन रहे हैं, उत्पाद के बारे में खुलकर बोलें...
                  </span>
                )}

                {/* 🌟 FEATURE 2: INTEGRATED DESCRIPTION EXPLAINER & AI ENHANCER */}
                <DescriptionExplainerEnhancer
                  currentDescription={description}
                  onApplyDescription={(enhancedText) => setDescription(enhancedText)}
                  productName={productName}
                  category={category}
                  language={language}
                />
              </div>

              {/* e) Image of the product with AUTO-CROP & STUDIO ENHANCER */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <span className="text-amber-600 font-bold">e)</span>
                    <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                    {t.productImage} <span className="text-red-500">*</span>
                  </label>

                  {/* 🌟 FEATURE 3: LAUNCH IMAGE STUDIO ENHANCER */}
                  <button
                    type="button"
                    onClick={() => setIsImageStudioOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-bold border border-orange-300 shadow-xs transition"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-orange-700" />
                    <span>{isHindi ? '✨ एआई फोटो सुधारक (Auto-Crop & Studio)' : '✨ AI Studio Enhancer'}</span>
                  </button>
                </div>

                {/* Upload or Preset Options */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-amber-500 text-stone-800 text-xs font-bold shadow-sm cursor-pointer transition">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>{customImageName ? 'Change File' : t.uploadBtn}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                    {customImageName && (
                      <span className="text-xs text-stone-600 truncate max-w-xs font-medium">
                        📎 {customImageName}
                      </span>
                    )}
                  </div>

                  {/* Preset thumbnails for quick testing */}
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 block mb-2">
                      {t.orPickPreset}
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {samplePresetImages.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setImage(preset.url);
                            setCategory(preset.category);
                            setCustomImageName('');
                          }}
                          className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            image === preset.url ? 'border-amber-600 ring-2 ring-amber-500/30' : 'border-stone-200 opacity-80 hover:opacity-100'
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

              {/* f) Price with PROACTIVE MARKET COMPARISON & SUGGESTION BEFORE ASKING */}
              <div className="space-y-3">
                
                {/* 🌟 UPFRONT PRICE ADVISOR & BENCHMARK CARD (SUGGESTS BEFORE ASKING AMOUNT) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border-2 border-emerald-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      {isHindi 
                        ? 'कीमत तय करने से पहले बाज़ार भाव तुलना व सुझाव:' 
                        : 'Market Price Comparison & Suggested Fair Price:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPriceComparerOpen(true)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline"
                    >
                      {isHindi ? 'विस्तृत तुलना देखें' : 'View Full Platforms'}
                    </button>
                  </div>

                  {/* Market Range & Platform Benchmarks */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <span className="text-stone-600">
                        {isHindi ? 'औसत बाज़ार मूल्य:' : 'Market Average:'} <strong className="text-stone-900 font-serif text-sm">₹{currentBenchmark.avgPrice.toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-600">
                        {isHindi ? 'अधिकतम मूल्य:' : 'Max Market:'} <strong className="text-stone-900 font-serif text-sm">₹{currentBenchmark.maxPrice.toLocaleString('en-IN')}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                      <span className="bg-stone-100 px-1.5 py-0.5 rounded">Amazon: ₹{currentBenchmark.platforms[0]?.price}</span>
                      <span className="bg-stone-100 px-1.5 py-0.5 rounded">FabIndia: ₹{currentBenchmark.platforms[1]?.price}</span>
                    </div>
                  </div>

                  {/* 1-Click Suggestion Chips */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-700 block w-full sm:w-auto">
                      {isHindi ? 'सुझाए गए मूल्य में से चुनें:' : 'Click to apply a suggested price:'}
                    </span>

                    {/* Recommended Fair Artisan Price */}
                    <button
                      type="button"
                      onClick={() => setPrice(String(currentBenchmark.recommendedFairPrice))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        price === String(currentBenchmark.recommendedFairPrice)
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-500 shadow-sm'
                          : 'bg-white text-emerald-950 border border-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>⭐ {isHindi ? `अनुशंसित उचित मूल्य: ₹${currentBenchmark.recommendedFairPrice.toLocaleString('en-IN')}` : `Fair Price: ₹${currentBenchmark.recommendedFairPrice.toLocaleString('en-IN')}`}</span>
                    </button>

                    {/* Market Average */}
                    <button
                      type="button"
                      onClick={() => setPrice(String(currentBenchmark.avgPrice))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        price === String(currentBenchmark.avgPrice)
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-500 shadow-sm'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <span>{isHindi ? `बाज़ार औसत: ₹${currentBenchmark.avgPrice.toLocaleString('en-IN')}` : `Market Avg: ₹${currentBenchmark.avgPrice.toLocaleString('en-IN')}`}</span>
                    </button>

                    {/* Premium */}
                    <button
                      type="button"
                      onClick={() => setPrice(String(currentBenchmark.maxPrice))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        price === String(currentBenchmark.maxPrice)
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-500 shadow-sm'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <span>{isHindi ? `प्रीमियम: ₹${currentBenchmark.maxPrice.toLocaleString('en-IN')}` : `Premium: ₹${currentBenchmark.maxPrice.toLocaleString('en-IN')}`}</span>
                    </button>
                  </div>
                </div>

                {/* Amount Input with Voice & Speaker Controls */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                      <span className="text-amber-600 font-bold">f)</span>
                      <IndianRupee className="w-3.5 h-3.5 text-stone-400" />
                      {t.productPrice} <span className="text-red-500">*</span>
                      <span className="text-[11px] font-normal text-stone-400">
                        {isHindi ? '(ऊपर सुझाव चुनें या मनचाही राशि दर्ज करें)' : '(Select suggestion above or type custom)'}
                      </span>
                    </label>

                    {/* Field Voice Q&A Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFieldSpeak('price', isHindi ? `बाज़ार में इसका औसत भाव ₹${currentBenchmark.avgPrice} है। हमारा सुझाव ₹${currentBenchmark.recommendedFairPrice} है। आप क्या कीमत रखना चाहते हैं?` : `In the market, the average price is ₹${currentBenchmark.avgPrice}. We recommend ₹${currentBenchmark.recommendedFairPrice}. What price would you like to set?`)}
                        className={`p-1 rounded-md transition ${activeSpeakingField === 'price' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-amber-700 hover:bg-stone-100'}`}
                        title="सवाल व सुझाव सुनें (Listen suggestion & question)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldListen('price', setPrice, true)}
                        className={`p-1 rounded-md transition ${activeListeningField === 'price' ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-orange-600 hover:bg-stone-100'}`}
                        title="बोलकर कीमत बताएं (Speak answer)"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold text-sm">
                      ₹
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t.productPricePlaceholder}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 ${
                        activeListeningField === 'price' ? 'border-red-400 bg-red-50/20' : 'border-stone-300'
                      }`}
                      required
                    />
                  </div>
                  {activeListeningField === 'price' && (
                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                      🎙️ आवाज़ सुन रहे हैं, कीमत बोलें (उदा: {currentBenchmark.recommendedFairPrice})...
                    </span>
                  )}
                </div>

              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.publishProductBtn}</span>
            </button>

          </form>
        </div>

        {/* Right Column (5 Cols): Live Marketplace Preview Card */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Live Buyer Preview
              </span>
              <span className="text-[11px] text-stone-400">
                How buyers will see your craft
              </span>
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/50 shadow-sm">
              <div className="relative aspect-[4/3] bg-stone-200 overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={productName || 'Product Preview'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                    <ImageIcon className="w-10 h-10 mb-1" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {category}
                </span>
                <span className="absolute top-3 right-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                  Direct Karigar
                </span>
              </div>

              <div className="p-4 space-y-2.5 bg-white">
                <div>
                  <h3 className="font-bold text-base text-stone-900 line-clamp-1 font-serif">
                    {productName || 'Your Product Title Will Appear Here'}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{location || 'Your Workshop City'}</span>
                    <span>•</span>
                    <span className="font-medium text-stone-700">{name || 'Your Name'}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {description || 'Your craft description will be displayed here for conscious buyers looking for authentic handmade products.'}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block">Artisan Price</span>
                    <span className="text-lg font-extrabold text-stone-900">
                      ₹{price ? Number(price).toLocaleString('en-IN') : '0'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
                      Add to Cart
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold">
                      Buy Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* List of Products Uploaded by this Artisan */}
          {myListedProducts.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md">
              <h3 className="font-bold text-sm text-stone-900 mb-3 flex items-center justify-between">
                <span>{t.yourListedItems}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-stone-100 rounded-full text-stone-600">
                  {myListedProducts.length}
                </span>
              </h3>

              <div className="space-y-3">
                {myListedProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-100 bg-stone-50">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-stone-500 font-semibold">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 1. Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        category={category}
        onComplete={handleVoiceAssistantComplete}
        currentValues={{ name, location, productName, description, image, price }}
      />

      {/* 2. Image Studio Enhancer Modal */}
      <ImageStudioEnhancer
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        originalImage={image}
        onApplyEnhancedImage={(newImg) => setImage(newImg)}
        language={language}
      />

      {/* 3. Price Comparer Modal */}
      <PriceComparerModal
        isOpen={isPriceComparerOpen}
        onClose={() => setIsPriceComparerOpen(false)}
        category={category}
        productName={productName}
        currentPrice={price}
        onApplyPrice={(recommended) => setPrice(String(recommended))}
        language={language}
      />

    </div>
  );
}
