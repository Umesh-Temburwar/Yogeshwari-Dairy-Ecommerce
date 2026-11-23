import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { ProductCard } from '@/components/product/ProductCard';
import { triggerHaptic } from '@/utils/haptics';

interface FlipkartProductRailProps {
  title: string;
  subtitle?: string;
  badge?: string;
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onViewAll?: () => void;
}

export const FlipkartProductRail: React.FC<FlipkartProductRailProps> = ({
  title,
  subtitle,
  badge,
  products,
  onOpenDetails,
  onViewAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    triggerHaptic('light');
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white border border-[#E0E0E0] rounded-xs p-3 sm:p-4 my-3 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className="bg-[#FFE500] text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs leading-none">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onViewAll();
              }}
              className="px-3 py-1 bg-[#2874F0] hover:bg-[#1A5DC8] text-white font-bold text-xs rounded-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>VIEW ALL</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Scroll Nav Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-xs border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer shadow-2xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-xs border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer shadow-2xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Snap Scroll Rail */}
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pt-3 scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[160px] sm:w-[190px] md:w-[210px] shrink-0"
          >
            <ProductCard
              product={product}
              onOpenDetails={onOpenDetails}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
