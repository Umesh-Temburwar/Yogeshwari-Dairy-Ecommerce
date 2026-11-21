import React, { useState } from 'react';
import {
  MapPin,
  Search,
  X,
  Mic,
  ShoppingBag,
  History,
  PhoneCall,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useCustomerStore } from '@/store/customerStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { formatPrice } from '@/utils/formatters';
import { getStoreCallHref } from '@/utils/whatsapp';
import { triggerHaptic } from '@/utils/haptics';
import { Link } from 'react-router-dom';

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
  const { getTotalItemsCount, getSubtotal, openCartDrawer } = useCartStore();
  const { getSelectedAddress } = useCustomerStore();
  const { isStoreOpen } = useStoreStatusStore();
  const selectedAddress = getSelectedAddress();
  const [isListening, setIsListening] = useState(false);

  const itemCount = getTotalItemsCount();
  const subtotal = getSubtotal();

  const handleVoiceSearch = () => {
    triggerHaptic('medium');
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onSearchChange('Cow Milk');
    }, 1200);
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-subtle border-b border-brand-slate-border">
      {/* Top Announcement Bar with honest delivery time claim & Store Open/Closed status */}
      <div
        className={`px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors duration-300 ${
          isStoreOpen ? 'bg-[#0C831F] text-white' : 'bg-red-600 text-white'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="flex h-2 w-2 relative shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isStoreOpen ? 'bg-yellow-300' : 'bg-white'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isStoreOpen ? 'bg-yellow-400' : 'bg-white'
              }`}
            />
          </span>
          {isStoreOpen ? (
            <>
              <span className="tracking-wide text-[11px] sm:text-xs font-black truncate">
                ⚡ FAST LOCAL DELIVERY (EST. 20-40 MINS)
              </span>
              <span className="text-white/60 hidden xs:inline">|</span>
              <span className="text-brand-yellow font-medium hidden sm:inline">
                Yogeshwari Fresh Dairy
              </span>
            </>
          ) : (
            <>
              <span className="tracking-wide text-[11px] sm:text-xs font-black truncate">
                🔴 DUKAN ABHI BAND HAI • Online Orders Resume at 6:00 AM
              </span>
              <span className="text-white/60 hidden sm:inline">|</span>
              <span className="text-yellow-200 font-medium hidden md:inline">
                दुकान सध्या बंद आहे
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={getStoreCallHref()}
            className="flex items-center gap-1 hover:text-yellow-200 transition-colors text-[11px] sm:text-xs"
            title="Dairy Contact Hotline"
          >
            <PhoneCall className="w-3 h-3" />
            <span className="hidden xs:inline">+91 93708 69896</span>
          </a>
          <span className="text-white/60">|</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider flex items-center gap-1 ${
              isStoreOpen ? 'bg-white/20 text-white' : 'bg-black/30 text-white'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStoreOpen ? 'bg-emerald-300 animate-pulse' : 'bg-white'
              }`}
            />
            {isStoreOpen ? 'Store Open' : 'Store Closed'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Store Info */}
          <Link to="/" className="flex items-center gap-2 group shrink-0 min-h-[44px]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0C831F] to-[#086617] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-xl">🥛</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-[#1C1C1C] tracking-tight group-hover:text-[#0C831F] transition-colors leading-none">
                  Yogeshwari Dairy
                </span>
                <span className="bg-brand-green-light text-[#0C831F] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#0C831F]/20">
                  Pure
                </span>
              </div>
              <p className="text-[11px] text-brand-text-muted font-medium mt-0.5">
                Farm Fresh Dairy & Sweets
              </p>
            </div>
          </Link>

          {/* Delivery Location Selector */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenAddressModal();
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-slate-border hover:border-[#0C831F] bg-[#F4F6F8] transition-all text-left max-w-xs min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#0C831F] shrink-0 shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-bold text-[#1C1C1C] flex items-center gap-1">
                <span>Deliver to: {selectedAddress.label}</span>
                <span className="text-[#0C831F] text-[10px]">▼</span>
              </div>
              <div className="text-[11px] text-brand-text-secondary truncate">
                {selectedAddress.street}, {selectedAddress.city}
              </div>
            </div>
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* My Orders Link */}
            <Link
              to="/orders"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-brand-text-primary hover:bg-[#F4F6F8] border border-transparent hover:border-brand-slate-border text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
              onClick={() => triggerHaptic('light')}
            >
              <History className="w-4 h-4 text-brand-text-secondary" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                openCartDrawer();
              }}
              className="flex items-center gap-2 bg-[#0C831F] hover:bg-[#086617] text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-102 active:scale-98 min-h-[44px]"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-yellow text-[#1C1C1C] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden xs:flex flex-col text-left leading-none">
                <span className="text-[10px] text-white/80 uppercase font-semibold">
                  {itemCount === 1 ? '1 Item' : `${itemCount} Items`}
                </span>
                <span className="text-xs font-extrabold">
                  {subtotal > 0 ? formatPrice(subtotal) : 'My Cart'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Location bar & Search row */}
        <div className="mt-2.5 flex flex-col gap-2">
          {/* Mobile Location Pill */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenAddressModal();
            }}
            className="md:hidden flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg bg-[#F4F6F8] text-xs min-h-[36px]"
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#0C831F] shrink-0" />
              <span className="font-bold text-brand-text-primary">{selectedAddress.label}:</span>
              <span className="text-brand-text-secondary truncate">
                {selectedAddress.street}, {selectedAddress.city}
              </span>
            </div>
            <span className="text-[#0C831F] font-bold text-[10px] shrink-0 ml-1">CHANGE</span>
          </button>

          {/* Search Input Bar */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-brand-text-muted pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Search "Cow Milk", "Malai Paneer", "Ghee", "Curd"...'
              className="w-full bg-[#F4F6F8] border border-brand-slate-border rounded-xl pl-10 pr-20 py-2.5 text-xs sm:text-sm text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-transparent transition-all min-h-[44px]"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="w-8 h-8 rounded-full text-brand-text-muted hover:text-brand-text-primary hover:bg-white flex items-center justify-center transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-brand-text-secondary hover:text-[#0C831F] transition-all ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'hover:bg-white'
                  }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
