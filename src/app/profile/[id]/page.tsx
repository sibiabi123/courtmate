'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Shield, MapPin, Calendar, Edit2, TrendingUp, Activity,
  Target, Phone, Send, Instagram, Swords, Award, Flame, Check, Copy,
  Sparkles, Zap, ArrowLeft
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';
import { sound } from '@/lib/sound';

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#ffd60a', bg: 'rgba(255,214,10,0.12)' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00f5d4', bg: 'rgba(0,245,212,0.12)' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  if (rating >= 1000) return { label: 'Bronze', emoji: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80', bg: 'rgba(107,107,128,0.12)' };
}

const ACHIEVEMENTS = [
  { id: 'a1', title: 'First Blood', desc: 'Won first competitive match', icon: '⚔️', unlocked: true },
  { id: 'a2', title: 'Court Veteran', desc: 'Played 20+ matches', icon: '🏅', unlocked: true },
  { id: 'a3', title: 'On Fire', desc: '5-match winning streak', icon: '🔥', unlocked: true },
  { id: 'a4', title: 'Grand Champion', desc: 'Reached 2000+ ELO rating', icon: '👑', unlocked: false },
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { currentUser } = useUIStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/profile?id=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.user) {
          setProfile(d);
        } else {
          // Fallback profile mock
          setProfile({
            user: {
              id: userId,
              name: currentUser?.id === userId ? currentUser.name : 'Ranked Athlete',
              email: currentUser?.id === userId ? currentUser.email : 'player@courtmate.io',
              avatar: currentUser?.id === userId ? currentUser.avatar : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userId}`,
              hostel: currentUser?.id === userId ? currentUser.hostel : 'Main Campus',
              coins: 350,
              glickoRating: { rating: 1740, rd: 65 },
              bio: 'Competitive badminton & football player. Always up for high-intensity weekend matchups!',
              phone: '+91 98765 43210',
              whatsapp: '+91 98765 43210',
              telegram: '@courtmate_player',
              instagram: '@courtmate_athlete',
              createdAt: '2026-01-15T00:00:00Z',
              rank: 4,
            },
            posts: [],
            tournaments: []
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, currentUser]);

  const handleCopy = (text: string, type: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-[#00f5d4] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-[#a0a0b8]">Loading athlete profile...</p>
        </div>
      </div>
    );
  }

  const u = profile?.user;
  const rating = Math.round(u?.glickoRating?.rating || 1500);
  const tier = getTier(rating);
  const isOwn = currentUser && currentUser.id === u?.id;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4 text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#a0a0b8] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* ── PROFILE HERO CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-[#111118] p-8 shadow-2xl relative overflow-hidden mb-8"
        >
          {/* Ambient glow header */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#7b2ff7]/20 via-[#00f5d4]/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`}
                  alt={u.name}
                  className="h-24 w-24 rounded-3xl object-cover bg-white/5 border-2 border-white/15 shadow-2xl p-1"
                />
                <span className="absolute -bottom-2 -right-2 text-xl">{tier.emoji}</span>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">{u.name}</h1>
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full" style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}40` }}>
                    {tier.label}
                  </span>
                </div>
                <p className="text-xs text-[#a0a0b8] flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00f5d4]" /> {u.hostel || 'Main Campus'}
                  <span>•</span>
                  <Calendar className="w-3.5 h-3.5 text-[#7b2ff7]" /> Joined {new Date(u.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                {u.bio && (
                  <p className="text-xs text-[#d1d5db] max-w-lg leading-relaxed">{u.bio}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {isOwn ? (
                <Link
                  href="/settings"
                  onClick={() => sound.playClick()}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Link>
              ) : (
                <Link
                  href="/challenges"
                  onClick={() => sound.playBattle()}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white shadow-xl transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                >
                  <Swords className="w-4 h-4" /> Challenge 1v1
                </Link>
              )}
            </div>

          </div>

          {/* Core Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-[#00f5d4]">{rating}</div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5">Glicko-2 ELO</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-[#ffd60a]">#{u.rank || 1}</div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5">Global Rank</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-white">🪙 {u.coins || 100}</div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5">Coins Balance</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-[#ff006e] flex items-center justify-center gap-1">
                <Flame className="w-5 h-5" /> 5W
              </div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5">Current Streak</div>
            </div>
          </div>
        </motion.div>

        {/* ── PROFILE DETAILS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Contact Cards & Socials */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Direct Connect Hub */}
            <div className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl">
              <h3 className="font-outfit font-black text-base text-white mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00f5d4]" /> Athlete Contact Card
              </h3>

              <div className="space-y-3">
                {u.whatsapp && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">💬</span>
                      <div>
                        <div className="text-xs font-bold text-white">WhatsApp</div>
                        <div className="text-[11px] text-[#a0a0b8]">{u.whatsapp}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(u.whatsapp, 'wa')}
                      className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      {copied === 'wa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {u.telegram && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">✈️</span>
                      <div>
                        <div className="text-xs font-bold text-white">Telegram</div>
                        <div className="text-[11px] text-[#a0a0b8]">{u.telegram}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(u.telegram, 'tg')}
                      className="p-2 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      {copied === 'tg' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {u.instagram && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-500/5 border border-pink-500/20">
                    <div className="flex items-center gap-2.5">
                      <Instagram className="w-5 h-5 text-pink-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Instagram</div>
                        <div className="text-[11px] text-[#a0a0b8]">{u.instagram}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(u.instagram, 'ig')}
                      className="p-2 rounded-xl text-pink-400 hover:bg-pink-500/10 transition-colors"
                    >
                      {copied === 'ig' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Trophy Cabinet */}
            <div className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl">
              <h3 className="font-outfit font-black text-base text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#ffd60a]" /> Achievement Showcase
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map(a => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      a.unlocked
                        ? 'bg-[#ffd60a]/5 border-[#ffd60a]/20 text-white'
                        : 'bg-white/[0.01] border-white/5 text-[#6b6b80] opacity-50'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{a.icon}</span>
                    <p className="font-bold text-xs truncate">{a.title}</p>
                    <p className="text-[10px] text-[#a0a0b8] mt-0.5">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: ELO Rating Chart & Skill Radar */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Visual ELO Progression Card */}
            <div className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-outfit font-black text-base text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00f5d4]" /> Rating Trajectory
                  </h3>
                  <p className="text-xs text-[#a0a0b8]">+140 RP gained across recent ranked matches</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +12.4% Trend
                </span>
              </div>

              {/* Sparkline Graphic */}
              <div className="h-32 w-full pt-4">
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="gradientElo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#7b2ff7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,80 Q 80,65 150,50 T 280,35 T 400,15 L 400,100 L 0,100 Z"
                    fill="url(#gradientElo)"
                  />
                  <path
                    d="M 0,80 Q 80,65 150,50 T 280,35 T 400,15"
                    fill="none"
                    stroke="#00f5d4"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="400" cy="15" r="5" fill="#ffd60a" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* 5-Point Attribute Pentagon */}
            <div className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl">
              <h3 className="font-outfit font-black text-base text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#7b2ff7]" /> Athletic Attribute Matrix
              </h3>

              <div className="space-y-3">
                {[
                  { attr: 'Agility & Speed', val: 88, color: '#00f5d4' },
                  { attr: 'Power & Stamina', val: 82, color: '#7b2ff7' },
                  { attr: 'Tactical Game Sense', val: 91, color: '#ffd60a' },
                  { attr: 'Clutch Performance', val: 85, color: '#ff006e' },
                ].map(item => (
                  <div key={item.attr}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#a0a0b8]">{item.attr}</span>
                      <span className="text-white">{item.val} / 100</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.val}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
