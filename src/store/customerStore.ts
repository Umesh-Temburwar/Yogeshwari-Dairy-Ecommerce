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

export const isDummyAddress = (addr: DeliveryAddress): boolean => {
  if (!addr || !addr.id) return true;
  if (addr.id === 'addr_home' || addr.id === 'addr_shop' || addr.id === 'addr_work') return true;
  const str = `${addr.name || ''} ${addr.street || ''} ${addr.city || ''} ${addr.landmark || ''} ${addr.area || ''}`.toLowerCase();
  return (
    str.includes('nagpur') ||
    str.includes('ramdas peth') ||
    str.includes('dharampeth') ||
    str.includes('sai complex') ||
    str.includes('it park') ||
    str.includes('vnit') ||
    str.includes('ramesh kumar') ||
    addr.phone === '9876543210'
  );
};

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
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
        const cleanedName = name.trim();
        set((state) => {
          // Keep active address in sync with customer contact details
          const updatedAddresses = state.savedAddresses.map((addr) => {
            if (addr.id === state.selectedAddressId || state.savedAddresses.length === 1) {
              return {
                ...addr,
                name: cleanedName || addr.name,
                phone: cleanedPhone || addr.phone,
              };
            }
            return addr;
          });
          return {
            customerName: cleanedName,
            customerPhone: cleanedPhone,
            customerProfile: {
              ...state.customerProfile,
              name: cleanedName,
              phone: cleanedPhone,
              role: 'customer',
            },
            savedAddresses: updatedAddresses,
          };
        });
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
        set((state) => {
          const finalName = (newAddr.name && newAddr.name.trim()) || state.customerName;
          const finalPhone = (newAddr.phone && newAddr.phone.trim()) || state.customerPhone;
          return {
            customerName: finalName || state.customerName,
            customerPhone: finalPhone || state.customerPhone,
            customerProfile: {
              ...state.customerProfile,
              name: finalName || state.customerProfile.name,
              phone: finalPhone || state.customerProfile.phone,
            },
            savedAddresses: [
              ...state.savedAddresses,
              { ...newAddr, name: finalName, phone: finalPhone, id },
            ],
            selectedAddressId: id,
          };
        });
      },

      updateAddress: (id, updated) => {
        set((state) => {
          const updatedAddresses = state.savedAddresses.map((addr) =>
            addr.id === id ? { ...addr, ...updated } : addr
          );
          const isSelected = state.selectedAddressId === id || state.savedAddresses.length === 1;
          const newName = isSelected && updated.name ? updated.name : state.customerName;
          const newPhone = isSelected && updated.phone ? updated.phone : state.customerPhone;
          return {
            savedAddresses: updatedAddresses,
            customerName: newName,
            customerPhone: newPhone,
            customerProfile: {
              ...state.customerProfile,
              name: newName,
              phone: newPhone,
            },
          };
        });
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
        const cleanAddresses = state.savedAddresses.filter((a) => !isDummyAddress(a));
        if (cleanAddresses.length === 0) {
          return EMPTY_ADDRESS;
        }
        const found = cleanAddresses.find((a) => a.id === state.selectedAddressId);
        const active = found || cleanAddresses[0] || EMPTY_ADDRESS;
        return {
          ...active,
          name: active.name || state.customerName || '',
          phone: active.phone || state.customerPhone || '',
        };
      },
    }),
    {
      name: 'yd_customer_storage_v5',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Purge dummy addresses
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
    ['yd_customer_storage', 'yd_customer_storage_v1', 'yd_customer_storage_v2', 'yd_customer_storage_v3', 'yd_customer_storage_v4'].forEach((k) => {
      window.localStorage.removeItem(k);
    });
    const current = window.localStorage.getItem('yd_customer_storage_v5');
    if (current && (
      current.includes('Nagpur') ||
      current.includes('9876543210') ||
      current.includes('Ramdas Peth') ||
      current.includes('Dharampeth') ||
      current.includes('Sai Complex') ||
      current.includes('IT Park') ||
      current.includes('Ramesh Kumar')
    )) {
      window.localStorage.removeItem('yd_customer_storage_v5');
    }
  } catch {
    // ignore
  }
}
