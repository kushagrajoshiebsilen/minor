import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  t,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingTarget = 999;
  const remaining = Math.max(0, freeShippingTarget - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingTarget) * 100);
  const shippingFee = subtotal === 0 || subtotal >= freeShippingTarget ? 0 : 79;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs">
      <div className="parchment-card w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="indigo-glass px-5 py-4 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#f0c76e]" />
            <div>
              <h2 className="font-display text-xl font-bold">{t.yourCart}</h2>
              <span className="text-[11px] text-[#f7f1e3]/75">{cartItems.length} craft line(s)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        {cartItems.length > 0 && (
          <div className="px-5 py-3 bg-[#efe4cf]/90 border-b border-[#c88d28]/25 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2c1d13]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#b54426]" />
                {remaining === 0 ? (
                  <span className="text-emerald-800">{t.freeShippingUnlocked}</span>
                ) : (
                  <span>Add ₹{remaining.toLocaleString('en-IN')} more for FREE pan-India shipping</span>
                )}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#b54426] to-emerald-600 transition-all"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#1b365d]/10 text-[#1b365d] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#2c1d13]">{t.emptyCart}</h3>
              <p className="text-xs text-[#6d4f38] max-w-xs">
                Every craft you add directly supports an independent Indian artisan workshop with 0% middleman commission.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl parchment-surface flex items-center gap-3"
              >
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#2c1d13] truncate">{item.name}</h4>
                  <p className="text-[11px] text-[#6d4f38] truncate">{item.artisanName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-sm text-[#1b365d]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <div className="inline-flex items-center gap-1 bg-white rounded-lg border border-[#c88d28]/30 p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-[#ede1ca] rounded cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-[#ede1ca] rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-[#8c7058] hover:text-red-700 cursor-pointer self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-[#efe4cf]/95 border-t border-[#c88d28]/30 space-y-3">
            <div className="space-y-1.5 text-xs text-[#5c4330]">
              <div className="flex justify-between">
                <span>Direct Artisan Subtotal</span>
                <strong className="text-[#2c1d13]">₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Insured Pan-India Delivery</span>
                <strong className={shippingFee === 0 ? 'text-emerald-700' : 'text-[#2c1d13]'}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </strong>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1b365d] pt-2 border-t border-[#c88d28]/25">
                <span>Total Payable</span>
                <span>₹{(subtotal + shippingFee).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t.directToArtisan}</span>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="btn-terracotta w-full py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
