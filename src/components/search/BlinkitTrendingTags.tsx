import React from 'react';
import { Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitTrendingTagsProps {
  onSelectTag: (tag: string) => void;
  className?: string;
}

export const TRENDING_DAIRY_TAGS = [
  { label: 'Cow Milk', icon: '🥛' },
  { label: 'Fresh Paneer', icon: '🧀' },
  { label: 'Bilona Ghee', icon: '🧈' },
  { label: 'Shrikhand', icon: '🍯' },
  { label: 'Dahi / Curd', icon: '🥣' },
  { label: 'Chaas', icon: '🥤' },
  { label: 'Basundi', icon: '🍮' },
];

export const BlinkitTrendingTags: React.FC<BlinkitTrendingTagsProps> = ({
  onSelectTag,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 ${className}`}>
      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 uppercase tracking-wider pl-0.5">
        <Sparkles className="w-3 h-3 text-amber-500" />
        Trending:
      </span>
      {TRENDING_DAIRY_TAGS.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onSelectTag(item.label);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-full shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
