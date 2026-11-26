import React from 'react';
import { ShieldCheck, ThermometerSnowflake } from 'lucide-react';

export interface BlinkitColdChainMonitorProps {
  temperature?: string;
  className?: string;
}

export const BlinkitColdChainMonitor: React.FC<BlinkitColdChainMonitorProps> = ({
  temperature = '3.8°C',
  className = '',
}) => {
  return (
    <div
      className={`bg-sky-50/80 border border-sky-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-sky-950 ${className}`}
      data-testid="blinkit-cold-chain-monitor"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs shrink-0">
          <ThermometerSnowflake className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
            <span>Cold-Chain Maintained</span>
            <span className="text-[10px] font-black bg-sky-200/70 text-sky-900 px-1.5 py-0.2 rounded">
              {temperature}
            </span>
          </h4>
          <p className="text-[11px] text-sky-700 leading-tight mt-0.5">
            Packaged in thermal cold-bags to preserve milk & curd probiotics
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-white/80 px-2 py-1 rounded-lg border border-sky-200/60 shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
        <span>Verified</span>
      </div>
    </div>
  );
};
