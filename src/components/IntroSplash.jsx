import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowRight, Sparkles } from 'lucide-react';

export default function IntroSplash({ onFinish, t }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.play().catch(() => {
      // Autoplay fallback if browser blocks even muted playback
    });
  }, []);

  const triggerExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 520);
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const next = !isMuted;
    vid.muted = next;
    setIsMuted(next);
    if (!next) {
      vid.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setProgress(Math.min(100, (vid.currentTime / vid.duration) * 100));
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#140d08] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Fullscreen cinematic intro video */}
      <video
        ref={videoRef}
        src="/start.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={triggerExit}
        onError={triggerExit}
        className="w-full h-full object-cover sm:object-contain bg-[#140d08]"
      />

      {/* Subtle top & bottom gradient vignette for controls legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 to-transparent" />

      {/* Top Controls */}
      <div className="absolute top-5 inset-x-5 sm:inset-x-8 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-[#c88d28]/40 text-[#f7f1e3] text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#e6b355]" />
          <span>SIH 2026 • Vocal for Local</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-[#f7f1e3] text-xs font-semibold transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#e6b355]" /> : <Volume2 className="w-4 h-4 text-[#e6b355]" />}
            <span>{isMuted ? (t?.unmute || 'Unmute') : (t?.mute || 'Mute')}</span>
          </button>

          <button
            type="button"
            onClick={triggerExit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#b54426]/90 hover:bg-[#c94e2d] backdrop-blur-md border border-[#e6b355]/40 text-white text-xs font-bold shadow-lg transition cursor-pointer"
          >
            <span>{t?.skipIntro || 'Skip Intro'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-6 inset-x-6 sm:inset-x-12 max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#f7f1e3]/75 font-medium">
          <span>KarigarBazaar — Royal Indian Artisan Atelier</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#b54426] via-[#e6b355] to-[#2e5c99] transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
