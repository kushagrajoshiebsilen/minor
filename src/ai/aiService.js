import {
  AI_PROVIDERS,
  buildStoryEnhancerPrompt,
  buildVisionInspectPrompt,
  buildPricingAdvisorPrompt,
  buildTranslatePrompt,
  buildConciergePrompt,
} from './craftKnowledgeBase';
import { computeLocalPricingBenchmark } from '../data/pricingBenchmarks';

const STORAGE_KEY = 'kb_ai_config_v2';

export function getAiConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        provider: parsed.provider || 'grok',
        apiKey: parsed.apiKey || '',
        model: parsed.model || '',
      };
    }
  } catch {
    // ignore storage read errors
  }
  return { provider: 'grok', apiKey: '', model: '' };
}

export function saveAiConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function fetchServerAiStatus() {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) return { defaultProvider: 'grok', serverKeysConfigured: {} };
    return await res.json();
  } catch {
    return { defaultProvider: 'grok', serverKeysConfigured: {} };
  }
}

function safeJsonParse(rawText) {
  if (!rawText) return null;
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function invokeUnifiedAi({ systemPrompt, userPrompt, imageDataUrl, jsonMode = true, temperature = 0.45, overrideConfig, disableFailover = false }) {
  const cfg = overrideConfig || getAiConfig();
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: cfg.provider || 'grok',
      apiKey: cfg.apiKey || '',
      model: cfg.model || '',
      systemPrompt,
      userPrompt,
      imageDataUrl: imageDataUrl || null,
      jsonMode,
      temperature,
      disableFailover,
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(payload?.error || 'AI service unavailable');
    err.code = payload?.code || 'ERROR';
    throw err;
  }

  return payload;
}

export async function testAiConnection(overrideConfig) {
  const res = await invokeUnifiedAi({
    systemPrompt: 'You are a concise connection tester.',
    userPrompt: 'Reply strictly with JSON: {"status":"ok","greeting":"Namaste from KarigarBazaar AI"}',
    jsonMode: true,
    temperature: 0,
    overrideConfig,
    disableFailover: true,
  });
  const parsed = safeJsonParse(res.text);
  return {
    ok: true,
    provider: res.provider,
    model: res.model,
    greeting: parsed?.greeting || 'Connected successfully!',
  };
}

