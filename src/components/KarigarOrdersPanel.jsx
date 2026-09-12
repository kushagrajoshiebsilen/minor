import React, { useState } from 'react';
import {
  Package, Bell, CheckCircle, Truck, Clock, MapPin,
  User, ChevronRight, AlertCircle, Inbox, IndianRupee,
  Calendar, PhoneCall, BellRing
} from 'lucide-react';
import { ORDER_STATUS, STATUS_STEPS, STATUS_LABELS, advanceOrderStatus } from '../utils/orderUtils';

export default function KarigarOrdersPanel({ orders, setOrders, language = 'en' }) {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [daysInput, setDaysInput] = useState({});

  const isHindi = language === 'hi';

  // Only show orders relevant to this karigar (in a real app you'd filter by karigarId)
  const pendingOrders = orders.filter(o => o.status === ORDER_STATUS.PENDING_KARIGAR);
  const activeOrders  = orders.filter(o =>
    o.status === ORDER_STATUS.ACCEPTED ||
    o.status === ORDER_STATUS.PACKED ||
    o.status === ORDER_STATUS.DISPATCHED
  );
  const completedOrders = orders.filter(o => o.status === ORDER_STATUS.DELIVERED);

  const handleAcceptOrder = (orderId) => {
    const days = parseInt(daysInput[orderId] || '3', 10);
    if (!days || days < 1) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId !== orderId) return o;
        return {
          ...o,
          status: ORDER_STATUS.ACCEPTED,
          estimatedDays: days,
          acceptedAt: new Date().toISOString(),
        };
      })
    );
    setExpandedOrderId(null);
  };

  const handleAdvanceStatus = (orderId) => {
    setOrders(prev =>
      prev.map(o => o.orderId === orderId ? advanceOrderStatus(o) : o)
    );
  };

  const statusLabel = (status) =>
    (STATUS_LABELS[language] || STATUS_LABELS.en)[status] || status;

  const statusColor = (status) => {
    if (status === ORDER_STATUS.PENDING_KARIGAR) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === ORDER_STATUS.ACCEPTED)         return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === ORDER_STATUS.PACKED)           return 'bg-purple-100 text-purple-700 border-purple-200';
    if (status === ORDER_STATUS.DISPATCHED)       return 'bg-orange-100 text-orange-700 border-orange-200';
    if (status === ORDER_STATUS.DELIVERED)        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-stone-100 text-stone-600 border-stone-200';
  };

  const nextActionLabel = (status) => {
    if (isHindi) {
      if (status === ORDER_STATUS.ACCEPTED)   return 'पैक किया गया चिह्नित करें';
      if (status === ORDER_STATUS.PACKED)     return 'डिस्पैच किया हुआ चिह्नित करें';
      if (status === ORDER_STATUS.DISPATCHED) return 'डिलीवर हुआ चिह्नित करें';
    }
    if (status === ORDER_STATUS.ACCEPTED)   return 'Mark as Packed';
    if (status === ORDER_STATUS.PACKED)     return 'Mark as Dispatched';
    if (status === ORDER_STATUS.DISPATCHED) return 'Mark as Delivered';
    return '';
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-stone-400" />
        </div>
        <p className="text-stone-500 font-medium text-sm">
          {isHindi ? 'अभी कोई ऑर्डर नहीं आया है।' : 'No orders yet. When buyers place orders, they will appear here.'}
        </p>
      </div>
    );
  }

  const OrderCard = ({ order, isPending }) => {
    const isExpanded = expandedOrderId === order.orderId;
    const placedDate = new Date(order.placedAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
      <div
        className={`rounded-2xl border-2 transition-all overflow-hidden ${
          isPending
            ? 'border-amber-300 bg-amber-50/30 shadow-sm shadow-amber-100'
            : 'border-stone-200 bg-white'
        }`}
      >
        {/* Card Header */}
        <button
          onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
          className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-stone-50/50 transition"
        >
          <div className="flex items-start gap-3">
            {/* Product thumbnail */}
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 shrink-0">
              {order.product?.image ? (
                <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-stone-400" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-stone-500">{order.orderId}</span>
                {isPending && (
                  <span className="flex items-center gap-1 text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    <BellRing className="w-3 h-3" />
                    {isHindi ? 'नया ऑर्डर!' : 'New Order!'}
                  </span>
                )}
              </div>
              <p className="font-bold text-stone-900 text-sm mt-0.5 truncate max-w-[180px]">
                {order.product?.name}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {order.buyerName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {placedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor(order.status)}`}>
              {statusLabel(order.status)}
            </span>
            <span className="text-xs font-bold text-orange-600 flex items-center gap-0.5">
              <IndianRupee className="w-3 h-3" />
              {order.totalAmount?.toLocaleString('en-IN')}
            </span>
          </div>
        </button>

        {/* Expanded panel */}
        {isExpanded && (
          <div className="border-t border-stone-200 p-4 space-y-4 animate-fade-in">
            {/* Buyer Info */}
            <div className="bg-stone-50 rounded-xl p-3 space-y-1.5 text-xs">
              <p className="font-bold text-stone-700 mb-2 uppercase tracking-wide text-[10px]">
                {isHindi ? 'खरीदार की जानकारी' : 'Buyer Details'}
              </p>
              <div className="flex items-center gap-2 text-stone-600">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold">{order.buyerName}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{order.buyerLocation}</span>
              </div>
              {order.phone && (
                <div className="flex items-center gap-2 text-stone-600">
                  <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
                  <span>+91 {order.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-stone-600">
                <span className="font-medium">{isHindi ? 'भुगतान:' : 'Payment:'}</span>
                <span className="uppercase font-bold text-stone-800">
                  {order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'card' ? 'Card' : 'COD'}
                </span>
              </div>
            </div>

            {/* Accept Order with days (Pending only) */}
            {isPending && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700">
                  {isHindi
                    ? '📅 इस ऑर्डर को पूरा करने में कितने दिन लगेंगे?'
                    : '📅 How many days will you take to complete this order?'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={daysInput[order.orderId] || ''}
                    onChange={(e) => setDaysInput(prev => ({ ...prev, [order.orderId]: e.target.value }))}
                    placeholder={isHindi ? 'दिन दर्ज करें' : 'Enter days'}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-sm text-stone-500 font-medium">
                    {isHindi ? 'दिन' : 'days'}
                  </span>
                </div>
                <button
                  onClick={() => handleAcceptOrder(order.orderId)}
                  disabled={!daysInput[order.orderId]}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isHindi ? 'ऑर्डर स्वीकार करें' : 'Accept Order'}
                </button>
              </div>
            )}

            {/* Advance status for active orders */}
            {!isPending && order.status !== ORDER_STATUS.DELIVERED && (
              <div className="space-y-2">
                {order.estimatedDays && (
                  <p className="text-xs text-stone-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {isHindi
                      ? `अनुमानित डिलीवरी: ${order.estimatedDays} दिन`
                      : `Estimated delivery: ${order.estimatedDays} days`}
                  </p>
                )}
                <button
                  onClick={() => handleAdvanceStatus(order.orderId)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  {nextActionLabel(order.status)}
                </button>
              </div>
            )}

            {order.status === ORDER_STATUS.DELIVERED && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                {isHindi ? 'ऑर्डर सफलतापूर्वक डिलीवर हो गया!' : 'Order successfully delivered!'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide">
              {isHindi ? `नए ऑर्डर (${pendingOrders.length})` : `New Orders (${pendingOrders.length})`}
            </h3>
          </div>
          <div className="space-y-3">
            {pendingOrders.map(o => <OrderCard key={o.orderId} order={o} isPending={true} />)}
          </div>
        </section>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide">
              {isHindi ? `सक्रिय ऑर्डर (${activeOrders.length})` : `Active Orders (${activeOrders.length})`}
            </h3>
          </div>
          <div className="space-y-3">
            {activeOrders.map(o => <OrderCard key={o.orderId} order={o} isPending={false} />)}
          </div>
        </section>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide">
              {isHindi ? `पूर्ण ऑर्डर (${completedOrders.length})` : `Completed (${completedOrders.length})`}
            </h3>
          </div>
          <div className="space-y-3">
            {completedOrders.map(o => <OrderCard key={o.orderId} order={o} isPending={false} />)}
          </div>
        </section>
      )}
    </div>
  );
}
