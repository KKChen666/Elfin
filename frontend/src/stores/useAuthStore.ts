import { create } from 'zustand';
import { authApi, User } from '../api/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,

  login: async (username, password) => {
    const res = await authApi.login(username, password);
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    set({ token });
    const userRes = await authApi.getMe();
    set({ user: userRes.data, isLoading: false });
  },

  register: async (username, password) => {
    await authApi.register(username, password);
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await authApi.getMe();
      set({ user: res.data, token, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
