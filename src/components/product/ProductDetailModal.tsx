import React, { useState } from 'react';
import {
  X,
  Share2,
  Heart,
  Truck,
  Tag,
} from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { PureAssuredBadge } from './PureAssuredBadge';
import { ProductSpecificationsTable } from './ProductSpecificationsTable';
import { ProductRatingsBreakdown } from './ProductRatingsBreakdown';
import { ProductReviewsList } from './ProductReviewsList';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';
import { shareProductOnWhatsApp } from '@/utils/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { getItemQuantity, addItem, openCartDrawer } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isStoreOpen, deliveryEta } = useStoreStatusStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const quantity = getItemQuantity(product.id);
  const isWishlisted = isInWishlist(product.id);

  // Alternate image gallery angles
  const galleryImages = [
    product.imageUrl,
    'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  ];

  const handleBuyNow = () => {
    if (!isStoreOpen) return;
    triggerHaptic('medium');
    if (quantity === 0) {
      addItem(product);
    }
    onClose();
    openCartDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-2 sm:p-4">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Blinkit Split Modal Window */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row animate-scale-in border border-slate-200">
        {/* Close Button & Share */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              shareProductOnWhatsApp(product.name, product.price);
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 flex items-center justify-center cursor-pointer transition-colors"
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LEFT COLUMN: Gallery & Buy Actions */}
        <div className="w-full md:w-5/12 bg-white p-4 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
          <div>
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4">
              <img
                src={galleryImages[activeImageIndex] || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />

              {/* Wishlist Heart */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  toggleWishlist(product);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-xs flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all"
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                />
              </button>

              {product.discountPercentage && product.discountPercentage > 0 && (
                <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {product.discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-2 mt-3 justify-center">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 rounded-xl border p-1 bg-white cursor-pointer transition-all ${
                    activeImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Add to Cart (Emerald) & Buy Now (Yellow) */}
          <div className="grid grid-cols-2 gap-2 pt-4 mt-auto">
            <button
              type="button"
              disabled={!isStoreOpen}
              onClick={() => {
                if (!isStoreOpen) return;
                triggerHaptic('medium');
                addItem(product);
              }}
              className="py-3 px-2 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 font-extrabold text-xs rounded-xl uppercase shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1 leading-none"
            >
              <span>{quantity > 0 ? `Added (${quantity})` : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              disabled={!isStoreOpen}
              onClick={handleBuyNow}
              className="py-3 px-2 bg-[#0C831F] hover:bg-[#086617] disabled:bg-slate-200 text-white font-extrabold text-xs rounded-xl uppercase shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1 leading-none"
            >
              <span>Buy Now</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Details, Specifications, Highlights */}
        <div className="w-full md:w-7/12 p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-4">
          {/* Brand & Title */}
          <div>
            {product.brand && (
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                {product.brand}
              </span>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>
            {product.marathiName && (
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {product.marathiName}
              </p>
            )}
          </div>

          {/* Ratings & Pure Assured */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 bg-[#0C831F] text-white text-xs font-bold px-2 py-0.5 rounded-md">
              <span>{product.rating ? product.rating.toFixed(1) : '4.6'}</span>
              <span>★</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {product.ratingCount || 128} Ratings &amp; 32 Reviews
            </span>
            <PureAssuredBadge />
          </div>

          {/* Price & Discount */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    {product.discountPercentage || Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              Special Price • Inclusive of all taxes
            </p>
          </div>

          {/* Delivery Promise */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Speed Delivery to Ambajogai Mandi Hub</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Guaranteed delivery in <strong>{deliveryEta || DELIVERY_ETA_TEXT}</strong> with fresh temperature-controlled handling.
            </p>
          </div>

          {/* Available Offers */}
          <div className="space-y-1.5 text-xs">
            <span className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wide block">
              Available Offers:
            </span>
            <div className="flex items-start gap-2 text-slate-700">
              <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Bank Offer:</strong> Flat ₹50 off on first UPI order using code DAIRY50.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Fresh Guarantee:</strong> 100% money back if not satisfied with milk freshness.
              </span>
            </div>
          </div>

          {/* Product Highlights */}
          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <span className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wide block">
              Product Highlights:
            </span>
            <ul className="space-y-1 text-slate-700 list-disc list-inside">
              <li>100% Pure &amp; Farm-Fresh direct from dairy farmers</li>
              <li>Untouched by hand, hygienically packed</li>
              <li>Rich in natural calcium, protein and vitamins</li>
              <li>Free from artificial preservatives or adulterants</li>
            </ul>
          </div>

          {/* Specifications Table */}
          <div className="pt-2">
            <ProductSpecificationsTable product={product} />
          </div>

          {/* Customer Ratings Breakdown */}
          <div className="pt-2">
            <ProductRatingsBreakdown
              rating={product.rating || 4.7}
              ratingCount={product.ratingCount || 142}
            />
          </div>

          {/* Frequently Bought Together Bundle */}
          <div className="pt-2">
            <FrequentlyBoughtTogether currentProduct={product} />
          </div>

          {/* Customer Reviews List */}
          <div className="pt-2">
            <ProductReviewsList productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
};
