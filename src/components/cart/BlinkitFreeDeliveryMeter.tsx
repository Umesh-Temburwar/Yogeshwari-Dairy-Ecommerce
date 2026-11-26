import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { formatBlinkitPrice } from '@/utils/blinkitFormatters';

export interface BlinkitFreeDeliveryMeterProps {
  subtotal: number;
  threshold?: number;
  className?: string;
}

export const BlinkitFreeDeliveryMeter: React.FC<BlinkitFreeDeliveryMeterProps> = ({
  subtotal,
  threshold = 299,
  className = '',
}) => {
  const isFreeDelivery = subtotal >= threshold;
  const amountNeeded = Math.max(0, threshold - subtotal);
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div
      className={`bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs ${className}`}
      data-testid="blinkit-free-delivery-meter"
    >
      <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
        {isFreeDelivery ? (
          <div className="flex items-center gap-1.5 text-[#0C831F]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Yay! You unlocked FREE Delivery</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-800">
            <Truck className="w-4 h-4 text-[#0C831F] shrink-0" />
            <span>
              Add <span className="text-[#0C831F]">{formatBlinkitPrice(amountNeeded)}</span> more for{' '}
              <span className="uppercase text-[#0C831F]">FREE Delivery</span>
            </span>
          </div>
        )}
        <span className="text-[11px] text-slate-500 font-semibold">{percent}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isFreeDelivery ? 'bg-[#0C831F]' : 'bg-[#0C831F]/80'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