// -----------------------------------------------------------------------------
// Offline Heuristic Fallback Analyzer (guarantees zero breakage without API key)
// -----------------------------------------------------------------------------
function localAnalyzeStory({ rawNotes = '', productName = '', category = 'Pottery & Clay', location = 'India' }) {
  const text = `${productName} ${rawNotes} ${location}`.toLowerCase();

  const materialMatchers = [
    { re: /(silk|katan|tussar|chanderi|resham|रेशम|सिल्क)/, label: 'Pure Handloom Silk' },
    { re: /(cotton|sooti|khadi|malmal|सूती|खादी)/, label: 'Handspun Organic Cotton' },
    { re: /(clay|terracotta|mitti|earthen|मिट्टी|टेराकोटा)/, label: 'Natural Terracotta Clay' },
    { re: /(brass|peetal|bronze|kansa|dhokra|पीतल|धातु)/, label: 'Hand-Cast Bell Brass' },
    { re: /(wood|lakdi|teak|sheesham|channapatna|लकड़ी)/, label: 'Seasoned Natural Hardwood' },
    { re: /(wool|pashmina|merino|oon|ऊन)/, label: 'Pure Kashmiri Wool' },
    { re: /(zari|gold thread|जरी)/, label: 'Traditional Gold Zari' },
    { re: /(natural dye|vegetable|turmeric|indigo|रंग)/, label: 'Organic Natural Pigments' },
  ];

  const techniqueMatchers = [
    { re: /(pit loom|handloom|weav|bunkar|हथकरघा)/, label: 'Traditional Pit-Loom Weaving' },
    { re: /(madhubani|mithila|warli|pattachitra|painting|चित्रकला)/, label: 'Freehand Heritage Folk Painting' },
    { re: /(aari|zardozi|chikankari|embroider|kantha|कढ़ाई)/, label: 'Intricate Hand Needlework' },
    { re: /(wheel|surahi|ghada|potter|चाक)/, label: 'Potter’s Wheel Throwing & Kiln Firing' },
    { re: /(dhokra|lost wax|casting)/, label: 'Ancient Lost-Wax Metal Casting' },
    { re: /(carv|chisel|lacquer|नक्काशी)/, label: 'Hand Chisel Carving & Lacquering' },
    { re: /(block print|ajrakh|sanganeri|छपाई)/, label: 'Wooden Block Hand-Printing' },
  ];

  const materials = materialMatchers.filter((m) => m.re.test(text)).map((m) => m.label);
  const techniques = techniqueMatchers.filter((t) => t.re.test(text)).map((t) => t.label);

  const timeMatch = rawNotes.match(/(\d+)\s*(days?|din|दिन|hours?|ghante|weeks?|hafte|months?)/i);
  const craftingTime = timeMatch
    ? `${timeMatch[1]} ${/hour|ghant/i.test(timeMatch[2]) ? 'Hours' : /week|haft/i.test(timeMatch[2]) ? 'Weeks' : 'Days'} of Master Craftsmanship`
    : '7–10 Days of Dedicated Handcrafting';

  const finalMaterials = materials.length > 0 ? materials : [category === 'Pottery & Clay' ? 'Natural Earthen Clay' : 'Authentic Regional Craft Material'];
  const finalTechnique = techniques[0] || `Traditional Indian ${category} Artistry`;
  const cleanTitle = productName?.trim() || `Handcrafted ${category} Heritage Piece`;

  return {
    enhancedTitle: cleanTitle,
    enhancedDescription: `Handcrafted in ${location || 'India'} using ${finalMaterials.join(' & ')}, this ${cleanTitle} showcases authentic ${finalTechnique}. Created with ${craftingTime.toLowerCase()}, every subtle detail reflects generations of master artisan skill. By choosing this creation on KarigarBazaar, 100% of your purchase directly empowers the artisan’s atelier with zero middleman cut.`,
    materials: finalMaterials,
    technique: finalTechnique,
    craftingTime,
    origin: location || 'Indian Heritage Craft Cluster',
    careGuide:
      category === 'Handloom & Textiles'
        ? 'Dry clean recommended; store folded in breathable cotton muslin.'
        : 'Wipe gently with a soft dry cotton cloth and protect from harsh chemicals.',
    giTagEligible: true,
    giTagLabel: 'Artisan Heritage Verified',
  };
}

// -----------------------------------------------------------------------------
// 1. AI Craft Storyteller & Attribute Analyzer
// -----------------------------------------------------------------------------
export async function enhanceCraftStory(params) {
  const prompt = buildStoryEnhancerPrompt(params);
  try {
    const res = await invokeUnifiedAi({ ...prompt, jsonMode: true, temperature: 0.55 });
    const parsed = safeJsonParse(res.text);
    if (parsed?.enhancedDescription) {
      return {
        data: parsed,
        live: true,
        provider: res.provider,
        model: res.model,
      };
    }
    throw new Error('Invalid JSON returned');
  } catch (err) {
    return {
      data: localAnalyzeStory(params),
      live: false,
      provider: getAiConfig().provider,
      fallbackReason: err?.message,
    };
  }
}

// -----------------------------------------------------------------------------
// 2. AI Vision Craft Inspector (Analyzes uploaded photo!)
// -----------------------------------------------------------------------------
export async function inspectCraftImage({ imageDataUrl, location, targetLanguageName, currentCategory }) {
  const prompt = buildVisionInspectPrompt({ location, targetLanguageName });
  try {
    // Only send data URLs or https URLs directly
    const res = await invokeUnifiedAi({
      ...prompt,
      imageDataUrl,
      jsonMode: true,
      temperature: 0.4,
    });
    const parsed = safeJsonParse(res.text);
    if (parsed?.productName && parsed?.description) {
      return {
        data: parsed,
        live: true,
        provider: res.provider,
        model: res.model,
      };
    }
    throw new Error('Could not parse vision output');
  } catch (err) {
    const fallbackCat = currentCategory || 'Pottery & Clay';
    const bench = computeLocalPricingBenchmark(fallbackCat, '');
    return {
      data: {
        category: fallbackCat,
        productName: `Handcrafted ${fallbackCat} Masterpiece`,
        description: `Authentic handmade ${fallbackCat.toLowerCase()} creation crafted in ${location || 'an Indian artisan workshop'}. Features intricate hand-finished surface detailing, organic materials, and timeless heritage character made without factory automation.`,
        materials: ['Authentic Natural Materials', 'Hand-Finished Craft Surface'],
        technique: `Traditional Indian ${fallbackCat} Craftsmanship`,
        giTagLabel: 'GI Heritage Eligible',
        suggestedPrice: bench.recommendedFairPrice,
      },
      live: false,
      provider: getAiConfig().provider,
      fallbackReason: err?.message,
    };
  }
}

