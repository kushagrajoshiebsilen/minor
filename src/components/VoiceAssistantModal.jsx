import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, CheckCircle, ArrowRight, ArrowLeft, 
  X, Sparkles, RefreshCw, AlertCircle, TrendingUp, BarChart3, 
  Upload, Image as ImageIcon, Wand2, Check
} from 'lucide-react';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechUtils';
import { getMarketBenchmark } from '../data/marketPriceData';
import { samplePresetImages } from '../data/initialProducts';
import { analyzeDescription, generateProfessionalDescription } from '../utils/descriptionAnalyzer';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  language = 'hi',
  category = 'Pottery & Clay',
  onComplete,
  currentValues = {}
}) {
  if (!isOpen) return null;

  const isHindi = language === 'hi';

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: currentValues.name || '',
    location: currentValues.location || '',
    productName: currentValues.productName || '',
    rawDescription: currentValues.description || '',
    image: currentValues.image || samplePresetImages[0].url,
    price: currentValues.price || ''
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [customImageFileName, setCustomImageFileName] = useState('');
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [enhancedFeedback, setEnhancedFeedback] = useState(false);

  const recognizerRef = useRef(null);

  // Compute market benchmark for the current product
  const benchmark = useMemo(() => {
    return getMarketBenchmark(category, formData.productName || '');
  }, [category, formData.productName]);

  // Real-time analysis for description step
  const descAnalysis = useMemo(() => {
    return analyzeDescription(formData.rawDescription, formData.productName, category);
  }, [formData.rawDescription, formData.productName, category]);

  // Steps definition including Image step and Description Enhancer
  const steps = useMemo(() => {
    return [
      {
        key: 'name',
        label: isHindi ? '1. कारीगर का नाम' : '1. Artisan Name',
        question: isHindi 
          ? 'नमस्ते! आपका नाम क्या है? कृपया बोलकर बताएं।' 
          : 'Hello! What is your full name? Please speak now.',
        hint: isHindi ? 'उदा: "रामप्रसाद शर्मा"' : 'e.g. "Ramprasad Sharma"',
        inputType: 'text'
      },
      {
        key: 'location',
        label: isHindi ? '2. स्थान / कार्यशाला' : '2. Workshop Location',
        question: isHindi 
          ? 'आपकी कार्यशाला या शहर कौन सा है?' 
          : 'Where is your workshop or city located?',
        hint: isHindi ? 'उदा: "वाराणसी, उत्तर प्रदेश"' : 'e.g. "Varanasi, Uttar Pradesh"',
        inputType: 'text'
      },
      {
        key: 'productName',
        label: isHindi ? '3. उत्पाद का नाम' : '3. Product Name',
        question: isHindi 
          ? 'आप कौन सा हस्तनिर्मित उत्पाद बेचना चाहते हैं?' 
          : 'What handcrafted item would you like to list?',
        hint: isHindi ? 'उदा: "हाथ से बनी टेराकोटा सुराही"' : 'e.g. "Handcrafted Terracotta Clay Carafe"',
        inputType: 'text'
      },
      {
        key: 'rawDescription',
        label: isHindi ? '4. कहानी व एआई सुधारक' : '4. Craft Story & AI Enhancer',
        question: isHindi 
          ? 'इसे बनाने में कितने दिन लगे, और क्या सामग्री का उपयोग हुआ?' 
          : 'How many days did it take to make, and what materials were used?',
        hint: isHindi ? 'उदा: "इसे बनाने में 7 दिन लगे, शुद्ध मिट्टी और प्राकृतिक रंगों का प्रयोग हुआ है"' : 'e.g. "Took 7 days, made with pure clay and natural dyes"',
        inputType: 'textarea',
        isDescStep: true
      },
      {
        key: 'image',
        label: isHindi ? '5. उत्पाद की फोटो' : '5. Product Image',
        question: isHindi 
          ? 'कृपया अपने उत्पाद की एक साफ़ फोटो अपलोड करें या नीचे दिए गए नमूनों में से चुनें।' 
          : 'Please upload a clear photo of your craft or pick from the sample presets below.',
        hint: isHindi ? 'फोटो चुनें या अपलोड करें' : 'Select or upload photo',
        inputType: 'image',
        isImageStep: true
      },
      {
        key: 'price',
        label: isHindi ? '6. मूल्य तुलना व सुझाव' : '6. Price Benchmark & Suggestion',
        question: isHindi 
          ? `बाज़ार में ${formData.productName || 'इस तरह के उत्पाद'} का औसत मूल्य ₹${benchmark.avgPrice} और अधिकतम ₹${benchmark.maxPrice} है। हमारा सुझाव है कि आप ₹${benchmark.recommendedFairPrice} रखें। आप इसकी क्या कीमत रखना चाहते हैं?` 
          : `In the market, ${formData.productName || 'this craft'} averages ₹${benchmark.avgPrice} and reaches up to ₹${benchmark.maxPrice}. We recommend a fair artisan price of ₹${benchmark.recommendedFairPrice}. What price would you like to set?`,
        hint: isHindi ? `अनुशंसित: ₹${benchmark.recommendedFairPrice}` : `Suggested: ₹${benchmark.recommendedFairPrice}`,
        inputType: 'number',
        isPriceStep: true
      }
    ];
  }, [isHindi, formData.productName, benchmark]);

  const step = steps[currentStepIndex];

  // Speak question automatically when step changes
  useEffect(() => {
    setTranscript(formData[step.key] || '');
    setErrorMessage('');
    
    setIsSpeaking(true);
    speakText(step.question, language, () => {
      setIsSpeaking(false);
      // For non-image steps, start listening
      if (!step.isImageStep) {
        startListening();
      }
    });

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [currentStepIndex, step.question]);

  const handleSpeakQuestion = () => {
    setIsSpeaking(true);
    speakText(step.question, language, () => {
      setIsSpeaking(false);
    });
  };

  const startListening = () => {
    setErrorMessage('');
    if (!isSpeechRecognitionSupported()) {
      setErrorMessage(
        isHindi 
          ? 'माइक्रोफ़ोन पहचान समर्थित नहीं है। आप नीचे लिख सकते हैं।' 
          : 'Microphone recognition is not supported in this browser. You can type below.'
      );
      return;
    }

    try {
      stopListening();
      const recognizer = createSpeechRecognizer({
        language,
        onResult: (spokenText) => {
          let cleanText = spokenText;
          if (step.inputType === 'number') {
            const numbers = spokenText.match(/\d+/g);
            if (numbers) {
              cleanText = numbers.join('');
            }
          }
          setTranscript(cleanText);
          setFormData((prev) => ({ ...prev, [step.key]: cleanText }));
        },
        onEnd: () => {
          setIsListening(false);
        },
        onError: () => {
          setIsListening(false);
        }
      });

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  // Handle local image file upload inside modal
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 1-Click AI Description Enhancer inside Voice Assistant Modal
  const handleEnhanceDescriptionInModal = () => {
    setIsEnhancingDesc(true);
    setTimeout(() => {
      const professionalCopy = generateProfessionalDescription(
        descAnalysis,
        formData.productName,
        category,
        language
      );
      setTranscript(professionalCopy);
      setFormData((prev) => ({ ...prev, rawDescription: professionalCopy }));
      setIsEnhancingDesc(false);
      setEnhancedFeedback(true);
      setTimeout(() => setEnhancedFeedback(false), 3000);
    }, 400);
  };

  const handleNext = () => {
    stopSpeaking();
    stopListening();

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete(formData);
      onClose();
    }
  };

  const handleBack = () => {
    stopSpeaking();
    stopListening();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSelectSuggestedPrice = (amount) => {
    stopListening();
    const val = String(amount);
    setTranscript(val);
    setFormData((prev) => ({ ...prev, price: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[94vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'बोलकर फॉर्म भरें (आवाज़ सहायक)' : 'Voice Assistant Guided Flow'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHindi 
                  ? 'सुनें, बोलें, फोटो चुनें — टाइप करने की कोई ज़रूरत नहीं!' 
                  : 'Listen, speak & pick photos — no typing required!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              stopListening();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-amber-50 px-6 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900 font-bold">
          <span>
            {isHindi ? `कदम ${currentStepIndex + 1} / ${steps.length}` : `Step ${currentStepIndex + 1} of ${steps.length}`}
          </span>
          <span className="truncate max-w-[200px]">{step.label}</span>
        </div>

        {/* Body Area */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 text-center">
          
          {/* Audio Question Box with Speaker Button */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 relative text-left">
            <button
              type="button"
              onClick={handleSpeakQuestion}
              className={`absolute top-3 right-3 p-2 rounded-xl transition cursor-pointer ${
                isSpeaking ? 'bg-amber-600 text-white animate-bounce' : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-300'
              }`}
              title="Click to replay audio question"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              {isHindi ? 'सहायक आपसे पूछ रहा है:' : 'Assistant is asking:'}
            </span>
            <p className="text-sm sm:text-base font-bold text-stone-900 font-serif leading-relaxed pr-8">
              "{step.question}"
            </p>
          </div>

          {/* 🌟 STEP 4: DESCRIPTION ENHANCER OPTION INSIDE VOICE FORM */}
          {step.isDescStep && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-left space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-amber-700" />
                  {isHindi ? 'एआई विवरण सुधारक (AI Description Enhancer):' : 'AI Description Enhancer:'}
                </span>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                  {descAnalysis.qualityScore}% Complete
                </span>
              </div>

              {/* Detected attributes chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                  ⏳ {descAnalysis.time || (isHindi ? 'समय: (उदा. 7 दिन)' : 'Time not detected')}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                  🧵 {descAnalysis.materials.length > 0 ? descAnalysis.materials[0] : (isHindi ? 'सामग्री' : 'Material')}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                  🎨 {descAnalysis.techniques.length > 0 ? descAnalysis.techniques[0] : (isHindi ? 'तकनीक' : 'Technique')}
                </span>
              </div>

              {/* 1-Click AI Enhance Button */}
              <button
                type="button"
                onClick={handleEnhanceDescriptionInModal}
                disabled={isEnhancingDesc || !formData.rawDescription}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isEnhancingDesc ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isHindi ? 'सुधारा जा रहा है...' : 'Synthesizing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isHindi ? '✨ बोले गए शब्दों को पेशेवर विवरण बनाएं' : '✨ Enhance Into Professional Copy'}</span>
                  </>
                )}
              </button>

              {enhancedFeedback && (
                <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {isHindi ? 'विवरण को पेशेवर व औपचारिक बना दिया गया है!' : 'Description enhanced to professional copy!'}
                </p>
              )}
            </div>
          )}

          {/* 🌟 STEP 5: INSERT IMAGE STEP (DEVICE UPLOAD OR 1-TAP PRESET) */}
          {step.isImageStep && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-700" />
                  {isHindi ? 'उत्पाद की फोटो चुनें / अपलोड करें:' : 'Choose or Upload Craft Photo:'}
                </span>
                {customImageFileName && (
                  <span className="text-[10px] text-stone-500 font-medium truncate max-w-[150px]">
                    📎 {customImageFileName}
                  </span>
                )}
              </div>

              {/* Preview of chosen image */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md shrink-0 bg-stone-200">
                  <img src={formData.image} alt="Selected Craft" className="w-full h-full object-cover" />
                </div>

                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white border border-stone-300 hover:border-amber-600 text-stone-800 text-xs font-bold shadow-xs cursor-pointer transition">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>{customImageFileName ? (isHindi ? 'फोटो बदलें' : 'Change Photo') : (isHindi ? 'डिवाइस / कैमरे से फोटो अपलोड करें' : 'Upload from Device / Camera')}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-stone-400">
                    {isHindi ? 'या नीचे दिए गए नमूनों में से एक पर टैप करें:' : 'Or tap one of our handicraft presets below:'}
                  </p>
                </div>
              </div>

              {/* 1-Tap Preset Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {samplePresetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: preset.url }));
                      setCustomImageFileName('');
                    }}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      formData.image === preset.url
                        ? 'border-orange-600 ring-2 ring-orange-500/30 scale-105 shadow-sm'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                    title={preset.title}
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 🌟 STEP 6: PROACTIVE MARKET PRICE COMPARISON & CHIPS */}
          {step.isPriceStep && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 text-left space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-700" />
                  {isHindi ? 'बाज़ार भाव तुलना (Market Comparison):' : 'Market Price Benchmark:'}
                </span>
                <span className="text-[11px] text-emerald-700">
                  {isHindi ? `औसत: ₹${benchmark.avgPrice} • अधिकतम: ₹${benchmark.maxPrice}` : `Avg: ₹${benchmark.avgPrice} • Max: ₹${benchmark.maxPrice}`}
                </span>
              </div>

              {/* Quick Select Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedPrice(benchmark.recommendedFairPrice)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    formData.price === String(benchmark.recommendedFairPrice)
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500'
                      : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>⭐ {isHindi ? `सुझाया गया: ₹${benchmark.recommendedFairPrice}` : `Suggested: ₹${benchmark.recommendedFairPrice}`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSuggestedPrice(benchmark.avgPrice)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.price === String(benchmark.avgPrice)
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <span>{isHindi ? `बाज़ार औसत: ₹${benchmark.avgPrice}` : `Market Avg: ₹${benchmark.avgPrice}`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSuggestedPrice(benchmark.maxPrice)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.price === String(benchmark.maxPrice)
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <span>{isHindi ? `प्रीमियम: ₹${benchmark.maxPrice}` : `Premium: ₹${benchmark.maxPrice}`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Large Microphone Action Button (Hidden on Image step) */}
          {!step.isImageStep && (
            <div className="flex flex-col items-center justify-center py-1">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white scale-110 ring-8 ring-red-200'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white hover:scale-105 shadow-orange-500/30'
                }`}
              >
                {isListening ? (
                  <div className="flex flex-col items-center">
                    <MicOff className="w-8 h-8" />
                    <span className="text-[9px] font-bold uppercase mt-0.5">सुन रहे हैं...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Mic className="w-8 h-8" />
                    <span className="text-[9px] font-bold uppercase mt-0.5">बोलें</span>
                  </div>
                )}

                {isListening && (
                  <span className="absolute -inset-2 rounded-full border-2 border-red-400 animate-ping opacity-75" />
                )}
              </button>

              <span className="text-xs font-semibold text-stone-500 mt-2">
                {isListening 
                  ? (isHindi ? '🎙️ अब बोलें, आपकी आवाज़ सुनी जा रही है...' : '🎙️ Listening... please speak now')
                  : (isHindi ? 'माइक दबाएं और बोलें' : 'Tap mic to speak your answer')}
              </span>
            </div>
          )}

          {/* Recognized Text / Transcript Preview (for text/number fields) */}
          {!step.isImageStep && (
            <div className="text-left space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                {isHindi ? 'पहचाने गए शब्द / उत्तर:' : 'Recognized Answer / Value:'}
              </label>
              <div className="relative">
                {step.inputType === 'textarea' ? (
                  <textarea
                    rows={2}
                    value={transcript}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                      setFormData((prev) => ({ ...prev, [step.key]: e.target.value }));
                    }}
                    placeholder={step.hint}
                    className="w-full p-3 text-sm font-semibold rounded-2xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <input
                    type={step.inputType}
                    value={transcript}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                      setFormData((prev) => ({ ...prev, [step.key]: e.target.value }));
                    }}
                    placeholder={step.hint}
                    className="w-full p-3 text-sm font-semibold rounded-2xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>
              {errorMessage && (
                <p className="text-xs text-amber-700 font-medium mt-1">
                  ⚠️ {errorMessage}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-5 sm:p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'पिछला' : 'Back'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>
              {currentStepIndex === steps.length - 1
                ? (isHindi ? 'फॉर्म में भरें ✓' : 'Save to Form ✓')
                : (isHindi ? 'अगला कदम' : 'Next Step')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
