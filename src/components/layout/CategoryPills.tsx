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
    <div className="bg-white border-b border-slate-200/80 sticky top-[108px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Horizontal Category Scroller with Snap */}
        <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto snap-x no-scrollbar scroll-smooth py-2">
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
                className="flex flex-col items-center shrink-0 snap-start group cursor-pointer focus:outline-hidden"
                aria-label={`Filter by ${cat.name}`}
              >
                {/* 64px Rounded-2xl Image Tile */}
                <div
                  className={`w-16 h-16 rounded-2xl overflow-hidden relative transition-all duration-200 border bg-slate-50 flex items-center justify-center ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-600 shadow-sm scale-102'
                      : 'border-slate-200/90 group-hover:border-emerald-300'
                  }`}
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {cat.icon || '🥛'}
                    </div>
                  )}
                </div>

                {/* Name Below (Max 2 lines, centered, fixed width 72px so no cut with '...') */}
                <span
                  className={`mt-1.5 w-[72px] text-center text-xs leading-tight line-clamp-2 transition-colors ${
                    isSelected
                      ? 'font-bold text-emerald-700'
                      : 'font-medium text-slate-700 group-hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
