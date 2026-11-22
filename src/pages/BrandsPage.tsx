import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ecommerceApi } from '@/services/api';
import { Product } from '@/types/ecommerce';
import { getProductBrand, getBrandVisual, initBrandLogos } from '@/utils/brands';
import { triggerHaptic } from '@/utils/haptics';

export const BrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const brandList = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const b = getProductBrand(p);
      if (!b) continue;
      map.set(b, (map.get(b) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brandList;
    const q = searchQuery.toLowerCase().trim();
    return brandList.filter((b) => b.name.toLowerCase().includes(q));
  }, [brandList, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7F9FA] pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              navigate(-1);
            }}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">All Brands</h1>
            <p className="text-xs text-slate-500">
              {brandList.length} verified dairy &amp; grocery brands
            </p>
          </div>
        </div>

        {/* Sticky Search Bar */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands (e.g. Amul, Yogeshwari, Parle)"
              className="w-full h-11 bg-slate-100 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 absolute right-2.5 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Brand Tiles */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4 animate-pulse">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-[72px] h-[72px] rounded-2xl bg-slate-200" />
                <div className="w-14 h-3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-medium text-sm">No brands found matching &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-emerald-700 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4">
            {filteredBrands.map((b) => {
              const visual = getBrandVisual(b.name);
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    navigate(`/brand/${encodeURIComponent(b.name)}`);
                  }}
                  className="flex flex-col items-center gap-1.5 text-center group cursor-pointer p-1"
                  aria-label={`Open brand ${b.name}`}
                >
                  <div className="w-[72px] h-[72px] rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-2 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-600 transition-all duration-200 overflow-hidden">
                    {visual.logoUrl ? (
                      <img
                        src={visual.logoUrl}
                        alt={b.name}
                        loading="lazy"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg ${visual.bgClass}`}
                      >
                        {visual.avatarText}
                      </div>
                    )}
                  </div>
                  <div className="w-full max-w-[80px]">
                    <p className="text-xs font-medium text-slate-800 truncate group-hover:text-emerald-700">
                      {b.name}
                    </p>
                    <span className="text-[10px] text-slate-500 font-normal block truncate">
                      {b.count} {b.count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
