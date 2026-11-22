import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Truck, Clock, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryPills } from '@/components/layout/CategoryPills';
import { BlinkitCategorySidebar } from '@/components/layout/BlinkitCategorySidebar';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
import { Category, Product } from '@/types/ecommerce';
import { ecommerceApi, isUsingMockApi } from '@/services/api';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { getStoreCallHref } from '@/utils/whatsapp';
import { triggerHaptic } from '@/utils/haptics';

interface HomePageProps {
  searchQuery: string;
  onClearSearch?: () => void;
}

const DISPLAY_CATEGORIES = [
  { slug: 'milk', name: 'Fresh Milk & Cream', marathiName: 'ताजे दूध आणि मलई', icon: '🥛' },
  { slug: 'paneer-khoya', name: 'Fresh Paneer & Butter', marathiName: 'पनीर आणि बटर', icon: '🧀' },
  { slug: 'dahi-chaas-lassi', name: 'Curd, Chaas & Lassi', marathiName: 'दही, ताक आणि लस्सी', icon: '🥣' },
  { slug: 'ghee-butter', name: 'Pure Desi Ghee', marathiName: 'शुद्ध देशी तूप', icon: '🧈' },
  { slug: 'sweets-shrikhand', name: 'Sweets, Mithai & Shrikhand', marathiName: 'मिठाई आणि श्रीखंड', icon: '🍯' },
  { slug: 'bakery-essentials', name: 'Biscuits, Bakery & Snacks', marathiName: 'बिस्किट्स, बेकरी आणि स्नॅक्स', icon: '🍪' },
  { slug: 'beverages', name: 'Cold Drinks & Beverages', marathiName: 'पेये आणि कोल्ड्रिंक्स', icon: '🥤' },
  { slug: 'groceries-fmcg', name: 'Cooking & Grocery Essentials', marathiName: 'मसाले आणि किराणा', icon: '🥫' },
];

