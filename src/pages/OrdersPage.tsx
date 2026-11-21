import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronRight } from 'lucide-react';
import { OrderSummary } from '@/types/ecommerce';
import { ecommerceApi } from '@/services/api';
import { formatDateTime, formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const list = await ecommerceApi.getCustomerOrders();
        setOrders(list);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen pb-24 bg-[#F4F6F8]">
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0C831F] text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-brand-text-primary">My Orders</h1>
              <p className="text-xs text-brand-text-muted">Track past and ongoing dairy orders</p>
            </div>
          </div>
          <Link
            to="/"
            className="text-xs font-bold text-[#0C831F] hover:underline"
          >
            ← Back to Store
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-brand-slate-border animate-pulse space-y-2"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-brand-slate-border my-6">
            <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
              📦
            </div>
            <h3 className="font-extrabold text-base text-brand-text-primary">
              No orders placed yet
            </h3>
            <p className="text-xs text-brand-text-muted max-w-sm mx-auto mt-1 mb-4">
              You haven't ordered fresh dairy products yet. Explore our fresh cow milk, ghee, and sweets!
            </p>
            <Link
              to="/"
              className="inline-block bg-[#0C831F] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isDelivered = order.orderStatus === 'delivered';
              const isCancelled = order.orderStatus === 'cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-brand-slate-border p-4 shadow-card hover:border-[#0C831F]/40 transition-colors"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-brand-slate-border">
                    <div>
                      <span className="text-xs font-black text-brand-text-primary">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-brand-text-muted block mt-0.5">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isDelivered
                          ? 'bg-green-100 text-green-800'
                          : isCancelled
                          ? 'bg-red-100 text-red-800'
                          : 'bg-brand-yellow-light text-amber-900 animate-pulse'
                      }`}
                    >
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-brand-text-secondary font-medium">
                        {order.firstItemName}
                        {order.itemCount > 1 ? ` + ${order.itemCount - 1} more items` : ''}
                      </span>
                    </div>
                    <span className="font-black text-brand-text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-brand-slate-border flex items-center justify-between">
                    <span className="text-[11px] text-brand-text-muted">
                      {order.itemCount} items
                    </span>
                    <Link
                      to={`/track/${order.id}`}
                      onClick={() => triggerHaptic('light')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0C831F] hover:text-[#086617]"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
