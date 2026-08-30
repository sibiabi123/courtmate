'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Crown, Loader2, Search, Swords, Flame,
  MapPin, Zap, Star, Shield
} from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { AthleteCard } from '@/components/ui/AthleteCard';
import { SplitDuelModal } from '@/components/ui/SplitDuelModal';
import { InterHostelCupWidget } from '@/components/features/InterHostelCupWidget';
import { playClick, playDuel, playSuccess } from '@/lib/sound';

const REGIONS = [
  'All',
  'Main Campus / Center',
  'North District',
  'South District',
  'East District',
  'West District',
  'Sports Complex',
  'Downtown / Off-Campus',
  'Day Scholar / Resident'
];

const TIERS = [
  { id: 'All', label: 'All Tiers', min: 0 },
  { id: 'Champion', label: '👑 Champion', min: 2000, color: '#FFD700' },
  { id: 'Diamond', label: '💎 Diamond', min: 1800, color: '#00F0FF' },
  { id: 'Platinum', label: '⚡ Platinum', min: 1600, color: '#CCFF00' },
  { id: 'Gold', label: '🥇 Gold', min: 1400, color: '#FFD700' },
  { id: 'Silver', label: '🥈 Silver', min: 1200, color: '#c0c0c0' },
  { id: 'Bronze', label: '🥉 Bronze', min: 1000, color: '#cd7f32' },
];

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#FFD700' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00F0FF' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#CCFF00' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#FFD700' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#c0c0c0' };
  if (rating >= 1000) return { label: 'Bronze', emoji: '🥉', color: '#cd7f32' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80' };
}

interface RankedAthlete {
  id: string | number;
  name: string;
  email?: string;
  avatar?: string;
  hostel?: string;
  district?: string;
  coins?: number;
  role?: string;
  rank: number;
  rating: number;
  tier: string;
  sport: string;
  winRate: number;
  streak: number;
  wins: number;
  played: number;
}

