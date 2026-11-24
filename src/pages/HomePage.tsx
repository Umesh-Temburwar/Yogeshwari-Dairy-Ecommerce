import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronRight, ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryPills } from '@/components/layout/CategoryPills';
import { BlinkitCategorySidebar } from '@/components/layout/BlinkitCategorySidebar';
import { ShopByBrandStrip } from '@/components/brand/ShopByBrandStrip';
import { HeroPromoCarousel } from '@/components/home/HeroPromoCarousel';
import { DealsOfTheDay } from '@/components/home/DealsOfTheDay';
import { ActiveFilterChips } from '@/components/product/ActiveFilterChips';
import { ZeroResultsState } from '@/components/product/ZeroResultsState';
import { MobileFilterDrawer } from '@/components/product/MobileFilterDrawer';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
import { BackToTopButton } from '@/components/layout/BackToTopButton';
import { Category, Product } from '@/types/ecommerce';
import { FilterFacets, SortOption } from '@/types/flipkart';
import { ecommerceApi } from '@/services/api';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { getStoreCallHref } from '@/utils/whatsapp';
import { triggerHaptic } from '@/utils/haptics';
import { BLINKIT_CATEGORIES, getCategorySlugForProduct } from '@/constants/categories';
import { getProductBrand, initBrandLogos } from '@/utils/brands';
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

  // Faceted Filtering & Sorting State
  const [facets, setFacets] = useState<FilterFacets>({
    priceRange: [0, 2000],
    minRating: null,
    minDiscount: null,
    selectedBrands: [],
    inStockOnly: true,
    fastDeliveryOnly: false,
  });

  const [sortOption, setSortOption] = useState<SortOption>('relevance');

  const resetFacets = useCallback(() => {
    setFacets({
      priceRange: [0, 2000],
      minRating: null,
      minDiscount: null,
      selectedBrands: [],
      inStockOnly: true,
      fastDeliveryOnly: false,
    });
    setSelectedBrand('All');
  }, []);

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
    initBrandLogos();
    fetchCatalogData(false);
  }, [fetchCatalogData]);

  // Synchronize realtime Postgres product changes
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

  // Extract available brands dynamically from active in-stock products
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

  // Filtered products matching category, search, brand, facets, and sort
  const filteredProducts = useMemo(() => {
    let list = allInStockProducts.filter((p) => p.inStock && p.stockQuantity > 0);

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) => getCategorySlugForProduct(p.category, p.name) === selectedCategory
      );
    }

    // 2. Brand Filter
    if (selectedBrand !== 'All') {
      const brandLower = selectedBrand.toLowerCase();
      list = list.filter((p) => getProductBrand(p).toLowerCase() === brandLower);
    } else if (facets.selectedBrands.length > 0) {
      const lowerBrands = facets.selectedBrands.map((b) => b.toLowerCase());
      list = list.filter((p) => lowerBrands.includes(getProductBrand(p).toLowerCase()));
    }

    // 3. Price Range Filter
    list = list.filter(
      (p) => p.price >= facets.priceRange[0] && p.price <= facets.priceRange[1]
    );

    // 4. Customer Rating Filter
    if (facets.minRating !== null) {
      list = list.filter((p) => (p.rating || 4.5) >= (facets.minRating || 0));
    }

    // 5. Discount Filter
    if (facets.minDiscount !== null) {
      list = list.filter(
        (p) => (p.discountPercentage || 0) >= (facets.minDiscount || 0)
      );
    }

    // 6. Fast Delivery Only Filter
    if (facets.fastDeliveryOnly) {
      list = list.filter(
        (p) =>
          p.isFreshToday ||
          /milk|paneer|curd|dahi|chaas|lassi/i.test(p.name || '') ||
          /milk|paneer|curd|dahi|chaas|lassi/i.test(p.category || '')
      );
    }

    // 7. Search Query Filter
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

    // 8. Sorting
    switch (sortOption) {
      case 'popularity':
        list.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
        break;
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
        break;
      case 'relevance':
      default:
        list.sort((a, b) => (b.isFreshToday ? 1 : 0) - (a.isFreshToday ? 1 : 0));
        break;
    }

    return list;
  }, [allInStockProducts, selectedCategory, facets, selectedBrand, searchQuery, sortOption]);

  // Group products category-wise for Blinkit storefront product rails
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

  const isHomeView =
    selectedCategory === 'all' &&
    !searchQuery.trim() &&
    selectedBrand === 'All' &&
    facets.selectedBrands.length === 0 &&
    facets.minRating === null &&
    facets.minDiscount === null &&
    facets.priceRange[0] === 0 &&
    facets.priceRange[1] === 2000;

  return (
    <div className="min-h-screen pb-32 bg-[#F7F9FA]">
      {/* 1. Blinkit Category Horizontal Snap Row - Right under sticky header */}
      <CategoryPills
        categories={displayedCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-3 space-y-4">
        {/* Store Closed Banner - Single slim banner at top under header */}
        {!isStoreOpen && (
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in border border-red-500/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0 backdrop-blur-xs">
                🌙
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <span>Store is Currently Closed</span>
                  <span className="text-yellow-200 text-xs font-semibold hidden sm:inline">• Opens 6:00 AM</span>
                </div>
                <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                  Deliveries and online ordering are currently paused. Order dispatch will resume fresh at <strong>6:00 AM</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
              <a
                href={getStoreCallHref()}
                className="w-full sm:w-auto text-center bg-white text-red-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-50 transition-colors shadow-2xs"
              >
                Call Hotline
              </a>
            </div>
          </div>
        )}

        {/* =========================================================================
            HOME VIEW: Promo Banner -> Deals -> Shop by Brand -> Category Product Rails
           ========================================================================= */}
        {isHomeView && (
          <>
            {/* Auto-Sliding Promotional Hero Banner Carousel (Blinkit Style, <140px on mobile) */}
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

            {/* Flash Deals & Discounts Rail (Live Countdown Timer) */}
            <DealsOfTheDay
              products={allInStockProducts}
              onOpenDetails={(p) => setActiveModalProduct(p)}
              onViewAllDeals={() => {
                setFacets((prev) => ({ ...prev, minDiscount: 10 }));
              }}
            />

            {/* "Shop by Brand" Strip (24 Brands with official vector logos) */}
            <ShopByBrandStrip
              brands={availableBrands}
              selectedBrand={selectedBrand}
              onSelectBrand={handleBrandChange}
            />

            {/* Blinkit-Style Product RAILS per category */}
            {isLoading ? (
              <div className="space-y-5 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
                    <div className="w-40 h-5 bg-slate-200 rounded" />
                    <div className="flex gap-3 overflow-hidden">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="w-36 h-48 bg-slate-100 rounded-xl shrink-0" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : categoryGroups.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-600 font-medium text-sm">No items in stock right now.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {categoryGroups.map((group) => (
                  <section
                    key={group.slug}
                    id={`category-section-${group.slug}`}
                    className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-2xs"
                  >
                    {/* Rail Header: Category Name + Marathi + Count + See all > */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {group.imageUrl ? (
                            <img
                              src={group.imageUrl}
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm">{group.icon || '🥛'}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                              {group.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          {group.marathiName && (
                            <p className="text-[10.5px] text-slate-400 font-medium leading-none mt-0.5">
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
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer group"
                        aria-label={`See all ${group.name}`}
                      >
                        <span>See all</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Horizontally scrollable snap row of compact cards (~144px width) */}
                    <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
                      {group.items.map((prod) => (
                        <div
                          key={prod.id}
                          className="w-[144px] sm:w-[160px] snap-start shrink-0 flex"
                        >
                          <ProductCard
                            product={prod}
                            onOpenDetails={setActiveModalProduct}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            CATEGORY DRILL-DOWN OR SEARCH VIEW: Blinkit Layout (Sidebar + 2-Col Grid)
           ========================================================================= */}
        {!isHomeView && (
          <div className="space-y-3">
            {/* Header / Filter Top Bar */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    if (searchQuery) onClearSearch?.();
                    setSelectedCategory('all');
                    setSelectedBrand('All');
                    resetFacets();
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Back to all categories"
                  title="Back to all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    {searchQuery
                      ? `Search: "${searchQuery}"`
                      : selectedBrand !== 'All'
                      ? `${selectedBrand} Products`
                      : activeCategoryObj?.name || 'Category'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Reset filters shortcut */}
                {(selectedCategory !== 'all' || selectedBrand !== 'All' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedCategory('all');
                      setSelectedBrand('All');
                      if (searchQuery) onClearSearch?.();
                      resetFacets();
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                )}
              </div>
            </div>

            {/* Active Brand Filter Notice */}
            {selectedBrand !== 'All' && (
              <div className="flex items-center justify-between bg-white border border-emerald-200/90 rounded-2xl p-3 shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium">Filtered Brand:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 font-extrabold text-xs shadow-2xs">
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
                </div>
                <button
                  type="button"
                  onClick={() => handleBrandChange('All')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                >
                  All Brands
                </button>
              </div>
            )}

            {/* Blinkit Layout: Left Rail + Right Product Grid */}
            <div className="flex gap-2 sm:gap-4 items-start">
              {/* Left Vertical Rail (~80px mobile, 240px desktop) */}
              <BlinkitCategorySidebar
                categories={displayedCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => {
                  setSelectedCategory(slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* Right Side: Active Chips + Product Grid (2 cols mobile, 3-4 desktop) */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {/* Active Filter Chips */}
                <ActiveFilterChips
                  facets={facets}
                  onUpdateFacets={setFacets}
                  onResetFacets={resetFacets}
                />

                {/* Quick Sort / Filter Bar (Blinkit Style) */}
                <div className="flex items-center justify-between bg-white rounded-xl p-2 sm:px-3 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Sort:</span>
                    <button
                      type="button"
                      onClick={() => setSortOption('relevance')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                        sortOption === 'relevance'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Relevance
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortOption('price_asc')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                        sortOption === 'price_asc'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortOption('price_desc')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                        sortOption === 'price_desc'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Price: High to Low
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 shrink-0 pl-2">
                    {filteredProducts.length} items
                  </span>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl h-56 border border-slate-100" />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <ZeroResultsState
                    searchQuery={searchQuery}
                    hasActiveFilters={
                      facets.selectedBrands.length > 0 ||
                      facets.minRating !== null ||
                      facets.minDiscount !== null ||
                      facets.priceRange[0] > 0 ||
                      facets.priceRange[1] < 2000 ||
                      selectedBrand !== 'All'
                    }
                    onResetFilters={resetFacets}
                    onClearSearch={onClearSearch}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onOpenDetails={setActiveModalProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Floating Filter Drawer */}
      <MobileFilterDrawer
        facets={facets}
        onUpdateFacets={setFacets}
        onResetFacets={resetFacets}
        availableBrands={availableBrands}
        sortOption={sortOption}
        onSelectSort={setSortOption}
        totalFilteredCount={filteredProducts.length}
      />

      {/* Floating Back to Top Button */}
      <BackToTopButton />

      {/* Product Detail Modal with Specifications & Reviews */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
};
