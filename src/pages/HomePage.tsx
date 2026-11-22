import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronRight, ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryPills } from '@/components/layout/CategoryPills';
import { BlinkitCategorySidebar } from '@/components/layout/BlinkitCategorySidebar';
import { BrandBar } from '@/components/layout/BrandBar';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
import { HeroPromoCarousel } from '@/components/home/HeroPromoCarousel';
import { Category, Product } from '@/types/ecommerce';
import { ecommerceApi } from '@/services/api';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { getStoreCallHref } from '@/utils/whatsapp';
import { triggerHaptic } from '@/utils/haptics';
import { BLINKIT_CATEGORIES, getCategorySlugForProduct } from '@/constants/categories';
import { getProductBrand } from '@/utils/brands';
import { supabase } from '@/services/supabase/client';

interface HomePageProps {
  searchQuery: string;
  onClearSearch?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery, onClearSearch }) => {
  const { isStoreOpen } = useStoreStatusStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allInStockProducts, setAllInStockProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const fetchCatalogData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        ecommerceApi.getCategories(),
        ecommerceApi.getProducts({ category: 'all' }),
      ]);
      setCategories(cats);
      // Strictly ensure only products with stock_quantity > 0 are kept
      const inStockOnly = prods.data.filter((p) => p.inStock && p.stockQuantity > 0);
      setAllInStockProducts(inStockOnly);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  // Initial and reactive query fetch
  useEffect(() => {
    fetchCatalogData(false);
  }, [fetchCatalogData]);

  // ============================================================================
  // REAL-TIME SYNC: Main Shop Inventory changes reflect instantly on E-Commerce
  // ============================================================================
  useEffect(() => {
    const channel = supabase
      .channel('ecommerce-shop-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const row = payload.new as any;
            const stockQuantity = Number(row.stock_quantity) || 0;
            const sellingPrice = Number(row.selling_price) || 0;

            // If stock dropped to 0 or inactive, remove immediately from view
            if (stockQuantity <= 0 || !row.is_active || sellingPrice <= 0) {
              setAllInStockProducts((prev) => prev.filter((p) => p.id !== row.id));
              return;
            }

            setAllInStockProducts((prev) => {
              const exists = prev.some((p) => p.id === row.id);
              const mrp = Number(row.mrp) && Number(row.mrp) > sellingPrice ? Number(row.mrp) : sellingPrice;
              const discountPercentage = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

              if (exists) {
                return prev.map((p) => {
                  if (p.id === row.id) {
                    return {
                      ...p,
                      name: row.name || p.name,
                      category: row.category || p.category,
                      brand: row.brand || p.brand || getProductBrand({ name: row.name }),
                      price: sellingPrice,
                      mrp,
                      discountPercentage,
                      stockQuantity,
                      inStock: true,
                      packSize: row.pack_size || p.packSize,
                      imageUrl: row.image_url || p.imageUrl,
                      description: row.description || p.description,
                    };
                  }
                  return p;
                });
              } else {
                // Was previously out of stock or new, now back in stock!
                const newP: Product = {
                  id: row.id,
                  name: row.name,
                  description: row.description || `${row.name} - Fresh dairy item`,
                  category: row.category || 'Dairy',
                  brand: row.brand || getProductBrand({ name: row.name }),
                  packSize: row.pack_size || 'Piece',
                  unit: row.unit || 'Piece',
                  mrp,
                  price: sellingPrice,
                  discountPercentage,
                  imageUrl: row.image_url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
                  inStock: true,
                  stockQuantity,
                  rating: 4.8,
                  ratingCount: 120,
                  isFreshToday: true,
                };
                return [newP, ...prev];
              }
            });
          } else if (payload.eventType === 'INSERT') {
            const row = payload.new as any;
            if (row.is_active && Number(row.selling_price) > 0 && Number(row.stock_quantity) > 0) {
              fetchCatalogData(true);
            }
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as any;
            setAllInStockProducts((prev) => prev.filter((p) => p.id !== row.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batches' },
        () => {
          fetchCatalogData(true);
        }
      )
      .subscribe();

    const handleFocus = () => {
      fetchCatalogData(true);
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      fetchCatalogData(true);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchCatalogData]);

  // Extract available brands dynamically from the active in-stock products
  const availableBrands = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allInStockProducts) {
      const b = getProductBrand(p);
      if (!b) continue;
      map.set(b, (map.get(b) || 0) + 1);
    }
    const list = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
    return [{ name: 'All', count: allInStockProducts.length }, ...list];
  }, [allInStockProducts]);

  // Cascading Category Drill-Down: only show categories containing products from selectedBrand
  const displayedCategories = useMemo(() => {
    if (selectedBrand === 'All') return categories;

    const brandLower = selectedBrand.toLowerCase();
    const allowedSlugs = new Set<string>();

    for (const p of allInStockProducts) {
      if (getProductBrand(p).toLowerCase() === brandLower) {
        allowedSlugs.add(getCategorySlugForProduct(p.category, p.name));
      }
    }

    return categories
      .filter((c) => c.slug === 'all' || allowedSlugs.has(c.slug))
      .map((c) => {
        if (c.slug === 'all') {
          const brandTotal = allInStockProducts.filter(
            (p) => getProductBrand(p).toLowerCase() === brandLower
          ).length;
          return { ...c, count: brandTotal };
        }
        const brandCatCount = allInStockProducts.filter(
          (p) =>
            getProductBrand(p).toLowerCase() === brandLower &&
            getCategorySlugForProduct(p.category, p.name) === c.slug
        ).length;
        return { ...c, count: brandCatCount };
      });
  }, [categories, selectedBrand, allInStockProducts]);

  // Handle Brand selection with automatic cascading reset of category
  const handleBrandChange = useCallback(
    (brand: string) => {
      setSelectedBrand(brand);
      if (selectedCategory !== 'all' && brand !== 'All') {
        const brandLower = brand.toLowerCase();
        const hasProductsInCategory = allInStockProducts.some(
          (p) =>
            getProductBrand(p).toLowerCase() === brandLower &&
            getCategorySlugForProduct(p.category, p.name) === selectedCategory
        );
        if (!hasProductsInCategory) {
          setSelectedCategory('all');
        }
      }
    },
    [selectedCategory, allInStockProducts]
  );

  // Filtered products strictly matching the current search, brand & category selection
  const filteredProducts = useMemo(() => {
    let list = allInStockProducts.filter((p) => p.inStock && p.stockQuantity > 0);

    if (selectedBrand !== 'All') {
      const brandLower = selectedBrand.toLowerCase();
      list = list.filter((p) => getProductBrand(p).toLowerCase() === brandLower);
    }

    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) => getCategorySlugForProduct(p.category, p.name) === selectedCategory
      );
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.marathiName && p.marathiName.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allInStockProducts, selectedBrand, selectedCategory, searchQuery]);

  // Group products category-wise for Blinkit storefront layout with real photos
  const categoryGroups = useMemo(() => {
    const groups = BLINKIT_CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      marathiName: cat.marathiName,
      icon: cat.icon,
      imageUrl: cat.imageUrl,
      items: [] as Product[],
    }));

    const groupMap = new Map(groups.map((g) => [g.slug, g]));
    const brandLower = selectedBrand.toLowerCase();

    allInStockProducts
      .filter((p) => {
        if (!p.inStock || p.stockQuantity <= 0) return false;
        if (selectedBrand !== 'All') {
          return getProductBrand(p).toLowerCase() === brandLower;
        }
        return true;
      })
      .forEach((p) => {
        const slug = getCategorySlugForProduct(p.category, p.name);
        const target = groupMap.get(slug) || groupMap.get('bakery-essentials');
        target?.items.push(p);
      });

    // Sort items within each category: highest stockQuantity first
    groups.forEach((g) => {
      g.items.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0));
    });

    return groups.filter((g) => g.items.length > 0);
  }, [allInStockProducts, selectedBrand]);

  const activeCategoryObj = useMemo(() => {
    return (
      displayedCategories.find((c) => c.slug === selectedCategory) ||
      categories.find((c) => c.slug === selectedCategory) ||
      BLINKIT_CATEGORIES.find((c) => c.slug === selectedCategory)
    );
  }, [displayedCategories, categories, selectedCategory]);

  return (
    <div className="min-h-screen pb-32 bg-[#F7F9FA]">
      {/* Brand Horizontal Carousel */}
      <BrandBar
        brands={availableBrands}
        selectedBrand={selectedBrand}
        onSelectBrand={handleBrandChange}
        filteredCount={filteredProducts.length}
      />

      {/* Category Horizontal Filter Bar (Cascading: only shows categories containing selected brand) */}
      <CategoryPills
        categories={displayedCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-3">
        <div className="flex gap-4 sm:gap-6 items-start">
          {/* Desktop Left Sticky Category Rail (Blinkit Style with Real Photos) */}
          <BlinkitCategorySidebar
            categories={displayedCategories}
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
                      <span>🔴 Store is Currently Closed</span>
                      <span className="text-yellow-200 text-xs font-semibold">| Opens tomorrow at 6:00 AM</span>
                    </div>
                    <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                      Yogeshwari Dairy store is currently closed. Online ordering and adding items to cart are paused right now. Deliveries will resume fresh tomorrow at <strong>6:00 AM</strong>.
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

            {/* Active Brand Filter Notice */}
            {selectedBrand !== 'All' && (
              <div className="flex items-center justify-between bg-white border border-emerald-200/90 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium">Selected Brand:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 font-black text-xs shadow-2xs">
                    <span>{selectedBrand}</span>
                    <button
                      type="button"
                      onClick={() => handleBrandChange('All')}
                      className="w-4 h-4 rounded-full bg-emerald-200/60 hover:bg-emerald-300 text-emerald-900 flex items-center justify-center cursor-pointer transition-colors"
                      title="Clear brand"
                    >
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </span>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    • {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBrandChange('All')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                >
                  Show All Brands
                </button>
              </div>
            )}

            {/* Auto-Sliding Promotional Hero Banner Carousel (Blinkit/Zepto Style) */}
            {!searchQuery && selectedCategory === 'all' && selectedBrand === 'All' && (
              <HeroPromoCarousel
                onSelectCategory={(slug) => {
                  setSelectedCategory(slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectBrand={(brand) => {
                  handleBrandChange(brand);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* Search Header or Single Category Filter Bar */}
            {searchQuery ? (
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Search results for &ldquo;{searchQuery}&rdquo;
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Found {filteredProducts.length} in-stock {filteredProducts.length === 1 ? 'item' : 'items'}
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
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0C831F] flex items-center justify-center transition-colors cursor-pointer"
                    title="All Categories"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3">
                    {activeCategoryObj?.imageUrl && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 shrink-0 shadow-xs">
                        <img
                          src={activeCategoryObj.imageUrl}
                          alt={activeCategoryObj.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>{activeCategoryObj?.name || 'Category'}</span>
                      </h2>
                      {activeCategoryObj?.marathiName && (
                        <p className="text-xs text-slate-500 font-medium">
                          {activeCategoryObj.marathiName} • {filteredProducts.length} in-stock items
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-black text-[#0C831F] hover:underline cursor-pointer"
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
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 my-4 shadow-xs">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-3xl mb-3 border border-gray-200">
                  🔍
                </div>
                <h3 className="font-black text-base text-slate-900">No items available right now</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  {selectedBrand !== 'All'
                    ? `No items found for brand "${selectedBrand}" in this selection.`
                    : 'All items in this section are currently out of stock or being prepared fresh at the dairy. Please check other categories or return to All Items.'}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {selectedBrand !== 'All' && (
                    <button
                      type="button"
                      onClick={() => handleBrandChange('All')}
                      className="bg-[#0C831F] text-white text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] cursor-pointer"
                    >
                      Clear Brand Filter
                    </button>
                  )}
                  {selectedCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="bg-gray-100 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] hover:bg-gray-200 cursor-pointer"
                    >
                      Reset Category
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onClearSearch?.()}
                      className="bg-gray-100 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] hover:bg-gray-200 cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : selectedCategory === 'all' && !searchQuery ? (
              /* ============================================================== */
              /* BLINKIT CATEGORY-WISE PRODUCT SECTIONS WITH REAL PHOTOS       */
              /* ============================================================== */
              <div id="products-section" className="space-y-8 pt-2">
                {categoryGroups.map((group) => (
                  <section
                    key={group.slug}
                    id={`category-section-${group.slug}`}
                    className="scroll-mt-36 space-y-3"
                  >
                    {/* Category Section Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                          {group.imageUrl ? (
                            <img
                              src={group.imageUrl}
                              alt={group.name}
                              loading="lazy"
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">{group.icon}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
                              {group.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {group.items.length} items
                            </span>
                          </div>
                          {group.marathiName && (
                            <p className="text-[11px] text-slate-500 font-normal">
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
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 hover:underline px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        aria-label={`See all items in ${group.name}`}
                      >
                        <span>See all</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 2 columns on mobile, gap-3 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
              <div id="products-section" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 pt-2">
                {filteredProducts.map((product) => (
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
