/**
 * orderUtils.js — Order state helpers for KarigarBazaar delivery flow
 */

export const ORDER_STATUS = {
  PENDING_KARIGAR: 'pending_karigar',   // Order placed, waiting for karigar
  ACCEPTED:        'accepted',           // Karigar accepted + entered days
  PACKED:          'packed',             // Karigar packed the item
  DISPATCHED:      'dispatched',         // Out for delivery
  DELIVERED:       'delivered',          // Delivered to buyer
};

export const STATUS_LABELS = {
  en: {
    pending_karigar: 'Awaiting Karigar Confirmation',
    accepted:        'Order Accepted by Karigar',
    packed:          'Packed & Ready to Ship',
    dispatched:      'Out for Delivery',
    delivered:       'Delivered',
  },
  hi: {
    pending_karigar: 'कारीगर की पुष्टि का इंतज़ार',
    accepted:        'कारीगर ने स्वीकार किया',
    packed:          'पैक होकर शिपमेंट के लिए तैयार',
    dispatched:      'डिलीवरी के रास्ते में',
    delivered:       'डिलीवर हो गया',
  },
};

export const STATUS_ICONS = ['📦', '✅', '🎁', '🚚', '🏠'];
export const STATUS_STEPS = [
  ORDER_STATUS.PENDING_KARIGAR,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PACKED,
  ORDER_STATUS.DISPATCHED,
  ORDER_STATUS.DELIVERED,
];

export function createOrder({ product, buyerProfile, phone, paymentMethod, quantity }) {
  return {
    orderId:      `SIH-${Math.floor(100000 + Math.random() * 900000)}`,
    product:      { ...product, quantity: quantity || 1 },
    buyerName:    buyerProfile?.name || 'Buyer',
    buyerLocation:buyerProfile?.location || 'India',
    phone:        phone || '',
    paymentMethod,
    status:       ORDER_STATUS.PENDING_KARIGAR,
    estimatedDays: null,
    placedAt:     new Date().toISOString(),
    acceptedAt:   null,
    dispatchedAt: null,
    deliveredAt:  null,
    artisanName:  product?.artisanName || 'Karigar',
    productLocation: product?.location || '',
    totalAmount:  (product?.price || 0) * (quantity || 1),
  };
}

export function advanceOrderStatus(order) {
  const idx = STATUS_STEPS.indexOf(order.status);
  if (idx === -1 || idx >= STATUS_STEPS.length - 1) return order;
  const next = STATUS_STEPS[idx + 1];
  const now = new Date().toISOString();
  const updates = { status: next };
  if (next === ORDER_STATUS.ACCEPTED) updates.acceptedAt = now;
  if (next === ORDER_STATUS.DISPATCHED) updates.dispatchedAt = now;
  if (next === ORDER_STATUS.DELIVERED) updates.deliveredAt = now;
  return { ...order, ...updates };
}
