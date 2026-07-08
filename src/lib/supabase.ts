import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined');

// Dynamic mock data for development fallback
const mockPosts = [
  {
    id: 'mock-post-1',
    sport: 'Cricket',
    ground: 'Main Ground',
    maxPlayers: 22,
    currentPlayers: 18,
    scheduledStart: new Date(Date.now() + 3600000).toISOString(),
    status: 'open',
    geoLocked: true,
    aiDescription: 'High stake hostel tournament preparation. Pitch conditions are dry. Need fast bowlers!',
    isLive: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'mock-post-2',
    sport: 'Football',
    ground: 'Main Ground',
    maxPlayers: 14,
    currentPlayers: 14,
    scheduledStart: new Date(Date.now() + 1800000).toISOString(),
    status: 'full',
    geoLocked: true,
    aiDescription: '7v7 scrimmage match. Intensity is high. Bring studs!',
    isLive: true,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'mock-post-3',
    sport: 'Badminton',
    ground: 'Indoor Court',
    maxPlayers: 4,
    currentPlayers: 2,
    scheduledStart: new Date(Date.now() + 7200000).toISOString(),
    status: 'open',
    geoLocked: false,
    aiDescription: 'Casual doubles. Intermediate skill level. Shuttles provided.',
    isLive: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  }
];

// Robust Mock Client implementation to prevent SSR crashes and allow offline demoing
const mockSupabaseClient = {
  from: (table: string) => {
    return {
      select: () => ({
        neq: () => ({
          order: () => ({
            limit: async () => ({ data: mockPosts, error: null })
          })
        }),
        eq: () => ({
          neq: () => ({
            order: () => ({
              limit: async () => ({ data: mockPosts.filter(p => p.sport === table), error: null })
            })
          })
        })
      }),
      insert: async (data: any) => ({ data, error: null }),
      update: () => ({
        eq: async () => ({ data: null, error: null })
      })
    };
  },
  channel: (name: string) => {
    return {
      on: function(event: string, filter: any, callback: (payload: any) => void) {
        // Return this for chaining
        return this;
      },
      subscribe: () => ({
        unsubscribe: () => {},
        send: async () => true
      }),
      send: async () => true
    };
  },
  removeChannel: (channel: any) => {}
} as any;

// Export either real client or mock fallback client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : mockSupabaseClient;

// Server-side Supabase (service role key — used for admin operations)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (isSupabaseConfigured && serviceKey && serviceKey !== 'undefined') {
    return createClient(supabaseUrl!, serviceKey, { auth: { persistSession: false } });
  }
  return mockSupabaseClient;
}
