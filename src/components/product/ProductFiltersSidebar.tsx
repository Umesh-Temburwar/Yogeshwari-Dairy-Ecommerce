import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Star, RotateCcw, Check } from 'lucide-react';
import { FilterFacets } from '@/types/flipkart';
import { triggerHaptic } from '@/utils/haptics';

interface ProductFiltersSidebarProps {
  facets: FilterFacets;
  onUpdateFacets: (updater: (prev: FilterFacets) => FilterFacets) => void;
  onResetFacets: () => void;
  availableBrands: { name: string; count: number }[];
  totalFilteredCount: number;
  className?: string;
}

export const ProductFiltersSidebar: React.FC<ProductFiltersSidebarProps> = ({
  facets,
  onUpdateFacets,
  onResetFacets,
  availableBrands,
  totalFilteredCount,
  className = '',
}) => {
  // Collapsible accordion sections
  const [openSections, setOpenSections] = useState({
    price: true,
    brand: true,
    ratings: true,
    discount: true,
    availability: true,
  });

  const [brandSearch, setBrandSearch] = useState('');

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasActiveFilters =
    facets.selectedBrands.length > 0 ||
    facets.minRating !== null ||
    facets.minDiscount !== null ||
    facets.priceRange[0] > 0 ||
    facets.priceRange[1] < 2000 ||
    facets.fastDeliveryOnly ||
    !facets.inStockOnly;

  return (
    <aside className={`w-full bg-white border border-[#E0E0E0] rounded-xs text-xs select-none ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200">
        <h3 className="font-black text-sm uppercase text-slate-900 tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onResetFacets();
            }}
            className="text-[#2874F0] hover:text-[#1A5DC8] font-bold text-xs uppercase cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
        Showing <strong className="text-slate-900 font-bold">{totalFilteredCount}</strong> products
      </div>

      {/* 1. PRICE FILTER SECTION */}
      <div className="border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left font-bold text-slate-800 uppercase tracking-wider text-[11px]"
        >
          <span>Price</span>
          {openSections.price ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.price && (
          <div className="px-3.5 pb-3.5 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'All', min: 0, max: 2000 },
                { label: 'Under ₹100', min: 0, max: 100 },
                { label: '₹100 - ₹250', min: 100, max: 250 },
                { label: '₹250 - ₹500', min: 250, max: 500 },
                { label: 'Above ₹500', min: 500, max: 2000 },
              ].map((b) => {
                const isActive = facets.priceRange[0] === b.min && facets.priceRange[1] === b.max;
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onUpdateFacets((prev) => ({ ...prev, priceRange: [b.min, b.max] }));
                    }}
                    className={`py-1.5 px-2 rounded-xs border text-[11px] font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 border-[#2874F0] text-[#2874F0]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
