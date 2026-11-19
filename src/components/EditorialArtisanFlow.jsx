import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  ShoppingBag,
  Package,
  Wallet,
  User,
  Headphones,
  Settings,
  Bell,
  Camera,
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  Store,
  CheckCircle2,
  Share2,
  Sliders,
  ChevronRight,
  AlertCircle,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageMeta, getTranslations } from '../i18n/languages';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';
import { inspectCraftImage } from '../ai/aiService';

export default function EditorialArtisanFlow({
  artisanProfile,
  onProfileUpdate: _onProfileUpdate,
  language = 'en',
  setLanguage,
  onPublishCraft,
  onLogout,
}) {
  const t = getTranslations(language);
  const langMeta = getLanguageMeta(language);

  // Active navigation tab on the left sidebar
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard' | 'listings' | 'orders' | 'earnings' | 'profile'

  // Listing creation flow stage: 'dashboard' | 'processing' | 'review' | 'matches'
  const [stage, setStage] = useState('dashboard');

  // Conversational questions state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [voiceAnswers, setVoiceAnswers] = useState({
    languageChoice: '',
    name: '',
    materials: '',
    duration: '',
    price: '',
  });

  // Photo
  const [capturedPhoto, setCapturedPhoto] = useState(
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  );

  // Speech & Waveform
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [micError, setMicError] = useState('');
  const [waveformLevels, setWaveformLevels] = useState([12, 24, 18, 30, 16, 28, 22, 14]);
  const recognizerRef = useRef(null);
  const advanceTimerRef = useRef(null);

  // Review editable fields
  const [showOriginalPhoto, setShowOriginalPhoto] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDesc, setReviewDesc] = useState('');
  const [reviewCategory, setReviewCategory] = useState('Pottery');
  const [reviewTags, setReviewTags] = useState('Terracotta, Wheel-thrown, Eco-friendly');
  const [reviewMaterial, setReviewMaterial] = useState('Natural Riverbed Clay, Wood Ash');
  const [reviewMinPrice, setReviewMinPrice] = useState('650');
  const [reviewMaxPrice, setReviewMaxPrice] = useState('950');

  // Processing checklist
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Cleaning workbench photo & refining lighting', done: false },
    { id: 2, label: `Transcribing voice answers in ${langMeta.nativeName}`, done: false },
    { id: 3, label: 'Writing craft story & specifications', done: false },
    { id: 4, label: 'Selecting heritage craft category', done: false },
    { id: 5, label: 'Checking fair benchmark market prices', done: false },
  ]);

  // Questions definitions (Dynamically localized)
  const questions = [
    {
      id: 'languageChoice',
      title: language === 'hi' ? 'भाषा चुनें' : 'Choose Language',
      prompt: t.q0Prompt || 'Namaste! Which language would you like to speak in today?',
      desc: t.q0Desc || 'e.g. Hindi, Gujarati, Tamil, Bengali, Marathi, or English',
      key: 'languageChoice',
      isLanguageStep: true,
      todoLabel: language === 'hi' ? 'अपने उत्पाद के बारे में बताएं' : 'Tell me about your product',
    },
    {
      id: 'name',
      title: language === 'hi' ? 'उत्पाद का नाम' : 'Craft Name',
      prompt: t.q1Prompt || 'What is the name of your handcrafted creation?',
      desc: t.q1Desc || 'e.g. Hand-turned Terracotta Surahi or Pure Katan Silk Dupatta',
      key: 'name',
      todoLabel: language === 'hi' ? 'अपने उत्पाद के बारे में बताएं' : 'Tell me about your product',
    },
    {
      id: 'materials',
      title: language === 'hi' ? 'सामग्री और तकनीक' : 'Materials & Methods',
      prompt: t.q2Prompt || 'Which materials and traditional tools did you use?',
      desc: t.q2Desc || 'e.g. Riverbed red clay, pit loom, botanical dyes, or seasoned rosewood',
      key: 'materials',
      todoLabel: language === 'hi' ? 'सामग्री विवरण जोड़ें' : 'Add product details',
    },
    {
      id: 'image',
      title: language === 'hi' ? 'फोटो अपलोड' : 'Photo Upload',
      prompt:
        language === 'hi'
          ? 'कृपया अपने हस्तशिल्प की एक साफ़ फोटो अपलोड करें या खींचें।'
          : 'Please snap or upload a clear photo of your craft creation.',
      desc:
        language === 'hi'
          ? 'हमारा AI आपकी फोटो को साफ़ कर स्टूडियो जैसा बना देगा।'
          : 'Our AI cleans and lights your photo automatically.',
      key: 'image',
      isImageStep: true,
      todoLabel: language === 'hi' ? 'उत्पाद की फोटो जोड़ें' : 'Add product images',
    },
    {
      id: 'price',
      title: language === 'hi' ? 'मूल्य तय करें' : 'Set Price',
      prompt: t.q4Prompt || 'What direct payout price in Rupees would you like to receive?',
      desc: t.q4Desc || 'e.g. 850 rupees, 1800 rupees, or 3200 rupees',
      key: 'price',
      todoLabel: language === 'hi' ? 'मूल्य तय करें' : 'Set price',
    },
  ];

  const activeQuestion = questions[currentQuestionIdx] || questions[0];

  // Helper to map spoken or typed language
  const detectAndApplyLanguage = (spokenText) => {
    if (!spokenText) return null;
    const lower = spokenText.toLowerCase().trim();
    const map = [
      { keys: ['hindi', 'हिन्दी', 'हिंदी', 'hindee'], code: 'hi' },
      { keys: ['gujarati', 'gujrati', 'ગુજરાતી'], code: 'gu' },
      { keys: ['tamil', 'தமிழ்'], code: 'ta' },
      { keys: ['telugu', 'తెలుగు'], code: 'te' },
      { keys: ['bengali', 'bangla', 'বাংলা'], code: 'bn' },
      { keys: ['marathi', 'मराठी'], code: 'mr' },
      { keys: ['kannada', 'ಕನ್ನಡ'], code: 'kn' },
      { keys: ['malayalam', 'മലയാളം'], code: 'ml' },
      { keys: ['punjabi', 'ਪੰਜਾਬੀ'], code: 'pa' },
      { keys: ['odia', 'oriya', 'ଓଡ଼ିଆ'], code: 'or' },
      { keys: ['urdu', 'اردو'], code: 'ur' },
      { keys: ['assamese', 'অসমীয়া'], code: 'as' },
      { keys: ['rajasthani', 'राजस्थानी', 'marwari'], code: 'raj' },
      { keys: ['kashmiri', 'कश्मीरी'], code: 'ks' },
      { keys: ['english', 'अंग्रेजी', 'अंग्रेज़ी', 'angreji'], code: 'en' },
    ];

    for (const item of map) {
      for (const k of item.keys) {
        if (lower.includes(k)) {
          return item.code;
        }
      }
    }
    return null;
  };

  // Stop recording safely
  const stopRecording = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch {
        // ignore
      }
      recognizerRef.current = null;
    }
    setIsRecording(false);
  };

  // Speak question and automatically open the listening mic when question finishes
  const speakQuestionAndListen = (
    promptText,
    langToUse = language,
    targetIdx = currentQuestionIdx,
    autoListen = true
  ) => {
    stopRecording();
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    setIsAiSpeaking(true);
    speakText(promptText, langToUse, () => {
      setIsAiSpeaking(false);
      if (autoListen) {
        setTimeout(() => {
          startListening(langToUse, targetIdx);
        }, 300);
      }
    });
  };

  // Start speech recognition listening with auto-turn-taking
  const startListening = async (langCode = language, targetIdx = currentQuestionIdx) => {
    if (stage !== 'dashboard') return;
    stopSpeaking();
    stopRecording();
    setIsAiSpeaking(false);
    setMicError('');

    if (!isSpeechRecognitionSupported()) {
      setMicError('Speech recognition requires Chrome or Edge browser. You can type below.');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr) {
      console.warn('Microphone permission check failed:', permErr);
      if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
        setMicError('Microphone permission blocked. Please allow mic access in your browser or type below.');
        return;
      }
    }

    try {
      const rec = createSpeechRecognizer({
        language: langCode,
        onResult: (text) => {
          setMicError('');
          const cleanText = text?.trim();
          if (!cleanText) return;

          // 1. QUESTION 0: Language step
          if (targetIdx === 0) {
            const detectedCode = detectAndApplyLanguage(cleanText);
            if (detectedCode) {
              stopRecording();
              setLanguage(detectedCode);
              const metaObj = getLanguageMeta(detectedCode);
              setVoiceAnswers((prev) => ({
                ...prev,
                languageChoice: `${metaObj.nativeName} (${metaObj.name})`,
              }));
              setCurrentQuestionIdx(1);
              const nextT = getTranslations(detectedCode);
              const nextPrompt = nextT.q1Prompt;
              setTimeout(() => {
                speakQuestionAndListen(nextPrompt, detectedCode, 1, true);
              }, 250);
              return;
            } else {
              setVoiceAnswers((prev) => ({
                ...prev,
                languageChoice: cleanText,
              }));
            }
          } else {
            // 2. QUESTIONS 1, 2, 4: Name, Materials, Price
            const targetKey = questions[targetIdx]?.key;
            if (targetKey) {
              setVoiceAnswers((prev) => ({
                ...prev,
                [targetKey]: cleanText,
              }));
            }

            // Automatically advance to the next question after speaker pauses (1.1s debounce)
            if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
            advanceTimerRef.current = setTimeout(() => {
              stopRecording();
              if (targetIdx === 1) {
                // Name -> Materials
                setCurrentQuestionIdx(2);
                const nextT = getTranslations(langCode);
                speakQuestionAndListen(nextT.q2Prompt, langCode, 2, true);
              } else if (targetIdx === 2) {
                // Materials -> Photo
                setCurrentQuestionIdx(3);
                const photoPrompt =
                  langCode === 'hi'
                    ? 'कृपया अपने हस्तशिल्प की एक साफ़ फोटो अपलोड करें या खींचें।'
                    : 'Please snap or upload a clear photo of your craft creation.';
                speakQuestionAndListen(photoPrompt, langCode, 3, false);
              } else if (targetIdx === 4) {
                // Price -> Processing
                const finishPrompt =
                  langCode === 'hi'
                    ? 'बहुत बढ़िया! आपका हस्तशिल्प कैटलॉग तैयार किया जा रहा है।'
                    : 'Wonderful! Creating your handcrafted catalogue now.';
                speakText(finishPrompt, langCode, () => {
                  handleStartProcessing();
                });
              }
            }, 1100);
          }
        },
        onInterim: (interimText) => {
          setMicError('');
          // Check for quick language match even on interim speech
          if (targetIdx === 0) {
            const detectedCode = detectAndApplyLanguage(interimText);
            if (detectedCode) {
              stopRecording();
              setLanguage(detectedCode);
              const metaObj = getLanguageMeta(detectedCode);
              setVoiceAnswers((prev) => ({
                ...prev,
                languageChoice: `${metaObj.nativeName} (${metaObj.name})`,
              }));
              setCurrentQuestionIdx(1);
              const nextT = getTranslations(detectedCode);
              setTimeout(() => {
                speakQuestionAndListen(nextT.q1Prompt, detectedCode, 1, true);
              }, 250);
            }
          }
        },
        onEnd: () => {
          setIsRecording(false);
          recognizerRef.current = null;
        },
        onError: (err) => {
          console.warn('Mic recognizer error:', err);
          if (err === 'not-allowed') {
            setMicError('Microphone permission blocked. Please enable mic access.');
          } else if (err === 'no-speech') {
            // Keep status friendly
          }
          setIsRecording(false);
          recognizerRef.current = null;
        },
      });

      if (rec) {
        recognizerRef.current = rec;
        rec.start();
        setIsRecording(true);
      }
    } catch (e) {
      console.error('Failed to start recognizer:', e);
      setIsRecording(false);
      setMicError('Could not start microphone. You can type your answer directly.');
    }
  };

  // Language pill button handler
  const handleSelectLanguage = (newLangCode) => {
    stopSpeaking();
    stopRecording();
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setLanguage(newLangCode);
    const metaObj = getLanguageMeta(newLangCode);
    setVoiceAnswers((prev) => ({
      ...prev,
      languageChoice: `${metaObj.nativeName} (${metaObj.name})`,
    }));
    setCurrentQuestionIdx(1);
    const nextT = getTranslations(newLangCode);
    setTimeout(() => {
      speakQuestionAndListen(nextT.q1Prompt, newLangCode, 1, true);
    }, 200);
  };

  // Toggle mic button manually
  const handleToggleRecord = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    if (isAiSpeaking) {
      stopSpeaking();
      setIsAiSpeaking(false);
    }
    startListening(language, currentQuestionIdx);
  };

  // Next Question handler
  const handleNextQuestion = () => {
    stopRecording();
    stopSpeaking();
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (currentQuestionIdx < questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      const nextQ = questions[nextIdx];
      // For photo step, speak prompt without auto-listening so user can choose image
      speakQuestionAndListen(nextQ.prompt, language, nextIdx, nextIdx !== 3);
    } else {
      handleStartProcessing();
    }
  };

  // Prev Question handler
  const handlePrevQuestion = () => {
    stopRecording();
    stopSpeaking();
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (currentQuestionIdx > 0) {
      const prevIdx = currentQuestionIdx - 1;
      setCurrentQuestionIdx(prevIdx);
      const prevQ = questions[prevIdx];
      speakQuestionAndListen(prevQ.prompt, language, prevIdx, prevIdx !== 3);
    }
  };

  // Photo Upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedPhoto(reader.result);
        // Automatically progress to Price question after uploading photo
        setTimeout(() => {
          setCurrentQuestionIdx(4);
          const nextT = getTranslations(language);
          speakQuestionAndListen(nextT.q4Prompt, language, 4, true);
        }, 500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopRecording();
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Live waveform animation when recording or AI is speaking
  useEffect(() => {
    let timer;
    if (isRecording || isAiSpeaking) {
      timer = setInterval(() => {
        setWaveformLevels(
          Array.from({ length: 16 }, () => Math.floor(10 + Math.random() * 34))
        );
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRecording, isAiSpeaking]);

  const handleStartProcessing = async () => {
    stopSpeaking();
    stopRecording();
    setStage('processing');

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

    try {
      const res = await inspectCraftImage({
        imageDataUrl: capturedPhoto,
        location: artisanProfile.location || 'India',
        targetLanguageName: langMeta.name,
      });

      const userCombinedAnswer = [voiceAnswers.name, voiceAnswers.materials]
        .filter(Boolean)
        .join('. ');

      setTimeout(() => {
        const detectedTitle =
          voiceAnswers.name || res?.data?.productName || 'Handcrafted Clay Creation';
        const detectedDesc =
          userCombinedAnswer ||
          res?.data?.description ||
          'Authentic craft shaped slowly by hand with mineral-rich terracotta clay and natural vegetable pigments.';
        const detectedMat =
          voiceAnswers.materials ||
          (res?.data?.materials || ['Terracotta Clay', 'Natural Minerals']).join(', ');

        setReviewTitle(detectedTitle);
        setReviewDesc(detectedDesc);
        setReviewCategory(res?.data?.category || 'Pottery');
        setReviewMaterial(detectedMat);

        const parsedPrice = parseInt(voiceAnswers.price?.replace(/\D/g, ''), 10);
        const basePrice = parsedPrice || res?.data?.suggestedPrice || 750;
        setReviewMinPrice(String(Math.round(basePrice * 0.9)));
        setReviewMaxPrice(String(Math.round(basePrice * 1.25)));

        setStage('review');
      }, 3400);
    } catch {
      setTimeout(() => {
        setReviewTitle(voiceAnswers.name || 'Handcrafted Creation');
        setReviewDesc(
          voiceAnswers.materials || 'Authentic regional handmade craft prepared by master artisan.'
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

  // Buyer matches for review
  const buyerMatches = [
    {
      name: 'Aditi Sharma',
      type: 'Interior Designer',
      city: 'Bengaluru, Karnataka',
      need: `Looking for authentic ${reviewCategory} pieces for a boutique heritage project.`,
      score: 96,
      avatar: 'AS',
    },
    {
      name: 'Ananya Roy',
      type: 'Boutique Curator',
      city: 'Kolkata, West Bengal',
      need: `Regular sourcing of handcrafted regional pieces with direct payout to artisan.`,
      score: 91,
      avatar: 'AR',
    },
    {
      name: 'FabIndia Craft Sourcing',
      type: 'Artisan Partner',
      city: 'New Delhi',
      need: 'Direct cluster order with fair payout directly to artisan bank accounts.',
      score: 87,
      avatar: 'FC',
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#FAF3E7] text-[#2C1D13] font-body relative overflow-x-hidden">
      {/* ============================================================== */}
      {/* 1. LEFT ARTISAN ATELIER SIDEBAR (Deep Olive/Brown Floral Motif) */}
      {/* ============================================================== */}
      <aside className="w-full md:w-64 bg-[#3E382A] text-[#F3EAD8] flex flex-col justify-between shrink-0 border-r border-[#2B261C]/50 z-20 min-h-full">
        <div>
          {/* Brand Logo & Lotus Emblem */}
          <div className="p-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* Lotus flower icon */}
              <div className="w-10 h-10 rounded-full bg-[#C68345]/25 border border-[#C68345]/60 flex items-center justify-center text-[#E5A96A] text-xl shadow-xs">
                🪷
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold tracking-tight text-[#FAF3E7]">
                  Karigar<span className="text-[#C68345]">Bazaar</span>
                </span>
                <span className="text-[10px] text-[#D8CCA6] tracking-wider uppercase">
                  Artisan Atelier
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveNav('dashboard');
                setStage('dashboard');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'dashboard'
                  ? 'bg-[#E3B778] text-[#2C1D13] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t.navDashboard}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('listings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'listings'
                  ? 'bg-[#E3B778] text-[#2C1D13] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.navMyListings}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'orders'
                  ? 'bg-[#E3B778] text-[#2C1D13] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.navOrders}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('earnings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'earnings'
                  ? 'bg-[#E3B778] text-[#2C1D13] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>{t.navEarnings}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'profile'
                  ? 'bg-[#E3B778] text-[#2C1D13] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.navProfile}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('support')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[#E0D7C5] hover:bg-white/10 transition cursor-pointer text-left"
            >
              <Headphones className="w-4 h-4" />
              <span>{t.navSupport}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('settings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[#E0D7C5] hover:bg-white/10 transition cursor-pointer text-left"
            >
              <Settings className="w-4 h-4" />
              <span>{t.navSettings}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar: Traditional Royal Elephant Illustration */}
        <div className="p-6 pt-4 border-t border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐘</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#E3B778]">{t.heritageStudio}</span>
              <span className="text-[11px] text-[#D8CCA6]/75">{t.directPayout100}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN SELLER CONTENT WORKSPACE */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        {/* Top Navbar Header with Notification & Profile avatar */}
        <header className="w-full px-8 py-5 flex items-center justify-between border-b border-[#E8DCBE]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#8B6E4E] uppercase tracking-widest">
              {t.artisanDashboardTitle}
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 text-[#4A3B2C] hover:text-[#B5532A] cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B5532A]" />
            </button>

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#E8DCBE]">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#C68345] bg-[#E3B778]/50 flex items-center justify-center font-bold text-sm text-[#3E382A]">
                {artisanProfile?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#2C1D13] leading-tight">
                  {artisanProfile?.name || 'Sitadevi Paswan'}
                </span>
                <span className="text-[10px] text-[#7A6752]">
                  {artisanProfile?.location || 'Jitwarpur, Bihar'}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold text-[#8B6E4E] hover:text-[#B5532A] pl-3 border-l border-[#E8DCBE] transition cursor-pointer"
              >
                {t.logoutBtn}
              </button>
            )}
          </div>
        </header>

        {/* ============================================================== */}
        {/* 3. DASHBOARD MAIN VIEW (Match User Reference Layout) */}
        {/* ============================================================== */}
        {stage === 'dashboard' && (
          <div className="p-6 md:p-10 space-y-8 flex-1">
            {/* Top Greeting Headline */}
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#2C1D13] tracking-tight flex items-center gap-2">
                <span>{t.helloArtisan}</span>
                <span className="text-[#C68345] text-3xl">✨</span>
              </h1>
              <p className="text-sm text-[#6E5843] mt-1 font-medium">
                {t.helloArtisanSub}
              </p>
            </div>

            {/* 3-Column Grid Matching Reference Layout:
                Col 1 (left): Shop Overview + Quick Actions + Grow Your Business card
                Col 2 (center): KarigarBazaar AI Assistant Floating Chat + Glowing Avatar + Waveform + Tap to Speak
                Col 3 (right): Your To-Do Checklist + Seller Tip card
            */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* -------------------------------------------------------- */}
              {/* LEFT COLUMN: Overview + Quick Actions + Growth Card (4 cols) */}
              {/* -------------------------------------------------------- */}
              <div className="lg:col-span-4 space-y-6">
                {/* Your Shop Overview Card */}
                <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4A3B2C]">
                    <Store className="w-4 h-4 text-[#B5532A]" />
                    <span>{t.shopOverview}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#F0E4CD] text-center">
                    <div>
                      <div className="font-display text-2xl font-bold text-[#2C1D13]">0</div>
                      <div className="text-[10px] text-[#7A6752] font-semibold mt-0.5">{t.totalListings}</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold text-[#2C1D13]">0</div>
                      <div className="text-[10px] text-[#7A6752] font-semibold mt-0.5">{t.orders}</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold text-[#2C1D13]">₹0</div>
                      <div className="text-[10px] text-[#7A6752] font-semibold mt-0.5">{t.totalEarnings}</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold text-[#C68345]">★ 5.0</div>
                      <div className="text-[10px] text-[#7A6752] font-semibold mt-0.5">{t.rating}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card (NO buyer/seller switcher button) */}
                <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4A3B2C]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#B5532A]">⚡</span>
                      <span>{t.quickActions}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#7A6752]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIdx(0);
                        speakQuestionAndListen(questions[0].prompt, language, 0, true);
                      }}
                      className="bg-[#B5532A] hover:bg-[#973F1C] text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t.addAProduct}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNav('listings')}
                      className="bg-white hover:bg-[#FAF3E7] border border-[#D8CCA6] text-[#2C1D13] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C68345]" />
                      <span>{t.myListingsBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Grow Your Business Decorative Card with Terracotta Surahi */}
                <div className="bg-gradient-to-br from-[#FFFDF9] to-[#F5ECE0] border border-[#EADBBE] rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-[#2C1D13] italic">
                      {t.growYourBusiness}
                    </h3>
                    <p className="text-xs text-[#7A6752]">
                      {t.growYourBusinessSub}
                    </p>
                    <button
                      type="button"
                      onClick={() => askQuestionAloud(t.sellerTipText)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3E382A] text-[#FAF3E7] text-[11px] font-bold hover:bg-[#2C1D13] transition cursor-pointer mt-1"
                    >
                      <span>{t.exploreTips}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#E8DCBE]">
                    <img
                      src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80"
                      alt="Artisan Surahi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* CENTER COLUMN: Interactive Glowing AI Robot Avatar (5 cols) */}
              {/* -------------------------------------------------------- */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-4">
                {/* Speech Bubble from KarigarBazaar AI Assistant */}
                <div className="w-full max-w-sm bg-white border border-[#EADBBE] rounded-2xl p-4 shadow-sm text-center relative mx-auto transition-all">
                  <p className="text-xs font-bold text-[#2C1D13] flex items-center justify-center gap-1.5">
                    <span>{t.aiBubbleGreeting}</span>
                    {isAiSpeaking && <span className="animate-bounce">🔊</span>}
                  </p>
                  <p className="text-xs text-[#7A6752] mt-0.5 font-medium">
                    {isAiSpeaking
                      ? `🔊 ${activeQuestion.prompt}`
                      : currentQuestionIdx === 0
                      ? `👋 ${t.aiBubblePrompt}`
                      : `👉 ${activeQuestion.prompt}`}
                  </p>
                  {/* Speech bubble pointer pointing down to mascot */}
                  <div className="w-3.5 h-3.5 bg-white border-b border-r border-[#EADBBE] transform rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2" />
                </div>

                {/* Glowing Aura Ring & Friendly Robot Mascot with Expressive Eyes */}
                <div className="relative w-52 h-52 flex items-center justify-center my-1">
                  {/* Outer Sacred Lotus Petals Aura (Mandala Ring) */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E3B778] animate-spin-slow opacity-60" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#E3B778]/30 via-[#C68345]/20 to-transparent blur-md" />

                  {/* Robot Head Sphere */}
                  <div
                    onClick={() =>
                      speakQuestionAndListen(activeQuestion.prompt, language, currentQuestionIdx, true)
                    }
                    className="relative w-38 h-38 rounded-full bg-[#1B140E] border-4 border-[#C68345] shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-105 group"
                    title={t.hearQuestion}
                  >
                    {/* Glowing Friendly Curved Eyes */}
                    <div className="flex items-center gap-7">
                      <div className="w-5 h-2.5 rounded-t-full border-t-4 border-l-2 border-r-2 border-[#54E2FF] shadow-[0_0_12px_#54E2FF] animate-pulse" />
                      <div className="w-5 h-2.5 rounded-t-full border-t-4 border-l-2 border-r-2 border-[#54E2FF] shadow-[0_0_12px_#54E2FF] animate-pulse" />
                    </div>

                    {/* Cute blush cheeks */}
                    <div className="absolute bottom-11 flex items-center gap-14">
                      <div className="w-2.5 h-1 rounded-full bg-[#FF7F50]/60 blur-[1px]" />
                      <div className="w-2.5 h-1 rounded-full bg-[#FF7F50]/60 blur-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Translucent Glass Waveform Card with Microphone Trigger (Directly Under Mascot) */}
                <div className="w-full max-w-sm bg-gradient-to-b from-[#FFFDF9]/90 to-[#FDF8EF]/95 backdrop-blur-md border border-[#EADBBE] rounded-3xl p-5 shadow-lg flex flex-col items-center space-y-3">
                  {/* Waveform graphic */}
                  <div className="h-9 flex items-center gap-1.5 justify-center w-full">
                    {waveformLevels.map((lvl, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full transition-all duration-100"
                        style={{
                          height: isRecording || isAiSpeaking ? `${lvl}px` : '4px',
                          backgroundColor: isRecording
                            ? '#B5532A'
                            : isAiSpeaking
                            ? '#D9A441'
                            : '#C68345',
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-[#7A6752]">
                    {isAiSpeaking
                      ? t.aiSpeakingText
                      : isRecording
                      ? t.listeningActive
                      : t.tapToSpeak}
                  </span>

                  {/* Circular Terracotta/Ochre Microphone Trigger */}
                  <button
                    type="button"
                    onClick={handleToggleRecord}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition transform hover:scale-105 cursor-pointer ${
                      isRecording
                        ? 'bg-[#B5532A] ring-4 ring-[#B5532A]/30 animate-pulse'
                        : isAiSpeaking
                        ? 'bg-[#D9A441] ring-4 ring-[#D9A441]/30'
                        : 'bg-[#B5532A] hover:bg-[#973F1C]'
                    }`}
                    title={t.tapToSpeak}
                  >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>

                {/* Active Question & Input Card (Nestled Below Waveform Capsule) */}
                <div className="w-full max-w-sm bg-white border border-[#EADBBE] rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#B5532A]">
                    <span>
                      {t.questionCounter} {currentQuestionIdx + 1} {t.ofCounter} {questions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakQuestionAndListen(activeQuestion.prompt, language, currentQuestionIdx, true)
                      }
                      className="flex items-center gap-1 text-[#2C1D13] hover:text-[#B5532A] cursor-pointer text-[11px] font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#C68345]" />
                      <span>{t.hearQuestion}</span>
                    </button>
                  </div>

                  <h4 className="font-display text-lg font-bold text-[#2C1D13] leading-snug">
                    {activeQuestion.prompt}
                  </h4>
                  <p className="text-xs text-[#7A6752] italic">{activeQuestion.desc}</p>

                  {/* Photo picker on Question 3 */}
                  {activeQuestion.isImageStep && (
                    <div className="pt-2">
                      <label className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer">
                        <Camera className="w-4 h-4 text-[#B5532A]" />
                        <span>{t.choosePhotoBtn}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <div className="mt-2 h-24 rounded-lg overflow-hidden border border-[#E8DCBE]">
                        <img
                          src={capturedPhoto}
                          alt="Craft preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Language Selection Chips on Question 0 */}
                  {activeQuestion.isLanguageStep && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {SUPPORTED_LANGUAGES.slice(0, 8).map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleSelectLanguage(l.code)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition border cursor-pointer ${
                            language === l.code
                              ? 'bg-[#B5532A] text-white border-[#B5532A]'
                              : 'bg-[#FAF3E7] text-[#2C1D13] border-[#EADBBE] hover:border-[#B5532A]'
                          }`}
                        >
                          {l.nativeName}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input / Transcribed text */}
                  {!activeQuestion.isImageStep && (
                    <div className="pt-2">
                      <input
                        type="text"
                        value={voiceAnswers[activeQuestion.key]}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNextQuestion();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVoiceAnswers((prev) => ({
                            ...prev,
                            [activeQuestion.key]: val,
                          }));
                          if (activeQuestion.isLanguageStep) {
                            const detected = detectAndApplyLanguage(val);
                            if (detected) {
                              handleSelectLanguage(detected);
                            }
                          }
                        }}
                        placeholder={
                          isAiSpeaking
                            ? t.aiSpeakingText
                            : isRecording
                            ? t.listeningActive
                            : t.enterAnswerPlaceholder
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#2C1D13] bg-[#FAF3E7]/50 ${
                          isRecording
                            ? 'border-[#B5532A] ring-2 ring-[#B5532A]/20 font-medium'
                            : 'border-[#EADBBE] focus:border-[#B5532A]'
                        }`}
                      />
                    </div>
                  )}

                  {micError && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{micError}</span>
                    </div>
                  )}

                  {/* Stepper Next/Prev buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F0E4CD]">
                    <button
                      type="button"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIdx === 0}
                      className="text-xs font-semibold text-[#7A6752] hover:text-[#2C1D13] disabled:opacity-30 cursor-pointer"
                    >
                      {t.previousBtn}
                    </button>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="text-xs font-bold text-[#B5532A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>
                        {currentQuestionIdx < questions.length - 1 ? t.nextQuestionBtn : t.finishListingBtn}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* RIGHT COLUMN: Your To-Do Checklist + Seller Tip (3 cols) */}
              {/* -------------------------------------------------------- */}
              <div className="lg:col-span-3 space-y-6">
                {/* Your To-Do Checklist Card */}
                <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4A3B2C]">
                    <span className="text-base">📋</span>
                    <span>{t.yourToDo}</span>
                  </div>

                  <div className="space-y-3 pt-1 text-xs">
                    {/* Item 1 */}
                    <div
                      className={`p-3 rounded-xl border transition ${
                        currentQuestionIdx <= 1
                          ? 'bg-[#FDF6E8] border-[#E3B778] text-[#2C1D13] font-bold'
                          : 'bg-white border-[#E8DCBE] text-[#7A6752]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            currentQuestionIdx > 1
                              ? 'bg-[#B5532A] border-[#B5532A] text-white text-[9px]'
                              : 'border-[#C68345]'
                          }`}
                        >
                          {currentQuestionIdx > 1 && '✓'}
                        </span>
                        <span>{t.todoStep1}</span>
                      </div>
                      <p className="text-[11px] text-[#7A6752] font-normal pl-5 mt-0.5">
                        {t.todoStep1Sub}
                      </p>
                    </div>

                    {/* Item 2 */}
                    <div
                      className={`p-2.5 rounded-xl border transition flex items-center gap-2 ${
                        currentQuestionIdx === 3
                          ? 'bg-[#FDF6E8] border-[#E3B778] text-[#2C1D13] font-bold'
                          : 'bg-white border-[#E8DCBE] text-[#7A6752]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-[#C68345]" />
                      <span>{t.todoStep2}</span>
                    </div>

                    {/* Item 3 */}
                    <div
                      className={`p-2.5 rounded-xl border transition flex items-center gap-2 ${
                        currentQuestionIdx === 4
                          ? 'bg-[#FDF6E8] border-[#E3B778] text-[#2C1D13] font-bold'
                          : 'bg-white border-[#E8DCBE] text-[#7A6752]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-[#C68345]" />
                      <span>{t.todoStep3}</span>
                    </div>

                    {/* Item 4 */}
                    <div className="p-2.5 rounded-xl border bg-white border-[#E8DCBE] text-[#7A6752] flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-[#C68345]" />
                      <span>{t.todoStep4}</span>
                    </div>
                  </div>
                </div>

                {/* Seller Tip Card */}
                <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4A3B2C]">
                    <Lightbulb className="w-4 h-4 text-[#E3B778]" />
                    <span>{t.sellerTipTitle}</span>
                  </div>

                  <p className="text-xs text-[#6E5843] leading-relaxed">
                    {t.sellerTipText}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        speakQuestionAndListen(
                          activeQuestion.prompt,
                          language,
                          currentQuestionIdx,
                          true
                        )
                      }
                      className="text-xs font-bold text-[#B5532A] hover:underline cursor-pointer"
                    >
                      {t.learnMore} →
                    </button>
                    <span className="text-2xl">🏺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. PROCESSING SCREEN */}
        {/* ============================================================== */}
        {stage === 'processing' && (
          <div className="p-10 max-w-2xl mx-auto space-y-8 flex-1 flex flex-col justify-center">
            <div className="bg-white border border-[#EADBBE] rounded-2xl p-8 shadow-sm space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs uppercase font-bold text-[#B5532A] tracking-wider">
                  AI Atelier Assistant
                </span>
                <h3 className="font-display text-3xl font-bold text-[#2C1D13]">
                  Publishing your craft
                </h3>
                <p className="text-xs text-[#7A6752]">
                  Synthesizing dialect answers in {langMeta.nativeName} and cleaning workshop photo
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F0E4CD]">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold ${
                      item.done
                        ? 'bg-[#FAF3E7] border-[#C68345] text-[#2C1D13]'
                        : 'border-[#E8DCBE] text-[#7A6752]'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#B5532A]" />
                      ) : (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#C68345]" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. REVIEW SCREEN */}
        {/* ============================================================== */}
        {stage === 'review' && (
          <div className="p-10 max-w-5xl mx-auto space-y-8 flex-1">
            <div>
              <span className="text-xs uppercase font-bold text-[#B5532A] tracking-wider">
                Step 3 of 4
              </span>
              <h2 className="font-display text-4xl font-bold text-[#2C1D13] mt-1">
                Review your craft entry
              </h2>
              <p className="text-xs text-[#7A6752] mt-1">
                Check details generated from your photo and dialect. You can edit any field.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Card Preview */}
              <div className="md:col-span-5 bg-white border border-[#EADBBE] rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#2C1D13]">
                  <span>Product Card</span>
                  <button
                    type="button"
                    onClick={() => setShowOriginalPhoto(!showOriginalPhoto)}
                    className="text-[#B5532A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showOriginalPhoto ? 'AI Studio' : 'Original Snap'}</span>
                  </button>
                </div>

                <div className="aspect-[4/5] rounded-xl overflow-hidden border border-[#E8DCBE] bg-black/5 relative">
                  <img
                    src={capturedPhoto}
                    alt={reviewTitle}
                    className={`w-full h-full object-cover transition ${
                      showOriginalPhoto ? 'filter contrast-90 brightness-95' : ''
                    }`}
                  />
                  <span className="absolute top-3 left-3 bg-[#2C1D13]/90 text-white text-[10px] px-2 py-0.5 rounded-sm">
                    {showOriginalPhoto ? 'Workshop raw' : 'AI studio clean'}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-xs text-[#B5532A] font-bold uppercase">{reviewCategory}</span>
                  <h4 className="font-display text-xl font-bold text-[#2C1D13]">{reviewTitle}</h4>
                  <p className="text-xs text-[#7A6752] line-clamp-2">{reviewDesc}</p>
                  <div className="pt-2 text-sm font-bold text-[#2C1D13]">
                    ₹{reviewMinPrice} – ₹{reviewMaxPrice}
                  </div>
                </div>
              </div>

              {/* Right Editable Fields */}
              <div className="md:col-span-7 bg-white border border-[#EADBBE] rounded-2xl p-6 space-y-4 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-[#2C1D13] mb-1">Product Title</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCBE] text-xs focus:border-[#B5532A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1D13] mb-1">Story & Description</label>
                  <textarea
                    rows={3}
                    value={reviewDesc}
                    onChange={(e) => setReviewDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCBE] text-xs focus:border-[#B5532A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1D13] mb-1">Category</label>
                    <select
                      value={reviewCategory}
                      onChange={(e) => setReviewCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCBE] text-xs focus:border-[#B5532A]"
                    >
                      <option value="Pottery">Pottery</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Block Print">Block Print</option>
                      <option value="Wood">Wood</option>
                      <option value="Painting">Painting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1D13] mb-1">Key Materials</label>
                    <input
                      type="text"
                      value={reviewMaterial}
                      onChange={(e) => setReviewMaterial(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCBE] text-xs focus:border-[#B5532A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1D13] mb-1">Min Price (₹)</label>
                    <input
                      type="number"
                      value={reviewMinPrice}
                      onChange={(e) => setReviewMinPrice(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCBE] text-xs focus:border-[#B5532A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1D13] mb-1">Max Price (₹)</label>
                    <input
                      type="number"
                      value={reviewMaxPrice}
                      onChange={(e) => setReviewMaxPrice(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCBE] text-xs focus:border-[#B5532A]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleApproveCraft}
                    className="btn-terracotta w-full py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer"
                  >
                    <span>Approve & Find Buyers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. MATCHES SCREEN */}
        {/* ============================================================== */}
        {stage === 'matches' && (
          <div className="p-10 max-w-4xl mx-auto space-y-6 flex-1">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase font-bold text-[#B5532A] tracking-wider">
                Listing Approved
              </span>
              <h2 className="font-display text-4xl font-bold text-[#2C1D13]">
                Matched buyers for your craft
              </h2>
              <p className="text-xs text-[#7A6752]">
                These verified curators and boutique buyers are actively looking for {reviewCategory}.
              </p>
            </div>

            <div className="space-y-4">
              {buyerMatches.map((buyer) => (
                <div
                  key={buyer.name}
                  className="bg-white border border-[#EADBBE] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FAF3E7] border border-[#C68345] text-[#2C1D13] font-bold text-base flex items-center justify-center shrink-0">
                      {buyer.avatar}
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-xl font-bold text-[#2C1D13]">
                          {buyer.name}
                        </h4>
                        <span className="text-xs text-[#B5532A] font-semibold">• {buyer.type}</span>
                      </div>
                      <p className="text-xs text-[#7A6752]">{buyer.city}</p>
                      <p className="text-xs text-[#4A3B2C] pt-0.5">{buyer.need}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-[#2C1D13]">
                      Match: {buyer.score}%
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`Direct link shared with ${buyer.name}!`)}
                      className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#B5532A]" />
                      <span>Share Catalogue</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setStage('dashboard');
                  setCurrentQuestionIdx(0);
                }}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={onFinishFlow}
                className="btn-terracotta"
              >
                <span>View Live in Bazaar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Traditional Indian Artisan Border Ribbon along bottom */}
        <div className="w-full h-4.5 bg-[#6B2414] flex items-center justify-center overflow-hidden border-t border-[#D9A441] mt-auto shrink-0 shadow-inner">
          <div className="flex items-center gap-6 text-[#FAF3E7] text-[9px] tracking-widest uppercase font-mono opacity-85 whitespace-nowrap">
            <span>◈ 100% Direct Payout to Artisans</span>
            <span>◈ Verified Heritage Guild</span>
            <span>◈ No Middleman Commission</span>
            <span>◈ Voice-First Commerce</span>
            <span>◈ 100% Direct Payout to Artisans</span>
            <span>◈ Handcrafted Indian Legacy</span>
          </div>
        </div>
      </main>
    </div>
  );
}
