import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronRight, ArrowLeft, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { FlipkartMegaNav } from '@/components/layout/FlipkartMegaNav';
import { MobileCategoryChips } from '@/components/layout/MobileCategoryChips';
import { AnnouncementTicker } from '@/components/home/AnnouncementTicker';
import { HeroPromoCarousel } from '@/components/home/HeroPromoCarousel';
import { BankOffersStrip } from '@/components/home/BankOffersStrip';
import { DealsOfTheDay } from '@/components/home/DealsOfTheDay';
import { TopDairyRail } from '@/components/home/TopDairyRail';
import { BestSellersSweetsRail } from '@/components/home/BestSellersSweetsRail';
import { TrendingSnacksRail } from '@/components/home/TrendingSnacksRail';
import { FlipkartPromoGrid } from '@/components/home/FlipkartPromoGrid';
import { ShopByBrandStrip } from '@/components/brand/ShopByBrandStrip';
import { ProductFiltersSidebar } from '@/components/product/ProductFiltersSidebar';
import { FlipkartSortBar } from '@/components/product/FlipkartSortBar';
import { ActiveFilterChips } from '@/components/product/ActiveFilterChips';
import { MobileFilterDrawer } from '@/components/product/MobileFilterDrawer';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
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

  // Flipkart Facet Filters & Sorting State
  const [facets, setFacets] = useState<FilterFacets>({
    priceRange: [0, 2000],
    minRating: null,
    minDiscount: null,
    selectedBrands: [],
    inStockOnly: true,
    fastDeliveryOnly: false,
  });

  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCatalogData]);

  // Extract available brands dynamically
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

  // Handle Brand selection
  const handleBrandChange = useCallback((brand: string) => {
    setSelectedBrand(brand);
    setFacets((prev) => ({
      ...prev,
      selectedBrands: brand === 'All' ? [] : [brand],
    }));
  }, []);

  // Multi-dimensional Flipkart Catalog Filtering & Sorting Engine
  const filteredProducts = useMemo(() => {
    let list = allInStockProducts.slice();

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) => getCategorySlugForProduct(p.category, p.name) === selectedCategory
      );
    }

    // 2. Brand Filter (Multi-select facets or single brand chip)
    if (facets.selectedBrands.length > 0) {
      const brandsLower = facets.selectedBrands.map((b) => b.toLowerCase());
      list = list.filter((p) => brandsLower.includes(getProductBrand(p).toLowerCase()));
    } else if (selectedBrand !== 'All') {
      const brandLower = selectedBrand.toLowerCase();
      list = list.filter((p) => getProductBrand(p).toLowerCase() === brandLower);
    }

    // 3. Price Range Filter
    const [minP, maxP] = facets.priceRange;
    if (minP > 0 || maxP < 2000) {
      list = list.filter((p) => p.price >= minP && p.price <= maxP);
    }

    // 4. Rating Filter
    if (facets.minRating !== null) {
      list = list.filter((p) => (p.rating || 4.5) >= (facets.minRating as number));
    }

    // 5. Discount Filter
    if (facets.minDiscount !== null) {
      list = list.filter(
        (p) =>
          (p.discountPercentage && p.discountPercentage >= (facets.minDiscount as number)) ||
          (p.mrp > p.price &&
            Math.round(((p.mrp - p.price) / p.mrp) * 100) >= (facets.minDiscount as number))
      );
    }

    // 6. In Stock Filter
    if (facets.inStockOnly) {
      list = list.filter((p) => p.inStock && p.stockQuantity > 0);
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

    // 8. Flipkart Sorting Options
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
        // Prioritize in-stock and fresh batch items
        list.sort((a, b) => (b.isFreshToday ? 1 : 0) - (a.isFreshToday ? 1 : 0));
        break;
    }

    return list;
  }, [allInStockProducts, selectedCategory, facets, selectedBrand, searchQuery, sortOption]);

  const isHomeBrowsing =
    selectedCategory === 'all' &&
    !searchQuery.trim() &&
    selectedBrand === 'All' &&
    facets.selectedBrands.length === 0 &&
    facets.minRating === null &&
    facets.minDiscount === null &&
    facets.priceRange[0] === 0 &&
    facets.priceRange[1] === 2000;

  return (
    <div className="min-h-screen pb-28 bg-[#F1F3F6]">
      {/* 1. Flipkart Secondary Horizontal Mega Category Navigation */}
      <FlipkartMegaNav
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectSubcategory={(sub) => {
          if (onClearSearch) onClearSearch();
          // Scroll directly down to catalog
          const catElem = document.getElementById('catalog-view');
          if (catElem) {
            catElem.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* 2. Mobile Quick Category Sticky Chips */}
      <MobileCategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 3. Live Announcement Flash Deal Ticker */}
      <AnnouncementTicker />

      {/* 4. Bank and UPI Discount Strip */}
      <BankOffersStrip />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-3">
        {/* Store Closed Banner (If applicable) */}
        {!isStoreOpen && (
          <div className="bg-[#D32F2F] text-white rounded-xs p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-red-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base">Store is Currently Closed</h4>
                <p className="text-xs text-red-100 mt-0.5">
                  Ordering is temporarily paused. Orders resume fresh at <strong>6:00 AM</strong>.
                </p>
              </div>
            </div>
            <a
              href={getStoreCallHref()}
              className="bg-white text-[#D32F2F] font-bold text-xs px-4 py-2 rounded-xs self-start sm:self-auto hover:bg-red-50 transition-colors"
            >
              Call Dairy Hotline
            </a>
          </div>
        )}

        {/* =====================================================================
            HOME SHOWCASES (Rendered when customer is browsing the home feed)
           ===================================================================== */}
        {isHomeBrowsing && (
          <>
            {/* Hero Promotional Carousel */}
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

            {/* Flipkart Deals of the Day (Live Countdown Timer + Flash Discounts) */}
            <DealsOfTheDay
              products={allInStockProducts}
              onOpenDetails={(p) => setActiveModalProduct(p)}
              onViewAllDeals={() => {
                setFacets((prev) => ({ ...prev, minDiscount: 10 }));
                const catElem = document.getElementById('catalog-view');
                if (catElem) catElem.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Featured Dairy Essentials Grid */}
            <FlipkartPromoGrid
              onSelectCategory={(slug) => {
                setSelectedCategory(slug);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Shop by Brand Strip (With real official vector logos) */}
            <ShopByBrandStrip
              brands={availableBrands}
              selectedBrand={selectedBrand}
              onSelectBrand={handleBrandChange}
            />

            {/* Curated Category Product Rails */}
            <TopDairyRail
              products={allInStockProducts}
              onOpenDetails={(p) => setActiveModalProduct(p)}
              onViewCategory={(cat) => setSelectedCategory(cat)}
            />

            <BestSellersSweetsRail
              products={allInStockProducts}
              onOpenDetails={(p) => setActiveModalProduct(p)}
              onViewCategory={(cat) => setSelectedCategory(cat)}
            />

            <TrendingSnacksRail
              products={allInStockProducts}
              onOpenDetails={(p) => setActiveModalProduct(p)}
              onViewCategory={(cat) => setSelectedCategory(cat)}
            />
          </>
        )}

        {/* =====================================================================
            MAIN FLIPKART CATALOG LAYOUT (Desktop 2-Column: Sidebar + Product Grid)
           ===================================================================== */}
        <div id="catalog-view" className="pt-2">
          {/* Active Search / Category Header */}
          {(selectedCategory !== 'all' || searchQuery.trim() || selectedBrand !== 'All') && (
            <div className="bg-white border border-[#E0E0E0] p-3.5 rounded-xs mb-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBrand('All');
                    if (onClearSearch) onClearSearch();
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  title="Back to All Products"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                    {searchQuery.trim()
                      ? `Search Results for "${searchQuery}"`
                      : selectedBrand !== 'All'
                      ? `${selectedBrand} Products`
                      : selectedCategory !== 'all'
                      ? categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory
                      : 'All Products'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {filteredProducts.length} items found
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetFacets}
                className="text-xs font-bold text-[#2874F0] hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Desktop 2-Column Grid */}
          <div className="flex items-start gap-3">
            {/* Left Column: Facet Filters Sidebar (Desktop only) */}
            <div className="hidden md:block w-60 lg:w-64 shrink-0 sticky top-24">
              <ProductFiltersSidebar
                facets={facets}
                onUpdateFacets={setFacets}
                onResetFacets={resetFacets}
                availableBrands={availableBrands}
                totalFilteredCount={filteredProducts.length}
              />
            </div>

            {/* Right Column: Sort Bar + Active Filter Chips + Product Grid */}
            <div className="flex-1 min-w-0 bg-white border border-[#E0E0E0] rounded-xs shadow-xs overflow-hidden">
              {/* Flipkart Sort Bar */}
              <FlipkartSortBar
                currentSort={sortOption}
                onSelectSort={setSortOption}
                viewMode={viewMode}
                onToggleViewMode={setViewMode}
                totalCount={filteredProducts.length}
              />

              {/* Active Filter Chips Bar */}
              <div className="px-3.5">
                <ActiveFilterChips
                  facets={facets}
                  onUpdateFacets={setFacets}
                  onResetFacets={resetFacets}
                />
              </div>

              {/* Product Grid / List / Zero Results */}
              <div className="p-3 sm:p-4">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-slate-100 rounded-xs aspect-square p-4" />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5'
                        : 'space-y-3'
                    }
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onOpenDetails={(p) => setActiveModalProduct(p)}
                      />
                    ))}
                  </div>
                ) : (
                  /* Zero Results State with Reset Suggestions */
                  <div className="text-center py-16 px-4 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center mx-auto text-2xl font-black">
                      🔍
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        No products match your active filters
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        Try adjusting your price range, clearing brand checkboxes, or relaxing your discount criteria.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetFacets}
                      className="px-5 py-2.5 bg-[#2874F0] hover:bg-[#1A5DC8] text-white text-xs font-bold rounded-xs cursor-pointer transition-colors shadow-xs"
                    >
                      Clear Filters &amp; View All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Filter & Sort Drawer */}
      <MobileFilterDrawer
        facets={facets}
        onUpdateFacets={setFacets}
        onResetFacets={resetFacets}
        availableBrands={availableBrands}
        sortOption={sortOption}
        onSelectSort={setSortOption}
        totalFilteredCount={filteredProducts.length}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
};
