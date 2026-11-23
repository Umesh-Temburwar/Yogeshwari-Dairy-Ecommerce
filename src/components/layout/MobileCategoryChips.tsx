import React, { useRef, useEffect } from 'react';
import { FLIPKART_MEGA_CATEGORIES } from './FlipkartMegaNav';
import { triggerHaptic } from '@/utils/haptics';

interface MobileCategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  categoryCounts?: Record<string, number>;
}

export const MobileCategoryChips: React.FC<MobileCategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected chip into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector('[aria-selected="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedCategory]);

  return (
    <div className="w-full bg-white border-b border-slate-200/80 px-2.5 py-2 sm:hidden sticky top-[95px] z-20 shadow-2xs">
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {FLIPKART_MEGA_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const count = categoryCounts[cat.slug];

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectCategory(cat.slug);
              }}
              aria-selected={isSelected}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#2874F0] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
