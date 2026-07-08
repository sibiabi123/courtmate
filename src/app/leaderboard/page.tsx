'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';

const HOSTELS = ['All', 'MH-A Block', 'MH-B Block', 'MH-C Block', 'MH-D Block', 'MH-E Block', 'MH-F Block', 'MH-G Block', 'MH-H Block', 'MH-K Block', 'MH-Q Block', 'MH-R Block', 'LH-A Block', 'LH-B Block', 'LH-C Block', 'LH-D Block', 'LH-E Block', 'LH-F Block', 'Day Scholar'];

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#ffd60a', bg: 'rgba(255,214,10,0.12)' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00f5d4', bg: 'rgba(0,245,212,0.12)' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80', bg: 'rgba(107,107,128,0.12)' };
}

function Avatar({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  const initials = user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  if (user.avatar && user.avatar.startsWith('http')) {
    return <img src={user.avatar} alt={user.name} className={`${s} rounded-full object-cover`} />;
  }
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-black text-white`}
      style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
      {initials}
    </div>
  );
}

export default function LeaderboardPage() {
  const [hostel, setHostel] = useState('All');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = hostel !== 'All' ? `/api/leaderboard?hostel=${encodeURIComponent(hostel)}` : '/api/leaderboard';
    fetch(url)
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d.users) ? d.users : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [hostel]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(255,214,10,0.12)', color: '#ffd60a', border: '1px solid rgba(255,214,10,0.25)' }}>
            <Trophy className="w-3.5 h-3.5" />Campus ELO Rankings
          </div>
          <h1 className="text-4xl font-black font-outfit text-white mb-3">
            Who Rules <span style={{ background: 'linear-gradient(135deg, #ffd60a, #ff006e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>the Court?</span>
          </h1>
          <p className="text-[#a0a0b8] font-body text-sm max-w-md mx-auto">Official Glicko-2 ELO leaderboards for VIT University campus athletes. Rankings update in real-time.</p>
        </motion.div>

        {/* Hostel Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {HOSTELS.map(h => (
            <button key={h} onClick={() => setHostel(h)}
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: hostel === h ? '#7b2ff7' : 'rgba(255,255,255,0.04)', color: hostel === h ? 'white' : '#6b6b80', border: `1px solid ${hostel === h ? '#7b2ff7' : 'rgba(255,255,255,0.08)'}` }}>
              {h}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-24">
            <Loader2 className="w-10 h-10 text-[#7b2ff7] animate-spin mb-4" />
            <p className="text-[#6b6b80] text-sm font-body">Loading rankings...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-white font-bold text-lg font-outfit mb-2">No players ranked yet</h3>
            <p className="text-[#6b6b80] text-sm font-body">Register and play matches to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-4 items-end mb-10">
                {/* 2nd */}
                {top3[1] ? (
                  <div className="rounded-2xl border border-white/8 p-5 text-center flex flex-col items-center"
                    style={{ background: 'rgba(148,163,184,0.06)' }}>
                    <div className="text-2xl mb-2">🥈</div>
                    <Avatar user={top3[1]} size="md" />
                    <p className="font-bold text-white text-sm mt-2 font-outfit truncate w-full text-center">{top3[1].name}</p>
                    <p className="text-[10px] text-[#6b6b80] font-body">{top3[1].hostel}</p>
                    <div className="mt-2 font-black text-[#94a3b8] text-lg font-outfit">{Math.round(top3[1].glickoRating.rating)}</div>
                    <div className="text-[10px] text-[#6b6b80]">ELO</div>
                  </div>
                ) : <div />}

                {/* 1st */}
                {top3[0] && (
                  <div className="rounded-2xl border p-6 text-center flex flex-col items-center relative"
                    style={{ background: 'rgba(255,214,10,0.06)', borderColor: 'rgba(255,214,10,0.3)', boxShadow: '0 0 40px rgba(255,214,10,0.08)' }}>
                    <Crown className="absolute -top-4 w-8 h-8 text-[#ffd60a]" />
                    <div className="text-3xl mb-2">🥇</div>
                    <Avatar user={top3[0]} size="lg" />
                    <p className="font-black text-white text-base mt-3 font-outfit">{top3[0].name}</p>
                    <p className="text-[10px] text-[#a0a0b8] font-body">{top3[0].hostel}</p>
                    <div className="mt-3 font-black text-[#ffd60a] text-2xl font-outfit">{Math.round(top3[0].glickoRating.rating)}</div>
                    <div className="text-[10px] text-[#6b6b80]">ELO</div>
                    <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,214,10,0.15)', color: '#ffd60a' }}>
                      🪙 {top3[0].coins} coins
                    </span>
                  </div>
                )}

                {/* 3rd */}
                {top3[2] ? (
                  <div className="rounded-2xl border border-white/8 p-5 text-center flex flex-col items-center"
                    style={{ background: 'rgba(180,120,60,0.06)' }}>
                    <div className="text-2xl mb-2">🥉</div>
                    <Avatar user={top3[2]} size="md" />
                    <p className="font-bold text-white text-sm mt-2 font-outfit truncate w-full text-center">{top3[2].name}</p>
                    <p className="text-[10px] text-[#6b6b80] font-body">{top3[2].hostel}</p>
                    <div className="mt-2 font-black text-[#f59e0b] text-lg font-outfit">{Math.round(top3[2].glickoRating.rating)}</div>
                    <div className="text-[10px] text-[#6b6b80]">ELO</div>
                  </div>
                ) : <div />}
              </motion.div>
            )}

            {/* Rest of the rankings */}
            {rest.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/6 overflow-hidden"
                style={{ background: 'rgba(17,17,24,0.8)' }}>
                {rest.map((user, i) => {
                  const tier = getTier(user.glickoRating.rating);
                  return (
                    <Link href={`/profile/${user.id}`} key={user.id}>
                      <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/3 transition-all cursor-pointer">
                        <span className="text-[#6b6b80] font-bold font-outfit w-7 text-sm text-center">#{i + 4}</span>
                        <Avatar user={user} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm font-outfit">{user.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: tier.bg, color: tier.color }}>
                              {tier.emoji} {tier.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6b6b80] font-body">{user.hostel}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-white font-outfit text-sm">{Math.round(user.glickoRating.rating)} <span className="text-[10px] text-[#6b6b80] font-normal">ELO</span></div>
                          <div className="text-[11px] text-[#ffd60a]">🪙 {user.coins}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
