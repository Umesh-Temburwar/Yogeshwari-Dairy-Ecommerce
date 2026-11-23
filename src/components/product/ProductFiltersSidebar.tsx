import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
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
  const [openSections, setOpenSections] = useState({
    price: true,
    ratings: true,
    discount: true,
    brand: true,
    availability: true,
  });

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

      {/* 1. PRICE SECTION */}
      <div className="border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left font-bold text-slate-800 uppercase tracking-wider text-[11px]"
        >
          <span>Price Range</span>
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

      {/* 2. CUSTOMER RATINGS SECTION */}
      <div className="border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('ratings')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left font-bold text-slate-800 uppercase tracking-wider text-[11px]"
        >
          <span>Customer Ratings</span>
          {openSections.ratings ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.ratings && (
          <div className="px-3.5 pb-3.5 space-y-2">
            {[4, 3].map((star) => {
              const isChecked = facets.minRating === star;
              return (
                <label
                  key={star}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      triggerHaptic('light');
                      onUpdateFacets((prev) => ({
                        ...prev,
                        minRating: isChecked ? null : star,
                      }));
                    }}
                    className="w-4 h-4 rounded-xs border-slate-300 text-[#2874F0] focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="flex items-center gap-0.5 bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                      {star}★
                    </span>
                    <span>&amp; above</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DISCOUNT SECTION */}
      <div className="border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('discount')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 text-left font-bold text-slate-800 uppercase tracking-wider text-[11px]"
        >
          <span>Discount</span>
          {openSections.discount ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.discount && (
          <div className="px-3.5 pb-3.5 space-y-2">
            {[30, 20, 10].map((disc) => {
              const isChecked = facets.minDiscount === disc;
              return (
                <label
                  key={disc}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      triggerHaptic('light');
                      onUpdateFacets((prev) => ({
                        ...prev,
                        minDiscount: isChecked ? null : disc,
                      }));
                    }}
                    className="w-4 h-4 rounded-xs border-slate-300 text-[#2874F0] focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-800">
                    {disc}% or more
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
