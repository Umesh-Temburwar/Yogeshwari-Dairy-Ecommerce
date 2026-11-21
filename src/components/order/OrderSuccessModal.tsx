import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, Clock, ArrowRight, X } from 'lucide-react';
import { Order } from '@/types/ecommerce';
import { formatPrice } from '@/utils/formatters';
import { openWhatsAppOrderConfirmation } from '@/utils/whatsapp';
import { triggerHaptic } from '@/utils/haptics';
import { useNavigate } from 'react-router-dom';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0C831F', '#F8CB46', '#22C55E', '#FFFFFF'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [order]);

  if (!order) return null;

  const handleTrackOrder = () => {
    triggerHaptic('medium');
    onClose();
    navigate(`/track/${order.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-float p-5 sm:p-6 overflow-hidden animate-scale-in text-center max-h-[85vh] overflow-y-auto pb-safe">
        {/* Close button with 44px min target */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-[#F4F6F8] flex items-center justify-center text-brand-text-secondary hover:text-black"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Success Badge */}
        <div className="w-16 h-16 bg-green-100 text-[#0C831F] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-black text-brand-text-primary tracking-tight">
          Order Placed Successfully!
        </h2>
        <p className="text-xs font-semibold text-[#0C831F] mt-0.5">
          Order ID: #{order.orderNumber}
        </p>

        {/* Honest ETA pill */}
        <div className="inline-flex items-center gap-1.5 bg-brand-yellow-light border border-brand-yellow/40 text-amber-900 px-3 py-1 rounded-full text-xs font-extrabold mt-3 mb-4">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>⚡ Estimated Delivery: Within 20-40 Mins</span>
        </div>

        {/* Summary Card */}
        <div className="bg-[#F4F6F8] rounded-2xl p-3.5 text-left border border-brand-slate-border mb-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Total Amount:</span>
            <span className="font-black text-brand-text-primary">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-muted">Payment:</span>
            <span className="font-semibold text-brand-text-primary">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'UPI Scan on Doorstep'}
            </span>
          </div>
          <div className="flex justify-between items-start pt-1 border-t border-brand-slate-border">
            <span className="text-brand-text-muted shrink-0">Address:</span>
            <span className="font-medium text-brand-text-secondary text-right truncate pl-2">
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Track Order Primary Button with 44px min height */}
          <button
            onClick={handleTrackOrder}
            className="w-full min-h-[48px] bg-[#0C831F] hover:bg-[#086617] text-white py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
          >
            <span>Live Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* WhatsApp Direct Confirmation Button with 44px min height */}
          <button
            onClick={() => {
              triggerHaptic('light');
              openWhatsAppOrderConfirmation(order);
            }}
            className="w-full min-h-[44px] bg-green-50 hover:bg-green-100 text-green-800 border border-green-300 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span>Send Details to Store WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
