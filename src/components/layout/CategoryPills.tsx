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
    <div className="bg-white border-b border-brand-slate-border py-2.5 sticky top-[108px] sm:top-[116px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectCategory(cat.slug);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-sm scale-102'
                    : 'bg-[#F4F6F8] text-brand-text-secondary border-brand-slate-border hover:border-[#0C831F]/40 hover:text-brand-text-primary'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.name}</span>
                {cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-brand-text-muted border border-brand-slate-border'
                    }`}
                  >
                    {cat.count}
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