// -----------------------------------------------------------------------------
// 3. Live AI Market Price Advisor
// -----------------------------------------------------------------------------
export async function getLivePriceAdvice(params) {
  const prompt = buildPricingAdvisorPrompt(params);
  try {
    const res = await invokeUnifiedAi({ ...prompt, jsonMode: true, temperature: 0.35 });
    const parsed = safeJsonParse(res.text);
    if (parsed?.recommendedFairPrice && Array.isArray(parsed?.platforms)) {
      return {
        data: parsed,
        live: true,
        provider: res.provider,
        model: res.model,
      };
    }
    throw new Error('Invalid pricing JSON');
  } catch (err) {
    return {
      data: computeLocalPricingBenchmark(params.category, params.productName, params.currentPrice),
      live: false,
      provider: getAiConfig().provider,
      fallbackReason: err?.message,
    };
  }
}

// -----------------------------------------------------------------------------
// 4. On-Demand 15-Language Product Translator
// -----------------------------------------------------------------------------
export async function translateProductContent({ title, description, careGuide, targetLanguageName }) {
  const prompt = buildTranslatePrompt({ title, description, careGuide, targetLanguageName });
  try {
    const res = await invokeUnifiedAi({ ...prompt, jsonMode: true, temperature: 0.3 });
    const parsed = safeJsonParse(res.text);
    if (parsed?.title && parsed?.description) {
      return {
        data: parsed,
        live: true,
        provider: res.provider,
        model: res.model,
      };
    }
    throw new Error('Translation JSON error');
  } catch (err) {
    return {
      data: {
        title,
        description: `[${targetLanguageName} AI Translation Preview — Connect Grok/Gemini key in AI Engine settings for instant live regional translation]\n\n${description}`,
        careGuide: careGuide || 'Handle with care.',
      },
      live: false,
      provider: getAiConfig().provider,
      fallbackReason: err?.message,
    };
  }
}

// -----------------------------------------------------------------------------
// 5. Buyer AI Craft Concierge Chat
// -----------------------------------------------------------------------------
export async function askCraftConcierge({ product, question, targetLanguageName }) {
  const prompt = buildConciergePrompt({ product, question, targetLanguageName });
  try {
    const res = await invokeUnifiedAi({ ...prompt, jsonMode: false, temperature: 0.6 });
    if (res.text?.trim()) {
      return {
        answer: res.text.trim(),
        live: true,
        provider: res.provider,
        model: res.model,
      };
    }
    throw new Error('Empty answer');
  } catch (err) {
    const q = question.toLowerCase();
    let answer = `This ${product.name} is handmade by ${product.artisanName} in ${product.location}. Priced at ₹${Number(product.price).toLocaleString('en-IN')}, 100% goes directly to the artisan’s atelier.`;
    if (/(wash|clean|care|maintain)/i.test(q)) {
      answer = `Care Tip for ${product.name}: ${product.careGuide || 'Wipe gently with a soft dry cloth or dry clean gently to protect natural pigments and artisanal detailing.'}`;
    } else if (/(gift|pack|deliver|ship)/i.test(q)) {
      answer = `Yes! ${product.name} arrives securely cushioned directly from ${product.location} with a Digital GI & Authenticity Certificate—making it a memorable heirloom gift. Orders over ₹999 ship free across India.`;
    } else if (/(authentic|real|gi|original)/i.test(q)) {
      answer = `Every piece on KarigarBazaar is sourced straight from ${product.artisanName}’s workshop (${product.location}) with zero middlemen and carries the "${product.tag}" heritage verification.`;
    }
    return {
      answer,
      live: false,
      provider: getAiConfig().provider,
      fallbackReason: err?.message,
    };
  }
}

export function getProviderMeta(providerId) {
  return AI_PROVIDERS.find((p) => p.id === providerId) || AI_PROVIDERS[0];
}
