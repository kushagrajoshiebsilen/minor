import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Check, X, Sliders, Eye, RotateCcw, Image as ImageIcon } from 'lucide-react';

const STUDIO_BACKDROPS = [
  {
    id: 'royal-gold',
    name: 'Royal Atelier Gold',
    desc: 'Warm heritage parchment & golden spotlight',
    stops: ['#fdf9f0', '#f1e1c4', '#cda166'],
    frameAccent: '#c88d28',
  },
  {
    id: 'terracotta-warm',
    name: 'Terracotta Spotlight',
    desc: 'Clay-earth gallery glow for pottery & brass',
    stops: ['#faf2ea', '#ebd1be', '#bd7a58'],
    frameAccent: '#b54426',
  },
  {
    id: 'indigo-linen',
    name: 'Handloom Indigo',
    desc: 'Deep royal indigo contrast for bright silks',
    stops: ['#31517d', '#1d365c', '#101f36'],
    frameAccent: '#f0c76e',
  },
  {
    id: 'gallery-white',
    name: 'Boutique White',
    desc: 'Amazon / FabIndia crisp catalog backdrop',
    stops: ['#ffffff', '#f7f7f5', '#e6e4de'],
    frameAccent: '#8c7a6b',
  },
  {
    id: 'khadi-jute',
    name: 'Natural Khadi Jute',
    desc: 'Organic woven textile tones',
    stops: ['#f6f2e8', '#e5dac3', '#bfa985'],
    frameAccent: '#8e6b3f',
  },
];

