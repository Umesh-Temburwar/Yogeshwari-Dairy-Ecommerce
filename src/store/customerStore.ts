import { DeliveryAddress, PaymentMethod } from '@/types/ecommerce';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const EMPTY_ADDRESS: DeliveryAddress = {
  id: '',
  label: 'Home',
  name: '',
  phone: '',
  houseNo: '',
  street: '',
  area: '',
  landmark: '',
  city: 'Ambajogai',
  state: 'Maharashtra',
  pincode: '431517',
  isConfirmedOnMap: false,
  isDefault: false,
};

const isDummyAddress = (addr: DeliveryAddress): boolean => {
  return Boolean(
    !addr ||
    !addr.id ||
    addr.id === 'addr_home' ||
    addr.id === 'addr_shop' ||
    addr.id === 'addr_work' ||
    addr.name === 'Ramesh Kumar' ||
    addr.phone === '9876543210' ||
    addr.city === 'Nagpur' ||
    (addr.street && addr.street.includes('Ramdas Peth')) ||
    (addr.street && addr.street.includes('Dharampeth')) ||
    (addr.street && addr.street.includes('Sai Complex')) ||
    (addr.street && addr.street.includes('IT Park')) ||
    (addr.landmark && addr.landmark.includes('Hanuman Mandir')) ||
    (addr.landmark && addr.landmark.includes('VNIT'))
  );
};

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  // Strict Security Rule: Customers cannot be assigned administrative roles
  readonly role: 'customer';
}

interface CustomerStore {
  customerProfile: CustomerProfile;
  customerName: string;
  customerPhone: string;
  savedAddresses: DeliveryAddress[];
  selectedAddressId: string;
  selectedPaymentMethod: PaymentMethod;
  deliveryNotes: string;
  activeOrderIds: string[];

  setCustomerProfile: (name: string, phone: string) => void;
  setSelectedAddressId: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => void;
  updateAddress: (id: string, updated: Partial<DeliveryAddress>) => void;
  deleteAddress: (id: string) => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  setDeliveryNotes: (notes: string) => void;
  addActiveOrderId: (orderId: string) => void;
  removeActiveOrderId: (orderId: string) => void;

  getSelectedAddress: () => DeliveryAddress;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customerProfile: {
        id: '',
        name: '',
        phone: '',
        role: 'customer',
      },
      customerName: '',
      customerPhone: '',
      savedAddresses: [],
      selectedAddressId: '',
      selectedPaymentMethod: 'cod',
      deliveryNotes: '',
      activeOrderIds: [],

      setCustomerProfile: (name, phone) => {
        const cleanedPhone = phone.trim();
        set((state) => ({
          customerName: name.trim(),
          customerPhone: cleanedPhone,
          customerProfile: {
            ...state.customerProfile,
            name: name.trim(),
            phone: cleanedPhone,
            role: 'customer', // Immutable customer role
          },
        }));
      },

      setSelectedAddressId: (id) => set({ selectedAddressId: id }),

      setDefaultAddress: (id) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          })),
          selectedAddressId: id,
        }));
      },

      addAddress: (newAddr) => {
        const id = `addr_${Date.now()}`;
        set((state) => ({
          savedAddresses: [...state.savedAddresses, { ...newAddr, id }],
          selectedAddressId: id,
        }));
      },

      updateAddress: (id, updated) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.map((addr) =>
            addr.id === id ? { ...addr, ...updated } : addr
          ),
        }));
      },

      deleteAddress: (id) => {
        set((state) => {
          const remaining = state.savedAddresses.filter((addr) => addr.id !== id);
          const nextSelected = state.selectedAddressId === id
            ? (remaining[0]?.id || '')
            : state.selectedAddressId;
          return {
            savedAddresses: remaining,
            selectedAddressId: nextSelected,
          };
        });
      },

      setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

      setDeliveryNotes: (notes) => set({ deliveryNotes: notes }),

      addActiveOrderId: (orderId) =>
        set((state) => ({
          activeOrderIds: Array.from(new Set([orderId, ...state.activeOrderIds])),
        })),

      removeActiveOrderId: (orderId) =>
        set((state) => ({
          activeOrderIds: state.activeOrderIds.filter((id) => id !== orderId),
        })),

      getSelectedAddress: () => {
        const state = get();
        if (!state.savedAddresses || state.savedAddresses.length === 0) {
          return EMPTY_ADDRESS;
        }
        const found = state.savedAddresses.find((a) => a.id === state.selectedAddressId);
        return found || state.savedAddresses[0] || EMPTY_ADDRESS;
      },
    }),
    {
      name: 'yd_customer_storage_v4',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Clean out old dummy addresses if previously stored
        if (Array.isArray(state.savedAddresses)) {
          state.savedAddresses = state.savedAddresses.filter((a) => !isDummyAddress(a));
          if (!state.savedAddresses.some((a) => a.id === state.selectedAddressId)) {
            state.selectedAddressId = state.savedAddresses[0]?.id || '';
          }
        }
        if (state.customerName && (state.customerName.toLowerCase().includes('ramesh') || state.customerName.toLowerCase() === 'customer')) {
          state.customerName = '';
        }
        if (state.customerPhone && (state.customerPhone.includes('9876543210') || state.customerPhone.includes('9370869896'))) {
          state.customerPhone = '';
        }
        if (state.customerProfile && state.customerProfile.name && state.customerProfile.name.toLowerCase().includes('ramesh')) {
          state.customerProfile = {
            id: '',
            name: '',
            phone: '',
            role: 'customer',
          };
        }
      },
    }
  )
);

// Clean up all legacy dummy storage keys completely from browser
if (typeof window !== 'undefined') {
  try {
    ['yd_customer_storage', 'yd_customer_storage_v1', 'yd_customer_storage_v2', 'yd_customer_storage_v3'].forEach((k) => {
      window.localStorage.removeItem(k);
    });
    const current = window.localStorage.getItem('yd_customer_storage_v4');
    if (current && (
      current.includes('Nagpur') ||
      current.includes('9876543210') ||
      current.includes('Ramdas Peth') ||
      current.includes('Dharampeth') ||
      current.includes('Sai Complex') ||
      current.includes('IT Park') ||
      current.includes('Ramesh Kumar')
    )) {
      window.localStorage.removeItem('yd_customer_storage_v4');
    }
  } catch {
    // ignore
  }
}
