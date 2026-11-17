import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Lock,
  QrCode,
  CreditCard,
  Landmark,
  Banknote,
  ShieldCheck,
  MapPin,
  User,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrderRecord } from '../utils/orderEngine';

export default function CheckoutModal({
  isOpen,
  onClose,
  itemsToBuy,
  buyerProfile,
  phone,
  onOrderCreated,
  t,
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiId, setUpiId] = useState('artisanlover@okicici');
  const [bankName, setBankName] = useState('State Bank of India');
  const [processing, setProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  if (!isOpen) return null;

  const subtotal = itemsToBuy.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const deliveryFee = subtotal >= 999 ? 0 : 79;
  const total = subtotal + deliveryFee;

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      const order = createOrderRecord({
        items: itemsToBuy,
        buyerProfile,
        phone,
        paymentMethod,
      });
      setProcessing(false);
      setCreatedOrder(order);
      onOrderCreated(order);

      try {
        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti failure
      }
    }, 1100);
  };

  const handleClose = () => {
    setCreatedOrder(null);
    onClose();
  };

  const methods = [
    { id: 'upi', label: 'UPI (GPay / PhonePe)', icon: QrCode },
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'netbanking', label: 'Net Banking', icon: Landmark },
    { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
      <div className="parchment-card rounded-3xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="indigo-glass px-6 py-4 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c88d28]/25 border border-[#c88d28]/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#f0c76e]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                {createdOrder ? t.orderConfirmed : 'Direct-to-Artisan Secure Checkout'}
              </h2>
              <p className="text-xs text-[#f7f1e3]/75">
                {createdOrder
                  ? 'Live order synced to both Buyer Tracking & Karigar Studio'
                  : '256-Bit Encrypted • 0% Middleman Commission'}
              </p>
            </div>
          </div>
          {!processing && (
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        {createdOrder ? (
          <div className="p-7 sm:p-9 text-center space-y-5 overflow-y-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-4 border-emerald-200">
              <CheckCircle2 className="w-11 h-11" />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-extrabold px-3.5 py-1 rounded-full bg-[#1b365d] text-[#f0c76e]">
                Order ID: {createdOrder.orderId}
              </span>
              <h3 className="font-display text-3xl font-bold text-[#2c1d13] pt-2">
                Dhanyavaad, {createdOrder.buyerName}!
              </h3>
              <p className="text-xs sm:text-sm text-[#5c4330] max-w-md mx-auto">
                Your direct artisan payment of <strong>₹{createdOrder.totalAmount.toLocaleString('en-IN')}</strong> has been notified to the Karigar’s Atelier. Track live acceptance, packing, and shipping in <strong>My Orders</strong>!
              </p>
            </div>

            <div className="p-4 rounded-2xl parchment-surface text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-[#7c5c43]">Payment Method:</span>
                <strong className="uppercase text-[#2c1d13]">{createdOrder.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7c5c43]">Delivery Location:</span>
                <strong className="text-[#2c1d13]">{createdOrder.buyerLocation}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7c5c43]">Direct Artisan Payout:</span>
                <strong className="text-emerald-800">₹{createdOrder.subtotal.toLocaleString('en-IN')} (100%)</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="btn-terracotta px-8 py-3.5 rounded-2xl text-sm font-extrabold cursor-pointer"
            >
              Continue Exploring & Track Order
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmPayment} className="p-6 overflow-y-auto space-y-5">
            {/* Delivery Address Bar */}
            <div className="p-3.5 rounded-2xl parchment-surface flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#1b365d]" />
                <strong>{buyerProfile.name}</strong>
                <span className="text-[#7c5c43]">(+91 {phone || 'Verified'})</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5c4330]">
                <MapPin className="w-4 h-4 text-[#b54426]" />
                <span>{buyerProfile.location}</span>
              </div>
            </div>

            {/* Order Items Mini Summary */}
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {itemsToBuy.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/80 border border-[#c88d28]/20 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[#2c1d13] truncate">{item.name}</div>
                      <div className="text-[10px] text-[#7c5c43]">Qty {item.quantity || 1} • {item.artisanName}</div>
                    </div>
                  </div>
                  <strong className="text-[#1b365d] shrink-0">
                    ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                  </strong>
                </div>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d4f38] block mb-2.5">
                Select Indian Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {methods.map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                        active
                          ? 'bg-[#1b365d] text-[#f7f1e3] border-[#c88d28] shadow'
                          : 'bg-white/80 hover:bg-white text-[#2c1d13] border-[#c88d28]/30'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-[#f0c76e]' : 'text-[#b54426]'}`} />
                      <span className="text-[11px] font-bold leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Details Panel */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-white/85 border border-[#c88d28]/30 space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                    <span key={app} className="px-2.5 py-1 rounded-full bg-[#ede1ca] text-[#2c1d13]">
                      {app}
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter your UPI ID (e.g. name@oksbi)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c88d28]/35 text-sm font-semibold text-[#2c1d13]"
                />
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-white/85 border border-[#c88d28]/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Card Number (Demo: 4242 4242 4242 4242)"
                  defaultValue="4242 4242 4242 4242"
                  className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c88d28]/35 text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  defaultValue="12/29"
                  className="px-4 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c88d28]/35 text-xs font-mono font-bold"
                />
                <input
                  type="password"
                  required
                  placeholder="CVV"
                  defaultValue="123"
                  className="px-4 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c88d28]/35 text-xs font-mono font-bold"
                />
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="p-4 rounded-2xl bg-white/85 border border-[#c88d28]/30">
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c88d28]/35 text-sm font-bold text-[#2c1d13]"
                >
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                Pay securely in cash or UPI scan upon receiving your handcrafted parcel at your doorstep.
              </div>
            )}

            {/* Final Breakdown & CTA */}
            <div className="p-4 rounded-2xl bg-[#efe4cf]/90 border border-[#c88d28]/35 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Direct Artisan Payout ({deliveryFee === 0 ? 'Free Shipping' : `+₹${deliveryFee} Shipping`})
                </div>
                <div className="font-display text-3xl font-bold text-[#1b365d]">
                  ₹{total.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="btn-terracotta px-6 py-3.5 rounded-2xl text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 text-[#f0c76e]" />
                <span>{processing ? 'Processing Direct Payout...' : `Pay ₹${total.toLocaleString('en-IN')}`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
