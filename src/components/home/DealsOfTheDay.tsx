import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { ProductCard } from '@/components/product/ProductCard';
import { triggerHaptic } from '@/utils/haptics';

interface DealsOfTheDayProps {
  products: Product[];
  onOpenDetails?: (product: Product) => void;
  onViewAllDeals?: () => void;
}

export const DealsOfTheDay: React.FC<DealsOfTheDayProps> = ({
  products,
  onOpenDetails,
  onViewAllDeals,
}) => {
  // Live ticking countdown timer towards midnight
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, endOfDay.getTime() - now.getTime());

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2 = (n: number) => String(n).padStart(2, '0');

  // Filter products with discounts
  const dealProducts = products.filter(
    (p) => (p.discountPercentage && p.discountPercentage > 0) || (p.mrp > p.price)
  );

  const displayProducts = dealProducts.length > 0 ? dealProducts.slice(0, 8) : products.slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="w-full bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 my-2 shadow-2xs">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Deals of the Day
            </h3>
          </div>

          {/* Live Countdown Timer */}
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>
              {format2(timeLeft.hours)}:{format2(timeLeft.minutes)}:{format2(timeLeft.seconds)}
            </span>
            <span className="text-[10px] text-amber-700 font-sans hidden sm:inline">left</span>
          </div>
        </div>

        {onViewAllDeals && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onViewAllDeals();
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer group"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Horizontal Snap Scroll Rail (Blinkit Style) */}
      <div className="pt-3">
        <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="w-[144px] sm:w-[160px] snap-start shrink-0 flex"
            >
              <ProductCard
                product={product}
                onOpenDetails={onOpenDetails}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
