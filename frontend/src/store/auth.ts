import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/api/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (u: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      initialized: false,
      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, loading: false, initialized: true });
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },
      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, loading: false, initialized: true });
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      loadUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ initialized: true });
          return;
        }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, token, initialized: true });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, initialized: true });
        }
      },
      updateUser: (u) => {
        const cur = get().user;
        if (cur) set({ user: { ...cur, ...u } });
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);
