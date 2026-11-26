import React from 'react';
import { Clock, ShieldCheck, Snowflake, Info } from 'lucide-react';

export interface BlinkitShelfLifeAccordionProps {
  shelfLife?: string;
  storageInfo?: string;
  fatContent?: string;
  fssaiNumber?: string;
  className?: string;
}

export const BlinkitShelfLifeAccordion: React.FC<BlinkitShelfLifeAccordionProps> = ({
  shelfLife = '2 Days from delivery',
  storageInfo = 'Store in refrigerator at 4°C or boil immediately',
  fatContent = 'Min 3.5% Milk Fat',
  fssaiNumber = '11521044000342',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3 ${className}`}
      data-testid="blinkit-shelflife-guide"
    >
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
        Storage & Shelf Life
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl">
          <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block leading-tight">Shelf Life</span>
            <span className="text-slate-600 text-[11px] leading-tight">{shelfLife}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl">
          <Snowflake className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block leading-tight">Storage Temp</span>
            <span className="text-slate-600 text-[11px] leading-tight">{storageInfo}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-semibold text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          FSSAI Lic No. {fssaiNumber}
        </span>
        <span className="font-medium">{fatContent}</span>
      </div>
    </div>
  );
};
