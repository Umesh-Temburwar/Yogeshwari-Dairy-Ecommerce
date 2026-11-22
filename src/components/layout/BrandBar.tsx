import React from 'react';
import { BrandItem, getBrandVisual } from '@/utils/brands';
import { triggerHaptic } from '@/utils/haptics';
import { Sparkles, X } from 'lucide-react';

interface BrandBarProps {
  brands: BrandItem[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  filteredCount?: number;
}

export const BrandBar: React.FC<BrandBarProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
  filteredCount,
}) => {
  if (!brands || brands.length <= 1) return null;

  const isBrandFilterActive = selectedBrand !== 'All';

  return (
    <div className="bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        {/* Top Label & Brand Count */}
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-extrabold text-slate-800 tracking-tight">Shop by Brand</span>
            <span className="text-slate-400">•</span>
            <span className="text-[11px] font-medium text-slate-500">
              {brands.length - 1} Top Brands
            </span>
          </div>

          {/* 1-Tap Reset button when a brand is selected */}
          {isBrandFilterActive && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectBrand('All');
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer focus:outline-hidden"
              aria-label="Clear brand filter"
            >
              <span>Reset Brand</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Horizontal Brand Shelf (Touch scrollable, snap-x) */}
        <div className="flex items-center gap-2 overflow-x-auto snap-x no-scrollbar scroll-smooth pb-1">
          {brands.map((b) => {
            const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
            const visual = getBrandVisual(b.name);

            return (
              <button
                key={b.name}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onSelectBrand(isSelected && b.name !== 'All' ? 'All' : b.name);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 snap-start transition-all cursor-pointer select-none min-h-[38px] ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30 font-bold scale-102'
                    : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border border-slate-200/90 hover:border-emerald-300'
                }`}
                aria-pressed={isSelected}
                aria-label={`Filter by brand ${b.name} (${b.count} products)`}
              >
                {/* Brand Logo or Avatar Badge */}
                {visual.logoUrl ? (
                  <img
                    src={visual.logoUrl}
                    alt={b.name}
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full object-contain shrink-0 bg-white p-0.5 shadow-2xs"
                  />
                ) : b.name === 'All' ? (
                  <Sparkles
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-amber-300' : 'text-emerald-600'
                    }`}
                  />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : visual.bgClass
                    }`}
                  >
                    {visual.avatarText}
                  </span>
                )}

                {/* Brand Name */}
                <span className="whitespace-nowrap leading-none">
                  {b.name === 'All' ? 'All Brands' : b.name}
                </span>

                {/* Product Count Badge */}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {b.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Pill with 1-Tap Clear */}
        {isBrandFilterActive && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs animate-fade-in">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium text-[11px]">Filtered by:</span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-0.5 rounded-full font-bold text-xs shadow-2xs">
                <span>Brand: {selectedBrand}</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectBrand('All');
                  }}
                  className="w-3.5 h-3.5 rounded-full bg-emerald-200/60 hover:bg-emerald-300 text-emerald-900 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label={`Clear ${selectedBrand} filter`}
                  title="Clear filter"
                >
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              </span>
              {typeof filteredCount === 'number' && (
                <span className="text-[11px] text-slate-500">
                  ({filteredCount} {filteredCount === 1 ? 'product' : 'products'} available)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
