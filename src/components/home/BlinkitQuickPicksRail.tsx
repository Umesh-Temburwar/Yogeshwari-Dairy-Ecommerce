import React from 'react';
import { Product } from '@/types/ecommerce';
import { ProductCard } from '@/components/product/ProductCard';
import { Zap, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitQuickPicksRailProps {
  products: Product[];
  onOpenDetails?: (product: Product) => void;
  className?: string;
}

export const BlinkitQuickPicksRail: React.FC<BlinkitQuickPicksRailProps> = ({
  products,
  onOpenDetails,
  className = '',
}) => {
  // Select top morning essentials
  const quickPicks = products
    .filter((p) => p.isBestseller || p.isFreshToday || p.category === 'milk')
    .slice(0, 6);

  if (quickPicks.length === 0) return null;

  return (
    <section className={`my-4 bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Zap className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              Daily Morning Essentials
            </h3>
            <p className="text-[11px] text-slate-500 leading-tight">
              Fresh batch delivered in 10-15 minutes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            const el = document.getElementById('product-catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs font-bold text-[#0C831F] hover:text-[#086617] flex items-center gap-0.5 cursor-pointer"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Grid / Rail */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {quickPicks.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </section>
  );
};
