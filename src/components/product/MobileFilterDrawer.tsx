import React, { useState } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';
import { FilterFacets, SortOption } from '@/types/flipkart';
import { triggerHaptic } from '@/utils/haptics';

interface MobileFilterDrawerProps {
  facets: FilterFacets;
  onUpdateFacets: (updater: (prev: FilterFacets) => FilterFacets) => void;
  onResetFacets: () => void;
  availableBrands: { name: string; count: number }[];
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
  totalFilteredCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  facets,
  onUpdateFacets,
  onResetFacets,
  availableBrands,
  sortOption,
  onSelectSort,
  totalFilteredCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'price' | 'brand' | 'ratings' | 'discount'>('price');

  const activeFilterCount =
    facets.selectedBrands.length +
    (facets.minRating ? 1 : 0) +
    (facets.minDiscount ? 1 : 0) +
    (facets.priceRange[0] > 0 || facets.priceRange[1] < 2000 ? 1 : 0) +
    (facets.fastDeliveryOnly ? 1 : 0);

  const sortOptionsList: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price_asc', label: 'Price -- Low to High' },
    { value: 'price_desc', label: 'Price -- High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  return (
    <>
      {/* Mobile Sticky Floating Filter & Sort Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-float py-2 px-4 flex items-center justify-around">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsSortOpen(true);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold text-slate-800 border-r border-slate-200 cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>Sort</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsOpen(true);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold text-slate-800 cursor-pointer relative"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#2874F0] text-white text-[10px] font-black flex items-center justify-center leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Sort Modal */}
      {isSortOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full bg-white rounded-t-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 uppercase">Sort By</span>
              <button
                type="button"
                onClick={() => setIsSortOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2 space-y-1">
              {sortOptionsList.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectSort(opt.value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xs text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    sortOption === opt.value
                      ? 'text-[#2874F0] bg-blue-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortOption === opt.value && <Check className="w-4 h-4 text-[#2874F0]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-h-[80vh] bg-white rounded-t-2xl flex flex-col animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <span className="font-extrabold text-sm text-slate-900 uppercase">Filters</span>
                <span className="text-xs text-slate-500 ml-2">({totalFilteredCount} items)</span>
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onResetFacets()}
                    className="text-xs font-bold text-[#2874F0] uppercase cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split view: Left tabs, Right options */}
            <div className="flex flex-1 overflow-hidden min-h-[300px]">
              {/* Left Tabs */}
              <div className="w-1/3 bg-slate-50 border-r border-slate-200 text-xs font-semibold">
                {[
                  { key: 'price', label: 'Price' },
                  { key: 'brand', label: 'Brand' },
                  { key: 'ratings', label: 'Ratings' },
                  { key: 'discount', label: 'Discount' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key as any)}
                    className={`w-full py-3 px-3 text-left transition-colors cursor-pointer border-b border-slate-100 ${
                      activeTab === t.key
                        ? 'bg-white text-[#2874F0] font-bold border-l-4 border-l-[#2874F0]'
                        : 'text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Right Content */}
              <div className="w-2/3 p-3 overflow-y-auto text-xs space-y-2">
                {activeTab === 'price' && (
                  <div className="space-y-1.5">
                    {[
                      { label: 'All', min: 0, max: 2000 },
                      { label: 'Under ₹100', min: 0, max: 100 },
                      { label: '₹100 - ₹250', min: 100, max: 250 },
                      { label: '₹250 - ₹500', min: 250, max: 500 },
                      { label: 'Above ₹500', min: 500, max: 2000 },
                    ].map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() =>
                          onUpdateFacets((prev) => ({ ...prev, priceRange: [b.min, b.max] }))
                        }
                        className={`w-full py-2 px-3 rounded-xs text-left border ${
                          facets.priceRange[0] === b.min && facets.priceRange[1] === b.max
                            ? 'bg-blue-50 border-[#2874F0] text-[#2874F0] font-bold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'brand' && (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {availableBrands
                      .filter((b) => b.name !== 'All')
                      .map((b) => {
                        const isChecked = facets.selectedBrands.includes(b.name);
                        return (
                          <label
                            key={b.name}
                            className="flex items-center justify-between p-2 rounded-xs border border-slate-100"
                          >
                            <span className="font-medium text-slate-800">{b.name}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                onUpdateFacets((prev) => ({
                                  ...prev,
                                  selectedBrands: isChecked
                                    ? prev.selectedBrands.filter((n) => n !== b.name)
                                    : [...prev.selectedBrands, b.name],
                                }));
                              }}
                              className="w-4 h-4 text-[#2874F0]"
                            />
                          </label>
                        );
                      })}
                  </div>
                )}

                {activeTab === 'ratings' && (
                  <div className="space-y-2">
                    {[4, 3].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          onUpdateFacets((prev) => ({
                            ...prev,
                            minRating: prev.minRating === star ? null : star,
                          }))
                        }
                        className={`w-full py-2.5 px-3 rounded-xs text-left border flex items-center justify-between ${
                          facets.minRating === star
                            ? 'bg-blue-50 border-[#2874F0] text-[#2874F0] font-bold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{star}★ &amp; above</span>
                        {facets.minRating === star && <Check className="w-4 h-4 text-[#2874F0]" />}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'discount' && (
                  <div className="space-y-2">
                    {[30, 20, 10].map((disc) => (
                      <button
                        key={disc}
                        type="button"
                        onClick={() =>
                          onUpdateFacets((prev) => ({
                            ...prev,
                            minDiscount: prev.minDiscount === disc ? null : disc,
                          }))
                        }
                        className={`w-full py-2.5 px-3 rounded-xs text-left border flex items-center justify-between ${
                          facets.minDiscount === disc
                            ? 'bg-blue-50 border-[#2874F0] text-[#2874F0] font-bold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{disc}% or more</span>
                        {facets.minDiscount === disc && <Check className="w-4 h-4 text-[#2874F0]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Apply Action */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setIsOpen(false);
                }}
                className="flex-1 py-2.5 bg-[#2874F0] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs text-center"
              >
                Apply Filters ({totalFilteredCount} Items)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
