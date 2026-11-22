import React from 'react';
import { PhoneCall, MessageCircle, MapPin, Clock, ShieldCheck, ChevronDown } from 'lucide-react';
import { getStoreCallHref, openWhatsAppStoreInquiry } from '@/utils/whatsapp';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';
import { useStoreStatusStore } from '@/store/storeStatusStore';

export const Footer: React.FC = () => {
  const deliveryEta = useStoreStatusStore((s) => s.deliveryEta);

  return (
    <footer className="bg-white border-t border-slate-200/90 pt-8 pb-24 sm:pb-16 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
        {/* Desktop 3-Column Layout / Mobile Stacked */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Col 1: Brand Info & Action Buttons */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2.5">
              <img
                src="/YDO_logo.png"
                alt="Yogeshwari Dairy"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl object-contain shadow-2xs"
              />
              <div>
                <span className="font-extrabold text-base text-slate-900 block leading-tight">
                  Yogeshwari Dairy Products
                </span>
                <span className="text-[11px] font-medium text-emerald-700">
                  Pure Farm Dairy &amp; Sweets
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Ambajogai&apos;s trusted dairy. Pure cow &amp; buffalo milk, bilona ghee, soft paneer &amp; fresh sweets delivered in {deliveryEta || DELIVERY_ETA_TEXT}.
            </p>

            {/* Action Buttons: Call Store & WhatsApp */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={getStoreCallHref()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors min-h-[44px] shadow-2xs"
                aria-label="Call Yogeshwari Dairy Hotline"
              >
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <span>Call Store</span>
              </a>
              <button
                type="button"
                onClick={() => openWhatsAppStoreInquiry()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs transition-colors min-h-[44px] shadow-2xs cursor-pointer"
                aria-label="Chat with Dairy on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Col 2: Store Timings & Address (Shown directly on desktop, accordion on mobile) */}
          <div className="space-y-3">
            <div className="hidden md:block space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Store Timings &amp; Zones</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">Open Daily:</span>
                  <span>6:00 AM – 10:00 PM</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Mandi Bazar, Mangalwar Peth Rd, near Masjid, Ambajogai - 431517</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  ⚡ Express Local Delivery across Ambajogai within 25 km envelope.
                </p>
              </div>
            </div>

            {/* Mobile Accordion */}
            <div className="md:hidden">
              <details className="group border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
                <summary className="flex items-center justify-between p-3 font-semibold text-xs text-slate-800 cursor-pointer list-none select-none hover:bg-slate-100/70 transition-colors">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Store timings &amp; address</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-3 pb-3 pt-1 text-xs text-slate-600 border-t border-slate-200/60 space-y-1.5 bg-white">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">Open Daily:</span>
                    <span>6:00 AM – 10:00 PM</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Mandi Bazar, Mangalwar Peth Rd, near Masjid, Ambajogai - 431517</span>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Col 3: Purity Guarantee */}
          <div className="space-y-3">
            <div className="hidden md:block space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Purity Guarantee</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p>• Daily Lactometer &amp; Adulteration Tested</p>
                <p>• Zero Preservatives or Chemical Bleaching</p>
                <p>• Cold Chain Delivery System across Ambajogai</p>
                <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                  ✓ 100% Unadulterated Desi Ghee &amp; Farm Fresh Milk
                </p>
              </div>
            </div>

            {/* Mobile Accordion */}
            <div className="md:hidden">
              <details className="group border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
                <summary className="flex items-center justify-between p-3 font-semibold text-xs text-slate-800 cursor-pointer list-none select-none hover:bg-slate-100/70 transition-colors">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Purity guarantee</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-3 pb-3 pt-1 text-xs text-slate-600 border-t border-slate-200/60 space-y-1 bg-white">
                  <p>• Daily Lactometer &amp; Adulteration Tested</p>
                  <p>• Zero Preservatives or Chemical Bleaching</p>
                  <p>• Cold Chain Delivery System across Ambajogai</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Yogeshwari Dairy Products. All rights reserved.</p>
          <p className="font-semibold text-slate-700">Made with ♥ for Ambajogai</p>
        </div>
      </div>
    </footer>
  );
};
