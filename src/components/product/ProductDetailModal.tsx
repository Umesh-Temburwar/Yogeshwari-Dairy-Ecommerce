import React from 'react';
import { X, Star, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatDisplayDate } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { getItemQuantity, addItem, updateQuantity } = useCartStore();

  if (!product) return null;

  const quantity = getItemQuantity(product.id);
  const isMaxStock = Boolean(product.stockQuantity) && quantity >= product.stockQuantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card with max-h-[85vh] and safe-area padding */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-float overflow-hidden z-10 max-h-[85vh] flex flex-col animate-slide-up">
        {/* Close button with min 44x44px touch target */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-3 right-3 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md border border-brand-slate-border flex items-center justify-center text-brand-text-secondary hover:text-black shadow-sm"
          title="Close details"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto no-scrollbar pb-24 sm:pb-6">
          {/* Main Photo Banner */}
          <div className="relative w-full aspect-[4/3] bg-brand-slate-bg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage && product.discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-[#0C831F] text-white text-xs font-black px-2 py-0.5 rounded-md uppercase">
                {product.discountPercentage}% OFF
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              Pack Size: {product.packSize}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Badges & Real Rating */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border border-[#0C831F] p-[2px] rounded-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#0C831F]" />
                </span>
                <span className="text-xs font-bold text-[#0C831F] uppercase">100% Pure Dairy</span>
              </div>
              {product.rating && product.ratingCount && product.ratingCount > 0 ? (
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold text-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-amber-700/70">({product.ratingCount} reviews)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fresh Batch Certified</span>
                </div>
              )}
            </div>

            {/* Title & Marathi Name */}
            <h2 className="text-lg sm:text-xl font-extrabold text-brand-text-primary leading-tight">
              {product.name}
            </h2>
            {product.marathiName && (
              <p className="text-sm font-semibold text-brand-text-muted mt-0.5">
                {product.marathiName}
              </p>
            )}

            {/* Price section */}
            <div className="flex items-baseline gap-2 mt-3 mb-4">
              <span className="text-2xl font-black text-brand-text-primary">
                {formatPrice(product.price)}
              </span>
              {product.mrp > product.price && (
                <span className="text-sm text-brand-text-muted line-through">
                  MRP {formatPrice(product.mrp)}
                </span>
              )}
              <span className="text-xs text-brand-green font-bold">Inclusive of all taxes</span>
            </div>

            {/* Batch & Dates Card */}
            {(product.batchNo || product.mfgDate || product.expiryDate) && (
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-emerald-900 font-extrabold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0C831F]" />
                    <span>Active Stock Batch Details</span>
                  </span>
                  {product.batchNo && (
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {product.batchNo}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {product.mfgDate && (
                    <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Manufacturing Date
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatDisplayDate(product.mfgDate)}
                      </span>
                    </div>
                  )}
                  {product.expiryDate && (
                    <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                        Best Before / Expiry
                      </span>
                      <span className="font-black text-emerald-700">
                        {formatDisplayDate(product.expiryDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-b border-brand-slate-border py-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                Product Details
              </h4>
              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications Cards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {product.fatContent && (
                <div className="bg-brand-slate-bg p-2.5 rounded-xl border border-brand-slate-border">
                  <span className="text-[10px] uppercase font-bold text-brand-text-muted block">
                    Fat & SNF Ratio
                  </span>
                  <span className="text-xs font-bold text-brand-text-primary">
                    {product.fatContent}
                  </span>
                </div>
              )}
              {product.shelfLife && (
                <div className="bg-brand-slate-bg p-2.5 rounded-xl border border-brand-slate-border">
                  <span className="text-[10px] uppercase font-bold text-brand-text-muted block">
                    Shelf Life
                  </span>
                  <span className="text-xs font-bold text-brand-text-primary">
                    {product.shelfLife}
                  </span>
                </div>
              )}
            </div>

            {/* Storage Info */}
            {product.storageInfo && (
              <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-3 flex items-start gap-2 text-blue-900 text-xs mb-4">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{product.storageInfo}</span>
              </div>
            )}

            {/* Purity & Trust Checklist */}
            <div className="bg-brand-green-light rounded-2xl p-3 border border-[#0C831F]/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0C831F]">
                <ShieldCheck className="w-4 h-4" />
                <span>Yogeshwari Dairy Quality Assurances:</span>
              </div>
              <ul className="text-xs text-brand-text-secondary space-y-1 pl-6 list-disc">
                <li>Direct daily farm procurement with zero middle-men tampering</li>
                <li>Laboratory tested for zero starch, detergent, or water adulteration</li>
                <li>Hygienically packaged in food-grade safe packaging</li>
                <li>⚡ Delivered in insulated bags within {DELIVERY_ETA_TEXT}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar inside Modal with safe area padding */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-brand-slate-border p-3.5 pb-safe flex items-center justify-between gap-3 shadow-float">
          <div>
            <span className="text-[11px] text-brand-text-muted block">Total Price:</span>
            <span className="text-lg font-black text-brand-text-primary">
              {formatPrice(product.price * (quantity || 1))}
            </span>
          </div>

          <div>
            {!product.inStock ? (
              <span className="text-xs font-bold text-red-500 uppercase px-4 py-2.5 bg-red-50 rounded-xl min-h-[44px] flex items-center">
                Currently Out of Stock
              </span>
            ) : quantity === 0 ? (
              <button
                onClick={() => {
                  addItem(product);
                }}
                className="min-h-[44px] bg-[#0C831F] hover:bg-[#086617] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <span>ADD TO CART</span>
              </button>
            ) : (
              <div className="flex items-center bg-[#0C831F] text-white rounded-xl shadow-xs overflow-hidden min-h-[44px]">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-black/20"
                  aria-label="Decrease"
                >
                  -
                </button>
                <span className="px-3 font-black text-sm">{quantity}</span>
                <button
                  type="button"
                  disabled={isMaxStock}
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center disabled:opacity-40 hover:bg-black/20"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
