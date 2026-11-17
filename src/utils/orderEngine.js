export const ORDER_STATUS = {
  PENDING_KARIGAR: 'pending_karigar',
  ACCEPTED: 'accepted',
  PACKED: 'packed',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
};

export const ORDER_STEPS = [
  ORDER_STATUS.PENDING_KARIGAR,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PACKED,
  ORDER_STATUS.DISPATCHED,
  ORDER_STATUS.DELIVERED,
];

export function getStatusLabel(status, t) {
  switch (status) {
    case ORDER_STATUS.PENDING_KARIGAR:
      return t?.stepPending || 'Awaiting Karigar Confirmation';
    case ORDER_STATUS.ACCEPTED:
      return t?.stepAccepted || 'Accepted by Karigar';
    case ORDER_STATUS.PACKED:
      return t?.stepPacked || 'Packed in Atelier';
    case ORDER_STATUS.DISPATCHED:
      return t?.stepDispatched || 'Out for Delivery';
    case ORDER_STATUS.DELIVERED:
      return t?.stepDelivered || 'Delivered Safely';
    default:
      return status;
  }
}

export function createOrderRecord({ items, buyerProfile, phone, paymentMethod }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const shippingFee = subtotal >= 999 ? 0 : 79;
  const orderId = `KB-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    orderId,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity || 1,
      artisanName: item.artisanName,
      location: item.location,
      category: item.category,
      tag: item.tag,
    })),
    buyerName: buyerProfile?.name || 'Conscious Buyer',
    buyerLocation: buyerProfile?.location || 'India',
    buyerPhone: phone || '',
    paymentMethod,
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee,
    status: ORDER_STATUS.PENDING_KARIGAR,
    estimatedDays: null,
    placedAt: new Date().toISOString(),
    acceptedAt: null,
    packedAt: null,
    dispatchedAt: null,
    deliveredAt: null,
  };
}

export function advanceOrderStatus(order) {
  const idx = ORDER_STEPS.indexOf(order.status);
  if (idx === -1 || idx >= ORDER_STEPS.length - 1) return order;
  const next = ORDER_STEPS[idx + 1];
  const now = new Date().toISOString();
  return {
    ...order,
    status: next,
    ...(next === ORDER_STATUS.ACCEPTED ? { acceptedAt: now } : {}),
    ...(next === ORDER_STATUS.PACKED ? { packedAt: now } : {}),
    ...(next === ORDER_STATUS.DISPATCHED ? { dispatchedAt: now } : {}),
    ...(next === ORDER_STATUS.DELIVERED ? { deliveredAt: now } : {}),
  };
}

export function generateCertificateHash(product) {
  const seed = `${product?.id || 'kb'}-${product?.artisanName || 'artisan'}-${product?.location || 'india'}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `KB-GI-2026-${hex}`;
}
