import React from 'react';
import { Category } from '@/types/ecommerce';
import { triggerHaptic } from '@/utils/haptics';
import { ChevronRight } from 'lucide-react';

interface BlinkitCategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const BlinkitCategorySidebar: React.FC<BlinkitCategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <aside className="hidden lg:block w-60 xl:w-64 shrink-0 self-start sticky top-[108px] sm:top-[116px] z-20">
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        {/* Sidebar Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/YDO_logo.png" alt="YDO" className="w-5 h-5 rounded object-contain" />
            <div>
              <h3 className="font-black text-xs text-emerald-950 uppercase tracking-wider">
                Categories
              </h3>
              <p className="text-[10px] text-emerald-700 font-bold">सर्व श्रेणी निवडा</p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-emerald-800 shadow-xs border border-emerald-200">
            {categories.length - 1}+
          </span>
        </div>

        {/* Categories List */}
        <div className="p-1.5 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar">
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
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/90 text-[#0C831F] font-black border-l-4 border-[#0C831F] shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 font-medium hover:text-black border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Category Real Photo Thumbnail */}
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative shadow-xs">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base bg-emerald-50">
                        {cat.icon || '🥛'}
                      </div>
                    )}
                  </div>

                  <div className="truncate">
                    <p className={`text-xs truncate ${isSelected ? 'font-black text-[#0C831F]' : 'font-bold'}`}>
                      {cat.name}
                    </p>
                    {cat.marathiName && (
                      <p className="text-[10px] text-gray-500 font-medium truncate">
                        {cat.marathiName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {cat.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected
                          ? 'bg-[#0C831F] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-[#0C831F] translate-x-0.5' : 'text-gray-300'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
