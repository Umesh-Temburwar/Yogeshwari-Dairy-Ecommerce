import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingCartBar } from '@/components/cart/FloatingCartBar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AddressSelectorModal } from '@/components/address/AddressSelectorModal';
import { OrderSuccessModal } from '@/components/order/OrderSuccessModal';
import { HomePage } from '@/pages/HomePage';
import { OrdersPage } from '@/pages/OrdersPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Order } from '@/types/ecommerce';
import { useStoreStatusStore } from '@/store/storeStatusStore';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Synchronize store open/closed state in real-time with Shop Counter POS
  useEffect(() => {
    const cleanup = useStoreStatusStore.getState().initRealtimeSubscription();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F4F6F8] font-sans antialiased text-[#1C1C1C]">
        {/* Top Navbar */}
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
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/track/:orderId" element={<TrackOrderPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />

        {/* Floating Cart Bar (Blinkit style bottom sticky pill) */}
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
