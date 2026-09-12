import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  t
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Cart Header */}
          <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  {t.cartTitle}
                </h2>
                <span className="text-xs text-stone-500">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)} {t.itemsInCart}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
              title="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800 mb-1">{t.emptyCart}</h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Explore authentic handicrafts directly from Indian artisans and add them to your cart.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 shadow-sm transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3.5 rounded-2xl border border-stone-200 bg-stone-50/40 hover:bg-white hover:shadow-sm transition"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate font-serif">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-red-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        By {item.artisanName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-extrabold text-stone-900 font-serif">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer / Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-stone-200 bg-stone-50/70 space-y-4">
              
              {/* Delivery info */}
              <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {deliveryFee === 0
                    ? '🎉 You qualify for FREE direct artisan shipping!'
                    : 'Add items worth ₹' + (999 - subtotal) + ' more for FREE shipping'}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.deliveryFee}</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>{t.totalAmount}</span>
                  <span className="text-base font-extrabold font-serif text-orange-600">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                <span>100% Secure Payment • Direct to Artisan Bank Account</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
