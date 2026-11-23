import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/ecommerce';
import { WishlistItem } from '@/types/flipkart';

interface WishlistState {
  items: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product: Product) => {
        const { items } = get();
        const exists = items.some((item) => item.productId === product.id);
        if (exists) {
          set({ items: items.filter((item) => item.productId !== product.id) });
        } else {
          set({
            items: [
              {
                productId: product.id,
                addedAt: new Date().toISOString(),
                product,
              },
              ...items,
            ],
          });
        }
      },

      addToWishlist: (product: Product) => {
        const { items } = get();
        if (!items.some((item) => item.productId === product.id)) {
          set({
            items: [
              {
                productId: product.id,
                addedAt: new Date().toISOString(),
                product,
              },
              ...items,
            ],
          });
        }
      },

      removeFromWishlist: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getWishlistCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'yd_wishlist_storage_v1',
    }
  )
);
