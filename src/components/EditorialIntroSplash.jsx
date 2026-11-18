import React from 'react';
import { X } from 'lucide-react';

export default function EditorialIntroSplash({ onFinish }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#120B07] flex flex-col justify-between">
      {/* Top right skip link */}
      <div className="w-full flex justify-between items-center px-6 py-6 z-10">
        <span className="font-display text-xl text-[#F6EFE4]/80 tracking-wide">KarigarBazaar</span>
        <button
          type="button"
          onClick={onFinish}
          className="text-[#F6EFE4]/80 hover:text-[#F6EFE4] text-sm tracking-widest uppercase transition flex items-center gap-1.5 cursor-pointer border border-[#F6EFE4]/30 px-3.5 py-1.5 rounded-sm"
        >
          <span>Skip to site</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main video element */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <video
          src="/start.mp4"
          autoPlay
          muted
          playsInline
          onEnded={onFinish}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Subtle bottom note */}
      <div className="w-full text-center py-4 text-xs text-[#F6EFE4]/60 tracking-wider">
        A handcrafted editorial for Indian master craftspeople
      </div>
    </div>
  );
}