export default function AiPhotoStudioModal({ isOpen, onClose, originalImage, onApplyEnhancedImage }) {
  const canvasRef = useRef(null);
  const [backdropId, setBackdropId] = useState('royal-gold');
  const [aspectRatio, setAspectRatio] = useState('4:3'); // '4:3' | '1:1' | '4:5'
  const [zoom, setZoom] = useState(1.06);
  const [brightness, setBrightness] = useState(106);
  const [contrast, setContrast] = useState(108);
  const [saturation, setSaturation] = useState(110);
  const [heritageFrame, setHeritageFrame] = useState(true);
  const [comparePos, setComparePos] = useState(100);
  const [enhancedUrl, setEnhancedUrl] = useState('');
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    if (!isOpen || !originalImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = originalImage;

    img.onload = () => {
      const width = 900;
      const height = aspectRatio === '1:1' ? 900 : aspectRatio === '4:5' ? 1125 : 675;
      canvas.width = width;
      canvas.height = height;

      const bg = STUDIO_BACKDROPS.find((b) => b.id === backdropId) || STUDIO_BACKDROPS[0];

      // 1. Studio radial backdrop
      const grad = ctx.createRadialGradient(width / 2, height * 0.45, 50, width / 2, height / 2, Math.max(width, height) * 0.78);
      grad.addColorStop(0, bg.stops[0]);
      grad.addColorStop(0.55, bg.stops[1]);
      grad.addColorStop(1, bg.stops[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle museum studio pedestal / shadow glow
      const pad = heritageFrame ? 68 : 26;
      const frameW = width - pad * 2;
      const frameH = height - pad * 2;
      const radius = 26;

      ctx.save();
      ctx.shadowColor = 'rgba(20, 12, 6, 0.36)';
      ctx.shadowBlur = 42;
      ctx.shadowOffsetY = 20;

      // Rounded rect clip
      ctx.beginPath();
      ctx.moveTo(pad + radius, pad);
      ctx.lineTo(pad + frameW - radius, pad);
      ctx.quadraticCurveTo(pad + frameW, pad, pad + frameW, pad + radius);
      ctx.lineTo(pad + frameW, pad + frameH - radius);
      ctx.quadraticCurveTo(pad + frameW, pad + frameH, pad + frameW - radius, pad + frameH);
      ctx.lineTo(pad + radius, pad + frameH);
      ctx.quadraticCurveTo(pad, pad + frameH, pad, pad + frameH - radius);
      ctx.lineTo(pad, pad + radius);
      ctx.quadraticCurveTo(pad, pad, pad + radius, pad);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 3. Draw photo inside rounded studio frame with lighting filters
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pad + radius, pad);
      ctx.lineTo(pad + frameW - radius, pad);
      ctx.quadraticCurveTo(pad + frameW, pad, pad + frameW, pad + radius);
      ctx.lineTo(pad + frameW, pad + frameH - radius);
      ctx.quadraticCurveTo(pad + frameW, pad + frameH, pad + frameW - radius, pad + frameH);
      ctx.lineTo(pad + radius, pad + frameH);
      ctx.quadraticCurveTo(pad, pad + frameH, pad, pad + frameH - radius);
      ctx.lineTo(pad, pad + radius);
      ctx.quadraticCurveTo(pad, pad, pad + radius, pad);
      ctx.closePath();
      ctx.clip();

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      const imgRatio = img.width / img.height;
      const boxRatio = frameW / frameH;
      let drawW = frameW * zoom;
      let drawH = frameH * zoom;
      if (imgRatio > boxRatio) {
        drawH = frameH * zoom;
        drawW = drawH * imgRatio;
      } else {
        drawW = frameW * zoom;
        drawH = drawW / imgRatio;
      }
      const dx = pad + (frameW - drawW) / 2;
      const dy = pad + (frameH - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();

      // 4. Optional fine Zari Gold museum border
      if (heritageFrame) {
        ctx.save();
        ctx.strokeStyle = bg.frameAccent;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.72;
        ctx.strokeRect(pad - 12, pad - 12, frameW + 24, frameH + 24);
        ctx.restore();
      }

      try {
        setEnhancedUrl(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        setEnhancedUrl(originalImage);
      }
    };
  }, [isOpen, originalImage, backdropId, aspectRatio, zoom, brightness, contrast, saturation, heritageFrame]);

  if (!isOpen) return null;

  const resetControls = () => {
    setBackdropId('royal-gold');
    setAspectRatio('4:3');
    setZoom(1.06);
    setBrightness(106);
    setContrast(108);
    setSaturation(110);
    setHeritageFrame(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
      <div className="parchment-card rounded-3xl max-w-5xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="indigo-glass px-6 py-4 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c88d28]/20 border border-[#c88d28]/50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#f0c76e]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Royal Atelier AI Photo Studio</h2>
              <p className="text-xs text-[#f7f1e3]/75">
                Transform workshop snapshots into museum-grade craft photography
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Preview Canvas */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6d4f38] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#b54426]" />
                Live Studio Render
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCompare(!showCompare);
                  setComparePos(50);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  showCompare
                    ? 'bg-[#1b365d] text-white border-[#1b365d]'
                    : 'bg-white/80 text-[#2c1d13] border-[#c88d28]/35'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showCompare ? 'Exit Before/After' : 'Before / After Slider'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-[#c88d28]/35 bg-[#1a120d] aspect-[4/3] flex items-center justify-center">
              <canvas ref={canvasRef} className="hidden" />
              {enhancedUrl && (
                <img
                  src={enhancedUrl}
                  alt="Enhanced Studio Preview"
                  className="w-full h-full object-contain"
                />
              )}

              {showCompare && originalImage && (
                <>
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
                  >
                    <img
                      src={originalImage}
                      alt="Original Craft"
                      className="w-full h-full object-contain bg-[#1a120d]"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold">
                      Original
                    </span>
                  </div>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#b54426] text-white text-[10px] font-bold">
                    Studio Enhanced
                  </span>
                  <div
                    className="absolute inset-y-0 w-0.5 bg-[#f0c76e] pointer-events-none"
                    style={{ left: `${comparePos}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={comparePos}
                    onChange={(e) => setComparePos(Number(e.target.value))}
                    aria-label="Before and after comparison"
                    className="absolute inset-x-4 bottom-4 accent-[#c88d28] cursor-ew-resize"
                  />
                </>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Backdrops */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d4f38] block mb-2">
                1. Studio Backdrop
              </label>
              <div className="grid grid-cols-1 gap-2">
                {STUDIO_BACKDROPS.map((b) => {
                  const active = backdropId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBackdropId(b.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                        active
                          ? 'bg-[#1b365d] text-[#f7f1e3] border-[#c88d28] shadow'
                          : 'bg-white/80 hover:bg-white text-[#2c1d13] border-[#c88d28]/25'
                      }`}
                    >
                      <span
                        className="w-9 h-9 rounded-lg border border-black/15 shrink-0"
                        style={{ background: `radial-gradient(circle, ${b.stops[0]}, ${b.stops[2]})` }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold">{b.name}</div>
                        <div className={`text-[10px] truncate ${active ? 'text-[#f7f1e3]/75' : 'text-[#7c5c43]'}`}>
                          {b.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio + Frame */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {['4:3', '1:1', '4:5'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      aspectRatio === ratio
                        ? 'bg-[#b54426] text-white border-[#b54426]'
                        : 'bg-white/80 text-[#6d4f38] border-[#c88d28]/30'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2c1d13] cursor-pointer">
                <input
                  type="checkbox"
                  checked={heritageFrame}
                  onChange={(e) => setHeritageFrame(e.target.checked)}
                  className="accent-[#b54426] w-4 h-4"
                />
                <span>Zari Gold Frame</span>
              </label>
            </div>

            {/* Lighting Sliders */}
            <div className="p-3.5 rounded-2xl parchment-surface space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-[#6d4f38]">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#b54426]" />
                  Studio Lighting & Crop
                </span>
                <button
                  type="button"
                  onClick={resetControls}
                  className="inline-flex items-center gap-1 text-[11px] text-[#1b365d] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Smart Zoom</span>
                  <span className="font-mono font-bold">{Math.round(zoom * 100)}%</span>
                </div>
                <input type="range" min={1} max={1.45} step={0.02} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#b54426]" />

                <div className="flex justify-between">
                  <span>Studio Brightness</span>
                  <span className="font-mono font-bold">{brightness}%</span>
                </div>
                <input type="range" min={80} max={135} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-[#b54426]" />

                <div className="flex justify-between">
                  <span>Clarity & Contrast</span>
                  <span className="font-mono font-bold">{contrast}%</span>
                </div>
                <input type="range" min={85} max={140} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-[#b54426]" />

                <div className="flex justify-between">
                  <span>Color Vibrance</span>
                  <span className="font-mono font-bold">{saturation}%</span>
                </div>
                <input type="range" min={80} max={145} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full accent-[#b54426]" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#efe4cf]/85 border-t border-[#c88d28]/25 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6d4f38] hover:bg-black/5 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (enhancedUrl) onApplyEnhancedImage(enhancedUrl);
              onClose();
            }}
            className="btn-terracotta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Studio Photo to Listing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
