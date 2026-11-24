
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Heart,
  Truck,
  Tag,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { ecommerceApi } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { formatPrice, formatDisplayDate } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { shareProductOnWhatsApp } from '@/utils/whatsapp';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';
import { PureAssuredBadge } from '@/components/product/PureAssuredBadge';
import { ProductSpecificationsTable } from '@/components/product/ProductSpecificationsTable';
import { ProductRatingsBreakdown } from '@/components/product/ProductRatingsBreakdown';
import { ProductReviewsList } from '@/components/product/ProductReviewsList';
import { FrequentlyBoughtTogether } from '@/components/product/FrequentlyBoughtTogether';
import { ProductCard } from '@/components/product/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getItemQuantity, addItem, updateQuantity, openCartDrawer } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isStoreOpen, deliveryEta } = useStoreStatusStore();

  useEffect(() => {
    if (!productId) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsLoading(true);
    setError(null);

    ecommerceApi
      .getProductById(productId)
      .then((p) => {
        setProduct(p);
        // Fetch similar products in the same category
        return ecommerceApi.getProducts({ category: p.category }).then((res) => {
          const others = res.data.filter((item) => item.id !== p.id && item.inStock);
          setSimilarProducts(others.slice(0, 8));
        });
      })
      .catch((err) => {
        console.error('Failed to load product details:', err);
        setError('This product is currently unavailable or out of stock.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] pb-24 max-w-7xl mx-auto px-4 py-6 space-y-6 animate-pulse">
        <div className="w-48 h-6 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-slate-100">
          <div className="aspect-square bg-slate-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="w-3/4 h-8 bg-slate-200 rounded-lg" />
            <div className="w-1/2 h-6 bg-slate-100 rounded-lg" />
            <div className="w-1/3 h-10 bg-slate-200 rounded-lg" />
            <div className="w-full h-32 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md w-full shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-2xl font-bold">
            🥛
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'The requested dairy item is no longer available in our active inventory.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            ← Back to Dairy Store
          </button>
        </div>
      </div>
    );
  }

  const quantity = getItemQuantity(product.id);
  const isWishlisted = isInWishlist(product.id);
  const isMaxStock = Boolean(product.stockQuantity) && quantity >= product.stockQuantity;

  const handleBuyNow = () => {
    if (!isStoreOpen) return;
    triggerHaptic('medium');
    if (quantity === 0) {
      addItem(product);
    }
    openCartDrawer();
  };

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
    <div className="min-h-screen bg-[#F7F9FA] pb-28 sm:pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                navigate(-1);
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Go back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-emerald-700 transition-colors shrink-0">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="hover:text-emerald-700 transition-colors shrink-0">
                {product.category || 'Dairy'}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900 truncate">
                {product.name}
              </span>
            </nav>
          </div>

          {/* Right Action Icons: WhatsApp Share & Wishlist */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                shareProductOnWhatsApp(product.name, product.price);
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 flex items-center justify-center cursor-pointer transition-colors"
              title="Share on WhatsApp"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                toggleWishlist(product);
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label="Wishlist toggle"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* LEFT COLUMN: Gallery & Buy Actions (Span 5 cols on desktop) */}
            <div className="md:col-span-5 flex flex-col space-y-4">
              {/* Main Image Stage */}
              <div className="relative w-full aspect-square bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-2xs group">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <span className="bg-emerald-700 text-white text-[10.5px] font-bold px-2 py-0.5 rounded-md uppercase shadow-xs">
                      {product.discountPercentage}% OFF
                    </span>
                  ) : null}
                  {product.isFreshToday && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      Fresh Farm
                    </span>
                  )}
                </div>

                {!product.inStock && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:grid grid-cols-2 gap-3 pt-2">
                {!product.inStock ? (
                  <button
                    type="button"
                    disabled
                    className="col-span-2 py-3.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-2xl uppercase cursor-not-allowed text-center"
                  >
                    Out of Stock
                  </button>
                ) : !isStoreOpen ? (
                  <button
                    type="button"
                    disabled
                    className="col-span-2 py-3.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-2xl uppercase cursor-not-allowed text-center"
                  >
                    Store is Closed
                  </button>
                ) : quantity === 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        addItem(product);
                      }}
                      className="py-3.5 px-4 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-600 font-extrabold text-xs rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer uppercase text-center"
                    >
                      ADD TO CART
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="py-3.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer uppercase flex items-center justify-center gap-1.5"
                    >
                      <span>BUY NOW</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between bg-emerald-700 text-white rounded-2xl shadow-xs overflow-hidden h-12 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          updateQuantity(product.id, quantity - 1);
                        }}
                        className="w-10 h-10 flex items-center justify-center hover:bg-black/20 rounded-xl transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-extrabold text-sm">{quantity} in Cart</span>
                      <button
                        type="button"
                        disabled={isMaxStock}
                        onClick={() => {
                          triggerHaptic('light');
                          if (!isMaxStock) updateQuantity(product.id, quantity + 1);
                        }}
                        className="w-10 h-10 flex items-center justify-center disabled:opacity-40 hover:bg-black/20 rounded-xl transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCartDrawer()}
                      className="py-3.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer uppercase flex items-center justify-center gap-1.5"
                    >
                      <span>VIEW CART</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Product Details, Pricing, Specs (Span 7 cols on desktop) */}
            <div className="md:col-span-7 space-y-4">
              {/* Brand Chip & Title */}
              <div>
                {product.brand && (
                  <Link
                    to={`/brand/${encodeURIComponent(product.brand)}`}
                    className="inline-block text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 mb-1 hover:bg-emerald-100 transition-colors"
                  >
                    {product.brand} →
                  </Link>
                )}
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
                {product.marathiName && (
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    {product.marathiName}
                  </p>
                )}
              </div>

              {/* Ratings & Trust Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-1 bg-[#0C831F] text-white text-xs font-bold px-2 py-0.5 rounded-md leading-none shadow-2xs">
                  <span>{product.rating ? product.rating.toFixed(1) : '4.6'}</span>
                  <span>★</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {product.ratingCount || 142} Ratings &amp; 38 Reviews
                </span>
                <PureAssuredBadge />
              </div>

              {/* Price & Savings Display */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-1">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-sm sm:text-base text-slate-400 line-through">
                        {formatPrice(product.mrp)}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-emerald-700">
                        {product.discountPercentage || Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800 font-bold">
                  Special Daily Price • Inclusive of all taxes
                </p>
                {product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                  <p className="text-xs text-rose-600 font-bold pt-1">
                    ⚡ Hurry, only {product.stockQuantity} {product.stockQuantity === 1 ? 'pack' : 'packs'} left in stock!
                  </p>
                )}
              </div>

              {/* Fast Delivery Promise */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Speed Delivery to Ambajogai Mandi Hub</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Guaranteed delivery in <strong>{deliveryEta || DELIVERY_ETA_TEXT}</strong> with fresh temperature-controlled cold chain handling.
                </p>
                {shouldShowExpiry && product.expiryDate && (
                  <p className="text-[11px] text-emerald-800 font-semibold pt-0.5">
                    ✓ Best before {formatDisplayDate(product.expiryDate)} (Fresh daily batch)
                  </p>
                )}
              </div>

              {/* Promotional & Bank Offers */}
              <div className="space-y-2 text-xs">
                <span className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider block">
                  Available Offers:
                </span>
                <div className="flex items-start gap-2 text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                  <Tag className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">UPI Instant Discount: </span>
                    <span>Flat ₹50 off on first UPI order using code <strong>DAIRY50</strong>.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Freshness Guarantee: </span>
                    <span>100% replacement or refund if dairy purity is not satisfactory.</span>
                  </div>
                </div>
              </div>

              {/* Product Specifications Table */}
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

        {/* Similar / More Products in This Category Rail */}
        {similarProducts.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                More in {product.category || 'Dairy'}
              </h2>
              <Link
                to="/"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
              {similarProducts.map((p) => (
                <div
                  key={p.id}
                  className="w-[144px] sm:w-[160px] snap-start shrink-0 flex"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Sticky Bottom Action Bar (Thumb-Friendly Checkout) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-float z-40 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 leading-none">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
            Inclusive of all taxes
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!product.inStock ? (
            <span className="text-xs font-bold text-slate-400 uppercase px-3 py-2 bg-slate-100 rounded-xl">
              Out of Stock
            </span>
          ) : !isStoreOpen ? (
            <span className="text-xs font-bold text-slate-400 px-3 py-2 bg-slate-100 rounded-xl">
              Closed
            </span>
          ) : quantity === 0 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  addItem(product);
                }}
                className="py-2.5 px-3.5 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-600 font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-95"
              >
                ADD TO CART
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="py-2.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleBuyNow}
              className="py-2.5 px-4 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1"
            >
              <span>CHECKOUT ({quantity})</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
