import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LiveOrderTracker } from '@/components/order/LiveOrderTracker';
import { Order } from '@/types/ecommerce';
import { ecommerceApi } from '@/services/api';

export const TrackOrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await ecommerceApi.getOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Order not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    // Auto-poll tracker every 8 seconds for live progress updates
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="min-h-screen pb-24 bg-[#F4F6F8]">
      <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Back Link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 border border-brand-slate-border text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-3xl p-8 border border-brand-slate-border text-center">
            <h3 className="text-base font-black text-brand-text-primary">Order Not Found</h3>
            <p className="text-xs text-brand-text-muted mt-1 mb-4">{error || 'Could not find order details.'}</p>
            <Link
              to="/"
              className="bg-[#0C831F] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Go to Store
            </Link>
          </div>
        ) : (
          <LiveOrderTracker order={order} onOrderUpdated={(updated) => setOrder(updated)} />
        )}
      </div>
    </div>
  );
};
