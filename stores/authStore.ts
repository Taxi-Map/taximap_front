import { create } from 'zustand';
import { authService } from '../services/authService';
import type { AuthUser } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  initialize: () => Promise<void>;
  logout: () => void;
  updateUserInStore: (user: AuthUser) => void;
}

export const authStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),

  initialize: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const profile = await authService.getProfile();
      set({ user: profile, loading: false });
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_provider');
      set({ user: null, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_provider');
    set({ user: null, error: null });
  },

  updateUserInStore: (user) => set({ user }),
}));
