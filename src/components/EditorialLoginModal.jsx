import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function EditorialLoginModal({
  isOpen,
  onClose,
  phone,
  setPhone,
  artisanProfile,
  onProfileUpdate,
}) {
  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [otpStage, setOtpStage] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [artisanName, setArtisanName] = useState(artisanProfile?.name || 'Sitadevi Paswan');
  const [location, setLocation] = useState(artisanProfile?.location || 'Jitwarpur, Bihar');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const cleaned = phoneInput.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setError('');
    setPhone(cleaned);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpInput(code); // Pre-fill for seamless hackathon demo
    setOtpStage(true);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otpInput.trim().length !== 4) {
      setError('Please enter the 4-digit code.');
      return;
    }
    onProfileUpdate({
      name: artisanName.trim() || 'Master Artisan',
      location: location.trim() || 'India',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#E4D9C8] rounded-sm p-8 space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#2B3A67]/60 hover:text-[#2B3A67] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
            Artisan & Buyer Access
          </span>
          <h2 className="font-display text-3xl font-semibold text-[#2B3A67] mt-1">
            Sign in to KarigarBazaar
          </h2>
          <p className="text-xs text-[#2B3A67]/75 mt-1">
            Fast OTP sign in. No password needed.
          </p>
        </div>

        {!otpStage ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={artisanName}
                onChange={(e) => setArtisanName(e.target.value)}
                placeholder="e.g. Sitadevi Paswan"
                className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                City, State
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Jitwarpur, Bihar"
                className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                Mobile Number
              </label>
              <div className="flex border border-[#E4D9C8] rounded-sm overflow-hidden">
                <span className="bg-[#F6EFE4] px-3 py-2.5 text-xs font-semibold text-[#2B3A67] border-r border-[#E4D9C8]">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="98765 43210"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none focus:border-[#B5532A]"
                />
              </div>
              {error && <p className="text-xs text-[#B5532A] mt-1.5">{error}</p>}
            </div>

            <button type="submit" className="btn-terracotta w-full mt-2">
              <span>Send OTP code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 bg-[#F6EFE4] border border-[#D9A441]/50 rounded-sm text-xs text-[#2B3A67] flex items-center justify-between">
              <span>Demo OTP code:</span>
              <strong className="font-mono text-[#B5532A] text-sm">{generatedOtp}</strong>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-3 border border-[#E4D9C8] rounded-sm text-center text-xl font-bold tracking-widest text-[#2B3A67] focus:outline-none focus:border-[#B5532A]"
              />
              {error && <p className="text-xs text-[#B5532A] mt-1.5">{error}</p>}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOtpStage(false)}
                className="btn-secondary text-xs px-4 py-2.5"
              >
                Change
              </button>
              <button type="submit" className="btn-terracotta flex-1 py-2.5 text-xs font-semibold">
                Verify and proceed
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
