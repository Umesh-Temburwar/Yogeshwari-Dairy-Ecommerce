import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { SortOption } from '@/types/flipkart';
import { triggerHaptic } from '@/utils/haptics';

interface FlipkartSortBarProps {
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  totalCount: number;
}

export const FlipkartSortBar: React.FC<FlipkartSortBarProps> = ({
  currentSort,
  onSelectSort,
  viewMode,
  onToggleViewMode,
}) => {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price_asc', label: 'Price -- Low to High' },
    { value: 'price_desc', label: 'Price -- High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  return (
    <div className="w-full bg-white border-b border-[#E0E0E0] px-4 py-2.5 flex items-center justify-between text-xs">
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
        <span className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wide shrink-0">
          Sort By
        </span>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {sortOptions.map((opt) => {
            const isSelected = currentSort === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onSelectSort(opt.value);
                }}
                className={`py-1 cursor-pointer font-semibold transition-colors border-b-2 text-[11px] sm:text-xs ${
                  isSelected
                    ? 'text-[#2874F0] border-[#2874F0] font-bold'
                    : 'text-slate-600 border-transparent hover:text-[#2874F0]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid / List View Toggle */}
      <div className="hidden sm:flex items-center gap-1 shrink-0 pl-4 border-l border-slate-200">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onToggleViewMode('grid');
          }}
          className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
            viewMode === 'grid'
              ? 'text-[#2874F0] bg-blue-50'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Grid View"
          aria-label="Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onToggleViewMode('list');
          }}
          className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
            viewMode === 'list'
              ? 'text-[#2874F0] bg-blue-50'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="List View"
          aria-label="List View"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
