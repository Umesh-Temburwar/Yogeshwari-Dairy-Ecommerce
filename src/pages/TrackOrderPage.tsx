import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LiveOrderTracker } from '@/components/order/LiveOrderTracker';
import { Order } from '@/types/ecommerce';
import { ecommerceApi } from '@/services/api';
import { supabase } from '@/services/supabase/client';
import { triggerHaptic } from '@/utils/haptics';

export const TrackOrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  // Play subtle order update chime using Web Audio API
  const playUpdateChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await ecommerceApi.getOrderById(orderId);
        if (data) {
          if (lastStatusRef.current && lastStatusRef.current !== data.orderStatus) {
            playUpdateChime();
            triggerHaptic('success');
          }
          lastStatusRef.current = data.orderStatus;
          setOrder(data);
        }
      } catch (err: any) {
        setError(err.message || 'Order not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    // 1. Supabase Realtime Subscription for instantaneous order updates
    let channel: any = null;
    try {
      channel = supabase
        .channel(`order-track-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ecommerce_orders',
          },
          (payload: any) => {
            if (
              payload.new &&
              (payload.new.id === orderId || payload.new.order_no === orderId)
            ) {
              fetchOrder();
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }

    // 2. Backup auto-poll interval every 6 seconds
    const interval = setInterval(fetchOrder, 6000);

    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [orderId]);

  return (
    <div className="min-h-screen pb-24 bg-[#F4F6F8]">
      <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Back Link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary min-h-[44px]"
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
              className="bg-[#0C831F] text-white text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] inline-flex items-center"
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
