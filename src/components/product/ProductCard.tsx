import React from 'react';
import { Minus, Plus, Star, Sparkles, Zap } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { getItemQuantity, addItem, updateQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id);
  const isMaxStock = Boolean(product.stockQuantity) && quantity >= product.stockQuantity;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    addItem(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-500/50 p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-card cursor-pointer relative overflow-hidden"
    >
      {/* Top Badges */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none gap-1">
        {/* Blinkit Delivery ETA Badge */}
        <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
          <Zap className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
          <span>20-30 MINS</span>
        </div>

        {/* Discount Badge */}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <span className="bg-[#0C831F] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
            {product.discountPercentage}% OFF
          </span>
        ) : product.isFreshToday ? (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            Fresh
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-[#F8F9FA] rounded-xl overflow-hidden mb-2 flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Pack Size Overlay */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
          {product.packSize}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-start">
        {/* Veg Dairy Dot & Rating */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-3 h-3 border border-[#0C831F] p-[1.5px] rounded-xs flex items-center justify-center shrink-0" title="100% Pure Vegetarian Dairy">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C831F]" />
          </span>
          {product.rating && (
            <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-slate-600">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 text-[9px]">({product.ratingCount || 100}+)</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-[#0C831F] transition-colors mb-0.5 min-h-[32px]">
          {product.name}
        </h4>

        {/* Marathi Subtitle */}
        {product.marathiName && (
          <p className="text-[10px] text-slate-500 font-medium mb-1 line-clamp-1">
            {product.marathiName}
          </p>
        )}
      </div>

      {/* Price & Action Row */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-black text-sm sm:text-base text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through font-medium">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          {product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <span className="text-[10px] text-rose-600 font-black block">
              Only {product.stockQuantity} left!
            </span>
          )}
        </div>

        {/* Blinkit Style ADD Button or Quantity Stepper */}
        <div>
          {!product.inStock ? (
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-100 rounded-lg">
              Out of stock
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="min-h-[36px] sm:min-h-[40px] min-w-[62px] sm:min-w-[70px] bg-white hover:bg-emerald-50 text-[#0C831F] border border-[#0C831F] font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center gap-0.5 cursor-pointer"
            >
              <span>ADD</span>
              <span className="text-sm font-bold leading-none">+</span>
            </button>
          ) : (
            <div className="flex items-center bg-[#0C831F] text-white rounded-xl shadow-xs overflow-hidden min-h-[36px] sm:min-h-[40px]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 sm:w-9 h-9 sm:h-10 flex items-center justify-center hover:bg-black/20 active:scale-90 transition-transform cursor-pointer"
                title="Decrease"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-xs font-black min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isMaxStock}
                onClick={handleIncrement}
                className="w-8 sm:w-9 h-9 sm:h-10 flex items-center justify-center disabled:opacity-40 hover:bg-black/20 active:scale-90 transition-transform cursor-pointer"
                title={isMaxStock ? 'Max available stock reached' : 'Increase quantity'}
                aria-label="Increase quantity"
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
