import React, { useState } from 'react';
import { 
  X, CheckCircle, ShieldCheck, CreditCard, QrCode, Banknote, 
  MapPin, User, Sparkles, ArrowRight, Truck, Lock, Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  itemsToBuy,
  buyerProfile,
  phone,
  onOrderSuccess,
  t
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'cod'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const subtotal = itemsToBuy.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 999 ? 0 : 79;
  const total = subtotal + deliveryFee;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedId = `SIH-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setOrderCompleted(true);
      triggerConfetti();
      onOrderSuccess();
    }, 1500);
  };

  const handleFinish = () => {
    setOrderCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                {orderCompleted ? t.orderSuccessTitle : t.checkoutTitle}
              </h2>
              <span className="text-xs text-stone-500">
                {orderCompleted ? 'Order confirmed & dispatched' : 'Amazon-Style Secure Payment Gateway'}
              </span>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={handleFinish}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        {orderCompleted ? (
          /* Order Confirmation Screen */
          <div className="p-6 sm:p-10 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Verified
              </span>
              <h3 className="text-2xl font-bold text-stone-900 font-serif mt-3">
                {t.orderSuccessTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
                {t.orderSuccessMsg}
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left space-y-3 max-w-md mx-auto text-xs">
              <div className="flex justify-between pb-2 border-b border-stone-200 font-medium">
                <span className="text-stone-500">{t.orderId}:</span>
                <span className="font-bold text-stone-900 font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Delivering to:</span>
                <span className="font-semibold text-stone-900">{buyerProfile.name || 'Buyer'}, {buyerProfile.location || 'India'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Phone:</span>
                <span className="font-semibold text-stone-900">+91 {phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Mode:</span>
                <span className="font-semibold text-stone-900 uppercase">
                  {paymentMethod === 'upi' ? 'UPI / QR Code' : paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>Amount Paid:</span>
                <span className="text-orange-600 font-serif font-extrabold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Finish button */}
            <button
              onClick={handleFinish}
              className="w-full max-w-md mx-auto py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.continueShopping}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Checkout & Payment Selection */
          <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6">
            
            {/* Delivery Details Summary */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-500 block font-medium">Delivering order to:</span>
                  <span className="font-bold text-stone-900 text-sm">{buyerProfile.name || 'Buyer'}</span>
                  <span className="text-stone-600 block">{buyerProfile.location || 'India'}</span>
                </div>
              </div>

              {phone && (
                <div className="flex items-center gap-1.5 text-stone-600 font-medium bg-white px-3 py-1.5 rounded-lg border border-stone-200 self-start sm:self-auto">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>+91 {phone}</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <span>{t.selectPaymentMethod}</span>
              </label>

              {/* METHOD 1: UPI / QR CODE */}
              <label className={`block p-4 rounded-2xl border-2 transition cursor-pointer ${paymentMethod === 'upi' ? 'border-orange-600 bg-orange-50/40' : 'border-stone-200 hover:border-stone-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-bold text-stone-900">
                        {t.upiOption}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Instant & Free
                  </span>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-4 pt-4 border-t border-orange-200/60 pl-7 space-y-3 animate-fade-in">
                    <p className="text-xs text-stone-600">
                      Scan QR code or enter your UPI Virtual ID (e.g. mobile@upi):
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Stylized QR Code */}
                      <div className="w-24 h-24 bg-white p-2 rounded-xl border border-stone-300 shadow-xs flex flex-col items-center justify-center shrink-0">
                        <QrCode className="w-16 h-16 text-stone-900" />
                        <span className="text-[8px] font-bold text-stone-500 uppercase">SIH 2026 UPI</span>
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 font-medium">
                          <span>Supported:</span>
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded">Google Pay</span>
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded">PhonePe</span>
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded">Paytm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </label>

              {/* METHOD 2: CREDIT / DEBIT CARDS */}
              <label className={`block p-4 rounded-2xl border-2 transition cursor-pointer ${paymentMethod === 'card' ? 'border-orange-600 bg-orange-50/40' : 'border-stone-200 hover:border-stone-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-bold text-stone-900">
                        {t.cardOption}
                      </span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-4 pt-4 border-t border-orange-200/60 pl-7 space-y-3 animate-fade-in">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                      maxLength={19}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM / YY"
                        maxLength={5}
                        className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        maxLength={4}
                        className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </label>

              {/* METHOD 3: CASH ON DELIVERY */}
              <label className={`block p-4 rounded-2xl border-2 transition cursor-pointer ${paymentMethod === 'cod' ? 'border-orange-600 bg-orange-50/40' : 'border-stone-200 hover:border-stone-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-bold text-stone-900">
                        {t.codOption}
                      </span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'cod' && (
                  <p className="mt-3 pl-7 text-xs text-stone-500">
                    Pay cash or via QR to the courier person when your authentic craft is delivered.
                  </p>
                )}
              </label>

            </div>

            {/* Order Amount Summary */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items ({itemsToBuy.reduce((a, b) => a + b.quantity, 0)} items):</span>
                <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Artisan Delivery:</span>
                <span className="font-semibold text-stone-900">
                  {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-base font-bold text-stone-900">
                <span>Order Total:</span>
                <span className="font-extrabold text-orange-600 font-serif">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Payment with Bank...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'cod'
                      ? t.placeOrder
                      : `${t.payNow} ₹${total.toLocaleString('en-IN')}`}
                  </span>
                </div>
              )}
            </button>

            <div className="text-center">
              <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encryption • SIH 2026 Safe Artisan Commerce Guarantee</span>
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
