import React from 'react';
import { Heart, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { PureAssuredBadge } from '@/components/product/PureAssuredBadge';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist, clearWishlist, getWishlistCount } = useWishlistStore();
  const { addItem, openCartDrawer } = useCartStore();

  const count = getWishlistCount();

  const handleMoveToCart = (product: any) => {
    triggerHaptic('medium');
    addItem(product);
    removeFromWishlist(product.id);
  };

  const handleAddAllToCart = () => {
    triggerHaptic('medium');
    items.forEach((item) => addItem(item.product));
    clearWishlist();
    openCartDrawer();
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] py-4 sm:py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              My Wishlist ({count})
            </h1>
          </div>

          {count > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-3.5 py-1.5 bg-[#2874F0] hover:bg-[#1A5DC8] text-white font-bold text-xs rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move All to Cart</span>
              </button>
              <button
                type="button"
                onClick={clearWishlist}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xs cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items List or Empty State */}
        {count > 0 ? (
          <div className="bg-white border border-[#E0E0E0] rounded-xs divide-y divide-slate-100 shadow-xs">
            {items.map((item) => {
              const p = item.product;
              return (
                <div
                  key={item.productId}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xs overflow-hidden p-2 flex items-center justify-center shrink-0">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{p.name}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                          {p.rating ? p.rating.toFixed(1) : '4.5'} ★
                        </span>
                        <span className="text-slate-400">({p.ratingCount || 48})</span>
                        <PureAssuredBadge />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-base text-slate-900">
                          {formatPrice(p.price)}
                        </span>
                        {p.mrp > p.price && (
                          <>
                            <span className="text-xs text-slate-400 line-through">
                              {formatPrice(p.mrp)}
                            </span>
                            <span className="text-xs font-bold text-[#388E3C]">
                              {p.discountPercentage || Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(p)}
                      className="px-4 py-2 bg-[#FF9F00] hover:bg-[#E58F00] text-white font-bold text-xs rounded-xs shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        removeFromWishlist(p.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer rounded hover:bg-slate-100"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#E0E0E0] rounded-xs p-12 text-center space-y-4 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10 text-[#2874F0]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Wishlist is Empty!</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore our pure dairy products, fresh cow milk, desi ghee, and sweets, and tap the heart icon to save items.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#2874F0] hover:bg-[#1A5DC8] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
