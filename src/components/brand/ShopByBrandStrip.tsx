import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { BrandItem, getBrandVisual } from '@/utils/brands';
import { Link } from 'react-router-dom';

interface ShopByBrandStripProps {
  brands: BrandItem[];
  selectedBrand: string;
  onSelectBrand: (brandName: string) => void;
}

export const ShopByBrandStrip: React.FC<ShopByBrandStripProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
}) => {
  // Filter out "All" from the strip and take top 10 brands by product count
  const topBrands = brands
    .filter((b) => b.name !== 'All')
    .slice(0, 10);

  if (topBrands.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-2xs">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
            Shop by Brand
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            • {topBrands.length} Top Brands
          </span>
        </div>

        <Link
          to="/brands"
          onClick={() => triggerHaptic('light')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 group"
          aria-label="View all brands"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Horizontal Snap-Scroll Row of 72px Brand Tiles */}
      <div className="flex items-start gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
        {topBrands.map((b) => {
          const isActive = selectedBrand.toLowerCase() === b.name.toLowerCase();
          const visual = getBrandVisual(b.name);
          const [imgError, setImgError] = useState(false);

          return (
            <button
              key={b.name}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectBrand(isActive ? 'All' : b.name);
              }}
              className="flex flex-col items-center gap-1.5 snap-start shrink-0 text-center cursor-pointer group focus:outline-hidden"
              aria-label={`Filter by ${b.name} (${b.count} items)`}
            >
              {/* 72px White Rounded-2xl Tile */}
              <div
                className={`w-[72px] h-[72px] rounded-2xl bg-white border flex items-center justify-center p-2 transition-all duration-200 group-hover:shadow-md group-hover:scale-105 overflow-hidden ${
                  isActive
                    ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs'
                    : 'border-slate-100 shadow-2xs'
                }`}
              >
                {visual.logoUrl && !imgError ? (
                  <img
                    src={visual.logoUrl}
                    alt={b.name}
                    loading="lazy"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg ${visual.bgClass}`}
                  >
                    {visual.avatarText}
                  </div>
                )}
              </div>

              {/* Brand Name & Count */}
              <div className="w-[76px]">
                <p
                  className={`text-xs font-medium leading-tight truncate transition-colors ${
                    isActive ? 'font-bold text-emerald-800' : 'text-slate-800 group-hover:text-emerald-700'
                  }`}
                  title={b.name}
                >
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
    </section>
  );
};
