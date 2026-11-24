import React, { useState } from 'react';
import {
  Search,
  X,
  Mic,
  ShoppingBag,
  Heart,
  History,
  Store,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCustomerStore } from '@/store/customerStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { triggerHaptic } from '@/utils/haptics';
import { Link } from 'react-router-dom';
import { DELIVERY_ETA_TEXT } from '@/constants/delivery';
import { ProfileDropdown } from './ProfileDropdown';
import { SearchAutoSuggest } from './SearchAutoSuggest';

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
  const { getWishlistCount } = useWishlistStore();
  const { getSelectedAddress } = useCustomerStore();
  const { isStoreOpen, deliveryEta } = useStoreStatusStore();
  const [isListening, setIsListening] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const itemCount = getTotalItemsCount();
  const wishlistCount = getWishlistCount();
  const selectedAddress = getSelectedAddress();

  const handleVoiceSearch = () => {
    triggerHaptic('medium');
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onSearchChange('Cow Milk');
    }, 1200);
  };

  const areaName =
    selectedAddress?.area?.trim() ||
    selectedAddress?.street?.trim() ||
    (selectedAddress?.city && selectedAddress.city !== 'Ambajogai' ? selectedAddress.city.trim() : '');

  const deliveryLocationText = areaName || (selectedAddress?.label && selectedAddress.street ? selectedAddress.label : '');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 space-y-2">
        {/* Row 1: Logo & Brand + Delivery Info (Desktop) + Right Action Buttons */}
        <div className="flex items-center justify-between gap-3 sm:gap-4">
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
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                  Yogeshwari Dairy
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-200/80">
                  Pure
                </span>
              </div>
              <span className="hidden sm:inline text-[10px] text-slate-500 font-semibold tracking-wide mt-0.5">
                Fresh Milk, Paneer &amp; Desi Ghee
              </span>
            </div>
          </Link>

          {/* Desktop Central Delivery Location (Blinkit Style) */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 leading-tight">
                <span className="text-amber-500">⚡</span>
                <span>{deliveryEta || DELIVERY_ETA_TEXT}</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-700 font-medium truncate max-w-[140px]">
                    {deliveryLocationText ? `Deliver to ${deliveryLocationText}` : 'Ambajogai'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenAddressModal();
                    }}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer p-0.5"
                    aria-label="Change delivery location"
                  >
                    Change
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-[10.5px] text-slate-500 font-medium">
                  {isStoreOpen ? 'Store Open • Delivery active' : 'Closed – opens 6:00 AM'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Central Search Bar (Blinkit Style) */}
          <div className="hidden md:flex flex-1 max-w-xl relative items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSuggestOpen(true)}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Search "Milk, Paneer, Ghee, Sweets"'
              className="w-full h-10 bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200/80 rounded-xl pl-10 pr-20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              aria-label="Search dairy products"
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-700 transition-all cursor-pointer ${
                  isListening ? 'bg-rose-50 text-rose-600 animate-pulse' : 'hover:bg-slate-200/60'
                }`}
                aria-label="Voice Search"
                title="Voice Search"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            <SearchAutoSuggest
              isOpen={isSuggestOpen}
              searchQuery={searchQuery}
              onSelectQuery={(q) => onSearchChange(q)}
              onClose={() => setIsSuggestOpen(false)}
            />
          </div>

          {/* Right Action Icons: Profile, Staff POS, Wishlist, Orders, Green Cart Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Customer Profile Dropdown */}
            <ProfileDropdown onOpenAddressModal={onOpenAddressModal} />

            {/* Staff POS Quick Access */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
              title="Open Staff POS & Inventory Dashboard"
            >
              <Store className="w-4 h-4 text-emerald-700" />
              <span>Staff POS</span>
            </a>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              onClick={() => triggerHaptic('light')}
              className="relative w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-hidden"
              aria-label={`Wishlist with ${wishlistCount} items`}
              title="View Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Orders History Link */}
            <Link
              to="/orders"
              onClick={() => triggerHaptic('light')}
              className="w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-hidden"
              aria-label="View Order History"
              title="Order History"
            >
              <History className="w-5 h-5" />
            </Link>

            {/* Blinkit Emerald Green Cart Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                openCartDrawer();
              }}
              className="relative h-10 px-3 sm:px-3.5 rounded-xl bg-[#0C831F] hover:bg-[#086617] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs focus:outline-hidden"
              aria-label={`Shopping Cart with ${itemCount} items`}
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline font-bold text-xs">My Cart</span>
              {itemCount > 0 && (
                <span className="bg-[#F8CB46] text-slate-950 text-[11px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center leading-none shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Row 2: Delivery Strip & Inline Store Open/Closed Status */}
        <div className="flex lg:hidden items-center justify-between gap-2 text-xs">
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

          {/* Slim Status Pill */}
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

        {/* Mobile Row 3: Search Bar with AutoSuggest, Mic & Clear */}
        <div className="md:hidden relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSuggestOpen(true)}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search "Milk, Paneer, Ghee, Sweets"'
            className="w-full h-10 bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200/80 rounded-xl pl-10 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            aria-label="Search dairy products"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-700 transition-all cursor-pointer ${
                isListening ? 'bg-rose-50 text-rose-600 animate-pulse' : 'hover:bg-slate-200/60'
              }`}
              aria-label="Voice Search"
              title="Voice Search"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          <SearchAutoSuggest
            isOpen={isSuggestOpen}
            searchQuery={searchQuery}
            onSelectQuery={(q) => onSearchChange(q)}
            onClose={() => setIsSuggestOpen(false)}
          />
        </div>
      </div>
    </header>
  );
};
