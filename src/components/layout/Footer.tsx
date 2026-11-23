import React from 'react';
import {
  PhoneCall,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Store,
  HelpCircle,
  Gift,
  CreditCard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoreCallHref, openWhatsAppStoreInquiry } from '@/utils/whatsapp';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';
import { useStoreStatusStore } from '@/store/storeStatusStore';

export const Footer: React.FC = () => {
  const deliveryEta = useStoreStatusStore((s) => s.deliveryEta);

  return (
    <footer className="bg-[#172337] text-white pt-10 pb-20 sm:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-8">
        {/* Top 4-Column Grid + Address Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 pb-8 border-b border-slate-700 text-slate-300">
          {/* Column 1: ABOUT */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              About
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href={getStoreCallHref()} className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  About Yogeshwari Dairy
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-white transition-colors">
                  Featured Brands
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Mandi Bazar Hub</span>
              </li>
              <li>
                <span className="text-slate-500">Pure Farm Assurance</span>
              </li>
            </ul>
          </div>

          {/* Column 2: HELP */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              Help
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Shipping &amp; Delivery
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Cancellations
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  FAQs
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: CONSUMER POLICY */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              Policy
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Return Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Terms Of Use
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Security
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Privacy
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: MAIL US (Flipkart Style) */}
          <div className="space-y-2 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6 text-[11px]">
            <h5 className="font-extrabold uppercase text-slate-400 tracking-wider">
              Mail Us:
            </h5>
            <p className="leading-relaxed text-slate-300">
              Yogeshwari Dairy Products,
              <br />
              Mandi Bazar, Mangalwar Peth Rd,
              <br />
              near Masjid, Ambajogai,
              <br />
              Beed, Maharashtra - 431517
            </p>
            <div className="pt-2">
              <span className="text-slate-400 font-bold block">Hotline:</span>
              <a href="tel:+919370869896" className="text-[#FFE500] font-bold">
                +91 93708 69896
              </a>
            </div>
          </div>

          {/* Column 5: REGISTERED OFFICE */}
          <div className="space-y-2 col-span-2 md:col-span-1 border-t md:border-t-0 border-slate-700 pt-4 md:pt-0 text-[11px]">
            <h5 className="font-extrabold uppercase text-slate-400 tracking-wider">
              Registered Office:
            </h5>
            <p className="leading-relaxed text-slate-300">
              Yogeshwari Dairy Online Storefront,
              <br />
              FSSAI Lic. Certified Hub,
              <br />
              Ambajogai Mandi Circle,
              <br />
              Maharashtra, India
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine Dairy Quality</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Call Dairy & WhatsApp */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <img
              src="/YDO_logo.png"
              alt="Yogeshwari Dairy"
              width={32}
              height={32}
              className="w-8 h-8 rounded-xs object-contain bg-white p-0.5"
            />
            <div>
              <span className="font-black text-white text-sm block leading-none">
                Yogeshwari Dairy Products
              </span>
              <span className="text-[10px] text-slate-400">
                Speed Local Delivery in {deliveryEta || DELIVERY_ETA_TEXT}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getStoreCallHref()}
              className="px-3.5 py-1.5 rounded-xs bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FFE500]" />
              <span>Call Store</span>
            </a>
            <button
              type="button"
              onClick={() => openWhatsAppStoreInquiry()}
              className="px-3.5 py-1.5 rounded-xs bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Flipkart Bottom Trust & Payment Methods Strip */}
        <div className="pt-6 border-t border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-start">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-[#FFE500]" />
              <span>Staff / POS Portal</span>
            </a>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
              <Gift className="w-3.5 h-3.5 text-[#FFE500]" />
              <span>Dairy Gift Cards</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
              <HelpCircle className="w-3.5 h-3.5 text-[#FFE500]" />
              <span>Help Center</span>
            </span>
            <span>© 2026 Yogeshwari Dairy Products. All rights reserved.</span>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Payment Partners:</span>
            <span className="px-2 py-0.5 rounded-xs bg-white text-slate-900 font-black text-[10px] shadow-2xs">
              UPI
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-white text-[#2874F0] font-black text-[10px] shadow-2xs">
              GPay / PhonePe
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-white text-blue-800 font-black text-[10px] shadow-2xs">
              RuPay
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-white text-slate-900 font-black text-[10px] shadow-2xs">
              Visa / MC
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-600 text-white font-black text-[10px] shadow-2xs">
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
