import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, CheckCircle, Info, Lightbulb, Clock, Layers, 
  HelpCircle, RefreshCw, Wand2, Check, ArrowRight, ShieldCheck,
  Zap, AlertCircle
} from 'lucide-react';
import { analyzeDescription, generateProfessionalDescription } from '../utils/descriptionAnalyzer';

export default function DescriptionExplainerEnhancer({
  currentDescription,
  onApplyDescription,
  productName = '',
  category = '',
  language = 'hi'
}) {
  const isHindi = language === 'hi';
  const [isOpen, setIsOpen] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);

  // 1. Real-time automatic analysis of whatever text the user types or speaks
  const analysis = useMemo(() => {
    return analyzeDescription(currentDescription, productName, category);
  }, [currentDescription, productName, category]);

  // 2. Automatically generate the professional version based on the analyzed attributes
  const professionalVersion = useMemo(() => {
    return generateProfessionalDescription(analysis, productName, category, language);
  }, [analysis, productName, category, language]);

  // Auto-apply if user has enabled auto-apply mode and description changed
  useEffect(() => {
    if (autoApply && currentDescription && currentDescription.length > 8 && currentDescription !== professionalVersion) {
      const timer = setTimeout(() => {
        onApplyDescription(professionalVersion);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [autoApply, currentDescription, professionalVersion]);

  const handleManualApply = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onApplyDescription(professionalVersion);
      setIsGenerating(false);
      setAppliedNotification(true);
      setTimeout(() => setAppliedNotification(false), 3000);
    }, 400);
  };

  const hasContent = currentDescription.trim().length > 0;

  return (
    <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-stone-50 p-4 sm:p-5 space-y-4 shadow-xs">
      
      {/* Top Bar: Automatic AI Analyzer Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
            <Wand2 className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                {isHindi ? 'स्वचालित विवरण विश्लेषक (Auto AI Description Analyzer)' : 'Automatic Craft Description Analyzer'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-800" />
                Live AI
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {isHindi 
                ? 'आपके बोले या लिखे शब्दों का स्वतः विश्लेषण कर उसे पेशेवर बनाता है' 
                : 'Automatically parses your raw craft notes and synthesizes a formal e-commerce description'}
            </p>
          </div>
        </div>

        {/* Action button to expand/collapse */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs transition"
          >
            {isOpen ? (isHindi ? 'संक्षिप्त करें' : 'Hide Details') : (isHindi ? 'विस्तार देखें' : 'View Breakdown')}
          </button>
        </div>
      </div>

      {/* Real-time Analyzed Badges (Pills) */}
      <div className="p-3 rounded-xl bg-white/90 border border-stone-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {isHindi ? 'विवरण से पहचाने गए मुख्य तत्व (Detected Craft Elements):' : 'Automatically Detected Craft Attributes:'}
          </span>
          <span className="text-[11px] font-semibold text-stone-500">
            {isHindi ? `गुणवत्ता स्तर: ${analysis.qualityScore}%` : `Listing Strength: ${analysis.qualityScore}%`}
          </span>
        </div>

        {/* Detected Tags Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time tag */}
          <span className={`px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 ${
            analysis.time 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
              : 'bg-stone-50 text-stone-500 border-stone-200'
          }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{analysis.time ? analysis.time : (isHindi ? 'समय: (उदा. 15 दिन लिखें)' : 'Time: Not specified')}</span>
          </span>

          {/* Material tag */}
          <span className={`px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 ${
            analysis.materials.length > 0 
              ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' 
              : 'bg-stone-50 text-stone-500 border-stone-200'
          }`}>
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>{analysis.materials.length > 0 ? analysis.materials.join(', ') : (isHindi ? 'सामग्री: (रेशम, मिट्टी, पीतल)' : 'Material: General craft')}</span>
          </span>

          {/* Technique tag */}
          <span className={`px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 ${
            analysis.techniques.length > 0 
              ? 'bg-orange-50 text-orange-900 border-orange-300 font-bold' 
              : 'bg-stone-50 text-stone-500 border-stone-200'
          }`}>
            <Lightbulb className="w-3.5 h-3.5 text-orange-600" />
            <span>{analysis.techniques.length > 0 ? analysis.techniques.join(', ') : (isHindi ? 'तकनीक: (हथकरघा, नक्काशी)' : 'Technique: Handcrafted')}</span>
          </span>

          {/* Origin tag */}
          {analysis.origin && (
            <span className="px-2.5 py-1 rounded-lg font-bold border bg-indigo-50 text-indigo-900 border-indigo-300 flex items-center gap-1.5">
              <span>📍 {analysis.origin}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Feature: 1-Click "Make Description Professional" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualApply}
            disabled={isGenerating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isHindi ? 'पेशेवर बनाया जा रहा है...' : 'Formatting professionally...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHindi ? '✨ विवरण को पेशेवर बनाएं (Make Professional)' : '✨ Make Description Professional'}</span>
              </>
            )}
          </button>

          {appliedNotification && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {isHindi ? 'लागू हो गया!' : 'Applied to field!'}
            </span>
          )}
        </div>

        <span className="text-[11px] text-stone-500">
          {isHindi ? '💡 यह आपके विवरण को Amazon/Flipkart स्तर का औपचारिक रूप देगा' : '💡 Formats your notes into high-converting, formal e-commerce copy'}
        </span>
      </div>

      {/* Expanded Breakdown & Live Comparison Preview */}
      {isOpen && (
        <div className="pt-3 border-t border-amber-200/60 space-y-4 animate-fade-in">
          
          {/* Comparison Cards: Original vs Professional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Original Draft */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block">
                {isHindi ? 'आपके द्वारा लिखा/बोला गया कच्चा विवरण:' : 'Your Raw Draft / Spoken Notes:'}
              </span>
              <p className="text-stone-700 italic text-xs leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100 min-h-[5rem]">
                {hasContent ? currentDescription : (isHindi ? 'अभी कुछ नहीं लिखा गया है।' : 'No description entered yet.')}
              </p>
            </div>

            {/* AI Synthesized Professional Version */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {isHindi ? 'एआई द्वारा तैयार पेशेवर विवरण:' : 'AI Synthesized Professional Description:'}
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                    E-Commerce Standard
                  </span>
                </div>
                <p className="text-stone-800 text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-200 min-h-[5rem] whitespace-pre-line font-medium">
                  {professionalVersion}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleManualApply}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'यह विवरण लागू करें' : 'Apply This Version'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Educational Explainer Checklist */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              {isHindi ? 'खरीदारों को आकर्षित करने के लिए क्या बताना आवश्यक है?' : 'What Buyers Look for in Handcrafted Product Descriptions:'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-stone-600">
              <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                <strong className="text-stone-800 block mb-0.5">⏳ 1. दिन व समय</strong>
                <span>हाथ से बनाने में कितने दिन लगे (उदा. 15 दिन pit loom पर)।</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                <strong className="text-stone-800 block mb-0.5">🧵 2. प्रयुक्त सामग्री</strong>
                <span>शुद्ध रेशम, मिट्टी, पीतल या प्राकृतिक वनस्पति रंग।</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                <strong className="text-stone-800 block mb-0.5">🎨 3. शिल्प परंपरा</strong>
                <span>बनारसी ज़री, टेराकोटा चाक, या मधुबनी निब कार्य।</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                <strong className="text-stone-800 block mb-0.5">🧼 4. देखभाल निर्देश</strong>
                <span>ड्राई क्लीन, ठंडे पानी से धुलाई, या धूप से बचाव।</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
