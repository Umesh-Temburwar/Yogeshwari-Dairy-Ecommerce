import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface MegaCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  hasSubmenu?: boolean;
  subcategories?: string[];
}

export const FLIPKART_MEGA_CATEGORIES: MegaCategoryItem[] = [
  {
    id: 'all',
    name: 'All Categories',
    slug: 'all',
    icon: '🥛',
  },
  {
    id: 'milk-cream',
    name: 'Milk & Cream',
    slug: 'milk-cream',
    icon: '🥛',
    hasSubmenu: true,
    subcategories: ['Cow Milk', 'Buffalo Milk', 'Fresh Cream', 'Toned Milk'],
  },
  {
    id: 'paneer-butter',
    name: 'Paneer & Butter',
    slug: 'paneer-butter',
    icon: '🧈',
    hasSubmenu: true,
    subcategories: ['Malai Paneer', 'Table Butter', 'White Butter (Loni)', 'Tikka Paneer'],
  },
  {
    id: 'curd-lassi',
    name: 'Curd & Chaas',
    slug: 'curd-lassi',
    icon: '🥣',
    hasSubmenu: true,
    subcategories: ['Fresh Dahi', 'Masala Chaas', 'Sweet Lassi', 'Shrikhand'],
  },
  {
    id: 'desi-ghee',
    name: 'Desi Ghee',
    slug: 'desi-ghee',
    icon: '🏺',
    hasSubmenu: true,
    subcategories: ['Desi Cow Ghee', 'Buffalo Ghee', 'Bilona Ghee', 'A2 Pure Ghee'],
  },
  {
    id: 'sweets-mithai',
    name: 'Sweets & Mithai',
    slug: 'sweets-mithai',
    icon: '🍬',
    hasSubmenu: true,
    subcategories: ['Gulab Jamun', 'Pedha', 'Kaju Katli', 'Rasgulla', 'Besan Ladoo'],
  },
  {
    id: 'bakery-breads',
    name: 'Bakery & Toast',
    slug: 'bakery-breads',
    icon: '🍞',
    hasSubmenu: true,
    subcategories: ['Toast & Rusk', 'Khari Biscuit', 'Milk Bread', 'Pav / Bun'],
  },
  {
    id: 'snacks-spices',
    name: 'Snacks & Namkeen',
    slug: 'snacks-spices',
    icon: '🥨',
    hasSubmenu: true,
    subcategories: ['Haldiram Namkeen', 'Chivda', 'Masala Spices', 'Pickles & Sauces'],
  },
];

interface FlipkartMegaNavProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onSelectSubcategory?: (query: string) => void;
}

export const FlipkartMegaNav: React.FC<FlipkartMegaNavProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectSubcategory,
}) => {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  return (
    <nav className="w-full bg-white border-b border-slate-200/90 shadow-xs relative z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <ul className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 sm:gap-2 py-2">
          {FLIPKART_MEGA_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const isHovered = hoveredCatId === cat.id;

            return (
              <li
                key={cat.id}
                className="relative group shrink-0"
                onMouseEnter={() => setHoveredCatId(cat.id)}
                onMouseLeave={() => setHoveredCatId(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectCategory(cat.slug);
                  }}
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xs transition-colors cursor-pointer text-center sm:text-left focus:outline-hidden ${
                    isSelected
                      ? 'text-[#2874F0] font-bold bg-blue-50/70 border-b-2 border-[#2874F0]'
                      : 'text-slate-700 hover:text-[#2874F0] font-medium'
                  }`}
                  aria-selected={isSelected}
                  title={cat.name}
                >
                  <span className="text-base sm:text-lg leading-none">{cat.icon}</span>
                  <span className="text-[11px] sm:text-xs whitespace-nowrap flex items-center gap-0.5">
                    {cat.name}
                    {cat.hasSubmenu && (
                      <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform hidden sm:inline" />
                    )}
                  </span>
                </button>

                {/* Desktop Interactive Hover Flyout Popover */}
                {cat.hasSubmenu && cat.subcategories && isHovered && (
                  <div className="hidden sm:block absolute top-full left-0 mt-0.5 w-52 bg-white rounded-xs shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs animate-fade-in">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      More in {cat.name}
                    </div>
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic('light');
                          onSelectCategory(cat.slug);
                          if (onSelectSubcategory) {
                            onSelectSubcategory(sub);
                          }
                          setHoveredCatId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 hover:text-[#2874F0] hover:bg-blue-50/80 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>{sub}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
