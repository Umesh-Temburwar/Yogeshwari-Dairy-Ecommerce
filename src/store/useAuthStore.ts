import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '@/types/auth';
import { authService } from '@/services/authService';
import { useCustomerStore } from './customerStore';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  loginWithOtp: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (payload: { name: string; phone: string; email?: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setUser: (user: AuthUser, token?: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      setUser: (user, token) => {
        set((state) => ({
          user,
          token: token || state.token,
          isAuthenticated: true,
          error: null,
        }));
        // Sync with customerStore
        useCustomerStore.getState().setCustomerProfile(user.name, user.phone);
      },

      sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.sendOtp(phone);
          set({ isLoading: false });
          return res;
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          return { success: false, message: err.message };
        }
      },

      loginWithOtp: async (phone, otp, name) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.verifyOtp(phone, otp, name);
          if (res.success && res.user) {
            get().setUser(res.user, res.token);
            set({ isLoading: false });
            return { success: true, message: res.message };
          }
          set({ isLoading: false, error: res.message });
          return { success: false, message: res.message };
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          return { success: false, message: err.message };
        }
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.loginWithEmail(email, password);
          if (res.success && res.user) {
            get().setUser(res.user, res.token);
            set({ isLoading: false });
            return { success: true, message: res.message };
          }
          set({ isLoading: false, error: res.message });
          return { success: false, message: res.message };
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          return { success: false, message: err.message };
        }
      },

      registerUser: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.register(payload);
          if (res.success && res.user) {
            get().setUser(res.user, res.token);
            set({ isLoading: false });
            return { success: true, message: res.message };
          }
          set({ isLoading: false, error: res.message });
          return { success: false, message: res.message };
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          return { success: false, message: err.message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear customer profile in customer store
        useCustomerStore.getState().setCustomerProfile('', '');
      },
    }),
    {
      name: 'yd_auth_storage_v1',
    }
  )
);
