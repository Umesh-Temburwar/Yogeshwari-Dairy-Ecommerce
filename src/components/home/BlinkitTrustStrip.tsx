import React from 'react';
import { Zap, ShieldCheck, Snowflake, BadgePercent } from 'lucide-react';

export const BlinkitTrustStrip: React.FC = () => {
  const trustPoints = [
    {
      icon: Zap,
      title: '10-15 Min Delivery',
      desc: 'Hyperlocal dark store network',
      color: 'text-amber-500 bg-amber-50',
    },
    {
      icon: ShieldCheck,
      title: '100% Pure Milk',
      desc: 'Zero adulteration guarantee',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: Snowflake,
      title: '4°C Cold Chain',
      desc: 'Chilled from farm to fridge',
      color: 'text-sky-600 bg-sky-50',
    },
    {
      icon: BadgePercent,
      title: 'Direct Farm Pricing',
      desc: 'Fair prices & daily discounts',
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 my-4"
      data-testid="blinkit-trust-strip"
    >
      {trustPoints.map((point) => {
        const Icon = point.icon;
        return (
          <div
            key={point.title}
            className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${point.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                {point.title}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate leading-tight mt-0.5">
                {point.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
