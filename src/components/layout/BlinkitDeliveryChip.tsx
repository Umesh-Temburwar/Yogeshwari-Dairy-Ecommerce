import React from 'react';
import { Zap, ChevronDown, MapPin } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitDeliveryChipProps {
  locationText?: string;
  etaText?: string;
  isStoreOpen?: boolean;
  onOpenAddressModal: () => void;
  className?: string;
}

export const BlinkitDeliveryChip: React.FC<BlinkitDeliveryChipProps> = ({
  locationText = 'Ambajogai Mandi Bazar',
  etaText = '10 MINS',
  isStoreOpen = true,
  onOpenAddressModal,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic('light');
        onOpenAddressModal();
      }}
      className={`text-left flex flex-col justify-center cursor-pointer group focus:outline-hidden ${className}`}
      aria-label="Change delivery location"
      data-testid="blinkit-delivery-chip"
    >
      <div className="flex items-center gap-1 leading-none">
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
        <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
          Delivery in {etaText}
        </span>
      </div>

      <div className="flex items-center gap-0.5 text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 max-w-[160px] sm:max-w-[200px] truncate leading-tight">
        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
        <span className="truncate">{locationText}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
      </div>
    </button>
  );
};
