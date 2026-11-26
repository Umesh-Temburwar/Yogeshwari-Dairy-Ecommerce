import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BackToTopButton } from '@/components/layout/BackToTopButton';
import { BlinkitMobileBottomNav } from '@/components/layout/BlinkitMobileBottomNav';
import { FloatingCartBar } from '@/components/cart/FloatingCartBar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AddressSelectorModal } from '@/components/address/AddressSelectorModal';
import { OrderSuccessModal } from '@/components/order/OrderSuccessModal';
import { HomePage } from '@/pages/HomePage';
import { BrandsPage } from '@/pages/BrandsPage';
import { BrandPage } from '@/pages/BrandPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Order } from '@/types/ecommerce';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { initBrandLogos } from '@/utils/brands';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Synchronize store open/closed state & brand logos in real-time
  useEffect(() => {
    initBrandLogos();
    const cleanup = useStoreStatusStore.getState().initRealtimeSubscription();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F4F6F8] font-sans antialiased text-[#1C1C1C]">
        {/* Top Sticky Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddressModal={() => setIsAddressModalOpen(true)}
        />

        {/* Dynamic Pages */}
        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                />
              }
            />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/brand/:brandName" element={<BrandPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/track/:orderId" element={<TrackOrderPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        {/* Responsive Footer */}
        <Footer />

        {/* Floating Back to Top Button */}
        <BackToTopButton />

        {/* Mobile 1-Thumb Quick-Commerce Navigation */}
        <BlinkitMobileBottomNav />

        {/* Bottom Floating Cart Bar */}
        <FloatingCartBar />

        {/* Cart Drawer Slide-Over */}
        <CartDrawer
          onOpenAddressModal={() => setIsAddressModalOpen(true)}
          onOrderSuccess={(order) => setSuccessOrder(order)}
        />

        {/* Address Selection Modal */}
        <AddressSelectorModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
        />

        {/* Order Success Confetti Modal */}
        <OrderSuccessModal
          order={successOrder}
          onClose={() => setSuccessOrder(null)}
        />
      </div>
    </Router>
  );
};

export default App;
