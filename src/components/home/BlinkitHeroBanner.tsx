import React from 'react';
import { Zap, ShieldCheck, Snowflake, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export const BlinkitHeroBanner: React.FC = () => {
  const handleScrollToCategories = () => {
    triggerHaptic('medium');
    const el = document.getElementById('categories-section') || document.getElementById('product-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C831F] via-[#086617] to-[#04400E] text-white p-4 sm:p-6 shadow-md mb-4"
      data-testid="blinkit-hero-banner"
    >
      {/* Background Decorative Rings */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#F8CB46]/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          {/* Blinkit Flash Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#F8CB46] text-slate-950 font-black text-[11px] sm:text-xs px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Delivery in 10-15 mins</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
            Ambajogai's Last-Minute Dairy App
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            Directly from local Vidarbha farms. Fresh morning batch cow milk, soft malai paneer, and authentic bilona ghee delivered cold at your doorstep.
          </p>

          {/* Trust Value Props */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] sm:text-xs font-semibold text-emerald-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F8CB46]" /> 100% Pure & Lab Tested
            </span>
            <span className="flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5 text-sky-300" /> 4°C Chilled Transit
            </span>
          </div>
        </div>

        {/* Right CTA */}
        <button
          type="button"
          onClick={handleScrollToCategories}
          className="self-stretch sm:self-auto shrink-0 inline-flex items-center justify-center gap-2 bg-[#F8CB46] hover:bg-[#FFC200] active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <span>Order Fresh Dairy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
