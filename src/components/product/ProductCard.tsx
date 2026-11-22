import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/cartStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { formatPrice, formatDisplayDate } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { getItemQuantity, addItem, updateQuantity } = useCartStore();
  const { isStoreOpen } = useStoreStatusStore();
  const quantity = getItemQuantity(product.id);
  const isMaxStock = Boolean(product.stockQuantity) && quantity >= product.stockQuantity;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isStoreOpen) {
      triggerHaptic('warning');
      return;
    }
    triggerHaptic('medium');
    addItem(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isStoreOpen) {
      triggerHaptic('warning');
      return;
    }
    triggerHaptic('light');
    if (!isMaxStock) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    updateQuantity(product.id, quantity - 1);
  };

  // Only show expiry on card if product is perishable or expiry is within 30 days
  const shouldShowExpiry = Boolean(
    product.expiryDate &&
      (() => {
        const isPerishable =
          /milk|paneer|curd|dahi|chaas|lassi/i.test(product.name || '') ||
          /milk|paneer|curd|dahi|chaas|lassi/i.test(product.category || '');
        if (isPerishable) return true;
        try {
          const expTime = new Date(product.expiryDate).getTime();
          const nowTime = Date.now();
          const diffDays = (expTime - nowTime) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 30;
        } catch {
          return false;
        }
      })()
  );

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-slate-100 p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-card cursor-pointer relative overflow-hidden"
    >
      {/* Product Image Area with ONE subtle badge max */}
      <div className="relative w-full aspect-square bg-slate-50/80 rounded-xl overflow-hidden mb-2 p-3 flex items-center justify-center">
        {/* ONE small badge max at top-left inside image corner */}
        {product.inStock && (
          product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="absolute top-2 left-2 z-10 bg-emerald-700/90 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          ) : product.isFreshToday ? (
            <span className="absolute top-2 left-2 z-10 bg-emerald-50/90 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Fresh
            </span>
          ) : null
        )}

        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          width={180}
          height={180}
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
            !product.inStock ? 'grayscale opacity-50' : ''
          }`}
        />

        {/* Out of Stock Greyscale Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-start">
        {/* Product Name (2-line clamp, text-sm font-semibold) */}
        <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors min-h-[36px]">
          {product.name}
        </h4>

        {/* Pack Size / Unit below in slate-500 */}
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {product.packSize || product.unit || 'Standard'}
        </p>

        {/* Tiny single-line Expiry (only when perishable or within 30 days) */}
        {shouldShowExpiry && product.expiryDate && (
          <p className="text-[10px] text-emerald-800 font-medium mt-1 truncate">
            Best before {formatDisplayDate(product.expiryDate)}
          </p>
        )}
      </div>

      {/* Bottom Row: Price & ADD Button / Stepper */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base text-slate-900 leading-none">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through font-normal">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          {product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <span className="text-[9.5px] text-rose-600 font-bold block mt-0.5">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>

        <div>
          {!product.inStock ? (
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-100 rounded-lg">
              Out of stock
            </span>
          ) : !isStoreOpen ? (
            <span
              className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 uppercase px-2 py-1.5 rounded-xl block text-center select-none"
              title="Store is currently closed"
            >
              Closed
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="h-9 min-h-[36px] min-w-[64px] bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-600 font-bold text-xs px-3 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-0.5 cursor-pointer focus:outline-hidden"
              aria-label={`Add ${product.name} to cart`}
            >
              <span>ADD</span>
              <span className="text-sm font-bold leading-none">+</span>
            </button>
          ) : (
            <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden h-9 min-h-[36px]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-9 flex items-center justify-center hover:bg-black/20 active:scale-90 transition-transform cursor-pointer focus:outline-hidden"
                aria-label={`Decrease quantity of ${product.name}`}
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-xs font-bold min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isMaxStock}
                onClick={handleIncrement}
                className="w-8 h-9 flex items-center justify-center disabled:opacity-40 hover:bg-black/20 active:scale-90 transition-transform cursor-pointer focus:outline-hidden"
                aria-label={`Increase quantity of ${product.name}`}
                title={isMaxStock ? 'Max stock reached' : 'Increase'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
