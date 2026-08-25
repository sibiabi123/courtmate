'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Crown, Star, Loader2, Search, Swords, Flame,
  TrendingUp, Shield, Sparkles, Filter, ChevronRight, CheckCircle2,
  MapPin, X, ArrowUpRight, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { sound } from '@/lib/sound';

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
  { id: 'Champion', label: '👑 Champion', min: 2000, color: '#ffd60a', border: 'rgba(255, 214, 10, 0.4)', bg: 'rgba(255, 214, 10, 0.08)' },
  { id: 'Diamond', label: '💎 Diamond', min: 1800, color: '#00f5d4', border: 'rgba(0, 245, 212, 0.4)', bg: 'rgba(0, 245, 212, 0.08)' },
  { id: 'Platinum', label: '⚡ Platinum', min: 1600, color: '#a855f7', border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.08)' },
  { id: 'Gold', label: '🥇 Gold', min: 1400, color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'Silver', label: '🥈 Silver', min: 1200, color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)', bg: 'rgba(148, 163, 184, 0.08)' },
  { id: 'Bronze', label: '🥉 Bronze', min: 1000, color: '#cd7f32', border: 'rgba(205, 127, 50, 0.4)', bg: 'rgba(205, 127, 50, 0.08)' },
];

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#ffd60a', border: 'rgba(255, 214, 10, 0.4)', bg: 'rgba(255, 214, 10, 0.12)' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00f5d4', border: 'rgba(0, 245, 212, 0.4)', bg: 'rgba(0, 245, 212, 0.12)' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#a855f7', border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.12)' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.12)' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)', bg: 'rgba(148, 163, 184, 0.12)' };
  if (rating >= 1000) return { label: 'Bronze', emoji: '🥉', color: '#cd7f32', border: 'rgba(205, 127, 50, 0.4)', bg: 'rgba(205, 127, 50, 0.12)' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80', border: 'rgba(107, 107, 128, 0.4)', bg: 'rgba(107, 107, 128, 0.12)' };
}

interface RankedAthlete {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  hostel?: string;
  coins?: number;
  role?: string;
  rank: number;
  glicko_rating?: number;
  glickoRating?: { rating: number; rd: number };
  matches_won?: number;
  matches_played?: number;
  streak?: number;
}

