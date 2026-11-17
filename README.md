# 🏺 KarigarBazaar — Royal Indian Artisan Atelier (SIH 2026)

> **Direct-to-Artisan Heritage Marketplace • 15 Indian Languages • Provider-Agnostic AI (xAI Grok / Gemini / Groq / OpenAI) • 0% Middleman Commerce**

KarigarBazaar bridges India's master traditional artisans (*Karigars*) directly with conscious buyers nationwide—eliminating commercial middlemen, protecting fair artisan wages, and removing digital/language barriers through voice-first regional tooling and multimodal AI.

---

## ✨ Key Highlights & Upgraded Features

### 🎬 Royal Atelier Visual Experience
- **Cinematic Intro Splash (`public/start.mp4`):** Fullscreen intro animation with mute/unmute toggle, live progress bar, skip control, smooth fade transition, and header replay option.
- **Artisan Workbench Backdrop (`public/background.png`):** Full-viewport handcrafted studio backdrop paired with frosted handmade-parchment glass UI cards in Deep Indigo (`#1B365D`), Terracotta (`#B54426`), and Zari Gold (`#C88D28`).

### 🤖 Provider-Agnostic AI Engine (Zero Re-Training Architecture)
- **Default Primary Provider:** **xAI Grok** (`grok-3-mini` + `grok-2-vision-1212`).
- **Instant Hot-Swap Without Retraining:** All Indian craft expertise, GI-tag cluster knowledge, pricing logic, storytelling rules, and strict JSON output schemas live in [`src/ai/craftKnowledgeBase.js`](src/ai/craftKnowledgeBase.js). Switching to **Google Gemini**, **GroqCloud**, or **OpenAI** requires changing only `AI_PROVIDER` and the API key in `.env` (or via the in-app **AI Engine** modal).
- **Smart Automatic Multi-AI Failover:** Automatically falls back across all configured keys (`GROK → GEMINI → GROQ → OPENAI`) if any upstream provider hits rate limits or quota caps, with a graceful offline fallback mode when no keys are set.

### 🗣️ 15 Indian Regional Languages (UI + Voice + Live AI Translation)
Supports **English, हिन्दी (Hindi), ગુજરાતી (Gujarati), தமிழ் (Tamil), తెలుగు (Telugu), বাংলা (Bengali), मराठी (Marathi), ಕನ್ನಡ (Kannada), മലയാളം (Malayalam), ਪੰਜਾਬੀ (Punjabi), ଓଡ଼ିଆ (Odia), اردو (Urdu with RTL), অসমীয়া (Assamese), राजस्थानी (Rajasthani), and कश्मीरी (Kashmiri)**:
- Regional Speech-to-Text dictation (`Web Speech API`) across all Indian BCP-47 locales.
- Built-in `/api/tts` regional audio proxy with automatic browser `speechSynthesis` fallback.
- On-demand **1-click Live AI Translation** of any craft listing into all 15 languages.

### 🛠️ Karigar Atelier Studio (For Artisans)
- **AI Vision Craft Inspector:** Upload any craft photo and click **AI Vision Scan** to auto-detect category, craft title, materials, traditional technique, GI-tag eligibility, description, and fair direct price.
- **6-Step Voice Listing Guide:** Hands-free audio-guided onboarding wizard + individual microphone & audio-readout buttons on every form field.
- **AI Craft Storyteller & Attribute Analyzer:** Converts rough regional notes into museum-grade product storytelling in English or the artisan's chosen regional language.
- **Royal Atelier Photo Studio:** Browser-native HTML5 Canvas studio with 5 heritage backdrops (*Royal Atelier Gold, Terracotta Spotlight, Handloom Indigo, Boutique White, Natural Khadi Jute*), `4:3`/`1:1`/`4:5` ratios, Zari Gold frame, lighting sliders, and a draggable **Before / After** slider.
- **Live Market Price Advisor:** Benchmarks direct fair artisan prices against **Amazon India, FabIndia, Etsy Global, and Govt. ONDC** with a visual price position spectrum and middleman markup breakdown.
- **My Atelier Catalog & Live Incoming Orders Hub:** Manage published listings, accept buyer orders with estimated crafting days, and advance orders through all 5 fulfillment stages.

