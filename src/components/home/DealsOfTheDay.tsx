import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { ProductCard } from '@/components/product/ProductCard';
import { triggerHaptic } from '@/utils/haptics';

interface DealsOfTheDayProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
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
    <section className="w-full bg-white border border-[#E0E0E0] rounded-xs p-3 sm:p-4 my-3 shadow-xs">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-full bg-[#FB641B] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Deals of the Day
            </h3>
          </div>

          {/* Live Countdown Timer */}
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xs text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {format2(timeLeft.hours)} : {format2(timeLeft.minutes)} : {format2(timeLeft.seconds)}
            </span>
            <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Left</span>
          </div>
        </div>

        {onViewAllDeals && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onViewAllDeals();
            }}
            className="px-3.5 py-1.5 bg-[#2874F0] hover:bg-[#1A5DC8] text-white font-bold text-xs rounded-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1 self-end sm:self-auto"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Product Rail with Snap Scroll */}
      <div className="pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
