import React from 'react';
import { Minus, Plus, Star, Sparkles } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatters';

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
    addItem(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMaxStock) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-brand-slate-border hover:border-[#0C831F]/40 p-2.5 sm:p-3 flex flex-col justify-between transition-all hover:shadow-card cursor-pointer relative overflow-hidden"
    >
      {/* Top badges row */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <span className="bg-[#0C831F] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
            {product.discountPercentage}% OFF
          </span>
        ) : (
          <span />
        )}

        {product.isFreshToday && (
          <span className="bg-brand-yellow-light text-[#8A6300] border border-brand-yellow/30 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            Fresh Today
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square bg-[#F9FAFB] rounded-xl overflow-hidden mb-2 flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Pack Size Pill Overlay */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
          {product.packSize}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col">
        {/* Vegetarian Dairy Dot */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-3 h-3 border border-[#0C831F] p-[1.5px] rounded-xs flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C831F]" />
          </span>
          {product.rating && (
            <div className="flex items-center gap-0.5 text-[11px] font-bold text-brand-text-secondary">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-brand-text-muted text-[10px]">({product.ratingCount})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-xs sm:text-sm text-brand-text-primary line-clamp-2 leading-snug group-hover:text-[#0C831F] transition-colors mb-0.5">
          {product.name}
        </h3>

        {/* Marathi subtitle if present */}
        {product.marathiName && (
          <p className="text-[11px] text-brand-text-muted font-medium mb-1 line-clamp-1">
            {product.marathiName}
          </p>
        )}
      </div>

      {/* Price & Action Row */}
      <div className="mt-2 pt-2 border-t border-brand-slate-border/60 flex items-center justify-between gap-1.5">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-sm sm:text-base text-brand-text-primary">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-[11px] text-brand-text-muted line-through font-medium">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-brand-text-muted font-medium block">
            ₹{(product.price / (parseFloat(product.packSize) || 1)).toFixed(1)}/unit
          </span>
          {product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <span className="text-[10px] text-red-600 font-extrabold block">
              Only {product.stockQuantity} left!
            </span>
          )}
        </div>

        {/* ADD Button or Quantity Counter with min 44x44px touch targets */}
        <div>
          {!product.inStock ? (
            <span className="text-[10px] font-bold text-red-500 uppercase px-2 py-1 bg-red-50 rounded-lg">
              Out of Stock
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="min-h-[44px] min-w-[56px] bg-brand-green-light hover:bg-[#0C831F] text-[#0C831F] hover:text-white border border-[#0C831F] font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-[#0C831F] text-white rounded-xl shadow-xs overflow-hidden min-h-[44px]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center hover:bg-black/20 active:scale-90 transition-transform"
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
                className="w-10 h-10 flex items-center justify-center disabled:opacity-40 hover:bg-black/20 active:scale-90 transition-transform"
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
