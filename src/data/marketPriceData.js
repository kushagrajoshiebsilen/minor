// Realistic Market Price Comparison Data for Indian Handicrafts & Artisan Crafts

export const marketPriceBenchmarks = {
  'Pottery & Clay': {
    minPrice: 350,
    avgPrice: 850,
    maxPrice: 2400,
    recommendedFairPrice: 750,
    markupExplanation: 'Retail stores & middlemen usually buy from potters at ₹200-₹300 and sell at ₹850-₹1,200. On KarigarBazaar, you keep the full direct price.',
    platforms: [
      { name: 'Amazon India', price: 999, logo: '🛍️', note: 'Standard ceramic/terracotta' },
      { name: 'FabIndia', price: 1450, logo: '🌿', note: 'Studio artisan collection' },
      { name: 'Etsy Handicrafts', price: 2200, logo: '🌍', note: 'Export grade hand-carved' },
      { name: 'Government ONDC', price: 790, logo: '🏛️', note: 'Subsidized artisan rate' }
    ]
  },
  'Handloom & Textiles': {
    minPrice: 1500,
    avgPrice: 3800,
    maxPrice: 12500,
    recommendedFairPrice: 3400,
    markupExplanation: 'Showrooms and boutiques add 150% to 300% markup over loom gate prices. Direct selling gives you full handloom wage value.',
    platforms: [
      { name: 'Amazon India', price: 3299, logo: '🛍️', note: 'Powerloom/Blend imitation' },
      { name: 'FabIndia', price: 5490, logo: '🌿', note: 'Pure organic silk/cotton' },
      { name: 'Etsy Handicrafts', price: 8900, logo: '🌍', note: 'Artisanal heritage weave' },
      { name: 'Government ONDC', price: 3600, logo: '🏛️', note: 'Co-op weaver rate' }
    ]
  },
  'Paintings & Art': {
    minPrice: 900,
    avgPrice: 2600,
    maxPrice: 9500,
    recommendedFairPrice: 2250,
    markupExplanation: 'Art galleries take 40-50% commission on Mithila/Madhubani, Pattachitra and Warli paintings. You deserve 100% of your labor value.',
    platforms: [
      { name: 'Amazon India', price: 1999, logo: '🛍️', note: 'Digital print on canvas' },
      { name: 'FabIndia', price: 3950, logo: '🌿', note: 'Framed original artwork' },
      { name: 'Etsy Handicrafts', price: 7400, logo: '🌍', note: 'Direct folk artist original' },
      { name: 'Government ONDC', price: 2100, logo: '🏛️', note: 'Tribal arts federation' }
    ]
  },
  'Metal & Brass': {
    minPrice: 1200,
    avgPrice: 3200,
    maxPrice: 8500,
    recommendedFairPrice: 2800,
    markupExplanation: 'Lost-wax Dhokra and Moradabad brass require intensive foundry work. Benchmarking against branded brass decor guarantees premium fair price.',
    platforms: [
      { name: 'Amazon India', price: 2899, logo: '🛍️', note: 'Cast brass figurine' },
      { name: 'FabIndia', price: 4200, logo: '🌿', note: 'Handcrafted bell metal' },
      { name: 'Etsy Handicrafts', price: 6800, logo: '🌍', note: 'Antique finish export item' },
      { name: 'Government ONDC', price: 2900, logo: '🏛️', note: 'State handicraft emporium' }
    ]
  },
  'Wood Carvings': {
    minPrice: 650,
    avgPrice: 1650,
    maxPrice: 4800,
    recommendedFairPrice: 1450,
    markupExplanation: 'Wood carvers from Channapatna and Saharanpur get underpaid by middlemen. Compare against lifestyle catalogs to price fairly.',
    platforms: [
      { name: 'Amazon India', price: 1499, logo: '🛍️', note: 'Turned wooden craft' },
      { name: 'FabIndia', price: 2850, logo: '🌿', note: 'Rosewood/Teak decor' },
      { name: 'Etsy Handicrafts', price: 4200, logo: '🌍', note: 'Hand-carved collectible' },
      { name: 'Government ONDC', price: 1350, logo: '🏛️', note: 'GI Toy cluster pricing' }
    ]
  }
};

export const getMarketBenchmark = (category, productName = '', currentPrice = 0) => {
  const defaultData = marketPriceBenchmarks[category] || marketPriceBenchmarks['Pottery & Clay'];
  
  // Dynamic adjustment if high value words exist
  let multiplier = 1;
  const nameLower = productName.toLowerCase();
  if (nameLower.includes('silk') || nameLower.includes('katan') || nameLower.includes('pashmina') || nameLower.includes('silver') || nameLower.includes('gold')) {
    multiplier = 1.35;
  } else if (nameLower.includes('mini') || nameLower.includes('toy') || nameLower.includes('small') || nameLower.includes('cup')) {
    multiplier = 0.7;
  }

  const minPrice = Math.round(defaultData.minPrice * multiplier);
  const avgPrice = Math.round(defaultData.avgPrice * multiplier);
  const maxPrice = Math.round(defaultData.maxPrice * multiplier);
  const recommendedFairPrice = Math.round(defaultData.recommendedFairPrice * multiplier);

  return {
    ...defaultData,
    minPrice,
    avgPrice,
    maxPrice,
    recommendedFairPrice,
    platforms: defaultData.platforms.map(p => ({
      ...p,
      price: Math.round(p.price * multiplier)
    }))
  };
};