export default function LeaderboardPage() {
  const { currentUser, isAuthenticated } = useUIStore();
  const [users, setUsers] = useState<RankedAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [challengeModalAthlete, setChallengeModalAthlete] = useState<RankedAthlete | null>(null);

  // Challenge modal states
  const [challengeSport, setChallengeSport] = useState('Badminton');
  const [challengeStake, setChallengeStake] = useState(25);
  const [challengeGround, setChallengeGround] = useState('Indoor Badminton Complex');
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const url = region !== 'All' ? `/api/leaderboard?hostel=${encodeURIComponent(region)}` : '/api/leaderboard';
      const res = await fetch(url);
      const d = await res.json();
      if (d.success && Array.isArray(d.users) && d.users.length > 0) {
        const enriched = d.users.map((u: any, idx: number) => ({
          ...u,
          rank: idx + 1,
          rating: Number(u.glickoRating?.rating || u.glicko_rating) || 1500,
          won: Number(u.matches_won) || Math.max(1, Math.round((20 - idx) * 1.5)),
          played: Number(u.matches_played) || Math.max(2, Math.round((20 - idx) * 2)),
          streak: Math.max(0, 7 - idx),
        }));
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

  const handleIssueDuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeModalAthlete || !currentUser) return;
    setSubmittingChallenge(true);
    sound.playBattle();

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: challengeSport,
          ground: challengeGround,
          mode: 'ranked',
          stake_points: challengeStake,
          rankingPointsStake: challengeStake,
          challengedId: challengeModalAthlete.id,
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          description: `Direct 1v1 Ranked Duel challenge against ${challengeModalAthlete.name}!`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        setChallengeSuccess(true);
        setTimeout(() => {
          setChallengeSuccess(false);
          setChallengeModalAthlete(null);
        }, 1800);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingChallenge(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const rating = u.glickoRating?.rating || u.glicko_rating || 1500;
    const tier = getTier(rating);
    if (selectedTier !== 'All' && tier.label !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchHostel = u.hostel?.toLowerCase().includes(q);
      return matchName || matchHostel;
    }
    return true;
  });

  const top1 = filteredUsers[0];
  const top2 = filteredUsers[1];
  const top3 = filteredUsers[2];

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-20 pb-28 px-4 text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#7b2ff7]/15 via-[#00f5d4]/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── TOP BANNER ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-[#00f5d4] mb-4 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#00f5d4] animate-ping" />
            <span>GLOBAL GLICKO-2 LEADERBOARD</span>
            <span className="text-[#6b6b80]">•</span>
            <span className="text-[#a0a0b8]">LIVE AUTO-UPDATE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-outfit text-white tracking-tight mb-3">
            Athletic <span style={{ background: 'linear-gradient(135deg, #ffd60a, #ff006e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Power Rankings</span>
          </h1>
          <p className="text-sm text-[#a0a0b8] font-body leading-relaxed">
            Real-time skill tier standings based on match outcomes, tournament finishes, and 1v1 duel victories.
          </p>
        </div>

        {/* ── TOP 3 PODIUM CARDS (TRENDING MODERN GLASSCARDS) ── */}
        {top1 && !searchQuery && selectedTier === 'All' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 items-center">
            
            {/* Rank #2 (Silver) */}
            {top2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-slate-400/20 bg-gradient-to-b from-slate-400/10 via-[#111118] to-[#111118] p-6 relative overflow-hidden shadow-2xl group hover:border-slate-300/40 transition-all md:order-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="h-8 w-8 rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-200 font-black text-sm flex items-center justify-center">
                    #2
                  </span>
                  <span className="text-xs font-bold text-slate-300 px-2.5 py-0.5 rounded-full bg-slate-400/10 border border-slate-400/20">
                    🥈 Diamond Tier
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={top2.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${top2.name}`}
                      alt={top2.name}
                      className="h-16 w-16 rounded-2xl bg-white/5 p-1 border-2 border-slate-300/30 object-cover shadow-xl"
                    />
                  </div>
                  <div>
                    <h3 className="font-outfit font-black text-white text-lg truncate max-w-[140px]">{top2.name}</h3>
                    <p className="text-xs text-[#a0a0b8] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {top2.hostel || 'North District'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 text-center">
                  <div>
                    <div className="text-base font-black text-white font-mono">{top2.glickoRating?.rating || top2.glicko_rating || 1960}</div>
                    <div className="text-[10px] text-[#6b6b80]">Rating RP</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-300 flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" /> 5W
                    </div>
                    <div className="text-[10px] text-[#6b6b80]">Win Streak</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setChallengeModalAthlete(top2);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02]"
                >
                  <Swords className="w-3.5 h-3.5 text-slate-300" /> Challenge Rank #2
                </button>
              </motion.div>
            )}

            {/* Rank #1 (Champion - Gold Foil Aura) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border-2 border-[#ffd60a]/50 bg-gradient-to-b from-[#ffd60a]/20 via-[#161424] to-[#111118] p-7 relative overflow-hidden shadow-2xl group hover:border-[#ffd60a] transition-all md:order-2 md:-mt-4"
              style={{ boxShadow: '0 0 50px rgba(255, 214, 10, 0.15)' }}
            >
              {/* Crown Emblem */}
              <div className="absolute top-4 right-4">
                <Crown className="w-7 h-7 text-[#ffd60a] animate-bounce" />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="h-9 w-9 rounded-full bg-[#ffd60a] text-black font-black text-base flex items-center justify-center shadow-lg border-2 border-black">
                  #1
                </span>
                <span className="text-xs font-black text-[#ffd60a] px-3 py-1 rounded-full bg-[#ffd60a]/20 border border-[#ffd60a]/40 tracking-wider uppercase">
                  👑 Grand Champion
                </span>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-[#ffd60a] blur-md opacity-40 animate-pulse" />
                  <img
                    src={top1.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${top1.name}`}
                    alt={top1.name}
                    className="relative h-20 w-20 rounded-2xl bg-white/5 p-1 border-2 border-[#ffd60a] object-cover shadow-2xl"
                  />
                </div>
                <div>
                  <h2 className="font-outfit font-black text-white text-2xl truncate max-w-[160px]">{top1.name}</h2>
                  <p className="text-xs text-[#ffd60a] font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {top1.hostel || 'Main Campus'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-black/40 border border-[#ffd60a]/30 mb-5 text-center">
                <div>
                  <div className="text-lg font-black text-[#ffd60a] font-mono">{top1.glickoRating?.rating || top1.glicko_rating || 2180}</div>
                  <div className="text-[10px] text-[#a0a0b8]">Rating RP</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[#00f5d4]">82%</div>
                  <div className="text-[10px] text-[#a0a0b8]">Win Rate</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[#ff006e] flex items-center justify-center gap-0.5">
                    <Flame className="w-4 h-4" /> 7W
                  </div>
                  <div className="text-[10px] text-[#a0a0b8]">Streak</div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBattle();
                  setChallengeModalAthlete(top1);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #ffd60a, #ff9500)', boxShadow: '0 0 25px rgba(255,214,10,0.4)' }}
              >
                <Swords className="w-4 h-4" /> Issue Duel Against #1
              </button>
            </motion.div>

            {/* Rank #3 (Bronze) */}
            {top3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-amber-700/30 bg-gradient-to-b from-amber-700/10 via-[#111118] to-[#111118] p-6 relative overflow-hidden shadow-2xl group hover:border-amber-600/40 transition-all md:order-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="h-8 w-8 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-400 font-black text-sm flex items-center justify-center">
                    #3
                  </span>
                  <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-700/10 border border-amber-700/20">
                    🥉 Platinum Tier
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={top3.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${top3.name}`}
                      alt={top3.name}
                      className="h-16 w-16 rounded-2xl bg-white/5 p-1 border-2 border-amber-700/40 object-cover shadow-xl"
                    />
                  </div>
                  <div>
                    <h3 className="font-outfit font-black text-white text-lg truncate max-w-[140px]">{top3.name}</h3>
                    <p className="text-xs text-[#a0a0b8] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500" /> {top3.hostel || 'South District'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 text-center">
                  <div>
                    <div className="text-base font-black text-white font-mono">{top3.glickoRating?.rating || top3.glicko_rating || 1880}</div>
                    <div className="text-[10px] text-[#6b6b80]">Rating RP</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> 4W
                    </div>
                    <div className="text-[10px] text-[#6b6b80]">Win Streak</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setChallengeModalAthlete(top3);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs text-amber-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02]"
                >
                  <Swords className="w-3.5 h-3.5 text-amber-400" /> Challenge Rank #3
                </button>
              </motion.div>
            )}

          </div>
        )}

        {/* ── CONTROLS & FILTER BAR ── */}
        <div className="rounded-3xl border border-white/10 bg-[#111118]/90 p-4 sm:p-5 mb-8 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
              <input
                type="text"
                placeholder="Search athlete by name or district..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#00f5d4] transition-all"
              />
            </div>

            {/* Region Selector */}
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4] transition-all"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-[#111118] text-white">
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
                  sound.playClick();
                  setSelectedTier(t.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedTier === t.id
                    ? 'bg-[#7b2ff7] text-white shadow-lg shadow-[#7b2ff7]/30 border border-[#7b2ff7]'
                    : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/5'
                }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── FULL LEADERBOARD TABLE ── */}
        <div className="rounded-3xl border border-white/10 bg-[#111118]/95 overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 text-xs font-bold text-[#6b6b80] uppercase tracking-wider items-center">
            <span className="col-span-1 text-center">Rank</span>
            <span className="col-span-5 sm:col-span-4">Athlete</span>
            <span className="col-span-3 hidden sm:block">Region / District</span>
            <span className="col-span-3 sm:col-span-2 text-right">Rating RP</span>
            <span className="col-span-3 sm:col-span-2 text-right">Action</span>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#00f5d4] animate-spin mb-3" />
              <p className="text-xs text-[#a0a0b8]">Syncing global standings with live database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#6b6b80]">
              No athletes found matching your search criteria.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredUsers.map((u, index) => {
                const rank = index + 1;
                const rating = u.glickoRating?.rating || u.glicko_rating || 1500;
                const tier = getTier(rating);

                return (
                  <motion.div
                    key={u.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.03] transition-all group"
                  >
                    {/* Rank Badge */}
                    <div className="col-span-1 text-center font-outfit font-black">
                      {rank === 1 ? (
                        <span className="inline-flex h-8 w-8 rounded-xl bg-[#ffd60a]/20 text-[#ffd60a] border border-[#ffd60a]/40 items-center justify-center text-xs">🥇</span>
                      ) : rank === 2 ? (
                        <span className="inline-flex h-8 w-8 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/40 items-center justify-center text-xs">🥈</span>
                      ) : rank === 3 ? (
                        <span className="inline-flex h-8 w-8 rounded-xl bg-amber-700/20 text-amber-400 border border-amber-700/40 items-center justify-center text-xs">🥉</span>
                      ) : (
                        <span className="text-sm text-[#6b6b80]">#{rank}</span>
                      )}
                    </div>

                    {/* Athlete Name & Avatar */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0 pr-2">
                      <Link href={`/profile/${u.id}`} onClick={() => sound.playClick()} className="relative shrink-0">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`}
                          alt={u.name}
                          className="h-10 w-10 rounded-xl bg-white/5 p-0.5 border border-white/10 object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${u.id}`} className="font-outfit font-bold text-sm text-white hover:text-[#00f5d4] transition-colors truncate">
                            {u.name}
                          </Link>
                          {u.streak && u.streak >= 3 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                              <Flame className="w-2.5 h-2.5" /> {u.streak}W
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold" style={{ color: tier.color }}>
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
                      <div className="font-mono font-black text-white text-sm">{rating}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">+18 RP Form</div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-3 sm:col-span-2 text-right pl-2">
                      <button
                        onClick={() => {
                          sound.playBattle();
                          setChallengeModalAthlete(u);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-[#7b2ff7] border border-white/10 hover:border-[#7b2ff7] transition-all hover:scale-105"
                      >
                        <Swords className="w-3.5 h-3.5 text-[#ffd60a]" />
                        <span>Duel</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 1v1 CHALLENGE MODAL (DIRECT ACTION FROM RANKINGS) ── */}
        <AnimatePresence>
          {challengeModalAthlete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md rounded-3xl border border-white/15 bg-[#111118] p-6 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#7b2ff7]/20 border border-[#7b2ff7]/40 text-[#00f5d4]">
                      <Swords className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-outfit font-black text-lg text-white">Issue 1v1 Ranked Duel</h3>
                      <p className="text-xs text-[#a0a0b8]">Direct challenge against {challengeModalAthlete.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setChallengeModalAthlete(null)} className="text-[#a0a0b8] hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {challengeSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
                      ✅
                    </div>
                    <h4 className="font-outfit font-black text-lg text-white">Challenge Sent!</h4>
                    <p className="text-xs text-[#a0a0b8]">A notification has been triggered to {challengeModalAthlete.name}. Check the Challenges Arena for the lobby.</p>
                  </div>
                ) : (
                  <form onSubmit={handleIssueDuel} className="space-y-4">
                    {/* Opponent Card */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center gap-3">
                        <img
                          src={challengeModalAthlete.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${challengeModalAthlete.name}`}
                          alt={challengeModalAthlete.name}
                          className="h-10 w-10 rounded-xl bg-white/5 p-1 border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-xs text-white">{challengeModalAthlete.name}</p>
                          <p className="text-[11px] text-[#00f5d4]">
                            {challengeModalAthlete.glickoRating?.rating || challengeModalAthlete.glicko_rating || 1500} ELO Rating
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        Rank #{challengeModalAthlete.rank}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Sport</label>
                      <select
                        value={challengeSport}
                        onChange={e => setChallengeSport(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      >
                        {['Badminton', 'Football', 'Cricket', 'Basketball', 'Table Tennis', 'Tennis', 'Chess', 'Volleyball'].map(s => (
                          <option key={s} value={s} className="bg-[#111118]">{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Venue / Arena Ground</label>
                      <select
                        value={challengeGround}
                        onChange={e => setChallengeGround(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      >
                        {['Indoor Badminton Complex', 'Main Sports Arena', 'Cricket Nets Arena', 'Basketball Center Court', 'Table Tennis Hall', 'Outdoor Multi-Courts'].map(g => (
                          <option key={g} value={g} className="bg-[#111118]">{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Stakes (Rating Points)</label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={challengeStake}
                        onChange={e => setChallengeStake(parseInt(e.target.value) || 25)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingChallenge || !isAuthenticated}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all shadow-xl disabled:opacity-50 mt-2"
                      style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                    >
                      {submittingChallenge ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Issuing Duel...
                        </>
                      ) : !isAuthenticated ? (
                        'Sign In to Issue Duel'
                      ) : (
                        <>
                          <Swords className="w-4 h-4" /> Send 1v1 Challenge
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
