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
  ChevronRight,
  AlertCircle,
  Plus,
  Search,
  TrendingUp,
  Edit3,
  Clock,
  ShieldCheck,
  FileText,
  PhoneCall,
  HelpCircle,
  Check,
  X,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageMeta, getTranslations, getArtisanTranslations } from '../i18n/languages';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';
import { inspectCraftImage } from '../ai/aiService';

export default function EditorialArtisanFlow({
  artisanProfile,
  onProfileUpdate,
  language = 'en',
  setLanguage,
  onPublishCraft,
  onLogout,
  onSwitchToBuyer,
}) {
  const t = getTranslations(language);
  const artisanT = getArtisanTranslations(language);
  const langMeta = getLanguageMeta(language);

  // Active navigation tab on the left sidebar: 'dashboard' | 'listings' | 'orders' | 'earnings' | 'profile' | 'support' | 'settings'
  const [activeNav, setActiveNav] = useState('dashboard');

  // Stage of the flow: 'view' (standard dashboard screens) | 'questions' (AI voice listing interview) | 'processing' | 'review' | 'matches'
  const [stage, setStage] = useState('view');

  // Conversational questions state for "+ Add Product"
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [voiceAnswers, setVoiceAnswers] = useState({
    languageChoice: '',
    name: '',
    materials: '',
    duration: '',
    price: '',
  });

  // Photo state
  const [capturedPhoto, setCapturedPhoto] = useState(
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  );

  // Speech & Waveform
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [micError, setMicError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
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

  // Listings State matching dashboard-screens.jpg
  const [listings, setListings] = useState([
    {
      id: 1,
      title: 'Terracotta Pot',
      price: 850,
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      category: 'Pottery',
    },
    {
      id: 2,
      title: 'Carved Wooden Elephant',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      category: 'Woodcraft',
    },
    {
      id: 3,
      title: 'Blue Ceramic Bowls',
      price: 1100,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      category: 'Ceramics',
    },
    {
      id: 4,
      title: 'Kantha Textile Shawl',
      price: 950,
      image: 'https://images.unsplash.com/photo-1606744888344-493238955de0?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      category: 'Textiles',
    },
  ]);

  // Listings Filter & Search
  const [listingFilter, setListingFilter] = useState('All'); // 'All' | 'Active' | 'Paused' | 'Draft'
  const [listingSearch, setListingSearch] = useState('');

  // Orders State matching dashboard-screens.jpg
  const [ordersFilter, setOrdersFilter] = useState('All'); // 'All' | 'Pending' | 'Shipped' | 'Delivered'
  const [orders] = useState([
    {
      id: '#KB2457',
      items: 2,
      amount: 1800,
      status: 'Pending',
      time: '2h ago',
      icon: '🏺',
    },
    {
      id: '#KB2456',
      items: 1,
      amount: 1200,
      status: 'Shipped',
      time: '4h ago',
      icon: '🐘',
    },
    {
      id: '#KB2455',
      items: 3,
      amount: 2650,
      status: 'Delivered',
      time: '1d ago',
      icon: '🥣',
    },
    {
      id: '#KB2454',
      items: 1,
      amount: 950,
      status: 'Delivered',
      time: '1d ago',
      icon: '🧣',
    },
  ]);

  // Profile State matching dashboard-screens.jpg
  const [profileData, setProfileData] = useState({
    shopName: 'CraftsByYou',
    contactNumber: '+91 98765 43210',
    location: 'Indore, Madhya Pradesh',
    gstNumber: '27ABCDE1234F1Z5',
    joinedOn: '12 Mar 2025',
    totalListings: 12,
    avatar: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=400&q=80',
    tagline: 'Tradition in every creation ✨',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Support FAQs state
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  // Questions definitions (Dynamically localized)
  const questions = [
    {
      id: 'languageChoice',
      title: artisanT.q0Title || 'Choose Language',
      prompt: t.q0Prompt || 'Namaste! Which language would you like to speak in today?',
      desc: t.q0Desc || 'e.g. Hindi, Gujarati, Tamil, Bengali, Marathi, or English',
      key: 'languageChoice',
      isLanguageStep: true,
      todoLabel: artisanT.todoStep1 || 'Tell me about your product',
    },
    {
      id: 'name',
      title: artisanT.q1Title || 'Craft Name',
      prompt: t.q1Prompt || 'What is the name of your handcrafted creation?',
      desc: t.q1Desc || 'e.g. Hand-turned Terracotta Surahi or Pure Katan Silk Dupatta',
      key: 'name',
      todoLabel: artisanT.todoStep1 || 'Tell me about your product',
    },
    {
      id: 'materials',
      title: artisanT.q2Title || 'Materials & Methods',
      prompt: t.q2Prompt || 'Which materials and traditional tools did you use?',
      desc: t.q2Desc || 'e.g. Riverbed red clay, pit loom, botanical dyes, or seasoned rosewood',
      key: 'materials',
      todoLabel: artisanT.todoStep2 || 'Add product details',
    },
    {
      id: 'image',
      title: artisanT.q3Title || 'Photo Upload',
      prompt:
        language === 'hi'
          ? 'कृपया अपने हस्तशिल्प की एक साफ़ फोटो अपलोड करें या खींचें।'
          : language === 'mr'
          ? 'कृपया तुमच्या हस्तकलेचा एक स्पष्ट फोटो अपलोड करा किंवा काढा.'
          : 'Please snap or upload a clear photo of your craft creation.',
      desc:
        language === 'hi'
          ? 'हमारा AI आपकी फोटो को साफ़ कर स्टूडियो जैसा बना देगा।'
          : language === 'mr'
          ? 'आमचे AI तुमच्या फोटोला स्वच्छ करून स्टुडिओसारखा बनवेल.'
          : 'Our AI cleans and lights your photo automatically.',
      key: 'image',
      isImageStep: true,
      todoLabel: artisanT.todoStep3 || 'Add product images',
    },
    {
      id: 'price',
      title: artisanT.q4Title || 'Set Price',
      prompt: t.q4Prompt || 'What direct payout price in Rupees would you like to receive?',
      desc: t.q4Desc || 'e.g. 850 rupees, 1800 rupees, or 3200 rupees',
      key: 'price',
      todoLabel: artisanT.todoStep4 || 'Set price',
    },
  ];

  const activeQuestion = questions[currentQuestionIdx] || questions[0];

  // Helper to map spoken language
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
      { keys: ['assamese', 'অসমীया'], code: 'as' },
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

  // Dynamic speech bubble response from AI on other pages
  const [contextualAiSpeech, setContextualAiSpeech] = useState('');
  const currentQuestionIdxRef = useRef(0);
  const isAdvancingRef = useRef(false);

  useEffect(() => {
    currentQuestionIdxRef.current = currentQuestionIdx;
  }, [currentQuestionIdx]);

  useEffect(() => {
    setContextualAiSpeech('');
    stopSpeaking();
  }, [activeNav]);

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

  // Speak question and auto-open mic
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

  // Contextual AI Intelligence for other pages (Listings, Orders, Earnings, Profile, Support, Dashboard)
  const handleContextualQuery = (userQuery, currentNav, currentLang) => {
    const q = (userQuery || '').toLowerCase().trim();
    if (!q) return;

    // 1. Language switching check
    if (q.includes('hindi') || q.includes('हिंदी') || q.includes('हिन्दी')) {
      if (setLanguage) setLanguage('hi');
      const response =
        'नमस्ते! अब हम हिंदी में बात करेंगे। आप अपने ऑर्डर, कमाई या नए उत्पाद के बारे में पूछ सकते हैं।';
      setContextualAiSpeech(response);
      speakText(response, 'hi');
      return;
    }
    if (q.includes('english') || q.includes('अंग्रेजी')) {
      if (setLanguage) setLanguage('en');
      const response =
        'Namaste! Switched to English. Ask me anything about your orders, earnings, or craft listings.';
      setContextualAiSpeech(response);
      speakText(response, 'en');
      return;
    }

    // 2. Add product / Start listing check (Only starts questionnaire on explicit request or dashboard)
    if (
      q.includes('add product') ||
      q.includes('new product') ||
      q.includes('naya saman') ||
      q.includes('naya craft') ||
      q.includes('bechna') ||
      q.includes('becho') ||
      q.includes('list product') ||
      q.includes('sell craft') ||
      q.includes('naya product')
    ) {
      const startMsg =
        currentLang === 'hi'
          ? 'नया उत्पाद सूचीकरण शुरू कर रहे हैं। आइए आपकी हस्तकला ऑनलाइन लाएं।'
          : "Starting product listing now. Let's get your handcrafted creation online!";
      setContextualAiSpeech(startMsg);
      speakText(startMsg, currentLang, () => {
        handleStartAddProduct();
      });
      return;
    }

    // 3. Switch to Buyer's POV
    if (
      q.includes('buyer') ||
      q.includes('kharidar') ||
      q.includes('grahak') ||
      q.includes('shop view') ||
      q.includes('customer view')
    ) {
      if (onSwitchToBuyer) {
        const switchMsg =
          currentLang === 'hi'
            ? 'खरीदार दृश्य खोल रहे हैं। यहां आप देख सकते हैं कि ग्राहक आपकी कृतियां कैसे देखते हैं।'
            : "Switching to Buyer's POV. Here you can see how customers browse your crafts.";
        setContextualAiSpeech(switchMsg);
        speakText(switchMsg, currentLang, () => {
          onSwitchToBuyer();
        });
        return;
      }
    }

    // 4. Cross-tab navigation check
    if (q.includes('order') || q.includes('bhejna') || q.includes('dispatch')) {
      if (currentNav !== 'orders') {
        setActiveNav('orders');
        const navMsg =
          currentLang === 'hi'
            ? 'ऑर्डर पृष्ठ खोल रहे हैं। आपके पास 28 कुल ऑर्डर और 5 प्रेषण हेतु लंबित हैं।'
            : 'Opening Orders. You have 28 total orders, with 5 pending dispatch.';
        setContextualAiSpeech(navMsg);
        speakText(navMsg, currentLang);
        return;
      }
    } else if (
      q.includes('earning') ||
      q.includes('kamai') ||
      q.includes('rupaye') ||
      q.includes('payout') ||
      q.includes('bank')
    ) {
      if (currentNav !== 'earnings') {
        setActiveNav('earnings');
        const navMsg =
          currentLang === 'hi'
            ? 'कमाई पृष्ठ खोल रहे हैं। पिछले 30 दिनों में आपकी कमाई ₹24,850 है और ₹3,200 का भुगतान लंबित है।'
            : 'Opening Earnings. Your 30-day earnings are ₹24,850 with ₹3,200 pending payout.';
        setContextualAiSpeech(navMsg);
        speakText(navMsg, currentLang);
        return;
      }
    } else if (
      (q.includes('listing') ||
        q.includes('catalog') ||
        q.includes('inventory') ||
        q.includes('products')) &&
      !q.includes('add')
    ) {
      if (currentNav !== 'listings') {
        setActiveNav('listings');
        const navMsg =
          currentLang === 'hi'
            ? 'आपकी सूचियां खोल रहे हैं। आपकी दुकान में 12 उत्पाद लाइव हैं।'
            : 'Opening your Listings. You have 12 handcrafted creations online.';
        setContextualAiSpeech(navMsg);
        speakText(navMsg, currentLang);
        return;
      }
    } else if (q.includes('profile') || q.includes('dukaan') || q.includes('shop details')) {
      if (currentNav !== 'profile') {
        setActiveNav('profile');
        const navMsg =
          currentLang === 'hi'
            ? 'आपकी दुकान की प्रोफ़ाइल खोल रहे हैं।'
            : 'Opening your shop Profile for CraftsByYou.';
        setContextualAiSpeech(navMsg);
        speakText(navMsg, currentLang);
        return;
      }
    } else if (
      q.includes('support') ||
      q.includes('help') ||
      q.includes('madad') ||
      q.includes('sahayata')
    ) {
      if (currentNav !== 'support') {
        setActiveNav('support');
        const navMsg =
          currentLang === 'hi'
            ? 'सहायता केंद्र खोल रहे हैं। 0% कमीशन और शिपिंग के बारे में पूछें।'
            : 'Opening Support. Ask about 0% commission, shipping, or payout policies.';
        setContextualAiSpeech(navMsg);
        speakText(navMsg, currentLang);
        return;
      }
    } else if (q.includes('dashboard') || q.includes('home') || q.includes('mukhya')) {
      if (currentNav !== 'dashboard') {
        setActiveNav('dashboard');
        const navMsg =
          currentLang === 'hi'
            ? 'डैशबोर्ड पर वापस आ गए हैं। आप आज क्या करना चाहेंगे?'
            : "Welcome back to your Artisan Dashboard! What would you like to do?";
        setContextualAiSpeech(navMsg);
        speakText(navMsg, currentLang);
        return;
      }
    }

    // 5. Intelligent Tab-Specific Responses
    let responseText = '';

    if (currentNav === 'orders') {
      if (
        q.includes('pending') ||
        q.includes('bacha') ||
        q.includes('dispatch') ||
        q.includes('kitna')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'आपके 5 ऑर्डर प्रेषण हेतु लंबित हैं। नवीनतम ऑर्डर #KB2457 है (₹1,800, 2 वस्तुएं), जिसका कूरियर पिकअप आज दोपहर है।'
            : 'You have 5 orders pending dispatch. The next is Order #KB2457 for 2 items worth ₹1,800 scheduled for afternoon pickup.';
      } else if (
        q.includes('courier') ||
        q.includes('pickup') ||
        q.includes('delivery') ||
        q.includes('kab')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'कूरियर पार्टनर आज शाम 3 से 6 बजे के बीच आपके कार्यशाला पते पर आएगा। कृपया कारीगर शिपिंग लेबल चिपकाकर रखें।'
            : 'Courier partner arrives between 3 PM and 6 PM today. Please have the packed parcel ready with the Karigar label.';
      } else if (q.includes('latest') || q.includes('recent') || q.includes('naya')) {
        responseText =
          currentLang === 'hi'
            ? 'आपका नवीनतम ऑर्डर #KB2457 है जो 2 घंटे पहले ₹1,800 का प्राप्त हुआ था। स्थिति: प्रेषण लंबित।'
            : 'Your latest order is #KB2457 for ₹1,800 received 2 hours ago. Status: Pending dispatch.';
      } else {
        responseText =
          currentLang === 'hi'
            ? 'आपके पास कुल 28 ऑर्डर हैं—5 प्रेषण हेतु लंबित, 12 भेजे जा चुके और 11 सफलतापूर्वक डिलीवर हुए हैं।'
            : 'You have 28 total orders: 5 pending dispatch, 12 in transit, and 11 delivered safely to buyers.';
      }
    } else if (currentNav === 'earnings') {
      if (
        q.includes('pending') ||
        q.includes('kab') ||
        q.includes('when') ||
        q.includes('payout') ||
        q.includes('bank')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'आपका ₹3,200 का भुगतान लंबित है। यह राशि हर मंगलवार सुबह बिना किसी कटौती के सीधे आपके बैंक खाते में जमा होती है।'
            : 'You have ₹3,200 pending payout. Direct transfers are processed every Tuesday morning with 0% middleman commission.';
      } else if (q.includes('average') || q.includes('ausat')) {
        responseText =
          currentLang === 'hi'
            ? '28 पूरे किए गए ऑर्डरों में आपका औसत ऑर्डर मूल्य ₹885 है।'
            : 'Your average order value is ₹885 across 28 completed customer orders.';
      } else if (
        q.includes('breakdown') ||
        q.includes('kahan se') ||
        q.includes('sales')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'आपकी 70% कमाई हस्तशिल्प बिक्री से, 20% कार्यशाला बुकिंग से और 10% अन्य से आती है।'
            : '70% of your earnings come from direct craft sales and 20% from traditional artisan workshop bookings.';
      } else {
        responseText =
          currentLang === 'hi'
            ? 'पिछले 30 दिनों में आपकी कुल कमाई ₹24,850 है, जो पिछले महीने से 12% अधिक है। ₹3,200 का भुगतान आगामी मंगलवार को होगा।'
            : 'Your 30-day earnings are ₹24,850 (+12%). Your next pending payout of ₹3,200 will be released on Tuesday.';
      }
    } else if (currentNav === 'listings') {
      if (
        q.includes('best') ||
        q.includes('top') ||
        q.includes('jyada') ||
        q.includes('sabse')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'आपकी दुकान का सबसे लोकप्रिय उत्पाद टेराकोटा सुराही (₹850) है जिसकी 15 इकाइयां बिकी हैं।'
            : 'Your top-selling craft is the Terracotta Heritage Surahi at ₹850 with 15 verified sales.';
      } else if (
        q.includes('edit') ||
        q.includes('price') ||
        q.includes('pause') ||
        q.includes('badle')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'किसी भी उत्पाद कार्ड पर क्लिक करके आप उसका मूल्य, विवरण और तस्वीरें कभी भी बदल सकते हैं।'
            : 'Click on any product card to update its price, edit descriptions, or temporarily pause sales.';
      } else {
        responseText =
          currentLang === 'hi'
            ? 'आपकी दुकान में कुल 12 हस्तशिल्प सूचियां हैं—10 सक्रिय, 1 रुकी हुई और 1 ड्राफ्ट। नया उत्पाद जोड़ने के लिए "+ Add Product" दबाएं।'
            : 'You have 12 listings online: 10 active, 1 paused, and 1 draft. Click "+ Add Product" to list another craft.';
      }
    } else if (currentNav === 'profile') {
      if (q.includes('rating') || q.includes('review') || q.includes('star')) {
        responseText =
          currentLang === 'hi'
            ? 'आपकी दुकान "CraftsByYou" 4.8 स्टार रेटिंग के साथ एक सत्यापित कारीगर विक्रेता है।'
            : 'Your shop "CraftsByYou" holds a verified 4.8 star rating from 36 buyer reviews.';
      } else if (q.includes('gst') || q.includes('tax')) {
        responseText =
          currentLang === 'hi'
            ? 'आपका पंजीकृत जीएसटी नंबर 27ABCDE1234F1Z5 है।'
            : 'Your registered GST number is 27ABCDE1234F1Z5.';
      } else if (
        q.includes('edit') ||
        q.includes('change') ||
        q.includes('phone') ||
        q.includes('address')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'अपनी दुकान का नाम, फ़ोन नंबर या पता बदलने के लिए "Edit Profile" बटन पर क्लिक करें।'
            : 'Click the "Edit Profile" button to update your workshop location, contact phone, or shop story.';
      } else {
        responseText =
          currentLang === 'hi'
            ? 'आपकी दुकान "CraftsByYou" इंदौर, मध्य प्रदेश में पंजीकृत है। सदस्य: मार्च 2025 से। स्थिति: सत्यापित कारीगर।'
            : 'CraftsByYou is registered in Indore, MP. Member since March 2025. Verified artisan seller.';
      }
    } else if (currentNav === 'support') {
      if (
        q.includes('commission') ||
        q.includes('charge') ||
        q.includes('fee') ||
        q.includes('shulk')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'कारीगर बाज़ार 0% कमीशन लेता है। आपकी कला का 100% पूरा मूल्य बिना किसी कटौती के सीधे आपके बैंक में जाता है।'
            : 'KarigarBazaar charges 0% commission. You receive 100% direct payout for every handcrafted creation you sell.';
      } else if (
        q.includes('call') ||
        q.includes('phone') ||
        q.includes('contact') ||
        q.includes('number')
      ) {
        responseText =
          currentLang === 'hi'
            ? 'हमारी कारीगर सहायता हेल्पलाइन 1800-KARIGAR पर कॉल करें या सीधे "Contact Support" पर क्लिक करें।'
            : 'Reach our dedicated artisan helpdesk toll-free at 1800-KARIGAR or tap "Contact Support".';
      } else {
        responseText =
          currentLang === 'hi'
            ? 'मैं आपकी पूरी सहायता कर सकता हूँ। भुगतान, पिकअप या उत्पाद नीति के बारे में कुछ भी पूछें।'
            : "I'm here to assist you with payouts, door-to-door courier pickups, or product guidelines. Ask away!";
      }
    } else {
      // Dashboard default
      responseText =
        currentLang === 'hi'
          ? 'नमस्ते! आपके पास 12 उत्पाद, 28 ऑर्डर और ₹24,850 की कुल कमाई है। नया सामान जोड़ने के लिए "नया सामान जोड़ो" कहें।'
          : "Namaste! You have 12 listings, 28 orders, and ₹24,850 in total earnings. Say 'Add product' to list a new craft.";
    }

    setContextualAiSpeech(responseText);
    speakText(responseText, currentLang);
  };

  // Start speech recognition listening with streaming interim support
  const startListening = (langCode = language, targetIdx = currentQuestionIdxRef.current) => {
    stopSpeaking();
    stopRecording();
    setIsAiSpeaking(false);
    setMicError('');
    setLiveTranscript('');

    if (!isSpeechRecognitionSupported()) {
      setMicError(
        'Speech recognition requires Chrome or Edge browser. You can type your answer below.'
      );
      return;
    }

    try {
      const rec = createSpeechRecognizer({
        language: langCode,
        onInterim: (interimText) => {
          setMicError('');
          setLiveTranscript(interimText);

          // Update text in real time if answering a question
          if (stage === 'questions') {
            const activeIdx = currentQuestionIdxRef.current;
            if (activeIdx > 0 && !questions[activeIdx]?.isImageStep) {
              const targetKey = questions[activeIdx]?.key;
              if (targetKey) {
                setVoiceAnswers((prev) => ({
                  ...prev,
                  [targetKey]: interimText,
                }));
              }
            }
          }
        },
        onResult: (text) => {
          setMicError('');
          const cleanText = text?.trim();
          if (!cleanText) return;
          setLiveTranscript(cleanText);

          // If in view mode, process conversational query for the active tab
          if (stage === 'view') {
            handleContextualQuery(cleanText, activeNav, langCode);
            return;
          }

          // If in Questionnaire mode, advance to next question
          if (stage === 'questions') {
            proceedToNextQuestionWithAnswer(cleanText, currentQuestionIdxRef.current);
          }
        },
        onEnd: () => {
          setIsRecording(false);
          recognizerRef.current = null;
        },
        onError: (err) => {
          console.warn('Mic recognizer error:', err);
          if (err === 'not-allowed') {
            setMicError(
              'Microphone permission blocked. Please allow microphone access in your browser settings.'
            );
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
      console.warn('Speech recognizer init error:', e);
      setIsRecording(false);
    }
  };

  // Proceed to the next question with answer registration
  const proceedToNextQuestionWithAnswer = (spokenAnswer, idx) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    stopRecording();

    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    if (idx === 0) {
      // Step 0: Language selection
      const detected = detectAndApplyLanguage(spokenAnswer) || language;
      const langMetaObj = getLanguageMeta(detected);
      setLanguage(detected);
      setVoiceAnswers((prev) => ({
        ...prev,
        languageChoice: `${langMetaObj.nativeName} (${langMetaObj.name})`,
      }));
      setCurrentQuestionIdx(1);
      currentQuestionIdxRef.current = 1;
      isAdvancingRef.current = false;
      const nextT = getTranslations(detected);
      speakQuestionAndListen(nextT.q1Prompt, detected, 1, true);
    } else if (idx === 1) {
      // Step 1: Craft Name
      const craftName = spokenAnswer || voiceAnswers.name || 'Terracotta Heritage Surahi';
      setVoiceAnswers((prev) => ({ ...prev, name: craftName }));
      setCurrentQuestionIdx(2);
      currentQuestionIdxRef.current = 2;
      isAdvancingRef.current = false;
      const nextT = getTranslations(language);
      speakQuestionAndListen(nextT.q2Prompt, language, 2, true);
    } else if (idx === 2) {
      // Step 2: Materials & Methods
      const mats = spokenAnswer || voiceAnswers.materials || 'Riverbed Clay, Natural Pigments';
      setVoiceAnswers((prev) => ({ ...prev, materials: mats }));
      setCurrentQuestionIdx(3);
      currentQuestionIdxRef.current = 3;
      isAdvancingRef.current = false;
      const photoPrompt =
        language === 'hi'
          ? 'कृपया अपने हस्तशिल्प की एक साफ़ फोटो अपलोड करें या खींचें।'
          : 'Please snap or upload a clear photo of your craft creation.';
      speakQuestionAndListen(photoPrompt, language, 3, false);
    } else if (idx === 3) {
      // Step 3: Photo Upload
      setCurrentQuestionIdx(4);
      currentQuestionIdxRef.current = 4;
      isAdvancingRef.current = false;
      const nextT = getTranslations(language);
      speakQuestionAndListen(nextT.q4Prompt, language, 4, true);
    } else if (idx === 4) {
      // Step 4: Price
      const pr = spokenAnswer || voiceAnswers.price || '850';
      setVoiceAnswers((prev) => ({ ...prev, price: pr }));
      isAdvancingRef.current = false;
      const finishPrompt =
        language === 'hi'
          ? 'बहुत बढ़िया! आपका हस्तशिल्प कैटलॉग तैयार किया जा रहा है।'
          : 'Wonderful! Creating your handcrafted catalogue now.';
      speakText(finishPrompt, language, () => {
        handleStartProcessing();
      });
    }
  };

  // Toggle microphone manually
  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (stage !== 'questions') {
        // Voice conversational query on the active tab
        handlePromptAndListenForTab(activeNav);
      } else {
        startListening(language, currentQuestionIdxRef.current);
      }
    }
  };

  // Prompt and listen for tab queries
  const handlePromptAndListenForTab = (tab) => {
    stopSpeaking();
    stopRecording();
    let promptText = '';
    switch (tab) {
      case 'dashboard':
        promptText = artisanT.aiMascotDashboardPrompt || t.aiMascotDashboardPrompt;
        break;
      case 'listings':
        promptText = artisanT.aiMascotListingsPrompt || t.aiMascotListingsPrompt;
        break;
      case 'orders':
        promptText = artisanT.aiMascotOrdersPrompt || t.aiMascotOrdersPrompt;
        break;
      case 'earnings':
        promptText = artisanT.aiMascotEarningsPrompt || t.aiMascotEarningsPrompt;
        break;
      case 'profile':
        promptText = artisanT.aiMascotProfilePrompt || t.aiMascotProfilePrompt;
        break;
      case 'support':
        promptText = artisanT.aiMascotSupportPrompt || t.aiMascotSupportPrompt;
        break;
      default:
        promptText = artisanT.aiMascotDefaultPrompt || t.aiMascotDefaultPrompt;
    }
    setContextualAiSpeech(promptText);
    speakQuestionAndListen(promptText, language, 0, true);
  };

  // Start the "+ Add Product" voice questionnaire flow (ONLY called for artwork listing)
  const handleStartAddProduct = () => {
    setContextualAiSpeech('');
    setStage('questions');
    setCurrentQuestionIdx(0);
    currentQuestionIdxRef.current = 0;
    isAdvancingRef.current = false;
    speakQuestionAndListen(questions[0].prompt, language, 0, true);
  };

  // Stepper logic
  const handleNextQuestion = () => {
    const currIdx = currentQuestionIdxRef.current;
    const currKey = questions[currIdx]?.key;
    const currentVal = voiceAnswers[currKey] || '';
    proceedToNextQuestionWithAnswer(currentVal, currIdx);
  };

  const handlePrevQuestion = () => {
    stopRecording();
    if (currentQuestionIdx > 0) {
      const prevIdx = currentQuestionIdx - 1;
      setCurrentQuestionIdx(prevIdx);
      currentQuestionIdxRef.current = prevIdx;
      isAdvancingRef.current = false;
      speakQuestionAndListen(
        questions[prevIdx].prompt,
        language,
        prevIdx,
        !questions[prevIdx].isImageStep
      );
    }
  };

  const handleSelectLanguage = (code) => {
    proceedToNextQuestionWithAnswer(code, 0);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCapturedPhoto(uploadEvent.target.result);
        setCurrentQuestionIdx(4);
        currentQuestionIdxRef.current = 4;
        isAdvancingRef.current = false;
        const nextT = getTranslations(language);
        speakQuestionAndListen(nextT.q4Prompt, language, 4, true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Processing Animation & AI Inspection
  const handleStartProcessing = () => {
    stopRecording();
    stopSpeaking();
    setStage('processing');

    checklist.forEach((item, index) => {
      setTimeout(() => {
        setChecklist((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, done: true } : c))
        );
      }, (index + 1) * 700);
    });

    const craftName = voiceAnswers.name || 'Terracotta Heritage Vessel';
    const craftMaterials = voiceAnswers.materials || 'Riverbed Clay, Natural Pigments';
    const spokenPrice = voiceAnswers.price ? parseInt(voiceAnswers.price.replace(/\D/g, ''), 10) : 850;

    inspectCraftImage(capturedPhoto, `${craftName}. Made using: ${craftMaterials}. Direct payout: ₹${spokenPrice}`).then((result) => {
      setReviewTitle(result?.craftName || craftName);
      setReviewDesc(result?.storyText || `Masterfully handcrafted using ${craftMaterials}. Finished with authentic traditional artisanal techniques.`);
      setReviewCategory(result?.craftType || 'Pottery');
      setReviewTags(result?.tags?.join(', ') || 'Terracotta, Hand-turned, Eco-friendly');
      setReviewMaterial(result?.materials?.join(', ') || craftMaterials);
      const minP = result?.suggestedPriceRange?.min || Math.round(spokenPrice * 0.9);
      const maxP = result?.suggestedPriceRange?.max || Math.round(spokenPrice * 1.25);
      setReviewMinPrice(String(minP));
      setReviewMaxPrice(String(maxP));

      setTimeout(() => {
        setStage('review');
      }, 4200);
    });
  };

  // Final Publish Handler
  const handleApprovePublish = () => {
    const newCraft = {
      id: `craft-${Date.now()}`,
      title: reviewTitle || voiceAnswers.name || 'Artisan Creation',
      price: parseInt(reviewMinPrice, 10) || 850,
      image: capturedPhoto,
      status: 'Active',
      category: reviewCategory || 'Handcrafted',
      artisan: profileData.shopName,
      location: profileData.location,
    };

    setListings((prev) => [newCraft, ...prev]);
    if (onPublishCraft) onPublishCraft(newCraft);

    setStage('view');
    setActiveNav('listings');
  };

  // Waveform animation loop
  useEffect(() => {
    let interval;
    if (isRecording || isAiSpeaking) {
      interval = setInterval(() => {
        setWaveformLevels(
          Array.from({ length: 8 }, () => Math.floor(Math.random() * 26) + 6)
        );
      }, 100);
    } else {
      setWaveformLevels([6, 12, 16, 20, 16, 12, 8, 6]);
    }
    return () => clearInterval(interval);
  }, [isRecording, isAiSpeaking]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopRecording();
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Mascot bubble text according to active screen
  const getMascotBubbleText = () => {
    if (stage === 'questions') {
      return activeQuestion.prompt;
    }
    if (contextualAiSpeech) {
      return contextualAiSpeech;
    }
    switch (activeNav) {
      case 'dashboard':
        return artisanT.aiMascotDashboardPrompt || t.aiMascotDashboardPrompt;
      case 'listings':
        return artisanT.aiMascotListingsPrompt || t.aiMascotListingsPrompt;
      case 'orders':
        return artisanT.aiMascotOrdersPrompt || t.aiMascotOrdersPrompt;
      case 'earnings':
        return artisanT.aiMascotEarningsPrompt || t.aiMascotEarningsPrompt;
      case 'profile':
        return artisanT.aiMascotProfilePrompt || t.aiMascotProfilePrompt;
      case 'support':
        return artisanT.aiMascotSupportPrompt || t.aiMascotSupportPrompt;
      default:
        return artisanT.aiMascotDefaultPrompt || t.aiMascotDefaultPrompt;
    }
  };

  // Handle clicking mascot on any screen
  const handleMascotBubbleClick = () => {
    stopSpeaking();
    if (stage === 'questions') {
      speakQuestionAndListen(activeQuestion.prompt, language, currentQuestionIdxRef.current, true);
    } else {
      handlePromptAndListenForTab(activeNav);
    }
  };

  // Filtered Listings
  const filteredListings = listings.filter((item) => {
    const matchesFilter =
      listingFilter === 'All'
        ? true
        : listingFilter === 'Active'
        ? item.status === 'Active'
        : listingFilter === 'Paused'
        ? item.status === 'Paused'
        : item.status === 'Draft';
    const matchesSearch =
      !listingSearch ||
      item.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(listingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    if (ordersFilter === 'All') return true;
    return order.status.toLowerCase() === ordersFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen w-full flex bg-[#F6EFE2] text-[#2C1D13] font-body relative overflow-x-hidden select-none">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR: Standard navigation across 6 views */}
      {/* ============================================================== */}
      <aside className="w-64 bg-[#232018] text-[#F3ECD8] shrink-0 hidden md:flex flex-col justify-between border-r border-[#3E382A] z-20">
        <div className="p-6 space-y-8">
          {/* Logo Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E3B778] flex items-center justify-center text-lg text-[#232018] font-bold shadow-sm">
              🪷
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-[#FAF3E7]">
                Karigar<span className="text-[#E3B778]">Bazaar</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#D8CCA6]/70 uppercase font-mono">
                Artisan Atelier
              </span>
            </div>
          </div>

          {/* Navigation Items (Buttons activate the 6 screens) */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => {
                setStage('view');
                setActiveNav('dashboard');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'dashboard' && stage === 'view'
                  ? 'bg-[#E3B778] text-[#232018] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t.navDashboard}</span>
            </button>

            {/* 2. My Listings */}
            <button
              type="button"
              onClick={() => {
                setStage('view');
                setActiveNav('listings');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'listings' && stage === 'view'
                  ? 'bg-[#E3B778] text-[#232018] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.navMyListings}</span>
            </button>

            {/* 3. Orders */}
            <button
              type="button"
              onClick={() => {
                setStage('view');
                setActiveNav('orders');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'orders' && stage === 'view'
                  ? 'bg-[#E3B778] text-[#232018] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.navOrders}</span>
            </button>

            {/* 4. Earnings */}
            <button
              type="button"
              onClick={() => {
                setStage('view');
                setActiveNav('earnings');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'earnings' && stage === 'view'
                  ? 'bg-[#E3B778] text-[#232018] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>{t.navEarnings}</span>
            </button>

            {/* 5. Profile */}
            <button
              type="button"
              onClick={() => {
                setStage('view');
                setActiveNav('profile');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'profile' && stage === 'view'
                  ? 'bg-[#E3B778] text-[#232018] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.navProfile}</span>
            </button>

            {/* 6. Support */}
            <button
              type="button"
              onClick={() => {
                setStage('view');
                setActiveNav('support');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'support' && stage === 'view'
                  ? 'bg-[#E3B778] text-[#232018] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>{t.navSupport}</span>
            </button>

            {/* 7. Settings */}
            <button
              type="button"
              onClick={() => {
                setStage('view');
                setActiveNav('profile');
                setIsEditingProfile(true);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition cursor-pointer text-left ${
                activeNav === 'settings'
                  ? 'bg-[#E3B778] text-[#232018] font-bold shadow-md'
                  : 'text-[#E0D7C5] hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.navSettings}</span>
            </button>

            {/* Switch to Buyer's POV in Sidebar */}
            {onSwitchToBuyer && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSwitchToBuyer}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-full border border-[#E3B778]/60 bg-[#E3B778]/10 text-[#E3B778] hover:bg-[#E3B778] hover:text-[#232018] text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{artisanT.buyersPov || t.buyersPov || "Buyer's POV"}</span>
                  </span>
                  <span>→</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Elephant Motif */}
        <div className="p-6 pt-4 border-t border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐘</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#E3B778]">{artisanT.heritageGuild || t.heritageGuild || 'Heritage Guild'}</span>
              <span className="text-[11px] text-[#D8CCA6]/75">{artisanT.directPayout100 || t.directPayout100 || '100% Direct Payout'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN CENTER CONTENT & RIGHT AI MASCOT WORKSPACE */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="w-full px-6 md:px-8 py-4 flex items-center justify-between border-b border-[#E8DCBE] bg-[#F7F1E5]/70 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <div className="flex md:hidden items-center gap-2">
              <span className="text-xl">🪷</span>
              <span className="font-display font-bold text-sm">KarigarBazaar</span>
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-[#8B6E4E] uppercase tracking-wider">
              {activeNav === 'dashboard'
                ? t.artisanDashboardTitle
                : activeNav === 'listings'
                ? t.navMyListings
                : activeNav === 'orders'
                ? t.navOrders
                : activeNav === 'earnings'
                ? t.navEarnings
                : activeNav === 'profile'
                ? t.navProfile
                : t.navSupport}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Pill */}
            {setLanguage && (
              <div className="relative group">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full bg-white/80 border border-[#DECDB3] text-[11px] font-bold text-[#2C1D13] hover:border-[#B5532A] cursor-pointer"
                >
                  🌐 {langMeta.nativeName}
                </button>
                <div className="hidden group-hover:flex flex-col absolute right-0 top-full mt-1 bg-white border border-[#DECDB3] rounded-xl p-1 shadow-lg z-30 min-w-[120px] max-h-48 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      className={`px-2 py-1 text-left text-xs rounded transition ${
                        language === l.code ? 'bg-[#B5532A] text-white font-bold' : 'hover:bg-[#FAF3E7]'
                      }`}
                    >
                      {l.nativeName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Switch to Buyer's POV Button */}
            {onSwitchToBuyer && (
              <button
                type="button"
                onClick={onSwitchToBuyer}
                className="px-3.5 py-1.5 rounded-full bg-[#E3B778] hover:bg-[#D9A441] text-[#2C1D13] font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Switch to Buyer's Point of View"
              >
                <Eye className="w-3.5 h-3.5 text-[#B5532A]" />
                <span>{artisanT.switchToBuyersPov || t.switchToBuyersPov || "Switch to Buyer's POV →"}</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-1.5 text-[#4A3B2C] hover:text-[#B5532A] cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B5532A]" />
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E8DCBE]">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#C68345]">
                <img
                  src={profileData.avatar}
                  alt={profileData.shopName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#2C1D13] leading-tight">
                  {profileData.shopName}
                </span>
                <span className="text-[10px] text-[#7A6752]">
                  {profileData.location}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold text-[#8B6E4E] hover:text-[#B5532A] pl-2 border-l border-[#E8DCBE] cursor-pointer"
              >
                {t.logoutBtn}
              </button>
            )}
          </div>
        </header>

        {/* Workspace Body: 2 Columns (Main Screen Content on Left + Mascot on Right) */}
        <main className="flex-1 p-6 md:p-8 flex flex-col xl:flex-row gap-8 items-start">
          {/* ============================================================ */}
          {/* LEFT AREA: Displays the specific active screen */}
          {/* ============================================================ */}
          <div className="flex-1 w-full space-y-6">
            {/* ---------------------------------------------------------- */}
            {/* SCREEN 1: DASHBOARD (activeNav === 'dashboard' && stage === 'view') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'view' && activeNav === 'dashboard' && (
              <div className="space-y-6">
                {/* Greeting Title */}
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1D13] tracking-tight">
                    {artisanT.welcomeBackArtisan || t.welcomeBackArtisan || 'Welcome back, Artisan!'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6E5843] mt-1 font-medium">
                    {artisanT.welcomeBackSub || t.welcomeBackSub || "Let's get your products online and reach more buyers."}
                  </p>
                </div>

                {/* 4 Stats Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* Total Listings */}
                  <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#F4ECE1] flex items-center justify-center text-[#B5532A]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-xl sm:text-2xl font-bold text-[#2C1D13]">
                        {listings.length}
                      </div>
                      <div className="text-[11px] text-[#7A6752] font-semibold">
                        {t.totalListings}
                      </div>
                    </div>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F3EB] flex items-center justify-center text-[#3B7A57]">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-xl sm:text-2xl font-bold text-[#2C1D13]">
                        28
                      </div>
                      <div className="text-[11px] text-[#7A6752] font-semibold">
                        {t.orders}
                      </div>
                    </div>
                  </div>

                  {/* Total Earnings */}
                  <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF0DC] flex items-center justify-center text-[#D9A441]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-xl sm:text-2xl font-bold text-[#2C1D13]">
                        ₹24,850
                      </div>
                      <div className="text-[11px] text-[#7A6752] font-semibold">
                        {t.totalEarnings}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FDF3E7] flex items-center justify-center text-[#C68345]">
                      <span className="text-lg">★</span>
                    </div>
                    <div>
                      <div className="font-display text-xl sm:text-2xl font-bold text-[#C68345]">
                        4.8
                      </div>
                      <div className="text-[11px] text-[#7A6752] font-semibold">
                        {t.rating}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main 2-Column Section: Your Listings (3 items) on left, Quick Actions on right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Your Listings (8 cols) */}
                  <div className="lg:col-span-8 bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌿</span>
                        <h3 className="font-display text-base font-bold text-[#2C1D13]">
                          {artisanT.yourListings || t.yourListings || 'Your Listings'}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveNav('listings')}
                        className="text-xs font-bold text-[#B5532A] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{artisanT.viewAll || t.viewAll || 'View All →'}</span>
                      </button>
                    </div>

                    {/* 3 Listing Cards */}
                    <div className="grid grid-cols-3 gap-3.5">
                      {listings.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl overflow-hidden border border-[#EADBBE] bg-white shadow-2xs group hover:shadow-md transition"
                        >
                          <div className="h-32 sm:h-36 w-full overflow-hidden bg-[#FAF4E9]">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <div className="p-2.5 space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3EB] text-[#3B7A57]">
                              {item.status === 'Active' ? (artisanT.activeBadge || 'Active') : item.status}
                            </span>
                            <div className="text-xs font-bold text-[#2C1D13] truncate">
                              {item.title}
                            </div>
                            <div className="text-xs font-semibold text-[#8B6E4E]">
                              ₹{item.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Quick Actions (4 cols) */}
                  <div className="lg:col-span-4 bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3B2C]">
                      <span>⚡</span>
                      <span>{t.quickActions}</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Action 1: Add a Product */}
                      <button
                        type="button"
                        onClick={handleStartAddProduct}
                        className="w-full bg-[#B5532A] hover:bg-[#973F1C] text-white py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition shadow-xs cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          <span>{t.addAProduct}</span>
                        </span>
                        <span>→</span>
                      </button>

                      {/* Action 2: View Analytics */}
                      <button
                        type="button"
                        onClick={() => setActiveNav('earnings')}
                        className="w-full bg-white hover:bg-[#FAF3E7] border border-[#DECDB3] text-[#2C1D13] py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#D9A441]" />
                          <span>{t.viewAnalyticsBtn}</span>
                        </span>
                        <span>→</span>
                      </button>

                      {/* Action 3: Check Orders */}
                      <button
                        type="button"
                        onClick={() => setActiveNav('orders')}
                        className="w-full bg-white hover:bg-[#FAF3E7] border border-[#DECDB3] text-[#2C1D13] py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#8B6E4E]" />
                          <span>{artisanT.checkOrdersBtn || t.checkOrdersBtn || 'Check Orders'}</span>
                        </span>
                        <span>→</span>
                      </button>

                      {/* Action 4: Switch to Buyer's POV */}
                      {onSwitchToBuyer && (
                        <button
                          type="button"
                          onClick={onSwitchToBuyer}
                          className="w-full bg-[#FAF4E9] hover:bg-[#F3E7D3] border border-[#DECDB3] text-[#2C1D13] py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[#B5532A]" />
                            <span>{artisanT.viewBuyersBazaarBtn || t.viewBuyersBazaarBtn || "View Buyer's Bazaar"}</span>
                          </span>
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* SCREEN 2: MY LISTINGS (activeNav === 'listings' && stage === 'view') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'view' && activeNav === 'listings' && (
              <div className="space-y-5">
                {/* Header with + Add Product button */}
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13]">
                    {t.navMyListings}
                  </h1>
                  <button
                    type="button"
                    onClick={handleStartAddProduct}
                    className="bg-[#B5532A] hover:bg-[#973F1C] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition transform hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ {t.addAProduct}</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-[#8B6E4E] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    placeholder={artisanT.searchProductsPlaceholder || t.searchProductsPlaceholder || 'Search your products...'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECDB3] bg-white text-xs text-[#2C1D13] placeholder-[#8A7969] focus:border-[#B5532A] focus:outline-none"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-[#EADBBE] pb-2 text-xs font-bold">
                  {['All', 'Active', 'Paused', 'Draft'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setListingFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        listingFilter === tab
                          ? 'bg-[#2E2C22] text-white shadow-xs'
                          : 'text-[#6E5843] hover:bg-black/5'
                      }`}
                    >
                      {tab === 'All'
                        ? `All (${listings.length})`
                        : tab === 'Active'
                        ? `Active (${listings.filter((l) => l.status === 'Active').length})`
                        : tab === 'Paused'
                        ? 'Paused (1)'
                        : 'Draft (1)'}
                    </button>
                  ))}
                </div>

                {/* 4 Product Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {filteredListings.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl overflow-hidden border border-[#DECDB3] bg-white shadow-2xs group hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="h-44 sm:h-48 w-full overflow-hidden bg-[#FAF4E9] relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-[#2C1D13] shadow-xs hover:bg-[#B5532A] hover:text-white transition cursor-pointer"
                        >
                          •••
                        </button>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-sm text-[#2C1D13]">
                            ₹{item.price}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3EB] text-[#3B7A57]">
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#2C1D13] truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#7A6752]">
                          {item.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* SCREEN 3: ORDERS (activeNav === 'orders' && stage === 'view') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'view' && activeNav === 'orders' && (
              <div className="space-y-5">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13]">
                  {t.navOrders}
                </h1>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-[#EADBBE] pb-2 text-xs font-bold">
                  {['All', 'Pending', 'Shipped', 'Delivered'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setOrdersFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        ordersFilter === tab
                          ? 'bg-[#2E2C22] text-white shadow-xs'
                          : 'text-[#6E5843] hover:bg-black/5'
                      }`}
                    >
                      {tab === 'All'
                        ? 'All Orders (28)'
                        : tab === 'Pending'
                        ? 'Pending (5)'
                        : tab === 'Shipped'
                        ? 'Shipped (12)'
                        : 'Delivered (11)'}
                    </button>
                  ))}
                </div>

                {/* Orders List Rows */}
                <div className="space-y-2.5">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-[#EADBBE] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 hover:border-[#B5532A] transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F7F0E3] flex items-center justify-center text-lg">
                          {order.icon}
                        </div>
                        <div>
                          <div className="font-display text-xs sm:text-sm font-bold text-[#2C1D13]">
                            Order {order.id}
                          </div>
                          <div className="text-[11px] text-[#7A6752]">
                            {order.items} {order.items > 1 ? 'items' : 'item'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-display text-sm font-bold text-[#2C1D13]">
                          ₹{order.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#8B6E4E]">{order.time}</div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.status === 'Pending'
                            ? 'bg-[#FCE8DC] text-[#B5532A]'
                            : order.status === 'Shipped'
                            ? 'bg-[#E0F2FE] text-[#0369A1]'
                            : 'bg-[#E8F3EB] text-[#3B7A57]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* SCREEN 4: EARNINGS (activeNav === 'earnings' && stage === 'view') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'view' && activeNav === 'earnings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13]">
                    {t.navEarnings}
                  </h1>
                  <div className="bg-white border border-[#DECDB3] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#4A3B2C] shadow-2xs">
                    Last 30 Days ▾
                  </div>
                </div>

                {/* Total Earnings Card with Green Trendline */}
                <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-[#7A6752]">
                        {t.totalEarnings}
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="font-display text-3xl sm:text-4xl font-bold text-[#2C1D13]">
                          ₹24,850
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F3EB] text-[#3B7A57] flex items-center gap-0.5">
                          ↑ 12%
                        </span>
                      </div>
                    </div>

                    {/* Smooth Green SVG Line Chart */}
                    <div className="w-full sm:w-64 h-16">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 240 60">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path
                          d="M 0 50 Q 30 45, 60 48 T 120 30 T 180 20 T 240 8 L 240 60 L 0 60 Z"
                          fill="url(#chartGrad)"
                        />
                        {/* Stroke */}
                        <path
                          d="M 0 50 Q 30 45, 60 48 T 120 30 T 180 20 T 240 8"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="240" cy="8" r="4" fill="#22C55E" />
                      </svg>
                    </div>
                  </div>

                  {/* 3 Sub-metrics row */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F0E4CD]">
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-[#7A6752] font-semibold flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-[#8B6E4E]" />
                        <span>Completed Orders</span>
                      </div>
                      <div className="font-display text-lg font-bold text-[#2C1D13]">
                        28
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[11px] text-[#7A6752] font-semibold flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-[#D9A441]" />
                        <span>Avg Order Value</span>
                      </div>
                      <div className="font-display text-lg font-bold text-[#2C1D13]">
                        ₹885
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[11px] text-[#7A6752] font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#3B7A57]" />
                        <span>Pending Payout</span>
                      </div>
                      <div className="font-display text-lg font-bold text-[#3B7A57]">
                        ₹3,200
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom 2 Cards: Donut Chart Breakdown + Recent Transactions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Earnings Breakdown with Donut Chart */}
                  <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-5 shadow-xs space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#2C1D13]">
                      Earnings Breakdown
                    </h3>

                    <div className="flex items-center gap-6">
                      {/* SVG Donut Chart */}
                      <div className="w-24 h-24 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke="#E8DCBE"
                            strokeWidth="3.5"
                          />
                          {/* 70% Product Sales */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke="#B5532A"
                            strokeWidth="3.5"
                            strokeDasharray="70 30"
                            strokeDashoffset="0"
                          />
                          {/* 20% Workshop */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke="#D9A441"
                            strokeWidth="3.5"
                            strokeDasharray="20 80"
                            strokeDashoffset="-70"
                          />
                          {/* 10% Other */}
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke="#3B7A57"
                            strokeWidth="3.5"
                            strokeDasharray="10 90"
                            strokeDashoffset="-90"
                          />
                        </svg>
                      </div>

                      {/* Legend */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#B5532A]" />
                          <span className="font-semibold text-[#2C1D13]">Product Sales</span>
                          <span className="text-[#7A6752]">70%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]" />
                          <span className="font-semibold text-[#2C1D13]">Workshop Orders</span>
                          <span className="text-[#7A6752]">20%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3B7A57]" />
                          <span className="font-semibold text-[#2C1D13]">Other</span>
                          <span className="text-[#7A6752]">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold text-[#2C1D13]">
                        Recent Transactions
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveNav('orders')}
                        className="text-xs font-bold text-[#B5532A] hover:underline cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EADBBE]">
                        <div>
                          <span className="font-bold text-[#2C1D13]">Order #KB2457</span>
                          <span className="text-[10px] text-[#7A6752] ml-2">2h ago</span>
                        </div>
                        <span className="font-bold text-[#3B7A57]">+ ₹885</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EADBBE]">
                        <div>
                          <span className="font-bold text-[#2C1D13]">Order #KB2456</span>
                          <span className="text-[10px] text-[#7A6752] ml-2">4h ago</span>
                        </div>
                        <span className="font-bold text-[#3B7A57]">+ ₹1,200</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EADBBE]">
                        <div>
                          <span className="font-bold text-[#2C1D13]">Order #KB2455</span>
                          <span className="text-[10px] text-[#7A6752] ml-2">1d ago</span>
                        </div>
                        <span className="font-bold text-[#3B7A57]">+ ₹650</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* SCREEN 5: PROFILE (activeNav === 'profile' && stage === 'view') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'view' && activeNav === 'profile' && (
              <div className="space-y-6">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13]">
                  {t.navProfile}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left: Avatar Card (5 cols) */}
                  <div className="md:col-span-5 bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-6 shadow-xs flex flex-col items-center text-center space-y-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#C68345] shadow-md">
                      <img
                        src={profileData.avatar}
                        alt={profileData.shopName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-[#2C1D13]">
                        {profileData.shopName}
                      </h3>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F3EB] text-[#3B7A57] text-[11px] font-bold mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Seller</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#7A6752] italic max-w-xs">
                      "{profileData.tagline}"
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="mt-2 px-4 py-2 rounded-xl border border-[#DECDB3] bg-white hover:bg-[#FAF4E9] text-xs font-bold text-[#2C1D13] flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#B5532A]" />
                      <span>{isEditingProfile ? 'Done Editing' : 'Edit Profile'}</span>
                    </button>
                  </div>

                  {/* Right: Shop Details & Store Stats (7 cols) */}
                  <div className="md:col-span-7 bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-6 shadow-xs space-y-5">
                    {/* Shop Details */}
                    <div className="space-y-3">
                      <h4 className="font-display text-sm font-bold text-[#2C1D13] border-b border-[#F0E4CD] pb-1.5">
                        Shop Details
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#7A6752]">Shop Name</span>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileData.shopName}
                              onChange={(e) =>
                                setProfileData({ ...profileData, shopName: e.target.value })
                              }
                              className="px-2 py-1 rounded border border-[#DECDB3] text-right font-bold text-[#2C1D13]"
                            />
                          ) : (
                            <span className="font-bold text-[#2C1D13]">
                              {profileData.shopName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#7A6752]">Contact Number</span>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileData.contactNumber}
                              onChange={(e) =>
                                setProfileData({ ...profileData, contactNumber: e.target.value })
                              }
                              className="px-2 py-1 rounded border border-[#DECDB3] text-right font-bold text-[#2C1D13]"
                            />
                          ) : (
                            <span className="font-bold text-[#2C1D13]">
                              {profileData.contactNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#7A6752]">Location</span>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) =>
                                setProfileData({ ...profileData, location: e.target.value })
                              }
                              className="px-2 py-1 rounded border border-[#DECDB3] text-right font-bold text-[#2C1D13]"
                            />
                          ) : (
                            <span className="font-bold text-[#2C1D13]">
                              {profileData.location}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#7A6752]">GST Number</span>
                          <span className="font-bold font-mono text-[#2C1D13]">
                            {profileData.gstNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Store Stats */}
                    <div className="space-y-3 pt-2">
                      <h4 className="font-display text-sm font-bold text-[#2C1D13] border-b border-[#F0E4CD] pb-1.5">
                        Store Stats
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#7A6752]">Joined On</span>
                          <span className="font-bold text-[#2C1D13]">{profileData.joinedOn}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#7A6752]">Total Listings</span>
                          <span className="font-bold text-[#2C1D13]">
                            {listings.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* SCREEN 6: SUPPORT (activeNav === 'support' && stage === 'view') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'view' && activeNav === 'support' && (
              <div className="space-y-6">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13]">
                  {t.navSupport}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left: Frequently Asked Questions (7 cols) */}
                  <div className="md:col-span-7 bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-5 shadow-xs space-y-3">
                    <h3 className="font-display text-sm font-bold text-[#2C1D13]">
                      Frequently Asked Questions
                    </h3>

                    <div className="space-y-2 text-xs">
                      {[
                        {
                          q: 'How do I add a new product?',
                          a: "Click '+ Add Product' or speak directly to the AI assistant to list your handcrafted creations in under two minutes with voice guidance.",
                        },
                        {
                          q: 'When will I receive my earnings?',
                          a: 'Payouts are automatically transferred directly into your verified bank account every Tuesday with 100% direct payout and 0% middleman commission.',
                        },
                        {
                          q: 'How to track my order?',
                          a: 'Navigate to the Orders tab in your dashboard to view live delivery status, courier pickups, and customer confirmations.',
                        },
                        {
                          q: 'What are the seller charges?',
                          a: 'KarigarBazaar is a 100% direct artisan marketplace with 0% commission. You keep 100% of your listed craft price.',
                        },
                      ].map((faq, idx) => (
                        <div
                          key={idx}
                          className="border border-[#EADBBE] rounded-xl overflow-hidden bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(openFaqIdx === idx ? -1 : idx)}
                            className="w-full p-3 flex items-center justify-between font-bold text-[#2C1D13] hover:bg-[#FAF4E9] text-left transition cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <HelpCircle className="w-3.5 h-3.5 text-[#B5532A]" />
                              <span>{faq.q}</span>
                            </span>
                            <span className="text-xs">{openFaqIdx === idx ? '▲' : '▼'}</span>
                          </button>
                          {(openFaqIdx === idx || openFaqIdx === -2) && (
                            <div className="p-3 pt-0 text-[11px] text-[#6E5843] border-t border-[#F0E4CD] leading-relaxed bg-[#FAF4E9]/40">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 text-right">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(openFaqIdx === -2 ? 0 : -2)}
                        className="text-xs font-bold text-[#B5532A] hover:underline cursor-pointer"
                      >
                        {openFaqIdx === -2
                          ? (language === 'hi' ? 'संक्षेप में देखें' : 'Collapse FAQs')
                          : (language === 'hi' ? 'सभी प्रश्न देखें →' : 'View All FAQs →')}
                      </button>
                    </div>
                  </div>

                  {/* Right: Need More Help? (5 cols) */}
                  <div className="md:col-span-5 bg-[#FFFDF9] border border-[#EADBBE] rounded-2xl p-5 shadow-xs space-y-3">
                    <h3 className="font-display text-sm font-bold text-[#2C1D13]">
                      Need More Help?
                    </h3>

                    <div className="space-y-2.5">
                      {/* Action 1: Talk to AI */}
                      <button
                        type="button"
                        onClick={() => {
                          const helpPrompt =
                            language === 'hi'
                              ? 'नमस्ते! मैं आपकी क्या सहायता कर सकता हूँ? आप नए उत्पाद जोड़ने या ऑर्डर के बारे में पूछ सकते हैं।'
                              : 'Hello! How can I help you today? You can ask about listing new products, orders, or earnings.';
                          speakQuestionAndListen(helpPrompt, language, currentQuestionIdx, true);
                        }}
                        className="w-full p-3 rounded-xl border border-[#DECDB3] bg-white hover:bg-[#FAF4E9] flex items-center gap-3 transition text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#FCE8DC] flex items-center justify-center text-[#B5532A]">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#2C1D13]">
                            Talk to AI Assistant
                          </div>
                          <div className="text-[10px] text-[#7A6752]">Ask anything, anytime</div>
                        </div>
                      </button>

                      {/* Action 2: Contact Support */}
                      <button
                        type="button"
                        onClick={() => {
                          speakText(
                            language === 'hi'
                              ? 'हमारी कारीगर सहायता टीम से संपर्क करने के लिए 1800-KARIGAR पर कॉल करें।'
                              : 'Our artisan support team is available toll-free at 1800-KARIGAR.',
                            language
                          );
                        }}
                        className="w-full p-3 rounded-xl border border-[#DECDB3] bg-white hover:bg-[#FAF4E9] flex items-center gap-3 transition text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#E8F3EB] flex items-center justify-center text-[#3B7A57]">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#2C1D13]">
                            Contact Support
                          </div>
                          <div className="text-[10px] text-[#7A6752]">Get in touch with our team</div>
                        </div>
                      </button>

                      {/* Action 3: Raise a Ticket */}
                      <button
                        type="button"
                        onClick={() => {
                          alert(
                            language === 'hi'
                              ? 'सपोर्ट टिकट #TKT-8849 दर्ज कर लिया गया है। 2 घंटे में समाधान होगा।'
                              : 'Support Ticket #TKT-8849 logged. Resolution expected within 2 hours.'
                          );
                        }}
                        className="w-full p-3 rounded-xl border border-[#DECDB3] bg-white hover:bg-[#FAF4E9] flex items-center gap-3 transition text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#FAF0DC] flex items-center justify-center text-[#D9A441]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#2C1D13]">
                            Raise a Ticket
                          </div>
                          <div className="text-[10px] text-[#7A6752]">For detailed help</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* STAGE: AI VOICE QUESTIONNAIRE (stage === 'questions') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'questions' && (
              <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-[#F0E4CD] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B5532A] animate-ping" />
                    <h2 className="font-display text-xl font-bold text-[#2C1D13]">
                      {language === 'hi' ? 'AI वॉयस उत्पाद सूचीकरण' : 'AI Voice Product Listing'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      stopRecording();
                      setStage('view');
                    }}
                    className="text-xs font-bold text-[#7A6752] hover:text-[#B5532A] cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    <span>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#8B6E4E]">
                    <span>
                      {t.questionCounter} {currentQuestionIdx + 1} {t.ofCounter} {questions.length}
                    </span>
                    <span>{activeQuestion.title}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EADBBE]/50 overflow-hidden">
                    <div
                      className="h-full bg-[#B5532A] transition-all duration-300 rounded-full"
                      style={{
                        width: `${((currentQuestionIdx + 1) / questions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-[#2C1D13]">
                    {activeQuestion.prompt}
                  </h3>
                  <p className="text-xs text-[#7A6752] italic">{activeQuestion.desc}</p>
                </div>

                {/* Step specific UI */}
                {activeQuestion.isLanguageStep && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                          language === l.code
                            ? 'bg-[#B5532A] text-white border-[#B5532A] shadow-xs'
                            : 'bg-white text-[#2C1D13] border-[#DECDB3] hover:border-[#B5532A]'
                        }`}
                      >
                        {l.nativeName} ({l.name})
                      </button>
                    ))}
                  </div>
                )}

                {activeQuestion.isImageStep && (
                  <div className="space-y-3 pt-2">
                    <label className="w-full py-3 px-4 rounded-xl border border-dashed border-[#B5532A] bg-[#FFF8F3] text-xs font-bold text-[#B5532A] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FCE8DC] transition">
                      <Camera className="w-4 h-4" />
                      <span>{t.choosePhotoBtn}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="h-44 rounded-xl overflow-hidden border border-[#DECDB3] bg-[#FAF4E9]">
                      <img
                        src={capturedPhoto}
                        alt="Craft preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {!activeQuestion.isImageStep && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={voiceAnswers[activeQuestion.key] || ''}
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
                      }}
                      placeholder={
                        isAiSpeaking
                          ? t.aiSpeakingText
                          : isRecording
                          ? t.listeningActive
                          : t.enterAnswerPlaceholder
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#DECDB3] bg-white text-sm text-[#2C1D13] placeholder-[#8A7969] focus:border-[#B5532A] focus:outline-none"
                    />
                  </div>
                )}

                {micError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{micError}</span>
                  </div>
                )}

                {/* Navigation Next/Prev */}
                <div className="flex items-center justify-between pt-4 border-t border-[#F0E4CD]">
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
                    className="bg-[#B5532A] hover:bg-[#973F1C] text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    {currentQuestionIdx < questions.length - 1 ? t.nextQuestionBtn : t.finishListingBtn}
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* STAGE: AI PROCESSING (stage === 'processing') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'processing' && (
              <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-3xl p-8 shadow-md text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#B5532A]/10 border-2 border-[#B5532A] flex items-center justify-center mx-auto text-2xl text-[#B5532A] animate-spin">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#2C1D13]">
                    {language === 'hi'
                      ? 'AI द्वारा कैटलॉग तैयार किया जा रहा है...'
                      : 'AI is Preparing Your Heritage Listing...'}
                  </h3>
                  <p className="text-xs text-[#7A6752] mt-1">
                    {language === 'hi'
                      ? 'हम आपकी फोटो साफ़ कर रहे हैं और विवरण लिख रहे हैं।'
                      : 'Refining workbench lighting, translating dialect, and checking benchmark rates.'}
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 text-left">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                        item.done
                          ? 'bg-[#E8F3EB] border-[#A3D9B5] text-[#1E5631]'
                          : 'bg-white border-[#EADBBE] text-[#7A6752]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3B7A57]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#D9A441] animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* STAGE: REVIEW LISTING (stage === 'review') */}
            {/* ---------------------------------------------------------- */}
            {stage === 'review' && (
              <div className="bg-[#FFFDF9] border border-[#EADBBE] rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
                <div className="border-b border-[#F0E4CD] pb-3">
                  <h2 className="font-display text-2xl font-bold text-[#2C1D13]">
                    {t.reviewTitle}
                  </h2>
                  <p className="text-xs text-[#7A6752]">{t.reviewDesc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-5 space-y-3">
                    <div className="h-56 rounded-2xl overflow-hidden border border-[#DECDB3]">
                      <img
                        src={capturedPhoto}
                        alt="Craft"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF4E9] border border-[#DECDB3] text-xs space-y-1">
                      <div className="font-bold text-[#2C1D13]">AI Studio Cleaning</div>
                      <div className="text-[11px] text-[#7A6752]">
                        Natural workbench shadow refined with authentic studio illumination.
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-[#2C1D13] block mb-1">
                        {t.productName}
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DECDB3] bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#2C1D13] block mb-1">
                        {t.craftStory}
                      </label>
                      <textarea
                        rows={3}
                        value={reviewDesc}
                        onChange={(e) => setReviewDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DECDB3] bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#2C1D13] block mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={reviewCategory}
                          onChange={(e) => setReviewCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DECDB3] bg-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#2C1D13] block mb-1">
                          Direct Payout (₹)
                        </label>
                        <input
                          type="number"
                          value={reviewMinPrice}
                          onChange={(e) => setReviewMinPrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#DECDB3] bg-white font-bold text-[#B5532A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0E4CD]">
                  <button
                    type="button"
                    onClick={() => setStage('view')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6752] hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApprovePublish}
                    className="bg-[#B5532A] hover:bg-[#973F1C] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
                  >
                    {t.approveAndFindBuyers} →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: AI Mascot Floating Sphere & Waveform */}
          {/* Present across all screens matching dashboard-screens.jpg */}
          {/* ============================================================ */}
          <div className="w-full xl:w-72 shrink-0 flex flex-col items-center space-y-4">
            {/* Contextual Speech Bubble */}
            <div
              onClick={handleMascotBubbleClick}
              className="w-full max-w-xs bg-white border border-[#EADBBE] rounded-2xl p-4 shadow-sm text-center relative cursor-pointer hover:border-[#B5532A] transition transform hover:scale-[1.02]"
              title="Click mascot to listen or speak"
            >
              <p className="text-xs font-bold text-[#2C1D13] leading-snug">
                {getMascotBubbleText()}
              </p>
              {isAiSpeaking && (
                <span className="text-[10px] text-[#B5532A] font-semibold block mt-1 animate-pulse">
                  🔊 {t.aiSpeakingText}
                </span>
              )}
              {/* Speech bubble pointer */}
              <div className="w-3 h-3 bg-white border-b border-r border-[#EADBBE] transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
            </div>

            {/* Glowing Aura Ring & Friendly Mascot Head */}
            <div className="relative w-44 h-44 flex items-center justify-center my-1">
              {/* Outer Golden Mandala Sunburst Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E3B778] animate-spin-slow opacity-60" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#E3B778]/30 via-[#C68345]/20 to-transparent blur-md" />

              {/* Robot Sphere */}
              <div
                onClick={handleMascotBubbleClick}
                className="relative w-32 h-32 rounded-full bg-[#18120C] border-3 border-[#D9A441] shadow-xl flex items-center justify-center cursor-pointer transition transform hover:scale-105 group"
                title="Click for voice assistance"
              >
                {/* Glowing Cyan Curved Happy Eyes */}
                <div className="flex items-center gap-5">
                  <div className="w-4 h-2 rounded-t-full border-t-3 border-l-2 border-r-2 border-[#54E2FF] shadow-[0_0_10px_#54E2FF] animate-pulse" />
                  <div className="w-4 h-2 rounded-t-full border-t-3 border-l-2 border-r-2 border-[#54E2FF] shadow-[0_0_10px_#54E2FF] animate-pulse" />
                </div>

                {/* Warm blushing cheeks */}
                <div className="absolute bottom-9 flex items-center gap-11">
                  <div className="w-2 h-1 rounded-full bg-[#FF7F50]/60 blur-[1px]" />
                  <div className="w-2 h-1 rounded-full bg-[#FF7F50]/60 blur-[1px]" />
                </div>
              </div>
            </div>

            {/* Waveform Visualization Capsule */}
            <div className="w-full max-w-xs bg-white/90 backdrop-blur-xs border border-[#DECDB3] rounded-2xl p-4 shadow-sm flex flex-col items-center space-y-2.5">
              <div className="h-7 flex items-center gap-1.5 justify-center w-full">
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

              <span className="text-[11px] font-semibold text-[#7A6752]">
                {isAiSpeaking
                  ? t.aiSpeakingText
                  : isRecording
                  ? t.listeningActive
                  : t.tapToSpeak}
              </span>

              {/* Terracotta Microphone Action Trigger */}
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition transform hover:scale-105 cursor-pointer ${
                  isRecording
                    ? 'bg-[#B5532A] ring-4 ring-[#B5532A]/30 animate-pulse'
                    : isAiSpeaking
                    ? 'bg-[#D9A441] ring-4 ring-[#D9A441]/30'
                    : 'bg-[#B5532A] hover:bg-[#973F1C]'
                }`}
                title={t.tapToSpeak}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Live Streaming Transcript Pill */}
              {isRecording && (
                <div className="w-full bg-[#FFF8F3] border border-[#B5532A]/30 rounded-xl px-2.5 py-1.5 text-center text-[11px] text-[#2C1D13] animate-pulse">
                  <span className="font-bold text-[#B5532A]">🎙️ {artisanT.hearingYou || t.hearingYou || 'Hearing you:'} </span>
                  <span className="font-semibold italic">"{liveTranscript || 'Listening... speak now'}"</span>
                </div>
              )}

              {micError && (
                <div className="w-full p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 flex items-center gap-1.5 text-left">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{micError}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
