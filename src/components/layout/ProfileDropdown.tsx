import React, { useState, useRef, useEffect } from 'react';
import { User, Package, Heart, MapPin, Headphones, ChevronDown, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomerStore } from '@/store/customerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { triggerHaptic } from '@/utils/haptics';

interface ProfileDropdownProps {
  onOpenAddressModal: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onOpenAddressModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const customerName = useCustomerStore((s) => s.customerName);
  const { isAuthenticated, user, logout } = useAuthStore();

  const activeName = (user && user.name) || customerName;
  const displayName = activeName && !activeName.toLowerCase().includes('ramesh')
    ? activeName.split(' ')[0]
    : isAuthenticated
    ? 'Customer'
    : 'Login';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    triggerHaptic('warning');
    logout();
    setIsOpen(false);
  };

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
        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
          isAuthenticated ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-100 text-emerald-800'
        }`}>
          <User className="w-3.5 h-3.5" />
        </div>
        <span className="hidden lg:inline">{displayName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 text-xs animate-fade-in overflow-hidden">
          {/* Header Banner */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-emerald-50/50">
            {isAuthenticated && user ? (
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-black tracking-wider block">
                  Logged In Account
                </span>
                <span className="font-extrabold text-slate-900 text-sm truncate block mt-0.5">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  {user.phone ? `+91 ${user.phone}` : user.email}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                  Welcome to Yogeshwari
                </span>
                <span className="text-[11px] text-slate-600 block mt-0.5 mb-2">
                  Sign in to access your orders & addresses
                </span>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 px-3 bg-[#0C831F] hover:bg-[#086617] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login / Sign Up</span>
                </Link>
              </div>
            )}
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

          {/* Logout Button if authenticated */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 transition-colors text-left font-bold border-t border-slate-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

