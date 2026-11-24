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
    <div className="min-h-screen bg-[#F7F9FA] py-4 sm:py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
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
                className="px-3.5 py-2 bg-[#0C831F] hover:bg-[#086617] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move All to Cart</span>
              </button>
              <button
                type="button"
                onClick={clearWishlist}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items List or Empty State */}
        {count > 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {items.map((item) => {
              const p = item.product;
              return (
                <div
                  key={item.productId}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-2 flex items-center justify-center shrink-0">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{p.name}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-[#0C831F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
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
                            <span className="text-xs font-bold text-emerald-700">
                              {p.discountPercentage || Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(p)}
                      className="px-3 py-1.5 bg-[#0C831F] hover:bg-[#086617] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <span>Move to Cart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        removeFromWishlist(item.productId);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Your wishlist is empty</h2>
              <p className="text-xs text-slate-500 mt-1">
                Explore our pure fresh dairy products and tap the heart icon to save your favorites!
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0C831F] hover:bg-[#086617] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Explore Fresh Dairy</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
