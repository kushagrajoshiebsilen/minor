// Rich Indian Handicraft Market Price Benchmarks (Offline Intelligence Fallback)

export const MARKET_BENCHMARKS = {
  'Pottery & Clay': {
    minPrice: 350,
    avgPrice: 920,
    maxPrice: 2600,
    recommendedFairPrice: 820,
    artisanRetentionNote:
      'Urban showrooms buy handcrafted terracotta from potters at ₹180–₹280 and retail at ₹950–₹1,450. Direct selling on KarigarBazaar lets you keep 100% of the fair retail value.',
    platforms: [
      { name: 'Amazon India', price: 999, logo: '🛍️', note: 'Standard kiln terracotta' },
      { name: 'FabIndia', price: 1490, logo: '🌿', note: 'Studio artisan collection' },
      { name: 'Etsy Global', price: 2450, logo: '🌍', note: 'Export hand-turned pottery' },
      { name: 'Govt. ONDC', price: 790, logo: '🏛️', note: 'Artisan co-op benchmark' },
    ],
  },
  'Handloom & Textiles': {
    minPrice: 1500,
    avgPrice: 3950,
    maxPrice: 13500,
    recommendedFairPrice: 3550,
    artisanRetentionNote:
      'Middlemen and textile showrooms add 160% to 300% over loom-gate rates. Direct listing guarantees weavers receive the full value of weeks spent on the pit loom.',
    platforms: [
      { name: 'Amazon India', price: 3299, logo: '🛍️', note: 'Powerloom / blended weave' },
      { name: 'FabIndia', price: 5690, logo: '🌿', note: 'Pure handspun heritage weave' },
      { name: 'Etsy Global', price: 9200, logo: '🌍', note: 'Export authentic handloom' },
      { name: 'Govt. ONDC', price: 3650, logo: '🏛️', note: 'Handloom Mark co-op rate' },
    ],
  },
  'Paintings & Art': {
    minPrice: 950,
    avgPrice: 2750,
    maxPrice: 9800,
    recommendedFairPrice: 2350,
    artisanRetentionNote:
      'Commercial galleries take 45–55% commission on original Madhubani, Pattachitra, and Warli art. Selling direct lets folk artists retain 100% of their creative value.',
    platforms: [
      { name: 'Amazon India', price: 1999, logo: '🛍️', note: 'Canvas print imitation' },
      { name: 'FabIndia', price: 4100, logo: '🌿', note: 'Framed folk painting' },
      { name: 'Etsy Global', price: 7600, logo: '🌍', note: 'Original signed folk art' },
      { name: 'Govt. ONDC', price: 2200, logo: '🏛️', note: 'Tribal arts federation' },
    ],
  },
  'Metal & Brass': {
    minPrice: 1250,
    avgPrice: 3350,
    maxPrice: 8900,
    recommendedFairPrice: 2890,
    artisanRetentionNote:
      'Lost-wax Bastar Dhokra and Moradabad brassware involve intense foundry craftsmanship. Direct fair pricing beats middleman bulk rates by over 2.5x.',
    platforms: [
      { name: 'Amazon India', price: 2899, logo: '🛍️', note: 'Cast brass figurine' },
      { name: 'FabIndia', price: 4350, logo: '🌿', note: 'Handcrafted bell metal' },
      { name: 'Etsy Global', price: 7100, logo: '🌍', note: 'Antique export collectible' },
      { name: 'Govt. ONDC', price: 2950, logo: '🏛️', note: 'State emporium price' },
    ],
  },
  'Wood Carvings': {
    minPrice: 650,
    avgPrice: 1750,
    maxPrice: 5200,
    recommendedFairPrice: 1490,
    artisanRetentionNote:
      'Channapatna lacquer toy makers and Saharanpur wood carvers are routinely underpaid by traders. Benchmarking against lifestyle stores ensures fair daily artisan wages.',
    platforms: [
      { name: 'Amazon India', price: 1499, logo: '🛍️', note: 'Turned wooden decor' },
      { name: 'FabIndia', price: 2950, logo: '🌿', note: 'Sheesham / Teak craft' },
      { name: 'Etsy Global', price: 4400, logo: '🌍', note: 'Hand-carved heritage piece' },
      { name: 'Govt. ONDC', price: 1380, logo: '🏛️', note: 'GI wood-cluster rate' },
    ],
  },
};

export function computeLocalPricingBenchmark(category, productName = '', currentPrice = 0) {
  const base = MARKET_BENCHMARKS[category] || MARKET_BENCHMARKS['Pottery & Clay'];
  const lower = (productName || '').toLowerCase();

  let multiplier = 1;
  if (/(silk|katan|pashmina|zari|banarasi|kanchipuram|gold|silver|royal|bridal)/i.test(lower)) {
    multiplier = 1.35;
  } else if (/(mini|small|cup|diya|keychain|coaster|toy)/i.test(lower)) {
    multiplier = 0.72;
  }

  const minPrice = Math.round(base.minPrice * multiplier);
  const avgPrice = Math.round(base.avgPrice * multiplier);
  const maxPrice = Math.round(base.maxPrice * multiplier);
  const recommendedFairPrice = Math.round(base.recommendedFairPrice * multiplier);

  const numericCurrent = Number(currentPrice) || 0;
  let priceVerdict = `Suggested fair direct price is ₹${recommendedFairPrice.toLocaleString('en-IN')} — competitive for buyers while maximizing artisan income.`;
  if (numericCurrent > 0) {
    if (numericCurrent < minPrice) {
      priceVerdict = `Your price (₹${numericCurrent.toLocaleString('en-IN')}) is below fair market minimum. Consider raising to ₹${recommendedFairPrice.toLocaleString('en-IN')} so your craftsmanship isn't undervalued.`;
    } else if (numericCurrent <= avgPrice) {
      priceVerdict = `Sweet Spot! ₹${numericCurrent.toLocaleString('en-IN')} offers unbeatable direct-to-artisan value compared to urban retail showrooms.`;
    } else if (numericCurrent <= maxPrice) {
      priceVerdict = `Premium Heritage tier! Highlight your GI tag, crafting days, and natural materials to justify ₹${numericCurrent.toLocaleString('en-IN')}.`;
    } else {
      priceVerdict = `Collector's Luxury tier — ideal for museum-grade, signed, one-of-one masterworks.`;
    }
  }

  return {
    minPrice,
    avgPrice,
    maxPrice,
    recommendedFairPrice,
    artisanRetentionNote: base.artisanRetentionNote,
    priceVerdict,
    platforms: base.platforms.map((p) => ({
      ...p,
      price: Math.round(p.price * multiplier),
    })),
  };
}
