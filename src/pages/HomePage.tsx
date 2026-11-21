import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Clock, X } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryPills } from '@/components/layout/CategoryPills';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
import { Category, Product } from '@/types/ecommerce';
import { ecommerceApi, isUsingMockApi } from '@/services/api';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { getStoreCallHref } from '@/utils/whatsapp';

interface HomePageProps {
  searchQuery: string;
  onClearSearch?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery, onClearSearch }) => {
  const { isStoreOpen } = useStoreStatusStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          ecommerceApi.getCategories(),
          ecommerceApi.getProducts({
            category: selectedCategory,
            search: searchQuery,
          }),
        ]);
        setCategories(cats);
        setProducts(prods.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen pb-32">
      {/* Category Horizontal Filter Bar */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
        {/* Store Closed Banner (Flipkart / Blinkit Style Alert) */}
        {!isStoreOpen && (
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in border border-red-500/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0 backdrop-blur-xs">
                🌙
              </div>
              <div>
                <div className="font-black text-sm sm:text-base flex items-center gap-2">
                  <span>🔴 Dukan Abhi Band Hai</span>
                  <span className="text-yellow-200 text-xs font-semibold">| दुकान सध्या बंद आहे</span>
                </div>
                <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                  Yogeshwari Dairy store is currently closed for the night. Online deliveries will resume tomorrow fresh at <strong>6:00 AM</strong>. You can browse products & build your cart anytime!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
              <a
                href={getStoreCallHref()}
                className="w-full sm:w-auto text-center bg-white text-red-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-50 transition-colors shadow-xs"
              >
                Call Store Hotline
              </a>
            </div>
          </div>
        )}
        {/* Banner Alert for Mock API Mode or Live Stock Mode */}
        {isUsingMockApi ? (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl px-3 py-2 flex items-center justify-between text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">ℹ️</span>
              <div>
                <span className="font-extrabold">Demo Store: </span>
                <span className="text-amber-800">
                  Showing local dairy product catalog. Physical inventory managed via shop counter.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-200/80 font-bold px-2 py-0.5 rounded-full shrink-0">
              Mock Adapter
            </span>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl px-3 py-2 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🟢</span>
              <div>
                <span className="font-extrabold">Live Inventory Connected: </span>
                <span className="text-emerald-800">
                  Real-time stock synced directly with Yogeshwari Dairy counter POS & Supabase.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full shrink-0">
              Live Stock
            </span>
          </div>
        )}

        {/* Hero Quick Banner with honest delivery text */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0C831F] via-[#09721B] to-[#044810] text-white p-5 sm:p-7 shadow-subtle">
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-brand-yellow text-brand-text-primary px-3 py-1 rounded-full text-xs font-black mb-2 shadow-xs">
                <span>⚡ FAST LOCAL DELIVERY (EST. 20-40 MINS)</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                Fresh Farm Milk & Pure Dairy at Your Doorstep
              </h1>
              <p className="text-xs sm:text-sm text-white/85 font-medium mt-1.5 leading-relaxed">
                100% Unadulterated Cow & Buffalo Milk, Soft Malai Paneer, and Desi Bilona Ghee.
                Delivery across Ambajogai • Open Daily: 6:00 AM – 10:00 PM.
              </p>

              {/* Guarantees checklist */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-[11px] font-bold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>Lab Tested Pure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>20-40 Mins Est.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>Free &gt; ₹300</span>
                </div>
              </div>
            </div>

            {/* Decorative background circle */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        )}

        {/* Section Heading */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-text-primary">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : selectedCategory === 'all'
                ? 'Fresh Today & Best Sellers'
                : categories.find((c) => c.slug === selectedCategory)?.name || 'Products'}
            </h2>
            <p className="text-xs text-brand-text-muted">
              {products.length} {products.length === 1 ? 'item available' : 'items available'}
            </p>
          </div>

          {searchQuery && (
            <button
              onClick={() => onClearSearch?.()}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-1 p-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 py-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 border border-brand-slate-border animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-brand-slate-border my-6">
            <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
              🔍
            </div>
            <h3 className="font-extrabold text-base text-brand-text-primary">
              No dairy items found
            </h3>
            <p className="text-xs text-brand-text-muted max-w-sm mx-auto mt-1 mb-4">
              We couldn't find any products matching your search. Try searching for "Cow Milk",
              "Paneer", "Ghee" or select "All Items".
            </p>
            <div className="flex items-center justify-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => onClearSearch?.()}
                  className="bg-[#0C831F] text-white text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px]"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => setSelectedCategory('all')}
                className="bg-gray-100 text-brand-text-primary text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px]"
              >
                Reset Category
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
};
