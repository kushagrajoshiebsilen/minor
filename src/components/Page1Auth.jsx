import React, { useState } from 'react';
import { Globe, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { languages } from '../locales/translations';

export default function Page1Auth({
  language,
  setLanguage,
  phone,
  setPhone,
  onContinue,
  t
}) {
  const [error, setError] = useState('');

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      setError(t.invalidPhone);
      return;
    }
    setError('');
    onContinue();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle decorative background circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-200/80 p-6 sm:p-10 backdrop-blur-sm">
          
          {/* Header Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.sihBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif mb-2">
              {t.page1Title}
            </h1>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              {t.page1Subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* ITEM A: Select Language */}
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-sm font-bold text-stone-800">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">
                    A
                  </span>
                  <Globe className="w-4 h-4 text-amber-700" />
                  {t.selectLanguage}
                </span>
                <span className="text-xs font-medium text-amber-700">
                  {languages.find(l => l.code === language)?.nativeName}
                </span>
              </label>

              {/* Language Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`relative p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-sm'
                          : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/80 text-stone-700'
                      }`}
                    >
                      <div className="text-sm font-bold text-stone-900">
                        {lang.nativeName}
                      </div>
                      <div className="text-xs text-stone-500">
                        {lang.name}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 absolute top-2.5 right-2.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ITEM B: Phone Number */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-bold text-stone-800">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">
                  B
                </span>
                <Phone className="w-4 h-4 text-amber-700" />
                {t.enterPhone}
              </label>

              <div className="relative">
                {/* Prefix +91 with Indian Flag */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <div className="flex items-center gap-1.5 pr-2.5 border-r border-stone-300">
                    <span className="text-base" role="img" aria-label="India">🇮🇳</span>
                    <span className="text-sm font-bold text-stone-700">+91</span>
                  </div>
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={t.phonePlaceholder}
                  className={`w-full pl-24 pr-4 py-3.5 rounded-2xl border bg-stone-50/40 text-stone-900 text-base font-semibold tracking-wider placeholder:text-stone-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all ${
                    error ? 'border-red-400 ring-2 ring-red-200' : 'border-stone-300 focus:border-amber-600'
                  }`}
                  autoFocus
                />
              </div>

              {error ? (
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1.5">
                  ⚠️ {error}
                </p>
              ) : (
                <p className="text-[12px] text-stone-400 flex items-center gap-1">
                  🔒 {t.phoneHelp}
                </p>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base shadow-lg shadow-orange-600/25 hover:shadow-orange-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t.continueBtn}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

          </form>

          {/* Bottom helper info */}
          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">
              🇮🇳 Empowering Indian Artisans under the <span className="font-semibold text-stone-600">Smart India Hackathon</span> initiative
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
