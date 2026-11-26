import React from 'react';
import { Phone, ShieldCheck, UserCheck } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitRiderCardProps {
  riderName?: string;
  riderPhone?: string;
  vehicleNumber?: string;
  temperature?: string;
  className?: string;
}

export const BlinkitRiderCard: React.FC<BlinkitRiderCardProps> = ({
  riderName = 'Santosh Shinde',
  riderPhone = '+91 93708 69896',
  vehicleNumber = 'MH-44-AB-1294',
  temperature = '98.2°F',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 ${className}`}
      data-testid="blinkit-rider-card"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-100 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-800 font-black text-sm shrink-0">
          <UserCheck className="w-6 h-6 text-emerald-700" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-extrabold text-slate-900 truncate">{riderName}</h4>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>{temperature}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Delivery Partner • {vehicleNumber}
          </p>
        </div>
      </div>

      <a
        href={`tel:${riderPhone}`}
        onClick={() => triggerHaptic('light')}
        className="shrink-0 w-10 h-10 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs transition-all active:scale-90"
        aria-label={`Call delivery partner ${riderName}`}
        title="Call partner"
      >
        <Phone className="w-4 h-4 fill-emerald-700" />
      </a>
    </div>
  );
};
