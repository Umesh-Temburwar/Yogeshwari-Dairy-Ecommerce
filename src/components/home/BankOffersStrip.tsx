import React from 'react';
import { Tag, Sparkles, ShieldCheck } from 'lucide-react';
import { BankOffer } from '@/types/flipkart';

export const BANK_OFFERS: BankOffer[] = [
  {
    id: 'upi-50',
    bank: 'UPI / GPay',
    title: 'Flat ₹50 Instant Off',
    description: 'On orders above ₹299 using Google Pay or PhonePe UPI',
    discountBadge: 'FLAT ₹50 OFF',
    code: 'DAIRY50',
  },
  {
    id: 'free-del',
    bank: 'Special Delivery',
    title: 'Free Ambajogai Delivery',
    description: 'Guaranteed 15-min delivery free on all carts above ₹199',
    discountBadge: 'FREE DELIVERY',
    code: 'FREESHIP',
  },
  {
    id: 'rupay-cashback',
    bank: 'RuPay / Cards',
    title: '5% Cashback Savings',
    description: 'Extra 5% instant cashback on RuPay debit and credit cards',
    discountBadge: '5% CASHBACK',
  },
];

export const BankOffersStrip: React.FC = () => {
  return (
    <section className="w-full bg-[#FFF9E6] border-y border-[#FFE11B]/60 py-2.5 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF9F00] text-white">
            <Tag className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-black uppercase text-slate-900 tracking-wide">
            Bank &amp; Payment Offers:
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {BANK_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xs border border-[#FFE11B] shadow-2xs text-xs"
            >
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-1.5 py-0.5 rounded-xs leading-none">
                {offer.discountBadge}
              </span>
              <span className="text-slate-800 font-medium">
                {offer.description}
              </span>
              {offer.code && (
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded-xs border border-blue-200">
                  {offer.code}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700 font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Genuine Dairy Quality Guarantee</span>
        </div>
      </div>
    </section>
  );
};
