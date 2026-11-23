import React, { useState } from 'react';
import {
  Search,
  X,
  Mic,
  ShoppingCart,
  Heart,
  History,
  Store,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { triggerHaptic } from '@/utils/haptics';
import { Link } from 'react-router-dom';
import { FlipkartPincodeWidget } from './FlipkartPincodeWidget';
import { SuperCoinsBadge } from './SuperCoinsBadge';
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
  const { isStoreOpen } = useStoreStatusStore();
  const [isListening, setIsListening] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const itemCount = getTotalItemsCount();
  const wishlistCount = getWishlistCount();

  const handleVoiceSearch = () => {
    triggerHaptic('medium');
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onSearchChange('Cow Milk');
    }, 1200);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#2874F0] text-white shadow-md">
      {/* Top Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Flipkart Style Logo Lockup */}
          <Link
            to="/"
            className="flex flex-col items-start shrink-0 group focus:outline-hidden"
            aria-label="Yogeshwari Dairy - Flipkart Style Storefront"
          >
            <div className="flex items-center gap-1.5">
              <img
                src="/YDO_logo.png"
                alt="Yogeshwari Dairy"
                width={32}
                height={32}
                className="w-8 h-8 rounded-xs object-contain bg-white p-0.5 shadow-2xs group-hover:scale-105 transition-transform"
              />
              <span className="text-base sm:text-lg font-black text-white italic tracking-tight leading-none">
                Yogeshwari
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] leading-tight font-medium pl-9">
              <span className="text-blue-100 italic">Explore</span>
              <span className="text-[#FFE500] font-bold italic flex items-center gap-0.5">
                Pure Plus
                <span className="text-[10px] font-black">★</span>
              </span>
            </div>
          </Link>

          {/* Deliver To Pincode Strip (Desktop & Tablet) */}
          <div className="hidden sm:block shrink-0">
            <FlipkartPincodeWidget onOpenAddressModal={onOpenAddressModal} />
          </div>

          {/* Flipkart Style Central Search Bar (Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-2xl relative items-center">
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSuggestOpen(true)}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for Milk, Paneer, Ghee, Sweets and more"
              className="w-full h-9 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm pl-4 pr-20 rounded-xs shadow-inner focus:outline-hidden"
              aria-label="Search products"
            />
            <div className="absolute right-1 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="w-7 h-7 rounded text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-blue-600 cursor-pointer ${
                  isListening ? 'bg-rose-50 text-rose-600 animate-pulse' : ''
                }`}
                title="Voice Search"
                aria-label="Voice Search"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center text-[#2874F0] hover:text-[#1A5DC8] cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            <SearchAutoSuggest
              isOpen={isSuggestOpen}
              searchQuery={searchQuery}
              onSelectQuery={(q) => onSearchChange(q)}
              onClose={() => setIsSuggestOpen(false)}
            />
          </div>

          {/* Right Action Icons: SuperCoins, Wishlist, Orders, Cart */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* SuperCoins Loyalty Badge */}
            <SuperCoinsBadge />

            {/* Profile Dropdown */}
            <ProfileDropdown onOpenAddressModal={onOpenAddressModal} />

            {/* Dairy Staff / POS Quick Access (Flipkart 'Become a Seller' counterpart) */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xs hover:bg-white/10 text-white font-semibold text-xs transition-colors"
              title="Open Staff POS & Inventory Dashboard"
            >
              <Store className="w-4 h-4 text-[#FFE500]" />
              <span>Staff POS</span>
            </a>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              onClick={() => triggerHaptic('light')}
              className="relative p-2 rounded-xs hover:bg-white/10 text-white flex items-center gap-1 transition-colors cursor-pointer focus:outline-hidden"
              title="View Wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-[#FFE500] text-[#FFE500]' : 'text-white'}`} />
              <span className="hidden md:inline text-xs font-semibold">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FFE500] text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#2874F0] leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Order History */}
            <Link
              to="/orders"
              onClick={() => triggerHaptic('light')}
              className="p-2 rounded-xs hover:bg-white/10 text-white flex items-center gap-1 transition-colors cursor-pointer focus:outline-hidden"
              title="Order History"
              aria-label="View Order History"
            >
              <History className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-semibold">Orders</span>
            </Link>

            {/* Cart Button with Flipkart Styling */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                openCartDrawer();
              }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2874F0] hover:bg-blue-50 font-bold text-xs rounded-xs shadow-xs transition-transform active:scale-95 cursor-pointer focus:outline-hidden"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-[#FB641B] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Pincode Strip (visible only on small screens) */}
        <div className="mt-2.5 sm:hidden space-y-2">
          {/* Mobile Search input */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Milk, Paneer, Ghee, Sweets..."
              className="w-full h-9 bg-white text-slate-900 placeholder:text-slate-400 text-xs pl-3 pr-16 rounded-xs shadow-inner focus:outline-hidden"
              aria-label="Mobile search"
            />
            <div className="absolute right-1.5 flex items-center gap-1 text-slate-500">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="w-6 h-6 flex items-center justify-center text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`w-6 h-6 flex items-center justify-center ${isListening ? 'text-rose-600 animate-pulse' : ''}`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <Search className="w-4 h-4 text-[#2874F0]" />
            </div>
          </div>

          {/* Mobile Deliver-To Strip */}
          <div className="flex items-center justify-between text-[11px] text-blue-100 px-0.5">
            <FlipkartPincodeWidget onOpenAddressModal={onOpenAddressModal} />
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-emerald-400' : 'bg-amber-300'}`} />
              <span className="text-white font-medium">
                {isStoreOpen ? 'Store Open' : 'Store Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
