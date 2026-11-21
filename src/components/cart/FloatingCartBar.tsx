import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';

export const FloatingCartBar: React.FC = () => {
  const { getTotalItemsCount, getSubtotal, openCartDrawer, isCartDrawerOpen } = useCartStore();

  const totalCount = getTotalItemsCount();
  const subtotal = getSubtotal();

  if (totalCount === 0 || isCartDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40 pointer-events-none">
      <div className="pointer-events-auto">
        <button
          onClick={() => {
            triggerHaptic('medium');
            openCartDrawer();
          }}
          className="w-full min-h-[52px] bg-[#0C831F] hover:bg-[#086617] text-white px-4 py-3 rounded-2xl shadow-float flex items-center justify-between transition-all transform active:scale-98 animate-slide-up"
          aria-label="View shopping cart"
        >
          {/* Left: Items count & price */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase font-extrabold tracking-wider text-white/90">
                {totalCount} {totalCount === 1 ? 'Item' : 'Items'} Added
              </div>
              <div className="text-base font-black leading-tight text-white">
                {formatPrice(subtotal)}
              </div>
            </div>
          </div>

          {/* Right: View Cart Action */}
          <div className="flex items-center gap-1.5 bg-white text-[#0C831F] font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs">
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </button>
      </div>
    </div>
  );
};
