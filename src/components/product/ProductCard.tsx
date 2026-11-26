import React from 'react';
import { Minus, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { formatPrice, formatDisplayDate } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { PureAssuredBadge } from './PureAssuredBadge';
import { BlinkitEtaBadge } from './BlinkitEtaBadge';
import { BlinkitColdChainBadge } from './BlinkitColdChainBadge';
import { BlinkitDiscountRibbon } from './BlinkitDiscountRibbon';

export interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const navigate = useNavigate();
  const { getItemQuantity, addItem, updateQuantity } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isStoreOpen } = useStoreStatusStore();
  const quantity = getItemQuantity(product.id);
  const isWishlisted = isInWishlist(product.id);
  const isMaxStock = Boolean(product.stockQuantity) && quantity >= product.stockQuantity;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    toggleWishlist(product);
  };

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

  const handleBrandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.brand) {
      triggerHaptic('light');
      navigate(`/brand/${encodeURIComponent(product.brand)}`);
    }
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
      onClick={() => {
        triggerHaptic('light');
        if (onOpenDetails) {
          onOpenDetails(product);
        } else {
          navigate(`/product/${product.id}`);
        }
      }}
      className="group bg-white rounded-2xl border border-slate-100 p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 hover:shadow-card cursor-pointer relative overflow-hidden w-full"
    >
      {/* Product Image Area with ONE subtle badge max */}
      <div className="relative w-full aspect-square bg-slate-50/80 rounded-xl overflow-hidden mb-1.5 sm:mb-2 p-2 sm:p-3 flex items-center justify-center">
        {/* Wishlist Heart Toggle Button (Blinkit Style) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 active:scale-90 transition-all cursor-pointer focus:outline-hidden"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isWishlisted
              ? 'fill-rose-500 text-rose-500'
              : 'text-slate-400 hover:text-rose-500'
              }`}
          />
        </button>

        {/* Blinkit corner discount ribbon or fresh tag */}
        {product.inStock && (
          product.discountPercentage && product.discountPercentage > 0 ? (
            <div className="absolute top-0 left-0 z-10">
              <BlinkitDiscountRibbon discountPercentage={product.discountPercentage} />
            </div>
          ) : product.isFreshToday ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-emerald-50/95 text-emerald-800 border border-emerald-200 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs leading-none">
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
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${!product.inStock ? 'grayscale opacity-50' : ''
            }`}
        />

        {/* Out of Stock Greyscale Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-start min-w-0">
        {/* Product Name (2-line clamp, text-xs sm:text-sm font-semibold) */}
        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors min-h-[30px] sm:min-h-[34px]">
          {product.name}
        </h4>

        {/* Blinkit Rating Pill & Pure Assured Seal */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 flex-wrap">
          <div className="inline-flex items-center gap-0.5 bg-[#0C831F] text-white text-[9.5px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md leading-none shrink-0">
            <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
            <span className="text-[8.5px] sm:text-[9px]">★</span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium shrink-0">
            ({product.ratingCount || 42})
          </span>
          <PureAssuredBadge className="hidden sm:inline-flex ml-auto shrink-0" />
        </div>

        {/* Pack Size / Unit & Clickable Brand Chip */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold shrink-0">
            {product.packSize || product.unit || 'Standard'}
          </span>
          {product.brand && (
            <>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleBrandClick}
                className="text-[9.5px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 px-1.5 py-0.5 rounded-md border border-emerald-100/80 truncate cursor-pointer transition-colors"
                title={`View all ${product.brand} products`}
              >
                {product.brand}
              </button>
            </>
          )}
        </div>

        {/* Tiny single-line Expiry (only when perishable or within 30 days) */}
        {shouldShowExpiry && product.expiryDate && (
          <p className="text-[9.5px] sm:text-[10px] text-emerald-800 font-medium mt-0.5 truncate">
            Best before {formatDisplayDate(product.expiryDate)}
          </p>
        )}

        {/* Fast Delivery Guarantee & Cold Chain */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <BlinkitEtaBadge mins={product.deliveryEtaMins || 10} />
          {product.isColdChain && <BlinkitColdChainBadge temperature={product.storageTemp || '4°C'} />}
        </div>
      </div>

      {/* Bottom Row: Price & ADD Button / Stepper */}
      <div className="mt-2 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 leading-none">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-normal">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          {product.mrp > product.price && (
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 block mt-0.5 leading-none">
              {product.discountPercentage || Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
            </span>
          )}
          {product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <span className="text-[8.5px] sm:text-[9.5px] text-rose-600 font-bold block mt-0.5 leading-none">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>

        <div className="shrink-0">
          {!product.inStock ? (
            <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-100 rounded-lg">
              Out
            </span>
          ) : !isStoreOpen ? (
            /* Closed State */
            <button
              type="button"
              disabled
              className="h-8 sm:h-9 min-h-[32px] sm:min-h-[36px] min-w-[56px] sm:min-w-[64px] bg-slate-100 text-slate-400 border border-slate-200 font-bold text-[11px] sm:text-xs px-2.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-0.5"
              aria-label="Store is currently closed"
              title="Store is currently closed"
            >
              <span>ADD</span>
              <span className="text-sm font-bold leading-none">+</span>
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="h-8 sm:h-9 min-h-[32px] sm:min-h-[36px] min-w-[56px] sm:min-w-[64px] bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-600 font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-0.5 cursor-pointer focus:outline-hidden"
              aria-label={`Add ${product.name} to cart`}
            >
              <span>ADD</span>
              <span className="text-sm font-bold leading-none">+</span>
            </button>
          ) : (
            <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden h-8 sm:h-9 min-h-[32px] sm:min-h-[36px]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-6 sm:w-7 h-8 sm:h-9 flex items-center justify-center hover:bg-black/20 active:scale-90 transition-transform cursor-pointer focus:outline-hidden"
                aria-label={`Decrease quantity of ${product.name}`}
                title="Decrease"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <span className="px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold min-w-[18px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isMaxStock}
                onClick={handleIncrement}
                className="w-6 sm:w-7 h-8 sm:h-9 flex items-center justify-center disabled:opacity-40 hover:bg-black/20 active:scale-90 transition-transform cursor-pointer focus:outline-hidden"
                aria-label={`Increase quantity of ${product.name}`}
                title={isMaxStock ? 'Max stock reached' : 'Increase'}
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
