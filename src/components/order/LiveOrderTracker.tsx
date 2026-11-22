import React, { useState } from 'react';
import {
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  Clock,
  Package,
  Bike,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/ecommerce';
import { formatPrice } from '@/utils/formatters';
import { getStoreCallHref, openWhatsAppStoreInquiry } from '@/utils/whatsapp';
import { triggerHaptic } from '@/utils/haptics';
import { ecommerceApi } from '@/services/api';

interface LiveOrderTrackerProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
}

const STATUS_STEPS: Array<{ key: OrderStatus; title: string; subtitle: string; icon: any }> = [
  {
    key: 'pending',
    title: 'Order Placed',
    subtitle: 'Received at Yogeshwari Dairy store',
    icon: Clock,
  },
  {
    key: 'confirmed',
    title: 'Order Confirmed',
    subtitle: 'Verified by counter staff',
    icon: CheckCircle2,
  },
  {
    key: 'preparing',
    title: 'Packing Fresh Dairy',
    subtitle: 'Chilled items placed in insulated bag',
    icon: Package,
  },
  {
    key: 'out_for_delivery',
    title: 'Out for Quick Delivery',
    subtitle: 'Rider is on the way to your doorstep',
    icon: Bike,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    subtitle: 'Fresh dairy delivered at doorstep',
    icon: CheckCircle2,
  },
];

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({ order, onOrderUpdated }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';
  const canCancel = order.orderStatus === 'pending' || order.orderStatus === 'confirmed';

  // YogiMart Dark-Store Item Verification Parser
  const notesText = order.notes || '';
  const isYogiMartScan = notesText.includes('YogiMart_SCAN') || notesText.includes('PACKED');
  const isAllVerified =
    notesText.includes('ALL_VERIFIED') ||
    notesText.includes('All items barcode-verified') ||
    order.orderStatus === 'out_for_delivery' ||
    order.orderStatus === 'delivered';

  const scanMatch = notesText.match(/(\d+)\s*items?\s*verified/i);
  const scannedUnitsCount = scanMatch
    ? parseInt(scanMatch[1], 10)
    : isAllVerified
      ? order.items.length
      : 0;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    setCancelError(null);
    triggerHaptic('warning');

    try {
      const res = await ecommerceApi.cancelOrder(order.id, 'Customer requested cancellation');
      if (res.success) {
        const updated = await ecommerceApi.getOrderById(order.id);
        onOrderUpdated?.(updated);
      }
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-slate-border shadow-card overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0C831F] to-[#086617] text-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
              Order #{order.orderNumber}
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-0.5">
              {isCancelled
                ? 'Order Cancelled'
                : order.orderStatus === 'delivered'
                  ? 'Order Delivered!'
                  : 'Arriving in 20-40 Mins ⚡'}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              {order.orderStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Rider / Delivery Partner Card (if out for delivery or preparing) */}
        {order.deliveryPartner && !isCancelled && (
          <div className="bg-[#F4F6F8] rounded-2xl p-3.5 border border-brand-slate-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#0C831F] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                ⚡
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-brand-text-primary">
                  {order.deliveryPartner.name}
                </h4>
                <p className="text-[11px] text-brand-text-muted">
                  Vehicle: {order.deliveryPartner.vehicleNumber || 'Express Scooter'}
                </p>
              </div>
            </div>

            <a
              href={`tel:${order.deliveryPartner.phone}`}
              className="w-11 h-11 rounded-xl bg-white border border-brand-slate-border text-[#0C831F] flex items-center justify-center hover:bg-green-50 shadow-xs transition-colors"
              title="Call Rider"
              aria-label="Call Rider"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* YogiMart-Style Live Dark-Store Barcode Verification Card */}
        {(order.orderStatus === 'preparing' || isYogiMartScan || isAllVerified) && !isCancelled && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <span>Store Barcode Quality Check</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {isAllVerified ? '100% VERIFIED' : 'SCANNING LIVE'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    {isAllVerified
                      ? 'Counter staff verified each item with laser barcode scanner. Chilled in insulated bag.'
                      : `Counter staff is scanning each product with barcode gun (${scannedUnitsCount} items verified so far)`}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: isAllVerified
                    ? '100%'
                    : `${Math.max(
                      25,
                      Math.min(95, (scannedUnitsCount / Math.max(1, order.items.length)) * 100)
                    )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 pt-0.5">
              <span>YogiMart-Speed Dark Store Packing</span>
              <span>{isAllVerified ? 'Sealed & Ready ✓' : 'Item-by-item verification in progress'}</span>
            </div>
          </div>
        )}

        {/* Timeline Stepper */}
        {!isCancelled ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-[23px] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isPast
                        ? 'bg-[#0C831F] text-white ring-4 ring-green-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-300'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5
                      className={`text-xs sm:text-sm font-bold leading-none ${isCurrent
                          ? 'text-[#0C831F]'
                          : isPast
                            ? 'text-brand-text-primary'
                            : 'text-brand-text-muted'
                        }`}
                    >
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-brand-text-muted mt-1">{step.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">This order was cancelled.</span>
              <span>Stock items have been restored. Any pre-authorization has been voided.</span>
            </div>
          </div>
        )}

        {/* Delivery Address Details */}
        <div className="bg-[#F4F6F8] rounded-2xl p-3.5 border border-brand-slate-border text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-brand-text-primary">
            <MapPin className="w-4 h-4 text-[#0C831F]" />
            <span>Delivery Destination:</span>
          </div>
          <p className="text-brand-text-secondary pl-5 leading-relaxed">
            {order.deliveryAddress.street}
            {order.deliveryAddress.landmark ? `, Near ${order.deliveryAddress.landmark}` : ''},{' '}
            {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
          </p>
          <p className="text-brand-text-muted pl-5">
            Customer: {order.customerName} ({order.customerPhone})
          </p>
        </div>

        {/* Order Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">
            Items in this Order ({order.items.length})
          </h4>
          <div className="divide-y divide-brand-slate-border border border-brand-slate-border rounded-2xl overflow-hidden">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="p-3 bg-white flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <span className="font-bold text-brand-text-primary">{item.name}</span>
                    <span className="text-[11px] text-brand-text-muted ml-1">
                      ({item.packSize}) x {item.quantity}
                    </span>
                  </div>
                  {(isAllVerified || isYogiMartScan) && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      ✓ Scanned
                    </span>
                  )}
                </div>
                <span className="font-black text-brand-text-primary">
                  {formatPrice(item.itemTotal)}
                </span>
              </div>
            ))}
            <div className="p-3 bg-brand-slate-bg flex items-center justify-between text-xs font-black">
              <span>Grand Total</span>
              <span className="text-[#0C831F] text-sm">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Help & Support Actions with min 44px touch targets */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={getStoreCallHref()}
            className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-brand-slate-border bg-white hover:bg-gray-50 text-xs font-bold text-brand-text-primary transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#0C831F]" />
            <span>Call Dairy Store</span>
          </a>
          <button
            type="button"
            onClick={() => openWhatsAppStoreInquiry()}
            className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-xs font-bold text-green-800 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-600" />
            <span>WhatsApp Store</span>
          </button>
        </div>

        {/* Cancel Button if eligible */}
        {canCancel && (
          <div className="pt-2 border-t border-brand-slate-border">
            {cancelError && (
              <p className="text-xs text-red-600 mb-2 font-medium">{cancelError}</p>
            )}
            <button
              disabled={isCancelling}
              onClick={handleCancel}
              className="w-full min-h-[44px] text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 py-2.5 rounded-xl font-bold transition-colors"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
