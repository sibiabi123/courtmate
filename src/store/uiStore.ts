'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  hostel: string;
  coins: number;
  role?: string;
  glickoRating: { rating: number; rd: number; vol: number };
}


interface UIState {
  currentUser: User | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
  activeModal: string | null;
  notifications: Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>;

  // Actions
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addNotification: (n: Omit<UIState['notifications'][number], 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateCoins: (amount: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      theme: 'dark',
      isSidebarOpen: false,
      activeModal: null,
      notifications: [],

      setCurrentUser: (user) =>
        set({ currentUser: user, isAuthenticated: !!user }),

      logout: () =>
        set({ currentUser: null, isAuthenticated: false }),

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      setActiveModal: (modal) => set({ activeModal: modal }),

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              id: `notif-${Date.now()}`,
              ...n,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications.slice(0, 49), // keep last 50
          ],
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      updateCoins: (amount) =>
        set((s) => ({
          currentUser: s.currentUser
            ? { ...s.currentUser, coins: s.currentUser.coins + amount }
            : null,
        })),
    }),
    {
      name: 'vit-g-hub-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
    }
  )
);
