'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAppStore } from '@/store';
import { getRankTier } from '@/lib/glicko';
import { Loader2, Trophy, Medal } from 'lucide-react';

const HOSTELS = ['All Hostels', 'MH-A Block', 'MH-B Block', 'MH-C Block', 'MH-Q Block', 'MH-K Block', 'LH-A Block', 'LH-B Block', 'LH-F Block', 'Day Scholar'];

export default function LeaderboardPage() {
  const [selectedHostel, setSelectedHostel] = useState('All Hostels');
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');

  // Zustand Store
  const storeUsers = useAppStore((s) => s.users);

  // tRPC global leaderboard query
  const { data: dbLeaderboardResponse, isLoading } = trpc.leaderboard.global.useQuery({
    hostel: selectedHostel !== 'All Hostels' ? selectedHostel : undefined,
  }, {
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const dbUsers: any[] | null = dbLeaderboardResponse?.success
    ? Array.isArray(dbLeaderboardResponse.data) ? dbLeaderboardResponse.data : []
    : null;

  // Use DB data if available, otherwise fallback to store users (guarded as array)
  const safeStoreUsers = Array.isArray(storeUsers) ? storeUsers : [];
  const displayUsers = (dbUsers ?? safeStoreUsers)
    .filter((u: any) => {
      if (selectedHostel !== 'All Hostels' && u.hostel !== selectedHostel) return false;
      return !u.isBanned;
    })
    // Sort by rating descending
    .sort((a: any, b: any) => {
      const rA = typeof a.glickoRating === 'object' ? (a.glickoRating?.rating ?? 1500) : (a.glickoRating ?? 1500);
      const rB = typeof b.glickoRating === 'object' ? (b.glickoRating?.rating ?? 1500) : (b.glickoRating ?? 1500);
      return rB - rA;
    });


  // Podium (top 3)
  const top3 = displayUsers.slice(0, 3);
  const remaining = displayUsers.slice(3);

  return (
    <main className="min-h-screen pt-24 pb-20" style={{ background: '#0a0a0f' }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold font-outfit text-white flex items-center gap-2">
              <Trophy className="w-8 h-8 text-[#ffd60a]" /> Campus Rankings
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-1">Official Glicko-2 ELO leaderboards for VIT University campus athletes.</p>
          </div>

          <div className="flex gap-3">
            {/* Period selector */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              {(['week', 'month', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase transition-all capitalize cursor-pointer"
                  style={{
                    background: period === p ? '#7b2ff7' : 'transparent',
                    color: period === p ? 'white' : '#6b6b80',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Hostel filter dropdown */}
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-[#a0a0b8] focus:outline-none focus:border-[#7b2ff7] cursor-pointer"
              style={{ background: '#0a0a0f' }}
            >
              {HOSTELS.map((h) => (
                <option key={h} value={h} className="bg-[#111118] text-white">
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && dbUsers === null ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#7b2ff7] animate-spin mb-4" />
            <p className="text-[#6b6b80] text-sm">Loading ranking registry...</p>
          </div>
        ) : (
          <>
            {/* ─── Podium (Top 3) ─────────────────────────────────────────────────── */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
                {/* 2nd Place */}
                {top3[1] && (
                  <div
                    className="rounded-2xl border p-6 text-center flex flex-col items-center order-2 md:order-1"
                    style={{
                      background: 'rgba(26,26,46,0.4)',
                      borderColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="text-3xl mb-1">🥈</div>
                    <img src={top3[1].avatar} alt="" className="h-16 w-16 rounded-full bg-white/5 border-2 border-slate-400 mb-3" />
                    <h3 className="font-bold text-white text-base">{top3[1].name}</h3>
                    <p className="text-xs text-[#a0a0b8]">{top3[1].hostel}</p>
                    <div className="mt-4 font-outfit text-[#00f5d4] font-bold text-lg">
                      {Math.round((top3[1].glickoRating as any)?.rating ?? 1500)} <span className="text-[10px] text-[#6b6b80]">ELO</span>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <div
                    className="rounded-2xl border p-8 text-center flex flex-col items-center order-1 md:order-2 relative"
                    style={{
                      background: 'rgba(26,26,46,0.6)',
                      borderColor: '#ffd60a40',
                      boxShadow: '0 10px 30px rgba(255, 214, 10, 0.05)',
                    }}
                  >
                    <div className="absolute -top-6 text-4xl">👑</div>
                    <div className="text-3xl mb-1">🥇</div>
                    <img src={top3[0].avatar} alt="" className="h-20 w-20 rounded-full bg-white/5 border-2 border-[#ffd60a] mb-3" />
                    <h3 className="font-bold text-white text-lg">{top3[0].name}</h3>
                    <p className="text-xs text-[#a0a0b8]">{top3[0].hostel}</p>
                    <div className="mt-4 font-outfit text-[#ffd60a] font-bold text-2xl">
                      {Math.round((top3[0].glickoRating as any)?.rating ?? 1500)} <span className="text-xs text-[#6b6b80]">ELO</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <div
                    className="rounded-2xl border p-6 text-center flex flex-col items-center order-3 md:order-3"
                    style={{
                      background: 'rgba(26,26,46,0.4)',
                      borderColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="text-3xl mb-1">🥉</div>
                    <img src={top3[2].avatar} alt="" className="h-16 w-16 rounded-full bg-white/5 border-2 border-amber-700 mb-3" />
                    <h3 className="font-bold text-white text-base">{top3[2].name}</h3>
                    <p className="text-xs text-[#a0a0b8]">{top3[2].hostel}</p>
                    <div className="mt-4 font-outfit text-[#7b2ff7] font-bold text-lg">
                      {Math.round((top3[2].glickoRating as any)?.rating ?? 1500)} <span className="text-[10px] text-[#6b6b80]">ELO</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Rankings List Table ────────────────────────────────────────────── */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: 'rgba(26,26,46,0.3)',
                borderColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-bold uppercase tracking-wider text-[#6b6b80] bg-white/[0.02]">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-6">Player</th>
                    <th className="py-4 px-6">Hostel</th>
                    <th className="py-4 px-6">Rank Tier</th>
                    <th className="py-4 px-6 text-right">Coins</th>
                    <th className="py-4 px-6 text-right">Rating ELO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {remaining.map((user, index) => {
                    const rating = (user.glickoRating as any)?.rating ?? 1500;
                    const tier = getRankTier(rating);
                    return (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-all">
                        <td className="py-4 px-6 text-center font-bold text-[#6b6b80]">#{index + 4}</td>
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full bg-white/5" />
                          <span className="font-semibold text-white">{user.name}</span>
                        </td>
                        <td className="py-4 px-6 text-[#a0a0b8]">{user.hostel}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 font-semibold text-xs" style={{ color: tier.color }}>
                            {tier.emoji} {tier.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-[#ffd60a] font-bold">🪙 {user.coins}</td>
                        <td className="py-4 px-6 text-right text-[#00f5d4] font-bold font-outfit">{Math.round(rating)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {displayUsers.length === 0 && (
                <div className="text-center py-16 text-[#6b6b80]">
                  <div className="text-5xl mb-4">🏆</div>
                  No records found for this block.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
