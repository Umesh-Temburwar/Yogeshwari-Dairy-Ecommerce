import React, { useState, useRef, useEffect } from 'react';
import { User, Package, Heart, MapPin, Headphones, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomerStore } from '@/store/customerStore';
import { triggerHaptic } from '@/utils/haptics';

interface ProfileDropdownProps {
  onOpenAddressModal: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onOpenAddressModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const customerName = useCustomerStore((s) => s.customerName);

  const displayName = customerName && !customerName.toLowerCase().includes('ramesh')
    ? customerName.split(' ')[0]
    : 'Account';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer focus:outline-hidden"
        aria-expanded={isOpen}
        aria-label="User Account Menu"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
          <User className="w-3.5 h-3.5" />
        </div>
        <span className="hidden lg:inline">{displayName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs animate-fade-in overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-emerald-50/50">
            <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
              Welcome to Yogeshwari
            </span>
            <span className="font-bold text-slate-900 text-sm truncate block">
              {displayName === 'Account' ? 'Dairy Customer' : displayName}
            </span>
          </div>

          <Link
            to="/orders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors"
          >
            <Package className="w-4 h-4 text-emerald-700" />
            <span className="font-medium">My Orders</span>
          </Link>

          <Link
            to="/wishlist"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="font-medium">Wishlist</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenAddressModal();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span className="font-medium">Saved Addresses</span>
          </button>

          <a
            href="tel:+919370869896"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors border-t border-slate-100"
          >
            <Headphones className="w-4 h-4 text-emerald-700" />
            <span className="font-medium">Store Hotline (+91 93708 69896)</span>
          </a>
        </div>
      )}
    </div>
  );
};
