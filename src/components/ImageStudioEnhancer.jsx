import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Crop, Wand2, Check, RefreshCw, Layers, 
  Eye, CheckCircle2, Sliders, Image as ImageIcon, X
} from 'lucide-react';

export default function ImageStudioEnhancer({
  isOpen,
  onClose,
  originalImage,
  onApplyEnhancedImage,
  language = 'hi'
}) {
  if (!isOpen) return null;

  const isHindi = language === 'hi';
  const canvasRef = useRef(null);

  const [selectedBackdrop, setSelectedBackdrop] = useState('studio-warm'); // 'studio-warm', 'royal-heritage', 'clean-white', 'earthy-jute'
  const [aspectRatio, setAspectRatio] = useState('4:3'); // '4:3' | '1:1'
  const [zoomLevel, setZoomLevel] = useState(1.1); // Auto smart crop zoom
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedDataUrl, setEnhancedDataUrl] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const backdrops = [
    {
      id: 'studio-warm',
      name: isHindi ? 'वॉर्म स्टूडियो (Warm Studio)' : 'Warm Studio Light',
      desc: isHindi ? 'पेशेवर स्टूडियो लाइटिंग और कोमल बैकड्रॉप' : 'Soft studio diffused spotlight',
      gradient: ['#faf8f5', '#efe6dc', '#d8c7b5'],
      border: 'border-amber-400'
    },
    {
      id: 'royal-heritage',
      name: isHindi ? 'रॉयल हेरिटेज (Royal Heritage)' : 'Royal Heritage Gold',
      desc: isHindi ? 'टेराकोटा व स्वर्णिम भारतीय आभा' : 'Terracotta & amber warm ambiance',
      gradient: ['#fdf6ee', '#f3dec6', '#d6a87c'],
      border: 'border-orange-400'
    },
    {
      id: 'clean-white',
      name: isHindi ? 'क्लीन बुटीक व्हाइट (Minimalist White)' : 'Boutique White',
      desc: isHindi ? 'अमेज़न/मिंत्रा स्टाइल क्लीन कैटलॉग' : 'Amazon/Myntra crisp catalog clean',
      gradient: ['#ffffff', '#f8f8f8', '#ececec'],
      border: 'border-stone-400'
    },
    {
      id: 'earthy-jute',
      name: isHindi ? 'प्राकृतिक खादी/जूट (Earthy Jute)' : 'Earthy Natural Linen',
      desc: isHindi ? 'हस्तशिल्प के लिए प्राकृतिक टेक्सचर' : 'Warm artisanal organic backdrop',
      gradient: ['#f5f2eb', '#e6decb', '#c8b99d'],
      border: 'border-amber-600'
    }
  ];

  // Render enhanced image on Canvas
  useEffect(() => {
    if (!originalImage) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = originalImage;

    img.onload = () => {
      // Set canvas dimension according to aspect ratio
      const width = 800;
      const height = aspectRatio === '4:3' ? 600 : 800;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Enhanced Studio Background
      const selectedBg = backdrops.find(b => b.id === selectedBackdrop) || backdrops[0];
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 40,
        width / 2, height / 2, width * 0.7
      );
      grad.addColorStop(0, selectedBg.gradient[0]);
      grad.addColorStop(0.6, selectedBg.gradient[1]);
      grad.addColorStop(1, selectedBg.gradient[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle studio vignette / rim lighting
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.4,
        width / 2, height / 2, width * 0.8
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // 2. Smart auto-crop calculation (centers product cleanly)
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;

      let drawW, drawH, drawX, drawY;

      // Apply zoom/crop level
      const scaleFactor = zoomLevel;

      if (imgAspect > targetAspect) {
        drawH = height * 0.88 * scaleFactor;
        drawW = drawH * imgAspect;
      } else {
        drawW = width * 0.88 * scaleFactor;
        drawH = drawW / imgAspect;
      }

      drawX = (width - drawW) / 2;
      drawY = (height - drawH) / 2;

      // 3. Grounding soft shadow underneath the product for 3D studio realism
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(width / 2, height - (height * 0.08), drawW * 0.35, height * 0.04, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.restore();

      // 4. Draw the original craft unwarped & crisp in the center
      // Soft rounded clipping mask
      ctx.save();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Convert to base64 Data URL
      try {
        const resultUrl = canvas.toDataURL('image/jpeg', 0.92);
        setEnhancedDataUrl(resultUrl);
      } catch (err) {
        console.warn('Canvas export fallback:', err);
        setEnhancedDataUrl(originalImage);
      }

      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
      setEnhancedDataUrl(originalImage);
    };

  }, [originalImage, selectedBackdrop, aspectRatio, zoomLevel]);

  const handleApply = () => {
    if (enhancedDataUrl) {
      onApplyEnhancedImage(enhancedDataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'एआई फोटो सुधारक (Image Studio Enhancer)' : 'Craft Studio Image Enhancer'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHindi 
                  ? 'उत्पाद बदले बिना सुंदर बैकग्राउंड व ऑटो-क्रॉपिंग' 
                  : 'Auto-crops & frames craft with professional studio backdrops'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Preview Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visual Canvas / Preview Area (7 Cols) */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-300 shadow-lg bg-stone-100 flex items-center justify-center">
                
                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Displayed Image */}
                <img
                  src={showComparison ? originalImage : (enhancedDataUrl || originalImage)}
                  alt="Craft Preview"
                  className="w-full h-full object-cover"
                />

                {/* Status Badge */}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                  showComparison 
                    ? 'bg-stone-900/80 text-white' 
                    : 'bg-emerald-600 text-white flex items-center gap-1'
                }`}>
                  {showComparison ? 'Original Photo' : '✨ Studio Enhanced'}
                </span>

                {/* Hold to Compare Button */}
                <button
                  type="button"
                  onMouseDown={() => setShowComparison(true)}
                  onMouseUp={() => setShowComparison(false)}
                  onTouchStart={() => setShowComparison(true)}
                  onTouchEnd={() => setShowComparison(false)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/85 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 transition select-none"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'दबाकर मूल फोटो देखें' : 'Hold to View Original'}</span>
                </button>
              </div>

              {/* Crop & Zoom Slider */}
              <div className="w-full mt-3 flex items-center justify-between text-xs text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <span className="flex items-center gap-1 font-bold text-stone-700">
                  <Crop className="w-3.5 h-3.5 text-amber-600" />
                  {isHindi ? 'ऑटो-क्रॉप ज़ूम:' : 'Smart Focus Zoom:'}
                </span>
                <input
                  type="range"
                  min="0.9"
                  max="1.35"
                  step="0.05"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-36 accent-orange-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-stone-800">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
            </div>

            {/* Backdrop & Setting Controls (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  {isHindi ? 'स्टूडियो बैकड्रॉप चुनें:' : 'Select Studio Backdrop:'}
                </label>

                <div className="space-y-2">
                  {backdrops.map((b) => {
                    const isSelected = selectedBackdrop === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBackdrop(b.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-xl shrink-0 border border-stone-300 shadow-xs"
                          style={{
                            background: `linear-gradient(135deg, ${b.gradient[0]}, ${b.gradient[2]})`
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {b.name}
                          </h4>
                          <p className="text-[10px] text-stone-500 truncate">
                            {b.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                  {isHindi ? 'आकार (Aspect Ratio):' : 'E-Commerce Framing:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('4:3')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      aspectRatio === '4:3'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    4:3 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      aspectRatio === '1:1'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    1:1 Square
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-200 transition"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isHindi ? 'सुधारी गई फोटो लागू करें ✓' : 'Apply Enhanced Photo ✓'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
