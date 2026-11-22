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
    <div className="bg-white border-b border-gray-200/90 py-2.5 sticky top-[108px] sm:top-[116px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Horizontal Category Circular Photo Carousel (Blinkit Mobile & Quick Bar) */}
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
                {/* Circular/Rounded Image Bubble with Real Photo */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden relative transition-all duration-200 border ${
                    isSelected
                      ? 'border-[#0C831F] ring-2.5 ring-[#0C831F] shadow-md scale-105'
                      : 'border-gray-200/90 bg-gray-50 group-hover:scale-102 group-hover:border-emerald-300'
                  }`}
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-50">
                      {cat.icon || '🥛'}
                    </div>
                  )}

                  {/* Corner Emoji Mini Badge */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[11px] shadow-xs border border-gray-100">
                    {cat.icon || '🥛'}
                  </div>

                  {/* Active Indicator Dot */}
                  {isSelected && (
                    <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#0C831F] rounded-full border-2 border-white shadow-xs" />
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
