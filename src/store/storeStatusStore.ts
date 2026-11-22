import { create } from 'zustand';
import { supabase } from '@/services/supabase/client';

export interface StoreStatusState {
  isStoreOpen: boolean;
  storeMessage: string;
  reopenTime: string;
  deliveryEta: string;
  isLoading: boolean;
  lastChecked: number | null;
  setStoreStatus: (isOpen: boolean, message?: string, reopenTime?: string, deliveryEta?: string) => void;
  setDeliveryEta: (eta: string) => void;
  fetchStoreStatus: () => Promise<void>;
  initRealtimeSubscription: () => () => void;
}

const STORAGE_KEY_OPEN = 'ydo_online_store_open';
const STORAGE_KEY_ETA = 'ydo_online_delivery_time';

const getInitialOpenState = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_OPEN);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch {}
  return true; // Default to open
};

const getInitialDeliveryEta = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ETA);
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return '15-25 mins'; // Default quick delivery ETA
};

export const useStoreStatusStore = create<StoreStatusState>((set, get) => ({
  isStoreOpen: getInitialOpenState(),
  storeMessage: 'Dukan Abhi Band Hai • Online orders resume tomorrow at 6:00 AM',
  reopenTime: '6:00 AM',
  deliveryEta: getInitialDeliveryEta(),
  isLoading: false,
  lastChecked: null,

  setStoreStatus: (isOpen: boolean, message?: string, reopenTime?: string, deliveryEta?: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_OPEN, String(isOpen));
      if (deliveryEta && deliveryEta.trim()) {
        localStorage.setItem(STORAGE_KEY_ETA, deliveryEta.trim());
      }
    } catch {}
    set((state) => ({
      isStoreOpen: isOpen,
      storeMessage:
        message ||
        (isOpen
          ? 'Store Open'
          : 'Dukan Abhi Band Hai • Online orders resume tomorrow at 6:00 AM'),
      reopenTime: reopenTime || '6:00 AM',
      deliveryEta: deliveryEta && deliveryEta.trim() ? deliveryEta.trim() : state.deliveryEta,
      lastChecked: Date.now(),
    }));
  },

  setDeliveryEta: (eta: string) => {
    if (!eta || !eta.trim()) return;
    try {
      localStorage.setItem(STORAGE_KEY_ETA, eta.trim());
    } catch {}
    set({ deliveryEta: eta.trim() });
  },

  fetchStoreStatus: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('profiles')
        .select('default_redirect_view, ecommerce_delivery_time')
        .eq('role', 'Owner')
        .single();

      if (!error && data) {
        const val = data.default_redirect_view || '';
        const isClosed = val.includes('store_closed');
        const isOpen = !isClosed;

        // Parse delivery ETA from explicit column or from tag
        let eta = (data as any).ecommerce_delivery_time;
        if (!eta && val.includes('eta_')) {
          const match = val.match(/eta_([a-zA-Z0-9_\-]+)/);
          if (match && match[1]) {
            eta = match[1].replace(/_/g, ' ');
          }
        }

        get().setStoreStatus(isOpen, undefined, undefined, eta || undefined);
      }
    } catch (err) {
      console.warn('Failed to fetch store status:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  initRealtimeSubscription: () => {
    // Initial fetch
    get().fetchStoreStatus();

    // Supabase Realtime channel for instant sync when counter staff toggles switch or updates ETA
    const channel = supabase
      .channel('store-status-sync-customer')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload: any) => {
          if (payload.new && payload.new.role === 'Owner') {
            const val = payload.new.default_redirect_view || '';
            const isClosed = val.includes('store_closed');
            let eta = payload.new.ecommerce_delivery_time;
            if (!eta && val.includes('eta_')) {
              const match = val.match(/eta_([a-zA-Z0-9_\-]+)/);
              if (match && match[1]) {
                eta = match[1].replace(/_/g, ' ');
              }
            }
            get().setStoreStatus(!isClosed, undefined, undefined, eta || undefined);
          }
        }
      )
      .subscribe();

    // Secondary poll every 30 seconds
    const interval = setInterval(() => {
      get().fetchStoreStatus();
    }, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  },
}));
