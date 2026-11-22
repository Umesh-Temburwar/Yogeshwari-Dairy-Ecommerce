import React from 'react';
import { PhoneCall, MessageCircle, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { getStoreCallHref, openWhatsAppStoreInquiry } from '@/utils/whatsapp';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-slate-border pt-8 pb-28 text-xs text-brand-text-secondary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥛</span>
              <span className="font-extrabold text-base text-brand-text-primary">
                Yogeshwari Dairy Products
              </span>
            </div>
            <p className="text-xs text-brand-text-muted max-w-sm leading-relaxed">
              Ambajogai's trusted local dairy brand. Farm-fresh cow & buffalo milk, pure bilona ghee,
              daily-made spongy paneer, and authentic festival sweets delivered in 10 minutes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={getStoreCallHref()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F6F8] hover:bg-gray-200 text-brand-text-primary font-bold text-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#0C831F]" />
                <span>Call Store</span>
              </a>
              <button
                onClick={() => openWhatsAppStoreInquiry()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                <span>WhatsApp Dairy</span>
              </button>
            </div>
          </div>

          {/* Quick links & timings */}
          <div>
            <h4 className="font-bold text-brand-text-primary uppercase tracking-wider text-[11px] mb-2">
              Store Timings & Zones
            </h4>
            <ul className="space-y-1.5 text-brand-text-muted">
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0C831F]" />
                <span>Open Daily: 6:00 AM – 10:00 PM</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0C831F]" />
                <span>Mandi Bazar, Mangalwar Peth Rd, near Masjid, Ambajogai - 431517</span>
              </li>
            </ul>
          </div>

          {/* Trust badges */}
          <div>
            <h4 className="font-bold text-brand-text-primary uppercase tracking-wider text-[11px] mb-2">
              Purity Guarantee
            </h4>
            <ul className="space-y-1.5 text-brand-text-muted">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0C831F]" />
                <span>Daily Lactometer & Adulteration Tested</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0C831F]" />
                <span>Zero Preservatives or Bleaching</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0C831F]" />
                <span>Cold Chain Delivery System</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-slate-border text-center text-[11px] text-brand-text-muted flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Yogeshwari Dairy Products. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Ambajogaikar's Dairy Lovers
          </span>
        </div>
      </div>
    </footer>
  );
};