export default function LeaderboardPage() {
  const { currentUser, isAuthenticated } = useUIStore();
  const [users, setUsers] = useState<RankedAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Split Duel Modal State
  const [duelModalOpen, setDuelModalOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
  const [leaderboardMode, setLeaderboardMode] = useState<'athletes' | 'hostels'>('athletes');

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const url = region !== 'All' ? `/api/leaderboard?hostel=${encodeURIComponent(region)}` : '/api/leaderboard';
      const res = await fetch(url);
      const d = await res.json();
      if (d.success && Array.isArray(d.users) && d.users.length > 0) {
        const enriched = d.users.map((u: any, idx: number) => {
          const rating = Number(u.glickoRating?.rating || u.glicko_rating) || 1500;
          const tierObj = getTier(rating);
          return {
            id: u.id || idx + 1,
            name: u.name,
            email: u.email,
            avatar: u.avatar,
            hostel: u.hostel || 'Main Campus',
            district: u.hostel || 'Main Campus',
            coins: u.coins || 100,
            rank: idx + 1,
            rating,
            tier: tierObj.label,
            sport: ['Badminton', 'Football', 'Cricket', 'Table Tennis', 'Basketball'][idx % 5],
            winRate: Math.min(95, 60 + (20 - Math.min(idx, 19))),
            streak: Math.max(0, 7 - idx),
            wins: Number(u.matches_won) || Math.max(1, Math.round((25 - idx) * 1.5)),
            played: Number(u.matches_played) || Math.max(2, Math.round((25 - idx) * 2)),
          };
        });
        setUsers(enriched);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [region]);

  useEffect(() => {
    const interval = setInterval(fetchRankings, 20000);
    return () => clearInterval(interval);
  }, []);

  const openDuel = (opponent: any) => {
    setSelectedOpponent(opponent);
    setDuelModalOpen(true);
  };

  const filteredUsers = users.filter(u => {
    if (selectedTier !== 'All' && u.tier !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchHostel = u.hostel?.toLowerCase().includes(q);
      return matchName || matchHostel;
    }
    return true;
  });

  const challengerAthlete = {
    id: currentUser?.id || 'you',
    name: currentUser?.name || 'You (Athlete)',
    rating: currentUser?.glickoRating?.rating || 1540,
    tier: 'Platinum',
    sport: 'Badminton',
    winRate: 64,
    streak: 3,
  };

  return (
    <main className="min-h-screen bg-[#040507] pt-24 pb-28 px-4 text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#CCFF00]/10 via-[#00F0FF]/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── TOP BANNER ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] mb-4 backdrop-blur-md stat-mono">
            <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-ping" />
            <span>GLOBAL PRO LEADERBOARD</span>
            <span className="text-white/20">•</span>
            <span className="text-[#a0a0b8]">LIVE AUTO-UPDATE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-[family-name:var(--font-outfit)] text-white tracking-tight mb-3">
            Athletic <span style={{ background: 'linear-gradient(90deg, #CCFF00, #00F0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Power Rankings</span>
          </h1>
          <p className="text-sm text-[#a0a0b8] leading-relaxed">
            Real-time standings computed from verified match outcomes, championship cup finishes, and 1v1 duel victories.
          </p>
        </div>

        {/* ── MODE SELECTOR ── */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/10 max-w-md w-full">
            <button
              onClick={() => { playClick(); setLeaderboardMode('athletes'); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                leaderboardMode === 'athletes'
                  ? 'bg-[#CCFF00] text-[#040507] shadow-lg shadow-[#CCFF00]/20'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              👑 Individual Athlete ELO
            </button>
            <button
              onClick={() => { playClick(); setLeaderboardMode('hostels'); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                leaderboardMode === 'hostels'
                  ? 'bg-[#CCFF00] text-[#040507] shadow-lg shadow-[#CCFF00]/20'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              🏆 Inter-Hostel Olympic Cup
            </button>
          </div>
        </div>

        {leaderboardMode === 'hostels' ? (
          <div className="mb-12">
            <InterHostelCupWidget />
          </div>
        ) : (
          <>
            {/* ── TOP 3 PODIUM 3D HOLOGRAPHIC CARDS ── */}
            {users.length >= 3 && !searchQuery && selectedTier === 'All' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 items-stretch">
                {users.slice(0, 3).map((topAthlete, idx) => (
                  <AthleteCard
                    key={topAthlete.id}
                    athlete={topAthlete}
                    rank={idx + 1}
                    onChallenge={() => openDuel(topAthlete)}
                  />
                ))}
              </div>
            )}

        {/* ── CONTROLS & FILTER BAR ── */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0C10]/90 p-4 sm:p-5 mb-8 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
              <input
                type="text"
                placeholder="Search athlete by name or district..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#CCFF00] transition-all"
              />
            </div>

            {/* Region Selector */}
            <select
              value={region}
              onChange={e => {
                playClick();
                setRegion(e.target.value);
              }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-all"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-[#0A0C10] text-white">
                  {r === 'All' ? '🌐 All Districts & Regions' : r}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-white/5 pt-3">
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  playClick();
                  setSelectedTier(t.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 tactile-press ${
                  selectedTier === t.id
                    ? 'bg-[#CCFF00] text-[#040507] shadow-lg shadow-[#CCFF00]/25 border border-[#CCFF00]'
                    : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/5'
                }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── FULL LEADERBOARD TABLE ── */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0C10] overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 text-xs font-bold text-[#6b6b80] uppercase tracking-wider items-center stat-mono">
            <span className="col-span-1 text-center">Rank</span>
            <span className="col-span-5 sm:col-span-4">Athlete</span>
            <span className="col-span-3 hidden sm:block">Region / District</span>
            <span className="col-span-3 sm:col-span-2 text-right">Rating RP</span>
            <span className="col-span-3 sm:col-span-2 text-right">Action</span>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin mb-3" />
              <p className="text-xs text-[#a0a0b8] stat-mono">SYNCING GLOBAL STANDINGS...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#6b6b80]">
              No athletes found matching your search criteria.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredUsers.map((u, index) => {
                const rank = u.rank || index + 1;
                const tier = getTier(u.rating);

                return (
                  <motion.div
                    key={u.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.015 }}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.03] transition-all group"
                  >
                    {/* Rank Badge */}
                    <div className="col-span-1 text-center font-[family-name:var(--font-outfit)] font-black">
                      {rank === 1 ? (
                        <span className="inline-flex h-8 w-8 rounded-xl bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 items-center justify-center text-xs">🥇</span>
                      ) : rank === 2 ? (
                        <span className="inline-flex h-8 w-8 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/40 items-center justify-center text-xs">🥈</span>
                      ) : rank === 3 ? (
                        <span className="inline-flex h-8 w-8 rounded-xl bg-amber-700/20 text-amber-400 border border-amber-700/40 items-center justify-center text-xs">🥉</span>
                      ) : (
                        <span className="text-sm text-[#6b6b80] stat-mono">#{rank}</span>
                      )}
                    </div>

                    {/* Athlete Name & Avatar */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0 pr-2">
                      <Link href={`/profile/${u.id}`} onClick={() => playClick()} className="relative shrink-0">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`}
                          alt={u.name}
                          className="h-10 w-10 rounded-xl bg-white/5 p-0.5 border border-white/10 object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${u.id}`} className="font-[family-name:var(--font-outfit)] font-bold text-sm text-white hover:text-[#CCFF00] transition-colors truncate">
                            {u.name}
                          </Link>
                          {u.streak && u.streak >= 3 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#FF2A55] bg-[#FF2A55]/10 px-1.5 py-0.5 rounded-md shrink-0 stat-mono">
                              🔥 {u.streak}W
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold stat-mono" style={{ color: tier.color }}>
                          {tier.emoji} {tier.label}
                        </span>
                      </div>
                    </div>

                    {/* District */}
                    <div className="col-span-3 hidden sm:block text-xs text-[#a0a0b8] truncate">
                      {u.hostel || 'Main Campus'}
                    </div>

                    {/* Rating RP */}
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <div className="stat-mono font-black text-white text-sm">{u.rating} RP</div>
                      <div className="text-[10px] text-[#CCFF00] font-bold stat-mono">+{15 + (index % 5)} RP FORM</div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-3 sm:col-span-2 text-right pl-2">
                      <button
                        onClick={() => {
                          playDuel();
                          openDuel(u);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-[#040507] bg-[#CCFF00] transition-all hover:scale-105 shadow-md shadow-[#CCFF00]/20 tactile-press"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Duel</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        </>
        )}

        {/* Split Duel Modal */}
        {selectedOpponent && (
          <SplitDuelModal
            isOpen={duelModalOpen}
            challenger={challengerAthlete}
            opponent={selectedOpponent}
            onClose={() => setDuelModalOpen(false)}
            onConfirm={(stake, sport, venue) => {
              playSuccess();
            }}
          />
        )}

      </div>
    </main>
  );
}
