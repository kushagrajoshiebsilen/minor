// Intelligent Craft Description Analyzer & Professional Copy Synthesizer

const MATERIAL_PATTERNS = [
  { keywords: ['silk', 'katan', 'tussar', 'chanderi', 'resham', 'रेशम', 'सिल्क'], label: 'Pure Handloom Silk' },
  { keywords: ['cotton', 'sooti', 'सूती', 'कॉटन', 'malmal'], label: 'Organic Handspun Cotton' },
  { keywords: ['clay', 'terracotta', 'mitti', 'मिट्टी', 'टेराकोटा', 'earthen'], label: 'Natural Earthen Terracotta' },
  { keywords: ['brass', 'peetal', 'पीतल', 'bronze', 'kansa', 'metal', 'धातु'], label: 'Hand-Cast Bell Brass / Metal' },
  { keywords: ['wood', 'lakdi', 'लकड़ी', 'teak', 'sheesham', 'rosewood'], label: 'Seasoned Natural Hardwood' },
  { keywords: ['wool', 'pashmina', 'oon', 'ऊन', 'merino', 'कश्मीरी ऊन'], label: 'Pure Kashmiri Wool / Pashmina' },
  { keywords: ['zari', 'zaree', 'जरी', 'gold thread', 'silver thread'], label: 'Traditional Zari Embroidery' },
  { keywords: ['vegetable dye', 'natural dye', 'rang', 'रंग', 'herbal'], label: 'Organic Natural Plant Dyes' },
  { keywords: ['leather', 'chamda', 'चमड़ा'], label: 'Handcrafted Genuine Leather' },
  { keywords: ['jute', 'पटसन', 'जूट'], label: 'Eco-Friendly Jute Fiber' }
];

const TECHNIQUE_PATTERNS = [
  { keywords: ['loom', 'pit loom', 'handloom', 'हथकरघा', 'bunkar', 'weav'], label: 'Traditional Handloom Weaving' },
  { keywords: ['embroider', 'kadhai', 'कढ़ाई', 'zardozi', 'aari', 'chikankari', 'kantha'], label: 'Heritage Needlework & Embroidery' },
  { keywords: ['madhubani', 'mithila', 'painting', 'चित्रकला', 'warli', 'pattachitra', 'pichwai'], label: 'Folk Heritage Freehand Painting' },
  { keywords: ['potter', 'wheel', 'ghada', 'surahi', 'चाक', 'बर्तन'], label: 'Potter\'s Wheel Throwing & Kiln Baking' },
  { keywords: ['carv', 'naksh', 'नक्काशी', 'hand carved'], label: 'Intricate Hand Chisel Carving' },
  { keywords: ['dokra', 'dhokra', 'lost wax', 'casting'], label: 'Ancient Lost-Wax Metal Casting' },
  { keywords: ['block print', 'ajrakh', 'dabu', 'छपाई', 'hand print'], label: 'Wooden Block Hand-Printing' },
  { keywords: ['tie and dye', 'bandhani', 'leheriya', 'बांधनी'], label: 'Traditional Bandhani Tie & Dye' }
];

const ORIGIN_PATTERNS = [
  { keywords: ['varanasi', 'banaras', 'kashi', 'बनारस', 'वाराणसी'], label: 'Varanasi, Uttar Pradesh' },
  { keywords: ['kashmir', 'srinagar', 'कश्मीर'], label: 'Srinagar, Jammu & Kashmir' },
  { keywords: ['bihar', 'madhubani', 'मिथिला', 'बिहार'], label: 'Mithila, Bihar' },
  { keywords: ['rajasthan', 'jaipur', 'jodhpur', 'राजस्थान', 'जयपुर'], label: 'Rajasthan' },
  { keywords: ['bengal', 'kolkata', 'krishnanagar', 'बंगाल'], label: 'West Bengal' },
  { keywords: ['karnataka', 'channapatna', 'मैसूर', 'कर्नाटक'], label: 'Karnataka' },
  { keywords: ['chhattisgarh', 'bastar', 'बस्तर'], label: 'Bastar, Chhattisgarh' },
  { keywords: ['gujarat', 'kutch', 'कच्छ', 'गुजरात'], label: 'Kutch, Gujarat' }
];

const CARE_PATTERNS = [
  { keywords: ['dry clean', 'ड्राई क्लीन', 'dryclean'], label: 'Dry clean recommended to preserve fine artisanal texture' },
  { keywords: ['hand wash', 'cold wash', 'धोएं', 'gentle wash'], label: 'Gentle handwash with cold water and mild detergent' },
  { keywords: ['sun', 'dhoop', 'धूप'], label: 'Dry in shade away from direct intense sunlight' },
  { keywords: ['wipe', 'cloth', 'कपड़ा', 'clean'], label: 'Clean with a soft dry or damp cotton cloth' }
];

