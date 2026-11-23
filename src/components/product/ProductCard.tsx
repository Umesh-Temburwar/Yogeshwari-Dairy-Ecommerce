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

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
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
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-slate-100 p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-card cursor-pointer relative overflow-hidden"
    >
      {/* Product Image Area with ONE subtle badge max */}
      <div className="relative w-full aspect-square bg-slate-50/80 rounded-xl overflow-hidden mb-2 p-3 flex items-center justify-center">
        {/* Wishlist Heart Toggle Button (Flipkart Style) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 active:scale-90 transition-all cursor-pointer focus:outline-hidden"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted
                ? 'fill-[#E53935] text-[#E53935]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          />
        </button>

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

        {/* Flipkart Rating Pill & Pure Assured Seal */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="inline-flex items-center gap-0.5 bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs leading-none">
            <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
            <span className="text-[9px]">★</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            ({product.ratingCount || 42})
          </span>
          <PureAssuredBadge className="ml-auto" />
        </div>

        {/* Pack Size / Unit & Clickable Brand Chip */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1 truncate">
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-xs text-[10px] font-bold">
            {product.packSize || product.unit || 'Standard'}
          </span>
          {product.brand && (
            <>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleBrandClick}
                className="text-[10px] font-bold text-[#2874F0] bg-blue-50 hover:bg-blue-100 hover:text-[#1A5DC8] px-1.5 py-0.5 rounded-xs border border-blue-100 truncate cursor-pointer transition-colors"
                title={`View all ${product.brand} products`}
              >
                {product.brand}
              </button>
            </>
          )}
        </div>

        {/* Tiny single-line Expiry (only when perishable or within 30 days) */}
        {shouldShowExpiry && product.expiryDate && (
          <p className="text-[10px] text-emerald-800 font-medium mt-1 truncate">
            Best before {formatDisplayDate(product.expiryDate)}
          </p>
        )}

        {/* Flipkart Fast Delivery Guarantee */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-1">
          <span className="text-[#FF9F00] font-bold">⚡</span>
          <span>Free delivery in 15 mins</span>
        </div>
      </div>

      {/* Bottom Row: Price & ADD Button / Stepper */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-extrabold text-base text-slate-900 leading-none">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-xs text-slate-400 line-through font-normal">
                  {formatPrice(product.mrp)}
                </span>
                <span className="text-[11px] font-bold text-[#388E3C] leading-none">
                  {product.discountPercentage || Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                </span>
              </>
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
            /* Closed State: greyed disabled ADD button without cluttered red badges */
            <button
              type="button"
              disabled
              className="h-9 min-h-[36px] min-w-[64px] bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-0.5"
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
              className="h-8 min-h-[32px] min-w-[64px] bg-white hover:bg-blue-50 text-[#2874F0] border border-[#2874F0] font-bold text-xs px-3 rounded-xs shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-0.5 cursor-pointer focus:outline-hidden"
              aria-label={`Add ${product.name} to cart`}
            >
              <span>ADD</span>
              <span className="text-sm font-bold leading-none">+</span>
            </button>
          ) : (
            <div className="flex items-center bg-[#2874F0] text-white rounded-xs shadow-2xs overflow-hidden h-8 min-h-[32px]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-8 flex items-center justify-center hover:bg-black/15 active:scale-90 transition-transform cursor-pointer focus:outline-hidden"
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
                className="w-7 h-8 flex items-center justify-center disabled:opacity-40 hover:bg-black/15 active:scale-90 transition-transform cursor-pointer focus:outline-hidden"
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
