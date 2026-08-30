'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  hostel: string;
  collegeId?: string;
  collegeName?: string;
  isVerifiedStudent?: boolean;
  isPro?: boolean;
  coins: number;
  role?: string;
  glickoRating: { rating: number; rd: number; vol: number };
}

interface CoinTransaction {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface UIState {
  currentUser: User | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
  activeModal: string | null;
  notifications: Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>;
  coinHistory: CoinTransaction[];
  lastDailyClaim: string | null; // ISO date string
  hasCompletedOnboarding: boolean;
  totalMatchesJoined: number;
  totalMatchesPosted: number;
  totalChallengesIssued: number;

  // Actions
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addNotification: (n: Omit<UIState['notifications'][number], 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateCoins: (amount: number, reason?: string) => void;
  addCoins: (amount: number, reason?: string) => void;
  claimDailyBonus: () => number; // returns coins earned (0 if already claimed)
  completeOnboarding: () => void;
  incrementMatchesJoined: () => void;
  incrementMatchesPosted: () => void;
  incrementChallengesIssued: () => void;
  canClaimDaily: () => boolean;
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
      coinHistory: [],
      lastDailyClaim: null,
      hasCompletedOnboarding: false,
      totalMatchesJoined: 0,
      totalMatchesPosted: 0,
      totalChallengesIssued: 0,

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
            ...s.notifications.slice(0, 49),
          ],
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      updateCoins: (amount, reason = 'Activity Reward') =>
        set((s) => ({
          currentUser: s.currentUser
            ? { ...s.currentUser, coins: Math.max(0, s.currentUser.coins + amount) }
            : null,
          coinHistory: amount > 0 ? [
            {
              id: `tx-${Date.now()}`,
              amount,
              reason,
              createdAt: new Date().toISOString(),
            },
            ...s.coinHistory.slice(0, 99),
          ] : s.coinHistory,
        })),

      addCoins: (amount, reason = 'Coin Store Purchase') =>
        get().updateCoins(amount, reason),

      canClaimDaily: () => {
        const { lastDailyClaim, isAuthenticated } = get();
        if (!isAuthenticated) return false;
        if (!lastDailyClaim) return true;
        const last = new Date(lastDailyClaim);
        const now = new Date();
        return (
          last.getDate() !== now.getDate() ||
          last.getMonth() !== now.getMonth() ||
          last.getFullYear() !== now.getFullYear()
        );
      },

      claimDailyBonus: () => {
        const { canClaimDaily, currentUser, coinHistory } = get();
        if (!canClaimDaily() || !currentUser) return 0;

        const streakDays = coinHistory.filter(tx => {
          const d = new Date(tx.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7 && tx.reason === 'Daily Login Bonus';
        }).length;

        const bonus = Math.min(50 + streakDays * 10, 150);

        set((s) => ({
          lastDailyClaim: new Date().toISOString(),
          currentUser: s.currentUser
            ? { ...s.currentUser, coins: s.currentUser.coins + bonus }
            : null,
          coinHistory: [
            { id: `tx-${Date.now()}`, amount: bonus, reason: 'Daily Login Bonus', createdAt: new Date().toISOString() },
            ...s.coinHistory.slice(0, 99),
          ],
        }));
        return bonus;
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      incrementMatchesJoined: () =>
        set((s) => ({ totalMatchesJoined: s.totalMatchesJoined + 1 })),

      incrementMatchesPosted: () =>
        set((s) => ({ totalMatchesPosted: s.totalMatchesPosted + 1 })),

      incrementChallengesIssued: () =>
        set((s) => ({ totalChallengesIssued: s.totalChallengesIssued + 1 })),
    }),
    {
      name: 'courtmate-ui-store-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        coinHistory: state.coinHistory,
        lastDailyClaim: state.lastDailyClaim,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        totalMatchesJoined: state.totalMatchesJoined,
        totalMatchesPosted: state.totalMatchesPosted,
        totalChallengesIssued: state.totalChallengesIssued,
      }),
    }
  )
);