export const analyzeDescription = (text = '', productName = '', category = '') => {
  const lower = text.toLowerCase();

  // 1. Detect Time / Days taken
  let timeDetected = null;
  const timeRegex = /(\d+)\s*(days?|din|दिन|hours?|ghante|घंटे|weeks?|hafte|हफ्ते|months?|mahine|महीने)/i;
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    const num = timeMatch[1];
    const unit = timeMatch[2].toLowerCase();
    if (unit.includes('din') || unit.includes('दिन') || unit.includes('day')) {
      timeDetected = `${num} Days of Artisanal Crafting`;
    } else if (unit.includes('hour') || unit.includes('ghante') || unit.includes('घंटे')) {
      timeDetected = `${num} Hours of Hand Detailing`;
    } else if (unit.includes('week') || unit.includes('hafte') || unit.includes('हफ्ते')) {
      timeDetected = `${num} Weeks of Dedicated Loom/Craft Work`;
    } else {
      timeDetected = `${num} Months of Master Craftsmanship`;
    }
  }

  // 2. Detect Materials
  const materialsDetected = [];
  MATERIAL_PATTERNS.forEach(pat => {
    if (pat.keywords.some(k => lower.includes(k))) {
      materialsDetected.push(pat.label);
    }
  });

  // 3. Detect Technique
  const techniquesDetected = [];
  TECHNIQUE_PATTERNS.forEach(pat => {
    if (pat.keywords.some(k => lower.includes(k))) {
      techniquesDetected.push(pat.label);
    }
  });

  // 4. Detect Origin
  let originDetected = null;
  ORIGIN_PATTERNS.forEach(pat => {
    if (pat.keywords.some(k => lower.includes(k))) {
      originDetected = pat.label;
    }
  });

  // 5. Detect Care Instructions
  const careDetected = [];
  CARE_PATTERNS.forEach(pat => {
    if (pat.keywords.some(k => lower.includes(k))) {
      careDetected.push(pat.label);
    }
  });

  // Fallbacks if not detected
  const finalMaterial = materialsDetected.length > 0 
    ? materialsDetected.join(' & ') 
    : (category.includes('Clay') ? 'Natural Earthen Terracotta' : category.includes('Textiles') ? 'Fine Handloom Fiber' : 'Authentic Handcrafted Materials');

  const finalTechnique = techniquesDetected.length > 0 
    ? techniquesDetected.join(' & ') 
    : 'Traditional Handmade Technique';

  const finalTime = timeDetected || 'Intricately Handcrafted Over Several Days';
  const finalCare = careDetected.length > 0 
    ? careDetected[0] 
    : 'Store in a clean, dry place; handle with artisanal care';

  return {
    raw: text,
    time: timeDetected,
    materials: materialsDetected,
    techniques: techniquesDetected,
    origin: originDetected,
    care: careDetected,
    summary: {
      time: finalTime,
      material: finalMaterial,
      technique: finalTechnique,
      origin: originDetected || 'Authentic Regional Indian Artisan Cluster',
      care: finalCare
    },
    qualityScore: Math.min(100, Math.round(
      (text.length > 10 ? 25 : 10) +
      (timeDetected ? 25 : 0) +
      (materialsDetected.length > 0 ? 25 : 0) +
      (techniquesDetected.length > 0 ? 25 : 0)
    ))
  };
};

export const generateProfessionalDescription = (analysis, productName = '', category = '', language = 'hi') => {
  const pName = productName.trim() || (language === 'hi' ? 'हस्तशिल्प उत्पाद' : 'Handcrafted Artisan Creation');
  const { summary, raw } = analysis;
  const isHindi = language === 'hi';

  if (isHindi) {
    return `पारंपरिक भारतीय हस्तकला की उत्कृष्ट धरोहर के रूप में तैयार किया गया "${pName}"। यह कृति ${summary.time.toLowerCase()} के कठिन परिश्रम और समर्पण से बनाई गई है। 

मुख्य विशेषताएं:
• सामग्री: ${summary.material}
• शिल्प तकनीक: ${summary.technique}
• निर्माण समय: ${summary.time}
• मूल क्षेत्र: ${summary.origin}

विवरण व शिल्पकार की कहानी:
${raw.trim() ? `कारीगर के शब्दों में: "${raw.trim()}"। ` : ''}यह उत्पाद 100% प्रामाणिक, पर्यावरण-अनुकूल और ग्रामीण कारीगरों की जीविका का प्रत्यक्ष समर्थन करता है। प्रत्येक टुकड़ा हाथ से बनाए जाने के कारण अपने आप में अनूठा है।

देखभाल निर्देश:
${summary.care}।`;
  }

  // English Professional E-Commerce Output
  return `Elegantly handcrafted to celebrate authentic Indian artisanal heritage, this "${pName}" is a testament to timeless skill and patient craftsmanship. Handcrafted with devotion, it represents ${summary.time.toLowerCase()} of fine manual precision.

Key Artisan Specifications:
• Craftsmanship Time: ${summary.time}
• Raw Material: ${summary.material}
• Craft Technique: ${summary.technique}
• Heritage Region: ${summary.origin}

Product Narrative & Authenticity:
${raw.trim() ? `Artisan's authentic craft notes: "${raw.trim()}". ` : ''}Each creation carries the distinct touch of the maker's hands, making no two pieces identical. By choosing this piece, you directly empower traditional Indian karigars and preserve sustainable, generational handicraft knowledge.

Care Guidelines:
${summary.care}.`;
};