function getCategorySlugForProduct(categoryName?: string, productName?: string): string {
  const c = (categoryName || '').toLowerCase();
  const n = (productName || '').toLowerCase();

  if (c.includes('milk') || n.includes('milk')) return 'milk';
  if (
    c.includes('curd') ||
    c.includes('chaas') ||
    c.includes('dahi') ||
    c.includes('lassi') ||
    n.includes('curd') ||
    n.includes('dahi') ||
    n.includes('chaas') ||
    n.includes('lassi')
  ) {
    return 'dahi-chaas-lassi';
  }
  if (c.includes('ghee') || n.includes('ghee')) return 'ghee-butter';
  if (
    c.includes('paneer') ||
    c.includes('butter') ||
    c.includes('khoya') ||
    n.includes('paneer') ||
    n.includes('butter') ||
    n.includes('khoya') ||
    n.includes('cheese')
  ) {
    return 'paneer-khoya';
  }
  if (
    c.includes('sweet') ||
    c.includes('mithai') ||
    c.includes('shrikhand') ||
    n.includes('shrikhand') ||
    n.includes('gulab jamun') ||
    n.includes('rasgulla') ||
    n.includes('sonpapdi') ||
    n.includes('laddu') ||
    n.includes('petha')
  ) {
    return 'sweets-shrikhand';
  }
  if (
    c.includes('beverage') ||
    c.includes('drink') ||
    n.includes('campa') ||
    n.includes('cola') ||
    n.includes('sprite') ||
    n.includes('flavour')
  ) {
    return 'beverages';
  }
  if (
    c.includes('grocery') ||
    c.includes('fmcg') ||
    c.includes('masala') ||
    n.includes('masala') ||
    n.includes('pickle') ||
    n.includes('sauce') ||
    n.includes('dal') ||
    n.includes('ketchup') ||
    n.includes('maggi')
  ) {
    return 'groceries-fmcg';
  }
  return 'bakery-essentials';
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
            limit: selectedCategory === 'all' && !searchQuery ? 300 : 100,
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

  // Group products category-wise for Blinkit storefront layout
  const categoryGroups = useMemo(() => {
    const groups = DISPLAY_CATEGORIES.map((cat) => ({
      ...cat,
      items: [] as Product[],
    }));

    const groupMap = new Map(groups.map((g) => [g.slug, g]));

    products.forEach((p) => {
      const slug = getCategorySlugForProduct(p.category, p.name);
      const target = groupMap.get(slug) || groupMap.get('bakery-essentials');
      target?.items.push(p);
    });

    // Sort items within each category: inStock first, then highest stockQuantity
    groups.forEach((g) => {
      g.items.sort((a, b) => {
        if (a.inStock && !b.inStock) return -1;
        if (!a.inStock && b.inStock) return 1;
        return (b.stockQuantity || 0) - (a.stockQuantity || 0);
      });
    });

    return groups.filter((g) => g.items.length > 0);
  }, [products]);

  const activeCategoryObj = useMemo(() => {
    return (
      categories.find((c) => c.slug === selectedCategory) ||
      DISPLAY_CATEGORIES.find((c) => c.slug === selectedCategory)
    );
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-screen pb-32 bg-[#F7F9FA]">
      {/* Category Horizontal Filter Bar (Blinkit Circular Icon Bar) */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-3">
        <div className="flex gap-4 sm:gap-6 items-start">
          {/* Desktop Left Sticky Category Rail (Blinkit Style) */}
          <BlinkitCategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Main Product Area */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Store Closed Banner */}
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

            {/* Live Inventory Connected Status */}
            {isUsingMockApi ? (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-amber-900 shadow-xs">
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
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
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
                  <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black mb-2 shadow-xs">
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
                      <ShieldCheck className="w-4 h-4 text-yellow-300 shrink-0" />
                      <span>Lab Tested Pure</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-yellow-300 shrink-0" />
                      <span>20-40 Mins Est.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-yellow-300 shrink-0" />
                      <span>Free &gt; ₹300</span>
                    </div>
                  </div>
                </div>

                {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              </div>
            )}

            {/* Search Header or Single Category Filter Bar */}
            {searchQuery ? (
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Search results for &ldquo;{searchQuery}&rdquo;
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Found {products.length} {products.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onClearSearch?.()}
                  className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-1 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Search</span>
                </button>
              </div>
            ) : selectedCategory !== 'all' ? (
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedCategory('all');
                    }}
                    className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0C831F] flex items-center justify-center transition-colors cursor-pointer"
                    title="All Categories"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>{activeCategoryObj?.icon || '🥛'}</span>
                      <span>{activeCategoryObj?.name || 'Category'}</span>
                    </h2>
                    {activeCategoryObj?.marathiName && (
                      <p className="text-xs text-slate-500 font-medium">
                        {activeCategoryObj.marathiName} • {products.length} items available
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-black text-[#0C831F] hover:underline"
                >
                  View All Categories
                </button>
              </div>
            ) : null}

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 py-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-3 border border-gray-200 animate-pulse space-y-3"
                  >
                    <div className="w-full aspect-square bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-8 bg-gray-100 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 my-4 shadow-xs">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-3xl mb-3 border border-gray-200">
                  🔍
                </div>
                <h3 className="font-black text-base text-slate-900">No items found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  We couldn&apos;t find any products in this section. Try searching for &ldquo;Milk&rdquo;,
                  &ldquo;Paneer&rdquo;, &ldquo;Ghee&rdquo; or return to All Items.
                </p>
                <div className="flex items-center justify-center gap-2">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onClearSearch?.()}
                      className="bg-[#0C831F] text-white text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="bg-gray-100 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] hover:bg-gray-200 cursor-pointer"
                  >
                    Reset Category
                  </button>
                </div>
              </div>
            ) : selectedCategory === 'all' && !searchQuery ? (
              /* ============================================================== */
              /* BLINKIT CATEGORY-WISE PRODUCT SECTIONS                         */
              /* ============================================================== */
              <div className="space-y-8 pt-2">
                {categoryGroups.map((group) => (
                  <section
                    key={group.slug}
                    id={`category-section-${group.slug}`}
                    className="scroll-mt-36 space-y-3"
                  >
                    {/* Category Section Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/80 flex items-center justify-center text-xl shadow-xs">
                          {group.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {group.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0C831F]">
                              {group.items.length} items
                            </span>
                          </div>
                          {group.marathiName && (
                            <p className="text-[11px] text-slate-500 font-medium">
                              {group.marathiName}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedCategory(group.slug);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs font-black text-[#0C831F] hover:text-emerald-700 flex items-center gap-0.5 hover:underline px-2.5 py-1.5 rounded-xl bg-emerald-50/80 transition-colors cursor-pointer"
                      >
                        <span>See all</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Blinkit 2-column on mobile, 3-to-5 on larger screens */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
                      {group.items.slice(0, 10).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOpenDetails={(p) => setActiveModalProduct(p)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* Filtered / Searched Flat Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 pt-2">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setActiveModalProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
};
