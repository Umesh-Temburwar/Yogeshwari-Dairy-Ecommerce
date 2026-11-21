import { DeliveryAddress, PaymentMethod } from '@/types/ecommerce';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr_home',
    label: 'Home',
    name: 'Ramesh Kumar',
    phone: '9370869896',
    houseNo: 'House 14',
    street: 'Mandi Bazar, Mangalwar Peth Road',
    area: 'Mandi Bazar',
    landmark: 'Near Masjid',
    city: 'Ambajogai',
    state: 'Maharashtra',
    pincode: '431517',
    latitude: 18.7304,
    longitude: 76.3879,
    isConfirmedOnMap: true,
    isDefault: true,
  },
  {
    id: 'addr_shop',
    label: 'Shop',
    name: 'Yogeshwari Dairy Counter',
    phone: '9370869896',
    houseNo: 'Shop No. 1',
    street: 'Main Market, Mandi Bazar Road',
    area: 'Mandi Bazar',
    landmark: 'Mangalwar Peth Road',
    city: 'Ambajogai',
    state: 'Maharashtra',
    pincode: '431517',
    latitude: 18.7312,
    longitude: 76.3885,
    isConfirmedOnMap: true,
    isDefault: false,
  },
  {
    id: 'addr_work',
    label: 'Work',
    name: 'Ramesh Kumar',
    phone: '9370869896',
    houseNo: 'Office 202',
    street: 'Near Yogeshwari Devi Mandir',
    area: 'Mandir Road',
    landmark: 'Main Gate',
    city: 'Ambajogai',
    state: 'Maharashtra',
    pincode: '431517',
    latitude: 18.7335,
    longitude: 76.3842,
    isConfirmedOnMap: true,
    isDefault: false,
  },
];

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
        id: 'cust_default_ramesh',
        name: 'Ramesh Kumar',
        phone: '9876543210',
        role: 'customer',
      },
      customerName: 'Ramesh Kumar',
      customerPhone: '9876543210',
      savedAddresses: DEFAULT_ADDRESSES,
      selectedAddressId: DEFAULT_ADDRESSES[0].id,
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
        const found = state.savedAddresses.find((a) => a.id === state.selectedAddressId);
        return found || state.savedAddresses[0] || DEFAULT_ADDRESSES[0];
      },
    }),
    {
      name: 'yd_customer_storage_v1',
    }
  )
);
