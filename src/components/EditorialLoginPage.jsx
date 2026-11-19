import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Phone, User, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export default function EditorialLoginPage({
  onLoginSuccess,
  onNavigateHome,
  language = 'en',
  phone = '',
  setPhone,
  artisanProfile,
  onProfileUpdate,
}) {
  const [fullName, setFullName] = useState(artisanProfile?.name || '');
  const [location, setLocation] = useState(artisanProfile?.location || '');
  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [otpStage, setOtpStage] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(
        language === 'hi'
          ? 'कृपया वैध 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }
    setError('');
    setPhone(cleanPhone);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpInput(code); // Pre-filled for demo convenience
    setOtpStage(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput.trim().length !== 4) {
      setError(
        language === 'hi' ? 'कृपया 4-अंकों का OTP कोड दर्ज करें।' : 'Please enter the 4-digit OTP code.'
      );
      return;
    }

    const finalProfile = {
      name: fullName.trim() || 'Sitadevi Paswan',
      location: location.trim() || 'Jitwarpur, Bihar',
    };

    onProfileUpdate(finalProfile);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#FAF3E7] text-[#2C1D13] font-body relative overflow-x-hidden p-6 md:p-12">
      {/* Background Subtle Traditional Grain & Watermark */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#B5532A_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#B5532A] text-white flex items-center justify-center font-display text-lg font-bold shadow-xs">
            🪷
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-[#2C1D13]">
              Karigar<span className="text-[#B5532A]">Bazaar</span>
            </span>
            <span className="text-[10px] text-[#7A6752] tracking-wider uppercase font-semibold">
              Artisan Atelier Portal
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onNavigateHome}
          className="text-xs font-semibold text-[#7A6752] hover:text-[#B5532A] transition cursor-pointer"
        >
          ← {language === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md mx-auto my-auto z-10 pt-6 pb-8">
        <div className="bg-white border border-[#EADBBE] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
          {/* Top Decorative Terracotta Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B5532A] via-[#D9A441] to-[#B5532A]" />

          {/* Title & Badge */}
          <div className="space-y-1.5 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E7] text-[#B5532A] text-xs font-bold uppercase tracking-wider border border-[#EADBBE]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कारीगर साइन इन' : 'Artisan Sign In'}</span>
            </span>

            <h1 className="font-display text-3xl font-bold text-[#2C1D13] tracking-tight pt-1">
              {language === 'hi' ? 'अपनी कार्यशाला में प्रवेश करें' : 'Enter Your Artisan Atelier'}
            </h1>

            <p className="text-xs text-[#7A6752] leading-relaxed">
              {language === 'hi'
                ? 'अपने मोबाइल नंबर से लॉगिन करें और 0% कमीशन पर सीधे खरीदारों से जुड़ें।'
                : 'Sign in with your mobile phone to manage your craft catalogue with 0% middleman fees.'}
            </p>
          </div>

          {/* Form */}
          {!otpStage ? (
            <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#2C1D13] mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#B5532A]" />
                    <span>{language === 'hi' ? 'कारीगर का पूरा नाम' : 'Your Full Name'}</span>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. सीतादेवी पासवान' : 'e.g. Sitadevi Paswan'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADBBE] text-sm text-[#2C1D13] bg-[#FAF3E7]/40 focus:border-[#B5532A] focus:outline-none focus:ring-2 focus:ring-[#B5532A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1D13] mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C68345]" />
                    <span>{language === 'hi' ? 'शहर / शिल्प क्षेत्र' : 'Craft Cluster / Location'}</span>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. जितवारपुर, मधुबनी, बिहार' : 'e.g. Jitwarpur, Bihar'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADBBE] text-sm text-[#2C1D13] bg-[#FAF3E7]/40 focus:border-[#B5532A] focus:outline-none focus:ring-2 focus:ring-[#B5532A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1D13] mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B5532A]" />
                    <span>{language === 'hi' ? '10-अंकों का मोबाइल नंबर' : '10-Digit Mobile Number'}</span>
                  </div>
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2.5 rounded-xl border border-[#EADBBE] bg-[#FAF3E7] text-xs font-bold text-[#4A3B2C]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EADBBE] text-sm text-[#2C1D13] bg-[#FAF3E7]/40 focus:border-[#B5532A] focus:outline-none focus:ring-2 focus:ring-[#B5532A]/20 tracking-wider font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#B5532A] hover:bg-[#973F1C] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>{language === 'hi' ? 'OTP प्राप्त करें' : 'Send 4-Digit OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF3E7] border border-[#EADBBE] text-center space-y-1">
                <span className="text-[11px] text-[#7A6752]">
                  {language === 'hi'
                    ? `OTP कोड +91 ${phoneInput} पर भेजा गया`
                    : `OTP code sent to +91 ${phoneInput}`}
                </span>
                <div className="text-xs font-bold text-[#B5532A]">
                  Demo Code: <span className="font-mono text-sm tracking-widest">{generatedOtp}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1D13] mb-1.5 text-center">
                  {language === 'hi' ? '4-अंकों का OTP दर्ज करें' : 'Enter 4-Digit Code'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.7em] font-mono text-2xl py-3 border border-[#EADBBE] rounded-xl text-[#2C1D13] bg-[#FAF3E7]/30 focus:border-[#B5532A] focus:outline-none focus:ring-2 focus:ring-[#B5532A]/20 font-bold"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#B5532A] hover:bg-[#973F1C] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'hi'
                    ? 'सत्यापित करें और डैशबोर्ड खोलें'
                    : 'Verify & Open Artisan Atelier'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpStage(false);
                  setError('');
                }}
                className="w-full text-center text-xs font-semibold text-[#7A6752] hover:text-[#2C1D13] transition pt-1 cursor-pointer"
              >
                ← {language === 'hi' ? 'मोबाइल नंबर बदलें' : 'Change mobile number'}
              </button>
            </form>
          )}

          {/* Trust Badges */}
          <div className="pt-4 border-t border-[#F0E4CD] flex items-center justify-center gap-4 text-[11px] text-[#7A6752]">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B5532A]" />
              <span>100% Direct Payout</span>
            </span>
            <span>•</span>
            <span>0% Commission</span>
            <span>•</span>
            <span>Fast Voice AI</span>
          </div>
        </div>
      </div>

      {/* Footer Ribbon */}
      <div className="w-full max-w-4xl mx-auto text-center text-[11px] text-[#7A6752] z-10">
        KarigarBazaar • Handcrafted Editorial Atelier for Indian Master Craftspeople
      </div>
    </div>
  );
}
