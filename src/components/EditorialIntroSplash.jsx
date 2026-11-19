import React from 'react';
import { X } from 'lucide-react';

export default function EditorialIntroSplash({ onFinish }) {
  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. Fullscreen Edge-to-Edge Video */}
      <video
        src="/start.mp4"
        autoPlay
        muted
        playsInline
        onEnded={onFinish}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Subtle cinematic gradient overlays for pristine contrast */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none z-10" />

      {/* 2. Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 flex justify-between items-center px-6 sm:px-8 py-6 z-20">
        <span className="font-display text-xl sm:text-2xl text-[#F6EFE4] font-bold tracking-wide drop-shadow-md">
          KarigarBazaar
        </span>
        <button
          type="button"
          onClick={onFinish}
          className="text-[#F6EFE4] hover:text-white text-xs sm:text-sm font-semibold tracking-widest uppercase transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md bg-black/40 hover:bg-black/60 border border-white/20 px-4 py-2 rounded-full shadow-lg"
        >
          <span>Skip to site</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Bottom Editorial Caption Overlay */}
      <div className="absolute bottom-5 inset-x-0 text-center text-xs text-[#F6EFE4]/80 tracking-widest uppercase font-medium drop-shadow-sm z-20">
        A handcrafted editorial for Indian master craftspeople
      </div>
    </div>
  );
}
