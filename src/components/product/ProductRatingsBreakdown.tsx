import React from 'react';
import { Star } from 'lucide-react';

interface ProductRatingsBreakdownProps {
  rating: number;
  ratingCount: number;
}

export const ProductRatingsBreakdown: React.FC<ProductRatingsBreakdownProps> = ({
  rating,
  ratingCount,
}) => {
  const distribution = [
    { stars: 5, pct: 72, color: 'bg-[#388E3C]' },
    { stars: 4, pct: 18, color: 'bg-[#388E3C]' },
    { stars: 3, pct: 6, color: 'bg-emerald-500' },
    { stars: 2, pct: 2, color: 'bg-amber-500' },
    { stars: 1, pct: 2, color: 'bg-rose-500' },
  ];

  return (
    <div className="border border-slate-200 rounded-xs p-3.5 bg-white text-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-extrabold text-slate-900 uppercase tracking-wide">
          Ratings &amp; Reviews
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Overall Big Score */}
        <div className="text-center sm:text-left shrink-0">
          <div className="flex items-center justify-center sm:justify-start gap-1 text-2xl font-black text-slate-900">
            <span>{rating.toFixed(1)}</span>
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5">
            {ratingCount} Ratings &amp; 38 Reviews
          </p>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="flex-1 w-full space-y-1.5">
          {distribution.map((row) => (
            <div key={row.stars} className="flex items-center gap-2 text-[11px]">
              <span className="w-6 text-slate-600 font-bold shrink-0">{row.stars} ★</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="w-7 text-right text-slate-400 font-medium shrink-0">
                {row.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
