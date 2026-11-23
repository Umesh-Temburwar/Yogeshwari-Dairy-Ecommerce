import React from 'react';
import { triggerHaptic } from '@/utils/haptics';

interface PromoGridTile {
  id: string;
  title: string;
  tag: string;
  categorySlug: string;
  imageUrl: string;
  tagColor: string;
}

const PROMO_TILES: PromoGridTile[] = [
  {
    id: 'p1',
    title: 'Pure Desi Cow Ghee',
    tag: 'Up to 20% Off',
    categorySlug: 'desi-ghee',
    imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=400&q=80',
    tagColor: 'text-[#388E3C] bg-green-50',
  },
  {
    id: 'p2',
    title: 'Fresh Malai Paneer',
    tag: 'Daily Fresh Batch',
    categorySlug: 'paneer-butter',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80',
    tagColor: 'text-[#2874F0] bg-blue-50',
  },
  {
    id: 'p3',
    title: 'Traditional Mithai',
    tag: 'Pure Cow Milk',
    categorySlug: 'sweets-mithai',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80',
    tagColor: 'text-amber-800 bg-amber-50',
  },
  {
    id: 'p4',
    title: 'Crisp Bakery Khari',
    tag: 'From ₹40',
    categorySlug: 'bakery-breads',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    tagColor: 'text-rose-700 bg-rose-50',
  },
];

interface FlipkartPromoGridProps {
  onSelectCategory: (slug: string) => void;
}

export const FlipkartPromoGrid: React.FC<FlipkartPromoGridProps> = ({ onSelectCategory }) => {
  return (
    <section className="w-full bg-white border border-[#E0E0E0] rounded-xs p-3 sm:p-4 my-3 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Featured Dairy Essentials
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Hand-crafted daily in Ambajogai Mandi Bazar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-3">
        {PROMO_TILES.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onSelectCategory(tile.categorySlug);
            }}
            className="group flex flex-col items-center p-2.5 rounded-xs border border-slate-100 hover:border-[#2874F0] hover:shadow-xs transition-all text-center bg-slate-50/50 hover:bg-white cursor-pointer"
          >
            <div className="w-full aspect-[4/3] rounded-xs overflow-hidden mb-2 bg-slate-200">
              <img
                src={tile.imageUrl}
                alt={tile.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-[#2874F0] transition-colors">
              {tile.title}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-xs mt-1 leading-none ${tile.tagColor}`}
            >
              {tile.tag}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
