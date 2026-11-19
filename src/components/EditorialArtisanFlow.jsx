import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Share2,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageMeta, getTranslations } from '../i18n/languages';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';
import { inspectCraftImage } from '../ai/aiService';

export default function EditorialArtisanFlow({
  artisanProfile,
  onProfileUpdate,
  language = 'en',
  setLanguage,
  onPublishCraft,
  onFinishFlow,
}) {
  const t = getTranslations(language);
  const langMeta = getLanguageMeta(language);

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

  // Conversational Voice Q&A state (one-by-one interview)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [voiceAnswers, setVoiceAnswers] = useState({
    languageChoice: '',
    name: '',
    materials: '',
    duration: '',
    price: '',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState('');
  const [waveformLevels, setWaveformLevels] = useState([12, 24, 18, 30, 16, 28, 22, 14]);

  const recognizerRef = useRef(null);

  // Processing checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Cleaning workbench photo & refining lighting', done: false },
    { id: 2, label: `Transcribing voice answers in ${langMeta.nativeName}`, done: false },
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

  // 5 Questions definition including Language Inquiry first
  const questions = [
    {
      id: 'languageChoice',
      prompt: t.q0Prompt,
      desc: t.q0Desc,
      key: 'languageChoice',
      isLanguageStep: true,
    },
    {
      id: 'name',
      prompt: t.q1Prompt,
      desc: t.q1Desc,
      key: 'name',
    },
    {
      id: 'materials',
      prompt: t.q2Prompt,
      desc: t.q2Desc,
      key: 'materials',
    },
    {
      id: 'duration',
      prompt: t.q3Prompt,
      desc: t.q3Desc,
      key: 'duration',
    },
    {
      id: 'price',
      prompt: t.q4Prompt,
      desc: t.q4Desc,
      key: 'price',
    },
  ];

  const activeQuestion = questions[currentQuestionIdx];

  // Helper to map spoken or typed language to language code
  const detectAndApplyLanguage = (spokenText) => {
    if (!spokenText) return;
    const lower = spokenText.toLowerCase();
    const map = [
      { key: 'hindi', code: 'hi' },
      { key: 'हिन्दी', code: 'hi' },
      { key: 'gujarati', code: 'gu' },
      { key: 'ગુજરાતી', code: 'gu' },
      { key: 'tamil', code: 'ta' },
      { key: 'தமிழ்', code: 'ta' },
      { key: 'telugu', code: 'te' },
      { key: 'తెలుగు', code: 'te' },
      { key: 'bengali', code: 'bn' },
      { key: 'বাংলা', code: 'bn' },
      { key: 'marathi', code: 'mr' },
      { key: 'मराठी', code: 'mr' },
      { key: 'kannada', code: 'kn' },
      { key: 'ಕನ್ನಡ', code: 'kn' },
      { key: 'malayalam', code: 'ml' },
      { key: 'മലയാളം', code: 'ml' },
      { key: 'punjabi', code: 'pa' },
      { key: 'ਪੰਜਾਬੀ', code: 'pa' },
      { key: 'odia', code: 'or' },
      { key: 'ଓଡ଼ିଆ', code: 'or' },
      { key: 'urdu', code: 'ur' },
      { key: 'اردو', code: 'ur' },
      { key: 'assamese', code: 'as' },
      { key: 'অসমীয়া', code: 'as' },
      { key: 'rajasthani', code: 'raj' },
      { key: 'राजस्थानी', code: 'raj' },
      { key: 'kashmiri', code: 'ks' },
      { key: 'english', code: 'en' },
    ];

    for (const item of map) {
      if (lower.includes(item.key)) {
        stopSpeaking();
        stopRecording();
        setLanguage(item.code);
        return item.code;
      }
    }
    return null;
  };

  // Play question audio automatically on mount or explicit user request
  const askQuestionAloud = (promptText) => {
    if (isRecording) {
      stopRecording();
    }
    speakText(promptText, language);
  };

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

  // Stop recording cleanup helper
  const stopRecording = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // ignore
      }
      recognizerRef.current = null;
    }
    setIsRecording(false);
  };

  // Mic recording handler for current question
  const handleToggleRecord = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Always silence any TTS speech before opening mic
    stopSpeaking();
    setMicError('');

    if (!isSpeechRecognitionSupported()) {
      setMicError('Speech recognition requires Chrome or Edge browser. You can also type directly in the box below.');
      return;
    }

    // Explicitly prompt for mic permission via getUserMedia to unlock Chrome permission dialog if not yet granted
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close test stream immediately; SpeechRecognition will now have granted permission
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr) {
      console.warn('Microphone permission check failed:', permErr);
      if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
        setMicError('Microphone permission is blocked in your browser. Please click the camera/mic icon in the address bar to allow microphone access.');
        return;
      }
    }

    try {
      const rec = createSpeechRecognizer({
        language,
        onResult: (text) => {
          setMicError('');
          setVoiceAnswers((prev) => ({
            ...prev,
            [activeQuestion.key]: prev[activeQuestion.key]
              ? `${prev[activeQuestion.key]} ${text}`
              : text,
          }));

          // If on Question 0 (language selection), dynamically auto-switch language if spoken
          if (activeQuestion.isLanguageStep) {
            detectAndApplyLanguage(text);
          }
        },
        onInterim: () => {
          setMicError('');
        },
        onEnd: (hasSpoken) => {
          setIsRecording(false);
          recognizerRef.current = null;
        },
        onError: (err) => {
          console.warn('Mic recognizer error:', err);
          if (err === 'not-allowed') {
            setMicError('Microphone permission is blocked. Click the lock/tune icon near your browser address bar to enable mic.');
          } else if (err === 'no-speech') {
            setMicError('No speech heard. Tap the button and speak clearly into your mic, or type below.');
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
      setMicError('Could not start microphone. You can type your answer directly in the box below.');
    }
  };

  // Move to next question or auto advance
  const handleNextQuestion = () => {
    stopRecording();
    stopSpeaking();
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    stopRecording();
    stopSpeaking();
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
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

      const userCombinedAnswer = [
        voiceAnswers.name,
        voiceAnswers.materials,
        voiceAnswers.duration,
      ]
        .filter(Boolean)
        .join('. ');

      setTimeout(() => {
        const detectedTitle =
          voiceAnswers.name || res?.data?.productName || 'Handcrafted Earthen Vessel';
        const detectedDesc =
          userCombinedAnswer ||
          res?.data?.description ||
          'Authentic craft shaped slowly by hand, using mineral-rich riverbed terracotta and dried under open sun before wood firing.';
        const detectedMat =
          voiceAnswers.materials ||
          (res?.data?.materials || ['Riverbed Terracotta', 'Organic Slip']).join(', ');

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
        setReviewTitle(voiceAnswers.name || 'Handcrafted Indian Masterpiece');
        setReviewDesc(
          voiceAnswers.materials ||
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
      artisanName: artisanProfile.name || profName || 'Master Artisan',
      location: artisanProfile.location || profCity || 'India',
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

  // Simulated Buyer Matches
  const buyerMatches = [
    {
      name: 'Aditi Sharma',
      type: 'Interior Designer',
      city: 'Bengaluru, Karnataka',
      need: `Looking for authentic ${reviewCategory} pieces for a luxury heritage resort lobby.`,
      score: 96,
      avatar: 'AS',
    },
    {
      name: 'Ananya Roy',
      type: 'Boutique Curator',
      city: 'Kolkata, West Bengal',
      need: `Regular sourcing of regional handcrafted items for sustainable retail with 0% middleman deduction.`,
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
    <div className="w-full bg-[#F6EFE4]/80 backdrop-blur-xs min-h-[90vh]">
      {/* 1. ARTISAN REGISTRATION / PROFILE MODAL */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-[#E4D9C8] rounded-sm p-8 space-y-6 shadow-2xl">
            <div>
              <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                {t.craftWorkspace}
              </span>
              <h2 className="font-display text-3xl font-semibold text-[#2B3A67] mt-1">
                {t.workshopCity} Profile
              </h2>
              <p className="text-xs text-[#2B3A67]/75 mt-1">
                Tell us your name and workshop city once in {langMeta.nativeName}. You won't have to type it again.
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
                Save & start workshop
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STAGE 1: CAPTURE SCREEN */}
      {stage === 'capture' && (
        <section className="max-w-7xl mx-auto px-6 py-14">
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#E4D9C8] gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#B5532A]">
                {t.craftWorkspace}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#2B3A67] mt-1">
                {t.namaste}, {artisanProfile.name || profName}
              </h1>
              <p className="text-sm text-[#2B3A67]/75 mt-1">
                {t.workshopCity}: {artisanProfile.location || profCity} • {t.noTypingNeeded}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="text-xs text-[#2B3A67] hover:text-[#B5532A] underline cursor-pointer self-start sm:self-auto"
            >
              {t.editWorkshop}
            </button>
          </div>

          {/* Two Very Large Tiles Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* TILE 1: SNAP (Camera / Upload) */}
            <div className="bg-white/95 backdrop-blur-xs border border-[#E4D9C8] rounded-sm p-8 flex flex-col justify-between space-y-6 min-h-[500px] shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                    {t.stepA}
                  </span>
                  <span className="text-xs text-[#D9A441] font-medium">{t.workshopSnap}</span>
                </div>
                <h2 className="font-display text-3xl font-semibold text-[#2B3A67] mt-1">
                  {t.snapYourCraft}
                </h2>
                <p className="text-xs text-[#2B3A67]/75 mt-1">
                  {t.snapDesc}
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
                    <span className="text-xs">{t.noPhotoSelected}</span>
                  </div>
                )}
              </div>

              {/* Camera / Upload trigger */}
              <label className="btn-secondary w-full py-3.5 cursor-pointer flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-[#B5532A]" />
                <span>{t.takeOrChoosePhoto}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* TILE 2: CONVERSATIONAL VOICE ASSISTANT (Asks questions one by one) */}
            <div className="bg-white/95 backdrop-blur-xs border border-[#E4D9C8] rounded-sm p-8 flex flex-col justify-between space-y-6 min-h-[500px] shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                    {t.stepB}
                  </span>
                  {/* Dialect selector */}
                  <select
                    value={language}
                    onChange={(e) => {
                      stopSpeaking();
                      stopRecording();
                      setLanguage(e.target.value);
                    }}
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
                  {t.voiceDialectTitle}
                </h2>
                <p className="text-xs text-[#2B3A67]/75 mt-1">
                  {t.voiceDialectDesc}
                </p>
              </div>

              {/* Active Question Box & Waveform */}
              <div className="rounded-sm border border-[#E4D9C8] bg-cream-cloth p-6 flex flex-col justify-between space-y-4">
                {/* Question Header & Read Aloud button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#B5532A]">
                    <span>
                      {t.questionPrefix} {currentQuestionIdx + 1} / {questions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => askQuestionAloud(activeQuestion.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#B5532A] text-white hover:bg-[#973F1C] cursor-pointer shadow-xs transition"
                      title="Hear AI speak question aloud"
                    >
                      <Volume2 className="w-4 h-4 text-white" />
                      <span className="text-xs font-semibold">{t.replayQuestion}</span>
                    </button>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-[#2B3A67] leading-snug">
                    {activeQuestion.prompt}
                  </h3>
                  <p className="text-xs text-[#2B3A67]/75 italic">
                    {activeQuestion.desc}
                  </p>
                </div>

                {/* Spoken Answer & Editable fallback field */}
                <div className="space-y-3 pt-2 border-t border-[#E4D9C8]">
                  {/* Waveform */}
                  <div className="h-8 flex items-center gap-1.5 justify-center">
                    {waveformLevels.map((lvl, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full transition-all duration-100"
                        style={{
                          height: isRecording ? `${lvl}px` : '4px',
                          backgroundColor: isRecording ? '#B5532A' : '#D9A441',
                        }}
                      />
                    ))}
                  </div>

                  {/* Input / Transcribed text */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={voiceAnswers[activeQuestion.key]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVoiceAnswers((prev) => ({
                          ...prev,
                          [activeQuestion.key]: val,
                        }));
                        if (activeQuestion.isLanguageStep) {
                          detectAndApplyLanguage(val);
                        }
                      }}
                      placeholder={
                        isRecording
                          ? 'Listening... speak clearly into your mic'
                          : `Speak or type your answer in ${langMeta.nativeName}...`
                      }
                      className={`w-full px-3.5 py-2.5 rounded-sm border text-xs text-[#2B3A67] bg-white transition ${
                        isRecording
                          ? 'border-[#B5532A] ring-2 ring-[#B5532A]/20 font-medium'
                          : 'border-[#E4D9C8] focus:border-[#B5532A]'
                      }`}
                    />

                    {/* If on Question 0, provide 1-click quick dialect chips */}
                    {activeQuestion.isLanguageStep && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-[#2B3A67]/60 mr-1">
                          Or tap to speak in:
                        </span>
                        {SUPPORTED_LANGUAGES.slice(0, 8).map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => {
                              stopSpeaking();
                              stopRecording();
                              setLanguage(l.code);
                              setVoiceAnswers((prev) => ({
                                ...prev,
                                languageChoice: `${l.nativeName} (${l.name})`,
                              }));
                            }}
                            className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold transition cursor-pointer border ${
                              language === l.code
                                ? 'bg-[#B5532A] text-white border-[#B5532A]'
                                : 'bg-white/80 hover:bg-white text-[#2B3A67] border-[#E4D9C8]'
                            }`}
                          >
                            {l.nativeName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {micError && (
                    <div className="p-2.5 rounded-sm bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{micError}</span>
                    </div>
                  )}
                </div>

                {/* Question Navigation Stepper */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIdx === 0}
                    className="text-xs font-semibold text-[#2B3A67] hover:text-[#B5532A] disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.previousQuestion}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          stopRecording();
                          stopSpeaking();
                          setCurrentQuestionIdx(idx);
                        }}
                        className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition cursor-pointer ${
                          idx === currentQuestionIdx
                            ? 'bg-[#B5532A] text-white'
                            : voiceAnswers[q.key]
                            ? 'bg-[#D9A441]/40 text-[#2B3A67]'
                            : 'bg-white border border-[#E4D9C8] text-[#2B3A67]/60'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIdx < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="text-xs font-semibold text-[#B5532A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>{t.nextQuestion}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-2" />
                      <span>Ready</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Mic toggle */}
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`w-full py-3.5 rounded-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm ${
                  isRecording
                    ? 'bg-[#B5532A] text-white ring-2 ring-[#B5532A]/30 animate-pulse'
                    : 'bg-[#F6EFE4] border border-[#E4D9C8] text-[#2B3A67] hover:border-[#B5532A]'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#B5532A]" />}
                <span>
                  {isRecording
                    ? 'Tap to stop listening'
                    : `Tap to speak answer for Question ${currentQuestionIdx + 1}`}
                </span>
              </button>
            </div>
          </div>

          {/* Single primary button: Create my catalogue */}
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleStartProcessing}
              className="btn-terracotta px-12 py-4 text-base font-semibold shadow-md"
            >
              <span>{t.createMyCatalogue}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* STAGE 2: PROCESSING SCREEN */}
      {stage === 'processing' && (
        <section className="max-w-2xl mx-auto px-6 py-24">
          <div className="bg-white border border-[#E4D9C8] rounded-sm p-10 space-y-8 shadow-sm">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                Craft atelier AI assistant
              </span>
              <h2 className="font-display text-4xl font-semibold text-[#2B3A67]">
                Preparing your piece
              </h2>
              <p className="text-xs text-[#2B3A67]/75">
                Processing your dialect answers in {langMeta.nativeName} and cleaning workshop photo
              </p>
            </div>

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

      {/* STAGE 3: REVIEW SCREEN */}
      {stage === 'review' && (
        <section className="max-w-7xl mx-auto px-6 py-12 pb-32">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B5532A]">
              {t.reviewSubtitle}
            </span>
            <h2 className="font-display text-4xl font-semibold text-[#2B3A67] mt-1">
              {t.reviewTitle}
            </h2>
            <p className="text-xs text-[#2B3A67]/75 mt-1">
              {t.reviewDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Catalogue card */}
            <div className="lg:col-span-5 bg-white border border-[#E4D9C8] rounded-sm p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2B3A67]">Catalogue Card Preview</span>
                <button
                  type="button"
                  onClick={() => setShowOriginalPhoto(!showOriginalPhoto)}
                  className="text-xs text-[#B5532A] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showOriginalPhoto ? t.showCleaned : t.showOriginal}</span>
                </button>
              </div>

              <div className="aspect-[4/5] rounded-sm overflow-hidden border border-[#E4D9C8] bg-black/5 relative">
                <img
                  src={capturedPhoto}
                  alt={reviewTitle}
                  className={`w-full h-full object-cover transition ${
                    showOriginalPhoto ? 'filter contrast-90 brightness-95' : ''
                  }`}
                />
                <span className="absolute top-3 left-3 bg-[#2B3A67]/90 text-white text-[11px] px-2.5 py-0.5 rounded-sm">
                  {showOriginalPhoto ? 'Original snap' : 'AI studio clean'}
                </span>
              </div>

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
            <div className="lg:col-span-7 bg-white border border-[#E4D9C8] rounded-sm p-8 space-y-6 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  {t.productName}
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
                  {t.craftStory}
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
                    {t.craftCategory}
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
                    {t.keyMaterials}
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
                    {t.payoutMin}
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
                    {t.payoutMax}
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
                  {t.tags}
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

          {/* Sticky Approve bar */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E4D9C8] py-4 px-6 shadow-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-xs text-[#2B3A67]">
                Ready to publish as <strong className="text-[#B5532A]">{reviewTitle}</strong>
              </div>

              <button
                type="button"
                onClick={handleApproveCraft}
                className="btn-terracotta px-8 py-3 font-semibold"
              >
                <span>{t.approveAndFindBuyers}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 4: MATCHES SCREEN */}
      {stage === 'matches' && (
        <section className="max-w-4xl mx-auto px-6 py-14">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
              {t.cataloguePublished}
            </span>
            <h2 className="font-display text-4xl font-semibold text-[#2B3A67]">
              {t.matchedBuyersTitle}
            </h2>
            <p className="text-xs text-[#2B3A67]/75">
              {t.matchedBuyersDesc}
            </p>
          </div>

          <div className="space-y-4">
            {buyerMatches.map((buyer) => (
              <div
                key={buyer.name}
                className="bg-white border border-[#E4D9C8] rounded-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs"
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
                    <span>{t.shareCatalogue}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setStage('capture');
                setCurrentQuestionIdx(0);
                setVoiceAnswers({ name: '', materials: '', duration: '', price: '' });
              }}
              className="btn-secondary"
            >
              {t.listAnotherCraft}
            </button>
            <button
              type="button"
              onClick={onFinishFlow}
              className="btn-terracotta"
            >
              <span>{t.viewInMarketplace}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
