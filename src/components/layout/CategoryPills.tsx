import React from 'react';
import { Category } from '@/types/ecommerce';
import { triggerHaptic } from '@/utils/haptics';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 py-3 sticky top-[108px] sm:top-[116px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Horizontal Category Circular Carousel (Blinkit Mobile & Quick Bar) */}
        <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onSelectCategory(cat.slug);
                  // If on all, scroll to section if exists
                  if (selectedCategory === 'all' && cat.slug !== 'all') {
                    const el = document.getElementById(`category-section-${cat.slug}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      return;
                    }
                  }
                }}
                className="flex flex-col items-center shrink-0 group cursor-pointer focus:outline-hidden"
              >
                {/* Circular Icon Bubble */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-emerald-50 to-green-100 border-2 border-[#0C831F] shadow-sm scale-105'
                      : 'bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 group-hover:scale-102'
                  }`}
                >
                  <span>{cat.icon || '🥛'}</span>

                  {/* Active dot */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#0C831F] rounded-full border-2 border-white flex items-center justify-center">
                      <span className="w-1 h-1 bg-white rounded-full" />
                    </span>
                  )}
                </div>

                {/* Category Labels */}
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs text-center max-w-[76px] sm:max-w-[84px] leading-tight line-clamp-1 transition-colors ${
                    isSelected
                      ? 'font-black text-[#0C831F]'
                      : 'font-bold text-slate-700 group-hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </span>

                {cat.marathiName && (
                  <span className="text-[9px] text-slate-400 font-medium line-clamp-1 max-w-[76px] text-center">
                    {cat.marathiName}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
