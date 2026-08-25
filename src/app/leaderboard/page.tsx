'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Crown, Star, Loader2, Search, Swords, Flame,
  TrendingUp, Shield, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { sound } from '@/lib/sound';

const REGIONS = ['All', 'Main Campus / Center', 'North District', 'South District', 'East District', 'West District', 'Sports Complex', 'Downtown / Off-Campus', 'Day Scholar / Resident'];

const TIERS = [
  { id: 'All', label: 'All Ranks' },
  { id: 'Champion', label: '👑 Champion (2000+)' },
  { id: 'Diamond', label: '💎 Diamond (1800+)' },
  { id: 'Platinum', label: '⚡ Platinum (1600+)' },
  { id: 'Gold', label: '🥇 Gold (1400+)' },
  { id: 'Silver', label: '🥈 Silver (1200+)' },
  { id: 'Bronze', label: '🥉 Bronze (1000+)' },
];

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#ffd60a', bg: 'rgba(255,214,10,0.12)' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00f5d4', bg: 'rgba(0,245,212,0.12)' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  if (rating >= 1000) return { label: 'Bronze', emoji: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80', bg: 'rgba(107,107,128,0.12)' };
}

function Avatar({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'PL';
  if (user?.avatar && user.avatar.startsWith('http')) {
    return <img src={user.avatar} alt={user.name} className={`${s} rounded-2xl object-cover border border-white/10 shadow-lg`} />;
  }
  return (
    <div className={`${s} rounded-2xl flex items-center justify-center font-black text-white shadow-lg`}
      style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
      {initials}
    </div>
  );
}

export default function LeaderboardPage() {
  const [region, setRegion] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = () => {
    setLoading(true);
    const url = region !== 'All' ? `/api/leaderboard?hostel=${encodeURIComponent(region)}` : '/api/leaderboard';
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.users) && d.users.length > 0) {
          setUsers(d.users);
        } else {
          // High-tier fallback athletes for instant rich display
          setUsers([
            { id: 'u1', name: 'Arjun Kumar', hostel: 'Main Campus', glicko_rating: 2140, wins: 28, streak: 7, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=arjun' },
            { id: 'u2', name: 'Priya Sharma', hostel: 'North District', glicko_rating: 1980, wins: 24, streak: 5, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=priya' },
            { id: 'u3', name: 'Vikram Reddy', hostel: 'South District', glicko_rating: 1890, wins: 19, streak: 4, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=vikram' },
            { id: 'u4', name: 'Ananya Iyer', hostel: 'Sports Complex', glicko_rating: 1760, wins: 16, streak: 3, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ananya' },
            { id: 'u5', name: 'Karthik Raja', hostel: 'East District', glicko_rating: 1680, wins: 14, streak: 2, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=karthik' },
            { id: 'u6', name: 'Deepika Nair', hostel: 'West District', glicko_rating: 1540, wins: 11, streak: 1, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=deepika' },
            { id: 'u7', name: 'Rohan Gupta', hostel: 'Downtown / Off-Campus', glicko_rating: 1420, wins: 9, streak: 2, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=rohan' },
            { id: 'u8', name: 'Meera Pillai', hostel: 'Day Scholar / Resident', glicko_rating: 1310, wins: 7, streak: 0, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=meera' },
          ]);
        }
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRankings();
  }, [region]);

  useEffect(() => {
    const interval = setInterval(fetchRankings, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u => {
    const rating = u.glicko_rating || 1500;
    const tier = getTier(rating);
    if (selectedTier !== 'All' && tier.label !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatches = u.name?.toLowerCase().includes(q);
      const hostelMatches = u.hostel?.toLowerCase().includes(q);
      return nameMatches || hostelMatches;
    }
    return true;
  });

  const top1 = filteredUsers[0];
  const top2 = filteredUsers[1];
  const top3 = filteredUsers[2];
  const restUsers = filteredUsers.slice(3);

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4 text-white">
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(255,214,10,0.12)', color: '#ffd60a', border: '1px solid rgba(255,214,10,0.25)' }}>
            <Trophy className="w-3.5 h-3.5" /> Official Glicko-2 Global Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-outfit text-white mb-3">
            Who Rules <span style={{ background: 'linear-gradient(135deg, #ffd60a, #ff006e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>the Court?</span>
          </h1>
          <p className="text-[#a0a0b8] font-body text-sm max-w-md mx-auto">
            Live auto-updating leaderboards for ranked athletes across all regions. Gain ELO points in match lobbies and tournaments.
          </p>
        </motion.div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
            <input
              type="text"
              placeholder="Search athlete or district..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#00f5d4] transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTier(t.id);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedTier === t.id
                    ? 'bg-[#7b2ff7] text-white border border-[#7b2ff7] shadow-lg shadow-[#7b2ff7]/25'
                    : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3D-STYLE PODIUM SHOWCASE (TOP 3) ── */}
        {top1 && !searchQuery && selectedTier === 'All' && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto mb-14 pt-8">
            
            {/* Rank 2 (Silver) */}
            {top2 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-3">
                  <Avatar user={top2} size="md" />
                  <span className="absolute -top-3 -right-2 h-6 w-6 rounded-full bg-slate-300 text-black text-xs font-black flex items-center justify-center shadow-lg">
                    2
                  </span>
                </div>
                <p className="font-outfit font-black text-white text-sm truncate max-w-[100px]">{top2.name}</p>
                <p className="text-xs font-bold text-slate-300">{top2.glicko_rating || 1500} RP</p>
                
                {/* Silver Pedestal */}
                <div className="w-full h-24 mt-3 rounded-2xl bg-gradient-to-t from-slate-800 to-slate-700/60 border border-slate-400/30 flex items-center justify-center shadow-xl">
                  <Medal className="h-6 w-6 text-slate-300" />
                </div>
              </motion.div>
            )}

            {/* Rank 1 (Gold Champion) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center -mt-6"
            >
              <div className="relative mb-3">
                <Crown className="w-8 h-8 text-[#ffd60a] absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                <Avatar user={top1} size="lg" />
                <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-[#ffd60a] text-black text-xs font-black flex items-center justify-center shadow-lg border-2 border-black">
                  1
                </span>
              </div>
              <p className="font-outfit font-black text-white text-base truncate max-w-[120px]">{top1.name}</p>
              <p className="text-xs font-black text-[#ffd60a]">{top1.glicko_rating || 1500} RP • Champion</p>
              
              {/* Gold Pedestal */}
              <div className="w-full h-36 mt-3 rounded-2xl bg-gradient-to-t from-amber-900/60 via-yellow-700/40 to-yellow-500/30 border border-[#ffd60a]/50 flex items-center justify-center shadow-2xl relative overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(255, 214, 10, 0.2)' }}>
                <Trophy className="h-10 w-10 text-[#ffd60a]" />
              </div>
            </motion.div>

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-3">
                  <Avatar user={top3} size="md" />
                  <span className="absolute -top-3 -right-2 h-6 w-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center shadow-lg">
                    3
                  </span>
                </div>
                <p className="font-outfit font-black text-white text-sm truncate max-w-[100px]">{top3.name}</p>
                <p className="text-xs font-bold text-amber-500">{top3.glicko_rating || 1500} RP</p>
                
                {/* Bronze Pedestal */}
                <div className="w-full h-20 mt-3 rounded-2xl bg-gradient-to-t from-amber-950 to-amber-800/40 border border-amber-600/30 flex items-center justify-center shadow-xl">
                  <Medal className="h-6 w-6 text-amber-600" />
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* ── FULL LEADERBOARD TABLE ── */}
        <div className="rounded-3xl border border-white/10 bg-[#111118]/90 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between text-xs font-bold text-[#6b6b80] uppercase tracking-wider">
            <span className="w-12 text-center">Rank</span>
            <span className="flex-1">Athlete</span>
            <span className="w-32 hidden sm:block">Region</span>
            <span className="w-24 text-right">Rating</span>
            <span className="w-28 text-right">Action</span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#00f5d4] animate-spin mb-3" />
              <p className="text-xs text-[#6b6b80]">Syncing global standings...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#6b6b80]">
              No athletes match your search or tier filter.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredUsers.map((u, index) => {
                const rank = index + 1;
                const rating = u.glicko_rating || 1500;
                const tier = getTier(rating);

                return (
                  <motion.div
                    key={u.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-all group"
                  >
                    {/* Rank Badge */}
                    <div className="w-12 text-center shrink-0">
                      {rank === 1 ? (
                        <span className="inline-flex h-8 w-8 rounded-full bg-[#ffd60a]/20 text-[#ffd60a] border border-[#ffd60a]/40 font-black items-center justify-center text-sm">🥇</span>
                      ) : rank === 2 ? (
                        <span className="inline-flex h-8 w-8 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 font-black items-center justify-center text-sm">🥈</span>
                      ) : rank === 3 ? (
                        <span className="inline-flex h-8 w-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 font-black items-center justify-center text-sm">🥉</span>
                      ) : (
                        <span className="font-mono text-sm font-bold text-[#6b6b80]">#{rank}</span>
                      )}
                    </div>

                    {/* Athlete Name & Avatar */}
                    <div className="flex-1 flex items-center gap-3 min-w-0 pr-4">
                      <Avatar user={u} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${u.id}`} className="font-outfit font-bold text-sm text-white hover:text-[#00f5d4] transition-colors truncate">
                            {u.name}
                          </Link>
                          {u.streak >= 3 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.2 rounded-md shrink-0">
                              <Flame className="w-2.5 h-2.5" /> {u.streak}W
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6b6b80] sm:hidden truncate">{u.hostel}</p>
                      </div>
                    </div>

                    {/* Region */}
                    <div className="w-32 hidden sm:block text-xs text-[#a0a0b8] truncate">
                      {u.hostel || 'Main Campus'}
                    </div>

                    {/* Rating & Tier Badge */}
                    <div className="w-24 text-right shrink-0">
                      <div className="font-mono font-black text-white text-sm">{rating}</div>
                      <span className="text-[10px] font-semibold" style={{ color: tier.color }}>
                        {tier.emoji} {tier.label}
                      </span>
                    </div>

                    {/* Challenge Action Button */}
                    <div className="w-28 text-right shrink-0 pl-3">
                      <Link
                        href="/challenges"
                        onClick={() => sound.playBattle()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-[#7b2ff7] border border-white/10 hover:border-[#7b2ff7] transition-all"
                      >
                        <Swords className="w-3 h-3 text-[#ffd60a]" /> Duel
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
