import React from 'react';
import { Category } from '@/types/ecommerce';
import { triggerHaptic } from '@/utils/haptics';

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
    <aside className="w-20 sm:w-24 lg:w-60 shrink-0 self-start sticky top-[112px] z-20">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Sidebar Header (Hidden on small mobile screens to save space) */}
        <div className="hidden lg:flex px-4 py-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-b border-emerald-100 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/YDO_logo.png" alt="YDO" className="w-5 h-5 rounded object-contain" />
            <div>
              <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                Categories
              </h3>
              <p className="text-[10px] text-emerald-700 font-bold">सर्व श्रेणी निवडा</p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-emerald-800 shadow-2xs border border-emerald-200">
            {categories.length - 1}+
          </span>
        </div>

        {/* Categories List (Vertical snap list) */}
        <div className="p-1 sm:p-1.5 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onSelectCategory(cat.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex flex-col lg:flex-row items-center lg:justify-between p-2 lg:px-2.5 lg:py-2 rounded-xl text-center lg:text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-900 font-extrabold border-l-3 lg:border-l-4 border-emerald-700 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 font-medium hover:text-slate-900 border-l-3 lg:border-l-4 border-transparent'
                }`}
                aria-label={`Select category ${cat.name}`}
              >
                <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2.5 min-w-0">
                  {/* Category Photo Thumbnail */}
                  <div
                    className={`w-11 h-11 lg:w-9 lg:h-9 rounded-xl overflow-hidden shrink-0 border relative ${
                      isSelected
                        ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm lg:text-base bg-emerald-50">
                        {cat.icon || '🥛'}
                      </div>
                    )}
                  </div>

                  <div className="truncate w-full lg:w-auto">
                    <p
                      className={`text-[11px] lg:text-xs leading-tight line-clamp-2 lg:truncate ${
                        isSelected ? 'font-extrabold text-emerald-800' : 'font-semibold text-slate-800'
                      }`}
                    >
                      {cat.name}
                    </p>
                    {cat.marathiName && (
                      <p className="hidden lg:block text-[10px] text-slate-500 font-medium truncate">
                        {cat.marathiName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Count pill (visible on desktop) */}
                <div className="hidden lg:flex items-center gap-1 shrink-0 ml-1">
                  {cat.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
