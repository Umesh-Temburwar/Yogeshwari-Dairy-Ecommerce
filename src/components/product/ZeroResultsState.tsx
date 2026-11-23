import React from 'react';
import { SearchX, RotateCcw, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface ZeroResultsStateProps {
  searchQuery?: string;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onClearSearch?: () => void;
}

export const ZeroResultsState: React.FC<ZeroResultsStateProps> = ({
  searchQuery,
  hasActiveFilters,
  onResetFilters,
  onClearSearch,
}) => {
  return (
    <div className="text-center py-16 px-4 space-y-4 max-w-md mx-auto animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center mx-auto shadow-xs border border-blue-100">
        <SearchX className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-base font-extrabold text-slate-900">
          {searchQuery
            ? `No dairy items found for "${searchQuery}"`
            : 'No products match your active filters'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Check for spelling errors, adjust your price range sliders, or remove active brand checkboxes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onResetFilters();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-[#2874F0] hover:bg-[#1A5DC8] text-white text-xs font-bold rounded-xs cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}

        {searchQuery && onClearSearch && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClearSearch();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xs cursor-pointer transition-colors"
          >
            Clear Search Term
          </button>
        )}
      </div>
    </div>
  );
};
