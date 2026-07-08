'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// ─── IDB Schema ────────────────────────────────────────────────────────────────
interface OfflineDB extends DBSchema {
  queue: {
    key: number;
    value: OfflineMutation;
    indexes: { 'by-timestamp': number };
  };
}

export interface OfflineMutation {
  id?: number;
  procedure: string;  // e.g. 'post.create', 'match.checkIn'
  input: unknown;
  timestamp: number;
  retries: number;
}

// ─── IDB Instance ─────────────────────────────────────────────────────────────
let dbInstance: IDBPDatabase<OfflineDB> | null = null;

async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<OfflineDB>('vit-g-hub-offline', 1, {
    upgrade(db) {
      const store = db.createObjectStore('queue', {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('by-timestamp', 'timestamp');
    },
  });
  return dbInstance;
}

export async function enqueueOfflineMutation(mutation: Omit<OfflineMutation, 'id'>): Promise<void> {
  const db = await getDB();
  await db.add('queue', mutation);
}

export async function getQueuedMutations(): Promise<OfflineMutation[]> {
  const db = await getDB();
  return db.getAllFromIndex('queue', 'by-timestamp');
}

export async function removeMutation(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('queue', id);
}

export async function clearQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('queue');
}

// ─── Zustand Offline Queue Store ──────────────────────────────────────────────
interface OfflineQueueState {
  isOnline: boolean;
  pendingCount: number;
  isFlushing: boolean;
  setOnline: (online: boolean) => void;
  setPendingCount: (count: number) => void;
  enqueue: (mutation: Omit<OfflineMutation, 'id'>) => Promise<void>;
  flush: (executor: (mutation: OfflineMutation) => Promise<boolean>) => Promise<void>;
  syncPendingCount: () => Promise<void>;
}

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount: 0,
      isFlushing: false,

      setOnline: (online: boolean) => set({ isOnline: online }),
      setPendingCount: (count: number) => set({ pendingCount: count }),

      enqueue: async (mutation) => {
        await enqueueOfflineMutation({ ...mutation, timestamp: Date.now(), retries: 0 });
        const mutations = await getQueuedMutations();
        set({ pendingCount: mutations.length });
      },

      flush: async (executor) => {
        const { isFlushing } = get();
        if (isFlushing) return;

        set({ isFlushing: true });
        try {
          const mutations = await getQueuedMutations();
          for (const mutation of mutations) {
            try {
              const success = await executor(mutation);
              if (success && mutation.id != null) {
                await removeMutation(mutation.id);
              }
            } catch {
              // Failed — will retry on next flush
            }
          }
          const remaining = await getQueuedMutations();
          set({ pendingCount: remaining.length });
        } finally {
          set({ isFlushing: false });
        }
      },

      syncPendingCount: async () => {
        const mutations = await getQueuedMutations();
        set({ pendingCount: mutations.length });
      },
    }),
    {
      name: 'vit-offline-queue-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isOnline: state.isOnline,
        pendingCount: state.pendingCount,
      }),
    }
  )
);

// ─── Network Listener Hook ────────────────────────────────────────────────────
/**
 * Use this hook in your root layout to auto-flush the queue when coming online.
 * Pass a flush executor function that calls tRPC.
 */
export function useNetworkSync(executor?: (mutation: OfflineMutation) => Promise<boolean>) {
  const { setOnline, flush, syncPendingCount } = useOfflineQueue();

  if (typeof window !== 'undefined') {
    const handleOnline = async () => {
      setOnline(true);
      if (executor) {
        await flush(executor);
      }
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    syncPendingCount().catch(() => {});
  }
}
