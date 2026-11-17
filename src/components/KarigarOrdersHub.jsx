import React, { useState } from 'react';
import { Package, CheckCircle2, Truck, Clock, MapPin, User, Inbox, BellRing, IndianRupee, ArrowRight } from 'lucide-react';
import { ORDER_STATUS, getStatusLabel, advanceOrderStatus } from '../utils/orderEngine';

export default function KarigarOrdersHub({ orders, setOrders, t }) {
  const [daysMap, setDaysMap] = useState({});

  const pendingOrders = orders.filter((o) => o.status === ORDER_STATUS.PENDING_KARIGAR);
  const activeOrders = orders.filter(
    (o) =>
      o.status === ORDER_STATUS.ACCEPTED ||
      o.status === ORDER_STATUS.PACKED ||
      o.status === ORDER_STATUS.DISPATCHED
  );
  const deliveredOrders = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED);

  const handleAccept = (orderId) => {
    const days = Math.max(1, parseInt(daysMap[orderId] || '4', 10));
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status: ORDER_STATUS.ACCEPTED,
              estimatedDays: days,
              acceptedAt: new Date().toISOString(),
            }
          : o
      )
    );
  };

  const handleAdvance = (orderId) => {
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? advanceOrderStatus(o) : o)));
  };

  const nextActionText = (status) => {
    if (status === ORDER_STATUS.ACCEPTED) return 'Mark Packed in Atelier';
    if (status === ORDER_STATUS.PACKED) return 'Mark Dispatched for Delivery';
    if (status === ORDER_STATUS.DISPATCHED) return 'Confirm Delivered Safely';
    return '';
  };

  if (orders.length === 0) {
    return (
      <div className="parchment-card rounded-3xl p-10 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-[#1b365d]/10 text-[#1b365d] flex items-center justify-center mx-auto">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="font-display text-2xl font-bold text-[#2c1d13]">No Incoming Orders Yet</h3>
        <p className="text-xs sm:text-sm text-[#6d4f38] max-w-md mx-auto">
          Switch to the <strong>Heritage Bazaar</strong> and place a test order—it will appear here immediately for you to accept, set crafting days, pack, and dispatch!
        </p>
      </div>
    );
  }

  const renderOrderCard = (order) => {
    const isPending = order.status === ORDER_STATUS.PENDING_KARIGAR;
    const isDelivered = order.status === ORDER_STATUS.DELIVERED;

    return (
      <div
        key={order.orderId}
        className={`parchment-card rounded-3xl p-5 sm:p-6 space-y-4 border-2 ${
          isPending ? 'border-[#b54426]/60' : 'border-[#c88d28]/35'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#c88d28]/25">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-[#1b365d] text-[#f0c76e]">
              {order.orderId}
            </span>
            <span className="text-xs font-semibold text-[#6d4f38]">
              {new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isPending
                ? 'bg-[#b54426]/15 text-[#8e3118] border-[#b54426]/35'
                : isDelivered
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-[#1b365d]/12 text-[#1b365d] border-[#1b365d]/25'
            }`}
          >
            {getStatusLabel(order.status, t)}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-2.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl parchment-surface">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#2c1d13] truncate">{item.name}</h4>
                <p className="text-xs text-[#6d4f38]">
                  Qty: <strong>{item.quantity}</strong> × ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right font-extrabold text-sm text-[#1b365d]">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        {/* Buyer & Payout Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white/75 border border-[#c88d28]/20 flex items-center gap-2">
            <User className="w-4 h-4 text-[#1b365d] shrink-0" />
            <div className="min-w-0">
              <span className="text-[#7c5c43] block text-[10px]">Buyer</span>
              <strong className="text-[#2c1d13] truncate block">{order.buyerName}</strong>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/75 border border-[#c88d28]/20 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#b54426] shrink-0" />
            <div className="min-w-0">
              <span className="text-[#7c5c43] block text-[10px]">Destination</span>
              <strong className="text-[#2c1d13] truncate block">{order.buyerLocation}</strong>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-emerald-800 block text-[10px]">100% Direct Payout ({order.paymentMethod.toUpperCase()})</span>
              <strong className="text-emerald-950 text-sm">₹{order.subtotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Fulfillment Actions */}
        {isPending && (
          <div className="p-4 rounded-2xl bg-[#b54426]/10 border border-[#b54426]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#8e3118]">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Estimated crafting / dispatch days:</span>
              <input
                type="number"
                min={1}
                max={45}
                value={daysMap[order.orderId] ?? '4'}
                onChange={(e) => setDaysMap({ ...daysMap, [order.orderId]: e.target.value })}
                className="w-16 px-2.5 py-1.5 rounded-lg bg-white border border-[#b54426]/40 text-center font-extrabold text-[#2c1d13]"
              />
              <span>days</span>
            </div>
            <button
              type="button"
              onClick={() => handleAccept(order.orderId)}
              className="btn-terracotta inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept & Confirm Order</span>
            </button>
          </div>
        )}

        {!isPending && !isDelivered && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-[#6d4f38] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#1b365d]" />
              Promised timeline: <strong>{order.estimatedDays || 4} days</strong>
            </span>
            <button
              type="button"
              onClick={() => handleAdvance(order.orderId)}
              className="btn-indigo inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <span>{nextActionText(order.status)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="parchment-card rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#8e3118]">
            <BellRing className="w-4 h-4" /> Pending Action
          </div>
          <div className="font-display text-3xl font-bold text-[#2c1d13] mt-1">{pendingOrders.length}</div>
        </div>
        <div className="parchment-card rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#1b365d]">
            <Package className="w-4 h-4" /> In Fulfillment
          </div>
          <div className="font-display text-3xl font-bold text-[#2c1d13] mt-1">{activeOrders.length}</div>
        </div>
        <div className="parchment-card rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" /> Delivered
          </div>
          <div className="font-display text-3xl font-bold text-[#2c1d13] mt-1">{deliveredOrders.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        {[...pendingOrders, ...activeOrders, ...deliveredOrders].map(renderOrderCard)}
      </div>
    </div>
  );
}
