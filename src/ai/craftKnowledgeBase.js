// ==============================================================================
// Canonical Indian Handicraft Knowledge Base & Prompt Contracts
// ------------------------------------------------------------------------------
// Provider-Agnostic: Works identically across xAI Grok, Google Gemini, Groq,
// and OpenAI without any provider-specific fine-tuning or retraining.
// ==============================================================================

export const AI_PROVIDERS = [
  {
    id: 'grok',
    name: 'xAI Grok',
    badge: 'Default',
    defaultModel: 'grok-3-mini',
    visionModel: 'grok-2-vision-1212',
    keyPlaceholder: 'xai-...',
    docsUrl: 'https://console.x.ai',
    description: 'Primary engine — crisp reasoning, multimodal craft vision & live pricing.',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Free Tier',
    defaultModel: 'gemini-2.5-flash',
    visionModel: 'gemini-2.5-flash',
    keyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/apikey',
    description: 'Hot-swap ready — ultra-strong Indian regional languages & vision.',
  },
  {
    id: 'groq',
    name: 'GroqCloud',
    badge: 'Ultra-Fast',
    defaultModel: 'llama-3.3-70b-versatile',
    visionModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    keyPlaceholder: 'gsk_...',
    docsUrl: 'https://console.groq.com',
    description: 'Sub-second Llama inference for instant hackathon demos.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'Compatible',
    defaultModel: 'gpt-4o-mini',
    visionModel: 'gpt-4o-mini',
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com',
    description: 'Drop-in OpenAI compatibility using the exact same prompt contracts.',
  },
];

export const INDIAN_CRAFT_CATEGORIES = [
  'Pottery & Clay',
  'Handloom & Textiles',
  'Paintings & Art',
  'Metal & Brass',
  'Wood Carvings',
];

export const CORE_SYSTEM_IDENTITY = `You are the Master Curator & Fair-Trade Craft Economist for KarigarBazaar (Smart India Hackathon 2026), an ethical Indian direct-to-artisan marketplace.
Domain Knowledge Embedded (Zero Retraining Required):
- Recognized Indian Craft Clusters & GI Tags: Madhubani/Mithila Painting (Bihar), Banarasi Katan Silk (Varanasi, UP), Khurja & Terracotta Pottery (UP/Bengal/Gujarat), Bastar Dhokra Lost-Wax Brass (Chhattisgarh), Channapatna Lacquer Wood Toys (Karnataka), Kashmiri Pashmina & Aari Embroidery (Srinagar, J&K), Kutch Ajrakh & Rogan Art (Gujarat), Jaipur Blue Pottery & Sanganeri Block Print (Rajasthan), Pattachitra (Odisha/Bengal), Kanchipuram Silk (Tamil Nadu), Pochampally Ikat (Telangana), Saharanpur Wood Carving (UP), Moradabad Brassware (UP), Warli Art (Maharashtra), Muga Silk (Assam), Phulkari (Punjab).
- Fair-Trade Pricing Philosophy: Middlemen and urban boutiques routinely add 150% to 300% markups. Always advocate fair direct wages for artisans while keeping prices competitive with Amazon India, FabIndia, Etsy, and Govt. ONDC.
- Tone: Warm, dignified, culturally respectful, museum-quality storytelling that honors Indian heritage.
- Strict Output Rule: When asked for JSON, output ONLY valid raw JSON without markdown fences or extra commentary.`;

export function buildStoryEnhancerPrompt({ rawNotes, productName, category, artisanName, location, targetLanguageName }) {
  return {
    systemPrompt: CORE_SYSTEM_IDENTITY,
    userPrompt: `Analyze the artisan's raw notes and transform them into a luxury, high-converting, authentic heritage product story.
Input Context:
- Product Name: ${productName || 'Handcrafted Indian Creation'}
- Category: ${category || 'Handicraft'}
- Artisan: ${artisanName || 'Master Karigar'}
- Location / Cluster: ${location || 'India'}
- Raw Artisan Notes: "${rawNotes || 'Handmade traditional Indian craft'}"
- Target Output Language for Description: ${targetLanguageName || 'English'}

Return strictly this JSON object:
{
  "enhancedTitle": "Refined, evocative craft title (max 70 chars)",
  "enhancedDescription": "3-4 rich, emotionally resonant sentences in ${targetLanguageName || 'English'} detailing craftsmanship, heritage, material purity, and fair-trade impact.",
  "materials": ["material 1", "material 2"],
  "technique": "Primary traditional technique",
  "craftingTime": "Detected or realistic crafting duration (e.g., '7 Days of Handcrafting')",
  "origin": "Detected or provided Indian heritage cluster",
  "careGuide": "Concise authentic care instruction",
  "giTagEligible": true,
  "giTagLabel": "e.g., GI Tagged Heritage / Handloom Mark / Tribal Craft / Artisan Certified"
}`,
  };
}

