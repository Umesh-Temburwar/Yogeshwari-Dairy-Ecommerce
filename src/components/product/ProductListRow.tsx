import React from 'react';
import { Minus, Plus, Heart } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { PureAssuredBadge } from './PureAssuredBadge';

interface ProductListRowProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductListRow: React.FC<ProductListRowProps> = ({
  product,
  onOpenDetails,
}) => {
  const { getItemQuantity, addItem, updateQuantity } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isStoreOpen } = useStoreStatusStore();

  const quantity = getItemQuantity(product.id);
  const isWishlisted = isInWishlist(product.id);
  const isMaxStock = Boolean(product.stockQuantity) && quantity >= product.stockQuantity;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-xs border border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-xs transition-shadow cursor-pointer relative"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Product Image */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 rounded-xs overflow-hidden shrink-0 relative p-2 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              toggleWishlist(product);
            }}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-xs cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted ? 'fill-[#E53935] text-[#E53935]' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#2874F0] transition-colors truncate">
            {product.name}
          </h4>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
              <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
              <span>★</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              ({product.ratingCount || 56} Ratings &amp; Reviews)
            </span>
            <PureAssuredBadge />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-xs font-semibold">
              {product.packSize || product.unit || 'Standard'}
            </span>
            {product.brand && (
              <>
                <span>•</span>
                <span className="text-[#2874F0] font-semibold">{product.brand}</span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 hidden sm:block">
            {product.description || '100% Pure & Fresh Dairy product directly sourced from farm.'}
          </p>
        </div>
      </div>

      {/* Right Column: Price & Add Stepper */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
        <div className="text-left sm:text-right">
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-lg text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="text-xs font-bold text-[#388E3C]">
                  {product.discountPercentage || Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            ⚡ Free delivery in 15 mins
          </span>
        </div>

        <div>
          {quantity === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isStoreOpen) return;
                triggerHaptic('medium');
                addItem(product);
              }}
              disabled={!isStoreOpen}
              className="px-4 py-1.5 bg-[#2874F0] hover:bg-[#1A5DC8] disabled:bg-slate-200 text-white font-bold text-xs rounded-xs shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>ADD TO CART</span>
            </button>
          ) : (
            <div className="flex items-center bg-[#2874F0] text-white rounded-xs shadow-xs overflow-hidden h-8">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  updateQuantity(product.id, quantity - 1);
                }}
                className="w-7 h-8 flex items-center justify-center hover:bg-black/15 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold">{quantity}</span>
              <button
                type="button"
                disabled={isMaxStock}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMaxStock) return;
                  triggerHaptic('light');
                  updateQuantity(product.id, quantity + 1);
                }}
                className="w-7 h-8 flex items-center justify-center hover:bg-black/15 disabled:opacity-40 cursor-pointer"
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