### 🛍️ Conscious Buyer Marketplace (For Shoppers)
- **National Heritage Bazaar:** Instant multi-field search, category filters, **GI-Tagged Only** toggle, price/rating sorting, wishlist hearts, and editable delivery details.
- **Rich Craft Inspection Modal:** Live 15-language AI translation, audio readout, verifiable **Digital GI & Authenticity Certificate** (`KB-GI-2026-...`), and interactive **Ask AI Craft Concierge** Q&A.
- **Cart Drawer & Multi-Mode Indian Checkout:** Free pan-India shipping progress bar (₹999+), UPI (GPay / PhonePe / Paytm / BHIM), Credit/Debit Card, Net Banking, Cash on Delivery (COD), and celebratory confetti confirmation.
- **Live 5-Stage Order Tracking:** Synced in real time with the Karigar Studio (`Awaiting Confirmation → Accepted → Packed → Dispatched → Delivered`).

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Icons & FX** | Lucide React, Canvas Confetti |
| **AI Middleware** | Vite Dev Server Proxy (`/api/ai/chat`, `/api/ai/status`) supporting xAI Grok, Google Gemini, Groq, and OpenAI |
| **Speech & Audio** | Web Speech API (STT) + Vite Regional TTS Proxy (`/api/tts`) |
| **Photo Studio** | HTML5 Canvas 2D Engine |
| **State Persistence** | Browser `localStorage` |

---

## 🚀 Getting Started Locally

### 1. Clone & Install
```bash
git clone https://github.com/kushagrajoshiebsilen/minor.git
cd minor
npm install
```

### 2. Configure AI API Keys (`.env`)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and add your preferred key(s):
```env
AI_PROVIDER=grok

XAI_API_KEY=your_xai_grok_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
```
> **Security Note:** `.env` is excluded via `.gitignore` so your secret API keys are never pushed to GitHub. You can also paste or switch keys directly inside the app's **AI Engine** modal in the header.

### 3. Run the Development Server
```bash
npm run dev
```
Open the local URL shown in your terminal (e.g., `http://localhost:5173/`).

### 4. Production Build & Lint
```bash
npm run build
npm run lint
```

---

## 📁 Project Structure

```text
├── public/
│   ├── start.mp4                    # Cinematic intro splash video
│   └── background.png               # Royal Artisan Atelier workbench backdrop
├── src/
│   ├── ai/
│   │   ├── craftKnowledgeBase.js    # Portable domain prompts & JSON contracts (zero retraining)
│   │   └── aiService.js             # Provider-agnostic AI client + offline fallbacks
│   ├── i18n/
│   │   └── languages.js             # 15 Indian languages + BCP-47 speech/TTS mappings
│   ├── data/
│   │   ├── heritageCatalog.js       # Curated Indian heritage crafts & studio presets
│   │   └── pricingBenchmarks.js     # National handicraft fair-pricing benchmarks
│   ├── utils/
│   │   ├── speechEngine.js          # Regional STT & TTS wrapper
│   │   └── orderEngine.js           # 5-stage order lifecycle & GI certificate hash
│   └── components/                  # IntroSplash, Onboarding, KarigarStudio, BuyerMarketplace, AI Modals, Orders & Checkout
├── vite.config.js                   # Unified Multi-AI Proxy (with Auto-Failover) + Regional TTS Proxy
├── .env.example                     # Template for Grok, Gemini, Groq, OpenAI keys
└── README.md
```

---

Built for **Smart India Hackathon (SIH 2026)** — *Vocal for Local • Zero Middleman • Direct Artisan Commerce*.