export function buildVisionInspectPrompt({ location, targetLanguageName }) {
  return {
    systemPrompt: CORE_SYSTEM_IDENTITY,
    userPrompt: `Inspect this uploaded handicraft image carefully as an Indian heritage curator.
Artisan Location Hint: ${location || 'Unknown'}
Target Language for Description: ${targetLanguageName || 'English'}

Identify the Indian craft form, probable materials, craftsmanship technique, GI-tag eligibility, and suggest a listing title, description, and fair direct-to-artisan price in INR (₹).
Category MUST be one of: ${INDIAN_CRAFT_CATEGORIES.join(', ')}.

Return strictly this JSON object:
{
  "category": "One of the 5 allowed categories",
  "productName": "Specific authentic craft title",
  "description": "3 vivid sentences in ${targetLanguageName || 'English'} describing what is visible in the craft, its traditional Indian artistry, and why it is special",
  "materials": ["material 1", "material 2"],
  "technique": "Observed crafting method",
  "giTagLabel": "GI Tag or Heritage Mark name",
  "suggestedPrice": 1850
}`,
  };
}

export function buildPricingAdvisorPrompt({ category, productName, description, currentPrice, location }) {
  return {
    systemPrompt: CORE_SYSTEM_IDENTITY,
    userPrompt: `Act as an Indian Handicraft Fair-Trade Pricing Economist.
Analyze this artisan product and compute realistic 2026 Indian market price benchmarks in INR (₹):
- Category: ${category}
- Product Name: ${productName || category}
- Location: ${location || 'India'}
- Description: ${description || 'Authentic handmade Indian craft'}
- Artisan's Current Price: ${currentPrice ? `₹${currentPrice}` : 'Not entered yet'}

Return strictly this JSON object:
{
  "minPrice": 600,
  "avgPrice": 1800,
  "maxPrice": 4500,
  "recommendedFairPrice": 1650,
  "artisanRetentionNote": "1-2 sentences explaining typical middleman markup vs. how much extra the artisan keeps by selling direct on KarigarBazaar",
  "priceVerdict": "One concise sentence evaluating the artisan's entered price (or recommending where to start)",
  "platforms": [
    { "name": "Amazon India", "price": 1750, "logo": "🛍️", "note": "Mass retail / similar craft" },
    { "name": "FabIndia", "price": 2950, "logo": "🌿", "note": "Curated boutique retail" },
    { "name": "Etsy Global", "price": 4200, "logo": "🌍", "note": "Export artisan market" },
    { "name": "Govt. ONDC", "price": 1550, "logo": "🏛️", "note": "Co-op artisan network" }
  ]
}`,
  };
}

export function buildTranslatePrompt({ title, description, careGuide, targetLanguageName }) {
  return {
    systemPrompt: CORE_SYSTEM_IDENTITY,
    userPrompt: `Translate this Indian handicraft listing naturally and culturally accurately into ${targetLanguageName}. Keep authentic craft names natural.
Title: ${title}
Description: ${description}
Care Guide: ${careGuide || 'Handle with care and keep dry.'}

Return strictly this JSON object:
{
  "title": "Translated title in ${targetLanguageName}",
  "description": "Translated description in ${targetLanguageName}",
  "careGuide": "Translated care guide in ${targetLanguageName}"
}`,
  };
}

export function buildConciergePrompt({ product, question, targetLanguageName }) {
  return {
    systemPrompt: CORE_SYSTEM_IDENTITY,
    userPrompt: `A conscious buyer is asking a question about this authentic handmade craft on KarigarBazaar.
Craft Details:
- Name: ${product.name}
- Category: ${product.category}
- Artisan: ${product.artisanName} from ${product.location}
- Price: ₹${product.price} (100% direct to artisan)
- Heritage Badge: ${product.tag}
- Story: ${product.description}

Buyer's Question: "${question}"

Respond warmly, concisely (2-4 sentences), accurately, and in ${targetLanguageName}. Highlight the artisan's heritage and practical buyer advice.`,
  };
}
