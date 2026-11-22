import React, { useState } from 'react';
import {
  Search,
  X,
  Mic,
  ShoppingBag,
  History,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useCustomerStore } from '@/store/customerStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { triggerHaptic } from '@/utils/haptics';
import { Link } from 'react-router-dom';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddressModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddressModal,
}) => {
  const { getTotalItemsCount, openCartDrawer } = useCartStore();
  const { getSelectedAddress } = useCustomerStore();
  const { isStoreOpen, deliveryEta } = useStoreStatusStore();
  const selectedAddress = getSelectedAddress();
  const [isListening, setIsListening] = useState(false);

  const itemCount = getTotalItemsCount();

  const handleVoiceSearch = () => {
    triggerHaptic('medium');
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onSearchChange('Cow Milk');
    }, 1200);
  };

  // Safe delivery location label (avoid empty strings and stray commas like "Home: , Ambajogai")
  const areaName =
    selectedAddress?.area?.trim() ||
    selectedAddress?.street?.trim() ||
    (selectedAddress?.city && selectedAddress.city !== 'Ambajogai' ? selectedAddress.city.trim() : '');

  const deliveryLocationText = areaName || (selectedAddress?.label && selectedAddress.street ? selectedAddress.label : '');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 space-y-2">
        {/* Row 1: Logo & Brand + Right Action Buttons (Order History, Cart) */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Info */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0 min-h-[44px] focus:outline-hidden"
            aria-label="Yogeshwari Dairy Home"
          >
            <img
              src="/YDO_logo.png"
              alt="Yogeshwari Dairy Logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                Yogeshwari Dairy
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-200/80">
                Pure
              </span>
            </div>
          </Link>

          {/* Right Action Icons (Min 44px touch targets) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Orders History Link */}
            <Link
              to="/orders"
              onClick={() => triggerHaptic('light')}
              className="w-11 h-11 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-hidden"
              aria-label="View Order History"
              title="Order History"
            >
              <History className="w-5 h-5" />
            </Link>

            {/* Cart Button with Count Badge */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                openCartDrawer();
              }}
              className="relative w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 flex items-center justify-center transition-all active:scale-95 cursor-pointer focus:outline-hidden"
              aria-label={`Shopping Cart with ${itemCount} items`}
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Delivery Strip & Inline Store Open/Closed Status */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Delivery Promise & Area */}
          <div className="flex items-center gap-1.5 truncate text-slate-700">
            <span className="text-amber-500 font-bold">⚡</span>
            <span className="font-bold text-slate-900 shrink-0">{deliveryEta || DELIVERY_ETA_TEXT}</span>
            <span className="text-slate-300">•</span>
            <div className="truncate flex items-center gap-1">
              <span className="text-slate-500 truncate">
                {deliveryLocationText ? `Deliver to ${deliveryLocationText}` : 'Select delivery area'}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenAddressModal();
                }}
                className="text-emerald-700 font-bold text-xs hover:underline shrink-0 p-1 cursor-pointer focus:outline-hidden"
                aria-label="Change delivery location"
              >
                Change
              </button>
            </div>
          </div>

          {/* Slim Status Pill (Replaces the old clipped top banner) */}
          <div className="shrink-0">
            {isStoreOpen ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Store Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Closed – opens 6:00 AM
              </span>
            )}
          </div>
        </div>

        {/* Row 3: Search Bar with Mic & Clear */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search "Milk, Paneer, Ghee"'
            className="w-full h-11 bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200/80 rounded-xl pl-10 pr-20 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            aria-label="Search dairy products"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-700 transition-all cursor-pointer ${
                isListening ? 'bg-rose-50 text-rose-600 animate-pulse' : 'hover:bg-slate-200/60'
              }`}
              aria-label="Voice Search"
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
