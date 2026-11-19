import React, { useState } from 'react';
import { Store, User, Smartphone, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageMeta } from '../i18n/languages';
import { speakText, stopSpeaking } from '../utils/speechEngine';

export default function EditorialLoginPage({
  onLoginSuccess,
  onNavigateHome,
  language = 'en',
  setLanguage,
  phone = '',
  setPhone,
  artisanProfile,
  onProfileUpdate,
}) {
  const langMeta = getLanguageMeta(language);

  // 'seller' | 'buyer'
  const [role, setRole] = useState('seller');

  // Form Fields
  const [mobileNumber, setMobileNumber] = useState(phone || '9876543210');
  const [password, setPassword] = useState('karigar2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  // Exactly ONE Mascot Voice Guidance
  const handleMascotHelp = () => {
    stopSpeaking();
    const promptText =
      language === 'hi'
        ? 'नमस्ते! कारीगर बाज़ार में लॉगिन करने के लिए अपना मोबाइल नंबर और पासवर्ड दर्ज करें, या गूगल से जारी रखें। आप विक्रेता या खरीदार चुन सकते हैं।'
        : 'Namaste! To login to KarigarBazaar, enter your mobile number and password, or continue with Google. You can choose between Seller and Buyer login.';
    speakText(promptText, language);
  };

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    const clean = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError(
        language === 'hi'
          ? 'कृपया वैध 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    if (password.length < 4) {
      setError(
        language === 'hi'
          ? 'कृपया कम से कम 4 अक्षरों का पासवर्ड दर्ज करें।'
          : 'Please enter a password with at least 4 characters.'
      );
      return;
    }

    setIsSubmitting(true);
    setPhone(clean);

    setTimeout(() => {
      setIsSubmitting(false);
      if (role === 'seller') {
        onProfileUpdate({
          name: artisanProfile?.name || 'Sitadevi Paswan',
          location: artisanProfile?.location || 'Jitwarpur, Bihar',
          phone: clean,
        });
        onLoginSuccess('artisan', 'seller');
      } else {
        onLoginSuccess('shop', 'buyer');
      }
    }, 400);
  };

  const handleGoogleLogin = () => {
    setPhone('9876543210');
    if (role === 'seller') {
      onProfileUpdate({
        name: 'Sitadevi Paswan',
        location: 'Jitwarpur, Bihar',
        phone: '9876543210',
      });
      onLoginSuccess('artisan', 'seller');
    } else {
      onLoginSuccess('shop', 'buyer');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-body select-none bg-[#F4EBD9]">
      {/* 
        Clean Artisan Background Artwork:
        Uses the new clean background without any embedded forms, UI, or duplicate text.
        Displays potter, hanging bells, and elephant on the left, with warm open space on the right.
      */}
      <div
        className="absolute inset-0 bg-cover bg-left sm:bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/login-bg-clean.jpg')" }}
        aria-hidden="true"
      />

      {/* Top Floating Mini-Nav for Language Switcher and Return to Home */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-4 pb-2 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-xs font-bold text-[#4A3B2C] hover:text-[#B5532A] flex items-center gap-1.5 transition cursor-pointer bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#DECDB3] shadow-xs"
        >
          <span>←</span>
          <span>{language === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to KarigarBazaar'}</span>
        </button>

        {/* Language selector chip */}
        <div className="flex items-center gap-2">
          {setLanguage && (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-xs border border-[#DECDB3] text-xs font-semibold text-[#2C1D13] hover:border-[#B5532A] transition cursor-pointer shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-[#B5532A]" />
                <span>{langMeta.nativeName}</span>
              </button>
              <div className="hidden group-hover:flex flex-col absolute right-0 top-full mt-1 bg-white border border-[#DECDB3] rounded-xl p-1.5 shadow-xl z-30 min-w-[140px] max-h-52 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1.5 text-xs text-left rounded-lg transition font-medium ${
                      language === l.code
                        ? 'bg-[#B5532A] text-white font-bold'
                        : 'text-[#2C1D13] hover:bg-[#FAF3E7]'
                    }`}
                  >
                    {l.nativeName} ({l.name})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container: Elegant single login card positioned cleanly on the right */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-end z-10 my-auto">
        {/* Open left area for desktop so the potter, bells & elephant in background shine through */}
        <div className="hidden lg:flex flex-1" />

        {/* RIGHT AREA: Single Functional Login Card + Single Floating Mascot */}
        <div className="relative flex items-center justify-center lg:mr-8 xl:mr-16">
          {/* Deckled Edge Parchment Card */}
          <div className="w-[360px] sm:w-[390px] md:w-[410px] bg-[#FFFDF8]/95 sm:bg-[#FFFDF8] backdrop-blur-xs border border-[#DECDB3] rounded-[28px] p-6 sm:p-8 shadow-[0_22px_50px_rgba(50,30,10,0.18)] space-y-4 relative">
            {/* Subtle deckled paper texture top accent line */}
            <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-[#E3B778] to-transparent rounded-full" />

            {/* Exactly ONE Top Brand Emblem & Title */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1.5">
                {/* 8-Petal Lotus Icon */}
                <svg className="w-6 h-6 text-[#B5532A]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C11 4.5 9 7 6 8c3 1 5 3.5 6 6 1-2.5 3-5 6-6-3-1-5-3.5-6-6z" opacity="0.9" />
                  <circle cx="12" cy="12" r="3" fill="#D9A441" />
                  <path d="M12 22c-1-2.5-3-5-6-6 3-1 5-3.5 6-6 1 2.5 3 5 6 6-3 1-5 3.5-6 6z" opacity="0.75" />
                </svg>
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#2C1D13]">
                  Karigar<span className="text-[#B5532A]">Bazaar</span>
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13] tracking-tight pt-1">
                {language === 'hi' ? 'वापसी पर स्वागत है!' : 'Welcome Back!'}
              </h2>
              <p className="text-xs text-[#7A6752]">
                {language === 'hi'
                  ? 'अपनी यात्रा जारी रखने के लिए लॉगिन करें'
                  : 'Login to continue your journey'}
              </p>
            </div>

            {/* Role Switcher Pills: Seller Login vs Buyer Login */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F0E6D5] border border-[#DECDB3]">
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  role === 'seller'
                    ? 'bg-[#2E2C22] text-white shadow-md'
                    : 'text-[#6E5843] hover:text-[#2C1D13]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'विक्रेता लॉगिन' : 'Seller Login'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  role === 'buyer'
                    ? 'bg-[#2E2C22] text-white shadow-md'
                    : 'text-[#6E5843] hover:text-[#2C1D13]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'खरीदार लॉगिन' : 'Buyer Login'}</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-0.5">
              {/* Mobile Number Field */}
              <div className="relative flex items-center">
                <Smartphone className="w-4 h-4 text-[#7A6752] absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={
                    language === 'hi'
                      ? 'अपना मोबाइल नंबर दर्ज करें'
                      : 'Enter your mobile number'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECDB3] bg-[#F7F0E3]/70 text-xs sm:text-sm text-[#2C1D13] placeholder-[#8A7969] focus:border-[#B5532A] focus:outline-none focus:ring-2 focus:ring-[#B5532A]/20 transition"
                />
              </div>

              {/* Password Field with Eye Toggle */}
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#7A6752] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter password'
                  }
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DECDB3] bg-[#F7F0E3]/70 text-xs sm:text-sm text-[#2C1D13] placeholder-[#8A7969] focus:border-[#B5532A] focus:outline-none focus:ring-2 focus:ring-[#B5532A]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#7A6752] hover:text-[#2C1D13] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs text-[#6E5843] pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#B5532A] w-3.5 h-3.5 rounded"
                  />
                  <span>{language === 'hi' ? 'याद रखें' : 'Remember me'}</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-[#B5532A] hover:underline cursor-pointer"
                >
                  {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                </button>
              </div>

              {error && (
                <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Primary Terracotta Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#B84E27] hover:bg-[#9E3E1A] text-white py-2.5 sm:py-3 px-4 rounded-full text-sm font-bold shadow-md transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>
                  {isSubmitting
                    ? 'Logging in...'
                    : `${language === 'hi' ? 'लॉगिन' : 'Login'} →`}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-[#E8DCBE] w-full" />
              <span className="bg-[#FFFDF8] px-3 text-xs text-[#8A7969] uppercase font-semibold">
                or
              </span>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-[#FAF4E9] border border-[#DECDB3] text-[#2C1D13] py-2.5 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{language === 'hi' ? 'Google से जारी रखें' : 'Continue with Google'}</span>
            </button>

            {/* Footer Registration prompt */}
            <div className="text-center text-xs text-[#7A6752] pt-0.5">
              <span>{language === 'hi' ? 'खाता नहीं है? ' : "Don't have an account? "}</span>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="text-[#B5532A] font-bold hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'यहां रजिस्टर करें' : 'Register here'}
              </button>
            </div>
          </div>

          {/* Exactly ONE Floating AI Assistant Mascot on the right */}
          <div className="hidden lg:flex flex-col items-center absolute -right-24 xl:-right-28 top-1/2 -translate-y-1/2 z-20 space-y-2">
            {/* Speech bubble */}
            <div
              onClick={handleMascotHelp}
              className="bg-white/95 border border-[#DECDB3] rounded-2xl px-3.5 py-2 shadow-lg text-center text-[11px] font-bold text-[#2C1D13] whitespace-nowrap relative cursor-pointer hover:border-[#B5532A] transition transform hover:scale-105"
            >
              <span>{language === 'hi' ? 'मदद चाहिए?' : 'Need help?'}</span>
              <br />
              <span className="font-normal text-[#7A6752]">
                {language === 'hi' ? 'बस पूछिए!' : 'Just ask!'}
              </span>
              {/* bubble pointer pointing down/left */}
              <div className="w-2.5 h-2.5 bg-white border-b border-r border-[#DECDB3] transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            </div>

            {/* Glowing Mascot Head Sphere */}
            <div
              onClick={handleMascotHelp}
              className="relative w-20 h-20 rounded-full bg-[#18120C] border-2 border-[#D9A441] shadow-[0_0_25px_rgba(217,164,65,0.4)] flex items-center justify-center cursor-pointer transition transform hover:scale-110 group"
              title="Click for voice guidance"
            >
              {/* Radiant Solar Aura Ring */}
              <div className="absolute -inset-2 rounded-full border border-dashed border-[#E3B778] animate-spin-slow opacity-60" />
              <div className="absolute -inset-1 rounded-full bg-[#E3B778]/25 blur-xs" />

              {/* Expressive Curved Cyan Glowing Eyes */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-3.5 h-2 rounded-t-full border-t-3 border-l border-r border-[#54E2FF] shadow-[0_0_10px_#54E2FF] animate-pulse" />
                <div className="w-3.5 h-2 rounded-t-full border-t-3 border-l border-r border-[#54E2FF] shadow-[0_0_10px_#54E2FF] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#DECDB3] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-display text-xl font-bold text-[#2C1D13]">
              {language === 'hi' ? 'पासवर्ड रीसेट करें' : 'Reset Password'}
            </h3>
            <p className="text-xs text-[#7A6752]">
              {forgotOtpSent
                ? language === 'hi'
                  ? 'आपके पंजीकृत मोबाइल नंबर पर 4 अंकों का OTP भेजा गया है।'
                  : 'A 4-digit OTP has been sent to your registered mobile number.'
                : language === 'hi'
                ? 'OTP प्राप्त करने के लिए अपना मोबाइल नंबर दर्ज करें।'
                : 'Enter your mobile number to receive a temporary login OTP.'}
            </p>

            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter mobile number"
              className="w-full px-3 py-2 rounded-xl border border-[#DECDB3] text-sm text-[#2C1D13]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotOtpSent(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#7A6752] hover:bg-black/5"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!forgotOtpSent) {
                    setForgotOtpSent(true);
                  } else {
                    setShowForgotModal(false);
                    handleLoginSubmit();
                  }
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#B5532A] text-white"
              >
                {forgotOtpSent
                  ? language === 'hi'
                    ? 'लॉगिन करें'
                    : 'Verify & Login'
                  : language === 'hi'
                  ? 'OTP भेजें'
                  : 'Send OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traditional Indian Geometric Block-Print Border Ribbon at bottom */}
      <footer className="w-full h-5 bg-[#6B2414] flex items-center justify-center overflow-hidden border-t border-[#D9A441] shrink-0 z-20">
        <div className="flex items-center gap-6 text-[#FAF3E7] text-[9px] tracking-widest uppercase font-mono opacity-85 whitespace-nowrap">
          <span>◈ 100% Direct Payout to Artisans</span>
          <span>◈ Verified Heritage Guild</span>
          <span>◈ No Middleman Commission</span>
          <span>◈ Voice-First Commerce</span>
          <span>◈ 100% Direct Payout to Artisans</span>
          <span>◈ Handcrafted Indian Legacy</span>
        </div>
      </footer>
    </div>
  );
}
