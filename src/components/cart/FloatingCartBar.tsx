import React from 'react';
import { ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { openWhatsAppStoreInquiry } from '@/utils/whatsapp';

export const FloatingCartBar: React.FC = () => {
  const { getTotalItemsCount, getSubtotal, openCartDrawer, isCartDrawerOpen } = useCartStore();
  const { isStoreOpen } = useStoreStatusStore();

  const totalCount = getTotalItemsCount();
  const subtotal = getSubtotal();
  const hasCartItems = isStoreOpen && totalCount > 0 && !isCartDrawerOpen;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none pb-safe">
      <div className="max-w-md mx-auto px-4 pb-3 relative">
        {/* Floating WhatsApp Button (Positioned above cart bar when visible) */}
        {!isCartDrawerOpen && (
          <div
            className={`absolute right-4 transition-all duration-300 pointer-events-auto ${
              hasCartItems ? 'bottom-16 sm:bottom-18' : 'bottom-3 sm:bottom-4'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                openWhatsAppStoreInquiry();
              }}
              className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5c] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform active:scale-90 cursor-pointer focus:outline-hidden"
              aria-label="Chat with Yogeshwari Dairy on WhatsApp"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
            </button>
          </div>
        )}

        {/* Sticky Cart Bar (Emerald-700, rounded-2xl, animated) */}
        {hasCartItems && (
          <div className="pointer-events-auto animate-slide-up motion-reduce:animate-none">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                openCartDrawer();
              }}
              className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-float flex items-center justify-between transition-all active:scale-98 cursor-pointer focus:outline-hidden border border-emerald-600/50"
              aria-label={`View cart with ${totalCount} items worth ${formatPrice(subtotal)}`}
            >
              {/* Left: N items • ₹total */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm text-white tracking-wide">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} • {formatPrice(subtotal)}
                </span>
              </div>

              {/* Right: View Cart → */}
              <div className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-white/15 px-3 py-1.5 rounded-xl text-white">
                <span>View Cart</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
