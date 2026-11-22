import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
import { ecommerceApi } from '@/services/api';
import { Product } from '@/types/ecommerce';
import { getProductBrand, getBrandVisual, initBrandLogos } from '@/utils/brands';
import { triggerHaptic } from '@/utils/haptics';

type SortOption = 'popularity' | 'price_asc' | 'price_desc' | 'name_asc';

export const BrandPage: React.FC = () => {
  const { brandName: rawBrandName } = useParams<{ brandName: string }>();
  const navigate = useNavigate();
  const brandName = decodeURIComponent(rawBrandName || '');

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    initBrandLogos();
    ecommerceApi
      .getProducts({ category: 'all' })
      .then((res) => {
        const inStock = res.data.filter((p) => p.inStock && p.stockQuantity > 0);
        setProducts(inStock);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Filter products for this specific brand
  const brandProducts = useMemo(() => {
    const brandLower = brandName.toLowerCase();
    return products.filter((p) => getProductBrand(p).toLowerCase() === brandLower);
  }, [products, brandName]);

  // Extract categories available for this brand
  const availableCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of brandProducts) {
      const cat = p.category || 'Other';
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    const list = Array.from(map.entries()).map(([cat, count]) => ({ cat, count }));
    return [{ cat: 'All', count: brandProducts.length }, ...list];
  }, [brandProducts]);

  // Apply category filtering & sorting
  const displayedProducts = useMemo(() => {
    let list = [...brandProducts];
    if (selectedCategory !== 'all') {
      list = list.filter((p) => (p.category || 'Other').toLowerCase() === selectedCategory.toLowerCase());
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Popularity (highest stock / rating)
      list.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0));
    }

    return list;
  }, [brandProducts, selectedCategory, sortBy]);

  const visual = getBrandVisual(brandName);

  return (
    <div className="min-h-screen bg-[#F7F9FA] pb-24">
      {/* Brand Header */}
      <div className="bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                navigate(-1);
              }}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* 56px Logo Tile */}
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
              {visual.logoUrl ? (
                <img
                  src={visual.logoUrl}
                  alt={brandName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${visual.bgClass}`}
                >
                  {visual.avatarText}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {brandName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {brandProducts.length} {brandProducts.length === 1 ? 'product' : 'products'} available in store
              </p>
            </div>
          </div>

          {/* Sort & Category Filter Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Chips for this brand */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {availableCategories.map((c) => {
                const isSelected =
                  c.cat.toLowerCase() === selectedCategory.toLowerCase();
                return (
                  <button
                    key={c.cat}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedCategory(c.cat === 'All' ? 'all' : c.cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c.cat} ({c.count})
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown / Chips */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-56 border border-slate-100" />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-medium text-sm">
              No products found for {brandName} in this category.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="mt-3 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Show all {brandName} products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {displayedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenDetails={setActiveModalProduct}
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
