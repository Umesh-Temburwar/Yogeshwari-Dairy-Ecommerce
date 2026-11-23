import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { DeliverySlot } from '@/types/flipkart';
import { triggerHaptic } from '@/utils/haptics';

export const DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: 'express',
    title: 'Instant Express',
    timeRange: '10 – 15 Mins',
    isAvailable: true,
    isExpress: true,
  },
  {
    id: 'morning',
    title: 'Morning Slot',
    timeRange: '6:30 AM – 8:30 AM',
    isAvailable: true,
  },
  {
    id: 'afternoon',
    title: 'Afternoon Slot',
    timeRange: '12:00 PM – 2:00 PM',
    isAvailable: true,
  },
  {
    id: 'evening',
    title: 'Evening Slot',
    timeRange: '6:00 PM – 8:00 PM',
    isAvailable: true,
  },
];

interface DeliverySlotPickerProps {
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
}

export const DeliverySlotPicker: React.FC<DeliverySlotPickerProps> = ({
  selectedSlotId,
  onSelectSlot,
}) => {
  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between text-slate-800 font-bold">
        <span>Preferred Delivery Slot:</span>
        <span className="text-[10px] text-blue-600 font-semibold">Scheduled Dispatch</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DELIVERY_SLOTS.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectSlot(slot.id);
              }}
              className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#2874F0] bg-blue-50/70 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  {slot.isExpress && <Zap className="w-3 h-3 text-[#FF9F00] fill-[#FF9F00]" />}
                  {slot.title}
                </span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#2874F0]" />}
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1">
                {slot.timeRange}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
