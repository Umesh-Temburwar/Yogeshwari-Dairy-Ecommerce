import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/ecommerce';

interface SaveForLaterState {
  items: Product[];
  saveForLater: (product: Product) => void;
  moveToCart: (productId: string) => Product | undefined;
  removeFromSaved: (productId: string) => void;
}

export const useSaveForLaterStore = create<SaveForLaterState>()(
  persist(
    (set, get) => ({
      items: [],

      saveForLater: (product: Product) => {
        const { items } = get();
        if (!items.some((p) => p.id === product.id)) {
          set({ items: [product, ...items] });
        }
      },

      moveToCart: (productId: string) => {
        const { items } = get();
        const found = items.find((p) => p.id === productId);
        if (found) {
          set({ items: items.filter((p) => p.id !== productId) });
        }
        return found;
      },

      removeFromSaved: (productId: string) => {
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }));
      },
    }),
    {
      name: 'yd_save_for_later_v1',
    }
  )
);
