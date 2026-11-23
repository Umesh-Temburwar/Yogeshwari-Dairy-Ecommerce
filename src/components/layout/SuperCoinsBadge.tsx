import React, { useState } from 'react';
import { Coins, Sparkles, X } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export const SuperCoinsBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const coinsBalance = 48; // Simulated active user loyalty coins

  const handleOpen = () => {
    triggerHaptic('light');
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#FFF9E6] border border-[#FFE11B] text-slate-800 hover:bg-[#FFEAA7] transition-all cursor-pointer text-xs font-semibold focus:outline-hidden"
        title="Flipkart SuperCoins Balance"
        aria-label="SuperCoins Balance: 48"
      >
        <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
          ★
        </span>
        <span className="text-[11px] font-bold text-amber-900">{coinsBalance}</span>
        <span className="text-[10px] text-amber-800 font-medium hidden lg:inline">Coins</span>
      </button>

      {/* Rewards Info Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xs border border-slate-200 max-w-sm w-full p-5 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              aria-label="Close SuperCoins info"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-200 flex items-center justify-center text-amber-900 text-2xl font-black shadow-md border-2 border-amber-300">
                ★
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  Flipkart SuperCoins
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {coinsBalance} SuperCoins
                </h3>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 bg-amber-50/60 p-3.5 rounded-xs border border-amber-200/60 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Earn <strong>2 SuperCoins</strong> for every ₹100 spent on fresh dairy &amp; sweets.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Coins className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Redeem coins for instant cart discounts on your next orders.
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-[#2874F0] hover:bg-[#1A5DC8] text-white text-xs font-bold rounded-xs cursor-pointer transition-colors"
            >
              Got it, Continue Shopping
            </button>
          </div>
        </div>
      )}
    </>
  );
};
