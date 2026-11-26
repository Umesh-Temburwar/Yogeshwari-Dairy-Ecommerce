import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Bike, Home } from 'lucide-react';
import { OrderStatus } from '@/types/ecommerce';

export interface BlinkitLiveOrderProgressProps {
  currentStatus: OrderStatus;
  estimatedMinutes?: number;
  className?: string;
}

export const BlinkitLiveOrderProgress: React.FC<BlinkitLiveOrderProgressProps> = ({
  currentStatus,
  estimatedMinutes = 10,
  className = '',
}) => {
  const steps = [
    {
      id: 'pending',
      title: 'Order Confirmed',
      desc: 'Sent to dark store',
      icon: CheckCircle2,
    },
    {
      id: 'preparing',
      title: 'Packed & Chilled',
      desc: 'Cold-chain 4°C verified',
      icon: PackageCheck,
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      desc: 'Rider is on the way',
      icon: Bike,
    },
    {
      id: 'delivered',
      title: 'Delivered',
      desc: 'At your doorstep',
      icon: Home,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 0;
      case 'preparing':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div
      className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs ${className}`}
      data-testid="blinkit-order-progress"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
            Live Delivery Status
          </h3>
          <p className="text-xs text-slate-500 leading-tight">
            Arriving in ~{estimatedMinutes} minutes
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0C831F] bg-[#E7F7ED] px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          <span>ON TIME</span>
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex items-start gap-3">
              {/* Dot / Icon */}
              <div
                className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-[#0C831F] text-white'
                    : isCurrent
                    ? 'bg-[#0C831F] text-white ring-4 ring-[#E7F7ED]'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>

              <div>
                <h4
                  className={`text-xs font-bold leading-tight ${
                    isCurrent ? 'text-[#0C831F]' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
