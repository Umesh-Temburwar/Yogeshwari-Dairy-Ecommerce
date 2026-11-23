import React, { useState, useEffect } from 'react';
import { Bell, Flame, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

const ANNOUNCEMENTS = [
  '🔥 Festive Special: 10% instant discount on 1L Desi Cow Ghee Jars today!',
  '⚡ Fresh Batch Alert: Warm Morning Milk & Fresh Malai Paneer ready for 15-min delivery.',
  '🎉 Free Home Delivery on all orders above ₹299 across Ambajogai Mandi & surrounding areas.',
  '★ Earn 2 Flipkart SuperCoins for every ₹100 spent on all Dairy & Sweets products.',
];

interface AnnouncementTickerProps {
  onBannerClick?: () => void;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#2874F0]/10 border-y border-[#2874F0]/20 py-1.5 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2874F0] text-white shrink-0">
            <Flame className="w-3 h-3 fill-white" />
          </span>
          <span className="font-extrabold text-[#2874F0] uppercase text-[10px] tracking-wider shrink-0">
            Live Flash Deal:
          </span>
          <p
            key={currentIndex}
            className="text-slate-800 font-semibold truncate animate-fade-in text-[11px] sm:text-xs"
          >
            {ANNOUNCEMENTS[currentIndex]}
          </p>
        </div>

        {onBannerClick && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onBannerClick();
            }}
            className="shrink-0 text-[11px] font-bold text-[#2874F0] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
