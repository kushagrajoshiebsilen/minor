import React from 'react';
import { Package, CheckCircle2, Truck, Home, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { ORDER_STEPS, getStatusLabel } from '../utils/orderEngine';

const STEP_ICONS = [Clock, CheckCircle2, Package, Truck, Home];

export default function BuyerOrdersHub({ orders, onSwitchToKarigar, t }) {
  if (orders.length === 0) {
    return (
      <div className="parchment-card rounded-3xl p-10 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-[#1b365d]/10 text-[#1b365d] flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="font-display text-2xl font-bold text-[#2c1d13]">No Orders Placed Yet</h3>
        <p className="text-xs sm:text-sm text-[#6d4f38] max-w-md mx-auto">
          Explore our curated GI-tagged crafts, complete a quick demo checkout, and track live progress straight from the artisan’s workshop here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="p-4 rounded-2xl indigo-glass text-[#f7f1e3] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#f0c76e]" />
          Live Workshop Tracking: Switch to Karigar Studio to accept & advance these orders in real time!
        </span>
        <button
          type="button"
          onClick={onSwitchToKarigar}
          className="px-3.5 py-1.5 rounded-xl bg-[#c88d28] text-[#11233e] font-extrabold cursor-pointer"
        >
          Open Karigar Orders →
        </button>
      </div>

      {orders.map((order) => {
        const currentIdx = Math.max(0, ORDER_STEPS.indexOf(order.status));
        return (
          <div key={order.orderId} className="parchment-card rounded-3xl p-5 sm:p-6 space-y-5">
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#c88d28]/25">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-[#1b365d] text-[#f0c76e]">
                  {order.orderId}
                </span>
                <span className="text-xs font-semibold text-[#6d4f38]">
                  Placed {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#b54426] block">
                  {getStatusLabel(order.status, t)}
                </span>
                {order.estimatedDays && (
                  <span className="text-[11px] font-semibold text-emerald-800">
                    Karigar Dispatch Estimate: {order.estimatedDays} days
                  </span>
                )}
              </div>
            </div>

            {/* 5-Stage Visual Stepper */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2 relative pt-2">
              {ORDER_STEPS.map((step, idx) => {
                const Icon = STEP_ICONS[idx];
                const reached = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step} className="flex flex-col items-center text-center gap-1.5 relative">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCurrent
                          ? 'bg-[#b54426] text-white border-[#f0c76e] scale-110 shadow-md'
                          : reached
                          ? 'bg-[#1b365d] text-[#f0c76e] border-[#1b365d]'
                          : 'bg-white/70 text-[#9c8168] border-[#c88d28]/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                        reached ? 'text-[#2c1d13]' : 'text-[#9c8168]'
                      }`}
                    >
                      {getStatusLabel(step, t)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Line Items */}
            <div className="space-y-2.5 pt-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl parchment-surface">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#2c1d13] truncate">{item.name}</h4>
                    <p className="text-xs text-[#6d4f38] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#b54426]" />
                      <span>
                        {item.artisanName} • {item.location}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#7c5c43]">Qty {item.quantity}</div>
                    <div className="font-extrabold text-sm text-[#1b365d]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="pt-3 border-t border-[#c88d28]/25 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5c4330]">
              <span>
                Delivering to: <strong>{order.buyerName}</strong> ({order.buyerLocation}) • Paid via{' '}
                <strong className="uppercase">{order.paymentMethod}</strong>
              </span>
              <span className="font-display text-lg font-bold text-[#1b365d]">
                Total: ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
