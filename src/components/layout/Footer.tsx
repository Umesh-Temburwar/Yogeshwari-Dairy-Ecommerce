import React from 'react';
import { PhoneCall, MessageCircle, MapPin, Clock, ShieldCheck, ChevronDown } from 'lucide-react';
import { getStoreCallHref, openWhatsAppStoreInquiry } from '@/utils/whatsapp';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-6 pb-24 sm:pb-16 text-xs text-slate-600">
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        {/* Brand info & Single Short Line */}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <img
              src="/YDO_logo.png"
              alt="Yogeshwari Dairy"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain shadow-xs"
            />
            <span className="font-extrabold text-base text-slate-900">
              Yogeshwari Dairy Products
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
            Ambajogai&apos;s trusted dairy. Pure milk, ghee, paneer &amp; sweets delivered in {DELIVERY_ETA_TEXT}.
          </p>
        </div>

        {/* Action Buttons: Call Store (outline) & WhatsApp (emerald-50) */}
        <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
          <a
            href={getStoreCallHref()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors min-h-[44px]"
            aria-label="Call Yogeshwari Dairy Hotline"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>Call Store</span>
          </a>
          <button
            type="button"
            onClick={() => openWhatsAppStoreInquiry()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs transition-colors min-h-[44px] cursor-pointer"
            aria-label="Chat with Dairy on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Collapsible Accordions (Closed by default to keep footer compact) */}
        <div className="space-y-2 pt-1">
          {/* Accordion 1: Store timings & address */}
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

          {/* Accordion 2: Purity guarantee */}
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

        {/* Copyright & Ambajogai Attribution (Meets WCAG AA text contrast) */}
        <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} Yogeshwari Dairy Products. All rights reserved.</p>
          <p className="font-medium text-slate-600">Made with ♥ in Ambajogai</p>
        </div>
      </div>
    </footer>
  );
};
