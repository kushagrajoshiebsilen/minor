import React from 'react';
import {
  Package, CheckCircle, Truck, Home, Clock,
  MapPin, User, IndianRupee, Box, ShieldCheck
} from 'lucide-react';
import { ORDER_STATUS, STATUS_STEPS, STATUS_LABELS } from '../utils/orderUtils';

const STEP_META = [
  { icon: Package,      color: 'text-amber-600',  bg: 'bg-amber-100'  },
  { icon: CheckCircle,  color: 'text-blue-600',   bg: 'bg-blue-100'   },
  { icon: Box,          color: 'text-purple-600', bg: 'bg-purple-100' },
  { icon: Truck,        color: 'text-orange-600', bg: 'bg-orange-100' },
  { icon: Home,         color: 'text-emerald-600',bg: 'bg-emerald-100'},
];

export default function BuyerOrderTracking({ orders, language = 'en' }) {
  const isHindi = language === 'hi';
  const labels  = STATUS_LABELS[language] || STATUS_LABELS.en;

  const currentStepIndex = (status) => STATUS_STEPS.indexOf(status);

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-stone-400" />
        </div>
        <p className="text-stone-500 font-medium text-sm">
          {isHindi
            ? 'आपका अभी कोई ऑर्डर नहीं है। खरीदारी शुरू करें!'
            : 'No orders yet. Start shopping and your orders will appear here!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const stepIdx   = currentStepIndex(order.status);
        const isDelivered = order.status === ORDER_STATUS.DELIVERED;
        const placedDate  = new Date(order.placedAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        });

        return (
          <div
            key={order.orderId}
            className={`rounded-2xl border-2 overflow-hidden shadow-sm ${
              isDelivered ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200 bg-white'
            }`}
          >
            {/* Order Header */}
            <div className="p-4 border-b border-stone-100 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                  {order.product?.image ? (
                    <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-stone-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-mono text-stone-400">{order.orderId}</p>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">{order.product?.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isHindi ? 'कारीगर:' : 'By'} {order.artisanName}
                    {order.productLocation ? ` · ${order.productLocation}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-orange-600 flex items-center justify-end gap-0.5">
                  <IndianRupee className="w-3 h-3" />
                  {order.totalAmount?.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">{placedDate}</p>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="p-4 sm:p-5">
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-200" />
                <div
                  className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-700"
                  style={{
                    width: stepIdx === 0
                      ? '0%'
                      : `${(stepIdx / (STATUS_STEPS.length - 1)) * (100)}%`,
                  }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const meta     = STEP_META[i];
                    const Icon     = meta.icon;
                    const isDone   = i <= stepIdx;
                    const isCurrent = i === stepIdx;

                    return (
                      <div key={step} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                            isDone
                              ? `${meta.bg} border-current ${meta.color} ${isCurrent ? 'ring-2 ring-offset-2 ring-current scale-110' : ''}`
                              : 'bg-white border-stone-200 text-stone-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-semibold text-center leading-tight ${
                          isDone ? 'text-stone-700' : 'text-stone-400'
                        }`} style={{ maxWidth: '60px' }}>
                          {labels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ETA / Info strip */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap gap-3 text-xs text-stone-500">
                {order.estimatedDays && order.status !== ORDER_STATUS.DELIVERED && (
                  <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {isHindi
                      ? `अनुमानित डिलीवरी: ${order.estimatedDays} दिन`
                      : `Est. delivery in ${order.estimatedDays} days`}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {order.buyerLocation}
                </span>
                {order.status === ORDER_STATUS.DISPATCHED && (
                  <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full font-semibold animate-pulse">
                    <Truck className="w-3.5 h-3.5" />
                    {isHindi ? 'रास्ते में है...' : 'On the way to you!'}
                  </span>
                )}
                {isDelivered && (
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isHindi ? 'डिलीवर हो गया ✓' : 'Delivered ✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
