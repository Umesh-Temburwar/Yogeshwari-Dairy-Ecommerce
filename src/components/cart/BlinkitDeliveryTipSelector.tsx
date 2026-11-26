import React from 'react';
import { Heart } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitDeliveryTipSelectorProps {
  selectedTip: number;
  onSelectTip: (tip: number) => void;
  className?: string;
}

const TIP_OPTIONS = [10, 20, 30, 50];

export const BlinkitDeliveryTipSelector: React.FC<BlinkitDeliveryTipSelectorProps> = ({
  selectedTip,
  onSelectTip,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs ${className}`}
      data-testid="blinkit-tip-selector"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            Delivery Partner Tip
          </h4>
          <p className="text-[10px] text-slate-500 leading-tight">
            100% of your tip goes directly to the delivery rider
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {TIP_OPTIONS.map((amount) => {
          const isSelected = selectedTip === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectTip(isSelected ? 0 : amount);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              ₹{amount}
            </button>
          );
        })}
        {selectedTip > 0 && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onSelectTip(0);
            }}
            className="text-[11px] font-bold text-rose-600 hover:underline px-1 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
