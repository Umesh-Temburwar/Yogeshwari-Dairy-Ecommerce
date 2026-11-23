import React, { useState } from 'react';
import { MapPin, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';
import { triggerHaptic } from '@/utils/haptics';

interface FlipkartPincodeWidgetProps {
  onOpenAddressModal: () => void;
}

export const FlipkartPincodeWidget: React.FC<FlipkartPincodeWidgetProps> = ({
  onOpenAddressModal,
}) => {
  const { getSelectedAddress } = useCustomerStore();
  const { deliveryEta, isStoreOpen } = useStoreStatusStore();
  const [isHovered, setIsHovered] = useState(false);

  const selectedAddress = getSelectedAddress();
  const areaName =
    selectedAddress?.area?.trim() ||
    selectedAddress?.street?.trim() ||
    'Ambajogai';
  const pincode = selectedAddress?.pincode || '431517';

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          onOpenAddressModal();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm hover:bg-white/10 text-white transition-colors cursor-pointer text-left text-xs focus:outline-hidden"
        title="Change delivery location / pincode"
        aria-label={`Deliver to ${areaName} ${pincode}`}
      >
        <MapPin className="w-4 h-4 text-[#FFE500] shrink-0" />
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-blue-100 font-medium flex items-center gap-1">
            Deliver to
            <ChevronDown className="w-3 h-3 text-blue-100" />
          </span>
          <span className="text-xs font-bold text-white max-w-[130px] sm:max-w-[160px] truncate">
            {areaName} {pincode}
          </span>
        </div>
      </button>

      {/* Quick Serviceability Hover Tooltip */}
      {isHovered && (
        <div className="absolute top-full left-0 mt-1 z-40 bg-white text-slate-800 p-2.5 rounded-xs shadow-lg border border-slate-200 w-56 text-xs animate-fade-in pointer-events-none">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Serviceable via Mandi Bazar Hub</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Speed delivery promised in{' '}
            <strong className="text-slate-900">{deliveryEta || DELIVERY_ETA_TEXT}</strong>.
          </p>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Status:</span>
            <span className={isStoreOpen ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              {isStoreOpen ? 'Store Open' : 'Store Closed'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
