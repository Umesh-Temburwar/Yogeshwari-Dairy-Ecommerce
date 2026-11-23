import React from 'react';
import { Search, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface SearchAutoSuggestProps {
  isOpen: boolean;
  searchQuery: string;
  onSelectQuery: (query: string) => void;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  'Fresh Cow Milk',
  'Buffalo Milk 500ml',
  'Fresh Malai Paneer',
  'Desi Cow Ghee',
  'Amul Butter',
  'Fresh Dahi Curd',
  'Gulab Jamun',
  'Kaju Katli',
  'Parle Biscuits',
];

export const SearchAutoSuggest: React.FC<SearchAutoSuggestProps> = ({
  isOpen,
  searchQuery,
  onSelectQuery,
  onClose,
}) => {
  if (!isOpen) return null;

  const filteredPopular = POPULAR_SEARCHES.filter((item) =>
    !searchQuery || item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xs shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-800 text-xs animate-fade-in">
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          Popular Dairy Searches
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-blue-600 hover:underline cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="py-1">
        {filteredPopular.length > 0 ? (
          filteredPopular.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectQuery(term);
                onClose();
              }}
              className="w-full px-3.5 py-2 hover:bg-blue-50 text-slate-700 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-900">{term}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-300" />
            </button>
          ))
        ) : (
          <div className="px-3.5 py-3 text-slate-500 text-center">
            No specific suggestions. Press Enter to search "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
