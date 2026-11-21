import { create } from 'zustand';
import { supabase } from '@/services/supabase/client';

export interface StoreStatusState {
  isStoreOpen: boolean;
  storeMessage: string;
  reopenTime: string;
  isLoading: boolean;
  lastChecked: number | null;
  setStoreStatus: (isOpen: boolean, message?: string, reopenTime?: string) => void;
  fetchStoreStatus: () => Promise<void>;
  initRealtimeSubscription: () => () => void;
}

const STORAGE_KEY = 'ydo_online_store_open';

const getInitialOpenState = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
  } catch {}
  return true; // Default to open
};

export const useStoreStatusStore = create<StoreStatusState>((set, get) => ({
  isStoreOpen: getInitialOpenState(),
  storeMessage: 'Dukan Abhi Band Hai • Online orders resume tomorrow at 6:00 AM',
  reopenTime: '6:00 AM',
  isLoading: false,
  lastChecked: null,

  setStoreStatus: (isOpen: boolean, message?: string, reopenTime?: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    } catch {}
    set({
      isStoreOpen: isOpen,
      storeMessage:
        message ||
        (isOpen
          ? 'Store Open'
          : 'Dukan Abhi Band Hai • Online orders resume tomorrow at 6:00 AM'),
      reopenTime: reopenTime || '6:00 AM',
      lastChecked: Date.now(),
    });
  },

  fetchStoreStatus: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('profiles')
        .select('default_redirect_view')
        .eq('role', 'Owner')
        .single();

      if (!error && data && data.default_redirect_view) {
        const isClosed = data.default_redirect_view.includes('store_closed');
        const isOpen = !isClosed;
        get().setStoreStatus(isOpen);
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

    // Supabase Realtime channel for instant sync when counter staff toggles switch
    const channel = supabase
      .channel('store-status-sync-customer')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload: any) => {
          if (payload.new && payload.new.role === 'Owner' && payload.new.default_redirect_view) {
            const isClosed = payload.new.default_redirect_view.includes('store_closed');
            get().setStoreStatus(!isClosed);
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
