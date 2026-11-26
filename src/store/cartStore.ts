import { CartItem, Product } from '@/types/ecommerce';
import { triggerHaptic } from '@/utils/haptics';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const FREE_DELIVERY_THRESHOLD =
  Number(import.meta.env.VITE_FREE_DELIVERY_THRESHOLD) || 300;
export const STANDARD_DELIVERY_FEE =
  Number(import.meta.env.VITE_STANDARD_DELIVERY_FEE) || 30;

interface CartStore {
  items: CartItem[];
  isCartDrawerOpen: boolean;
  tipAmount: number;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  setTipAmount: (tip: number) => void;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  getItemQuantity: (productId: string) => number;
  getSubtotal: () => number;
  getTotalItemsCount: () => number;
  getDeliveryFee: () => number;
  getHandlingFee: () => number;
  getTotalSavings: () => number;
  getAmountNeededForFreeDelivery: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartDrawerOpen: false,
      tipAmount: 0,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
      setTipAmount: (tip: number) => set({ tipAmount: Math.max(0, tip) }),

      addItem: (product: Product, quantity: number = 1) => {
        triggerHaptic('medium');
        set((state) => {
          const maxStock = product.stockQuantity || 99;
          const existingIndex = state.items.findIndex((item) => item.productId === product.id);
          if (existingIndex > -1) {
            const updated = [...state.items];
            const newQty = updated[existingIndex].quantity + quantity;
            // Cap at available stock
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: Math.min(newQty, maxStock),
            };
            return { items: updated };
          }
          return {
            items: [
              ...state.items,
              { productId: product.id, product, quantity: Math.min(quantity, maxStock) },
            ],
          };
        });
      },

      removeItem: (productId: string) => {
        triggerHaptic('light');
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        triggerHaptic('light');
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }
          return {
            items: state.items.map((item) => {
              if (item.productId === productId) {
                const maxStock = item.product.stockQuantity || 99;
                return { ...item, quantity: Math.min(quantity, maxStock) };
              }
              return item;
            }),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((i) => i.productId === productId);
        return item ? item.quantity : 0;
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
      },

      getHandlingFee: () => {
        const subtotal = get().getSubtotal();
        return subtotal > 0 ? 2 : 0;
      },

      getTotalSavings: () => {
        return get().items.reduce((sum, item) => {
          const mrp = item.product.mrp || item.product.price;
          const diff = Math.max(0, mrp - item.product.price);
          return sum + diff * item.quantity;
        }, 0);
      },

      getAmountNeededForFreeDelivery: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + get().getDeliveryFee() + get().getHandlingFee() + get().tipAmount;
      },
    }),
    {
      name: 'yd_cart_storage_v1',
      partialize: (state) => ({ items: state.items }),
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
          try {
            const str = localStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch {
              // ignore
            }
          }
        },
        removeItem: (name) => {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              localStorage.removeItem(name);
            } catch {
              // ignore
            }
          }
        },
      },
    }
  )
);
