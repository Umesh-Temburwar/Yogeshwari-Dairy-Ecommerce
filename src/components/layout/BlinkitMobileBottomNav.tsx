import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { triggerHaptic } from '@/utils/haptics';

export const BlinkitMobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getWishlistCount } = useWishlistStore();

  const wishlistCount = getWishlistCount();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Categories', path: '/#categories', icon: LayoutGrid },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Account', path: '/login', icon: User },
  ];

  const handleNav = (item: typeof navItems[0]) => {
    triggerHaptic('light');
    if (item.path.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('categories-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg flex items-center justify-around pb-safe"
      data-testid="blinkit-mobile-bottom-nav"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleNav(item)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all cursor-pointer relative ${
              isActive ? 'text-[#0C831F] font-bold' : 'text-slate-500 font-medium hover:text-slate-900'
            }`}
            aria-label={item.label}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
