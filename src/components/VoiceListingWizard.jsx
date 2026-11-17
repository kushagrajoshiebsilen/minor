import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Upload,
  Sparkles,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';
import { getLanguageMeta } from '../i18n/languages';
import { ATELIER_PRESET_IMAGES } from '../data/heritageCatalog';
import { computeLocalPricingBenchmark } from '../data/pricingBenchmarks';
import { enhanceCraftStory } from '../ai/aiService';

export default function VoiceListingWizard({
  isOpen,
  onClose,
  language,
  category,
  currentValues,
  onComplete,
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState({
    name: currentValues?.name || '',
    location: currentValues?.location || '',
    productName: currentValues?.productName || '',
    description: currentValues?.description || '',
    image: currentValues?.image || ATELIER_PRESET_IMAGES[0].url,
    price: currentValues?.price || '',
  });
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const recognizerRef = useRef(null);

  const langMeta = getLanguageMeta(language);
  const isHindi = language === 'hi';

  const benchmark = useMemo(
    () => computeLocalPricingBenchmark(category, form.productName, form.price),
    [category, form.productName, form.price]
  );

  const steps = useMemo(
    () => [
      {
        key: 'name',
        title: isHindi ? '1. कारीगर का नाम' : '1. Artisan Name',
        prompt: isHindi
          ? 'नमस्ते! आपका पूरा नाम क्या है? माइक दबाकर बोलें।'
          : `Namaste! What is your full name? Tap the mic and speak in ${langMeta.name}.`,
        placeholder: isHindi ? 'जैसे: रामप्रसाद शर्मा' : 'e.g. Ramprasad Sharma',
        type: 'text',
      },
      {
        key: 'location',
        title: isHindi ? '2. कार्यशाला / शहर' : '2. Workshop City / Craft Cluster',
        prompt: isHindi
          ? 'आपकी कार्यशाला किस शहर या राज्य में है?'
          : 'Which city or heritage craft cluster is your workshop located in?',
        placeholder: isHindi ? 'जैसे: वाराणसी, उत्तर प्रदेश' : 'e.g. Varanasi, Uttar Pradesh',
        type: 'text',
      },
      {
        key: 'productName',
        title: isHindi ? '3. शिल्प का नाम' : '3. Craft Name',
        prompt: isHindi
          ? 'आप कौन सा हस्तनिर्मित उत्पाद बेचना चाहते हैं?'
          : 'What handcrafted creation would you like to list today?',
        placeholder: isHindi ? 'जैसे: हाथ से बनी टेराकोटा सुराही' : 'e.g. Hand-Turned Terracotta Water Carafe',
        type: 'text',
      },
      {
        key: 'description',
        title: isHindi ? '4. कहानी, सामग्री व समय' : '4. Craft Story & Materials',
        prompt: isHindi
          ? 'इसे बनाने में कितने दिन लगे और क्या सामग्री लगी? बोलकर बताएं।'
          : 'Tell buyers about the materials, traditional technique, and days taken to craft this.',
        placeholder: isHindi
          ? 'जैसे: इसे बनाने में 7 दिन लगे, शुद्ध मिट्टी और प्राकृतिक रंगों का उपयोग हुआ है'
          : 'e.g. Took 7 days on pit loom with pure mulberry silk and gold zari...',
        type: 'textarea',
      },
      {
        key: 'image',
        title: isHindi ? '5. शिल्प की फोटो' : '5. Craft Photography',
        prompt: isHindi
          ? 'अपने शिल्प की साफ़ फोटो अपलोड करें या नीचे से चुनें।'
          : 'Upload a clear photo of your craft or choose a sample studio image below.',
        type: 'image',
      },
      {
        key: 'price',
        title: isHindi ? '6. सीधा कारीगर मूल्य (₹)' : '6. Fair Direct Artisan Price (₹)',
        prompt: isHindi
          ? `इस श्रेणी का उचित बाज़ार मूल्य लगभग ${benchmark.recommendedFairPrice} रुपये है। आप क्या कीमत रखना चाहते हैं?`
          : `Recommended direct fair price is around ₹${benchmark.recommendedFairPrice}. Speak or enter your desired price in Rupees.`,
        placeholder: String(benchmark.recommendedFairPrice),
        type: 'number',
      },
    ],
    [isHindi, langMeta.name, benchmark.recommendedFairPrice]
  );

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: currentValues?.name || '',
      location: currentValues?.location || '',
      productName: currentValues?.productName || '',
      description: currentValues?.description || '',
      image: currentValues?.image || ATELIER_PRESET_IMAGES[0].url,
      price: currentValues?.price || '',
    });
    setStepIdx(0);
    setErrorMsg('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      return;
    }
    const step = steps[stepIdx];
    if (step) {
      speakText(step.prompt, language);
    }
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, stepIdx, language, steps]);

  if (!isOpen) return null;

  const currentStep = steps[stepIdx];

  const toggleListen = () => {
    if (isListening) {
      try {
        recognizerRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setErrorMsg('Voice recognition requires Chrome or Edge browser. You can still type below.');
      return;
    }

    stopSpeaking();
    setErrorMsg('');
    setInterimText('');
    setIsListening(true);

    const rec = createSpeechRecognizer({
      language,
      onInterim: (txt) => setInterimText(txt),
      onResult: (spoken) => {
        let value = spoken;
        if (currentStep.type === 'number') {
          const digits = spoken.match(/\d+/g);
          if (digits) value = digits.join('');
        }
        setForm((prev) => ({
          ...prev,
          [currentStep.key]:
            currentStep.key === 'description' && prev.description
              ? `${prev.description} ${value}`
              : value,
        }));
        setInterimText('');
      },
      onError: () => {
        setIsListening(false);
        setErrorMsg('Could not capture voice clearly. Please tap the mic again or type directly.');
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    recognizerRef.current = rec;
    try {
      rec?.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickAiStory = async () => {
    setEnhancing(true);
    const res = await enhanceCraftStory({
      rawNotes: form.description,
      productName: form.productName,
      category,
      artisanName: form.name,
      location: form.location,
      targetLanguageName: 'English',
    });
    if (res?.data?.enhancedDescription) {
      setForm((prev) => ({ ...prev, description: res.data.enhancedDescription }));
    }
    setEnhancing(false);
  };

  const handleFinish = () => {
    stopSpeaking();
    onComplete(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
      <div className="parchment-card rounded-3xl max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="indigo-glass px-6 py-4 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b54426] flex items-center justify-center shadow">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold">
                Voice Listing Guide ({langMeta.nativeName})
              </h2>
              <p className="text-[11px] text-[#f7f1e3]/75">
                Step {stepIdx + 1} of {steps.length} • Speak naturally in {langMeta.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1.5 bg-[#ede1ca]">
          <div
            className="h-full bg-gradient-to-r from-[#b54426] to-[#c88d28] transition-all duration-300"
            style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#b54426]">
                {currentStep.title}
              </span>
              <p className="text-sm sm:text-base font-bold text-[#2c1d13] mt-1 leading-snug">
                {currentStep.prompt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => speakText(currentStep.prompt, language)}
              title="Repeat audio prompt"
              className="p-2.5 rounded-xl bg-[#1b365d]/10 hover:bg-[#1b365d]/20 text-[#1b365d] shrink-0 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Mic Button (for text/textarea/number steps) */}
          {currentStep.type !== 'image' && (
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                type="button"
                onClick={toggleListen}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition cursor-pointer ${
                  isListening
                    ? 'bg-[#b54426] animate-mic-pulse scale-105'
                    : 'bg-gradient-to-br from-[#1b365d] to-[#2b528c] hover:scale-105'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className="text-xs font-bold text-[#6d4f38]">
                {isListening
                  ? `Listening in ${langMeta.nativeName}... Tap to stop`
                  : `Tap Microphone to Speak (${langMeta.nativeName})`}
              </span>
              {interimText && (
                <p className="text-xs italic text-[#b54426] bg-white/80 px-3 py-1 rounded-full">
                  “{interimText}...”
                </p>
              )}
            </div>
          )}

          {/* Input Field */}
          {currentStep.type === 'text' && (
            <input
              type="text"
              value={form[currentStep.key]}
              onChange={(e) => setForm({ ...form, [currentStep.key]: e.target.value })}
              placeholder={currentStep.placeholder}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/95 border border-[#c88d28]/35 text-sm font-semibold text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
            />
          )}

          {currentStep.type === 'textarea' && (
            <div className="space-y-2.5">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={currentStep.placeholder}
                className="w-full px-4 py-3 rounded-2xl bg-white/95 border border-[#c88d28]/35 text-sm text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
              />
              <button
                type="button"
                onClick={handleQuickAiStory}
                disabled={enhancing}
                className="btn-indigo inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                {enhancing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-[#f0c76e]" />}
                <span>{enhancing ? 'Refining with AI...' : 'Polish Spoken Notes with AI'}</span>
              </button>
            </div>
          )}

          {currentStep.type === 'number' && (
            <div className="space-y-3">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder={currentStep.placeholder}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/95 border border-[#c88d28]/35 text-lg font-extrabold text-[#1b365d] focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
              />
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
                  Fair Direct Benchmark: <strong>₹{benchmark.recommendedFairPrice.toLocaleString('en-IN')}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, price: String(benchmark.recommendedFairPrice) })}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Use Fair Price
                </button>
              </div>
            </div>
          )}

          {currentStep.type === 'image' && (
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden border border-[#c88d28]/35 h-44 bg-black/10">
                <img src={form.image} alt="Selected craft" className="w-full h-full object-cover" />
              </div>

              <label className="btn-indigo w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-[#f0c76e]" />
                <span>Upload Photo from Device</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              <div className="grid grid-cols-5 gap-2">
                {ATELIER_PRESET_IMAGES.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => setForm({ ...form, image: p.url })}
                    className={`rounded-xl overflow-hidden border-2 h-14 cursor-pointer ${
                      form.image === p.url ? 'border-[#b54426] scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-semibold text-[#b54426] bg-[#b54426]/10 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer Nav */}
        <div className="px-6 py-4 bg-[#efe4cf]/85 border-t border-[#c88d28]/25 flex items-center justify-between">
          <button
            type="button"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#c88d28]/30 text-xs font-bold text-[#6d4f38] disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {stepIdx < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
              className="btn-terracotta inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn-terracotta inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Fill Craft Form</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
