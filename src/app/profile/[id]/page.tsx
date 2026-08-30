'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Shield, MapPin, Calendar, Edit2, TrendingUp, Activity,
  Target, Phone, Send, Instagram, Swords, Award, Flame, Check, Copy,
  Sparkles, Zap, ArrowLeft, UserCheck, AlertTriangle
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';
import { playClick, playDuel, playSuccess } from '@/lib/sound';

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#CCFF00', bg: 'rgba(204,255,0,0.12)' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00F0FF', bg: 'rgba(0,240,255,0.12)' };
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
  const [attendance, setAttendance] = useState<{ karma: number; attended: number; noShows: number; total: number; badge: string; isReliable: boolean } | null>(null);
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

    // Fetch Fair Play Attendance Karma
    fetch(`/api/posts/attendance?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAttendance(d);
        }
      })
      .catch(() => {});
  }, [userId, currentUser]);

  const handleCopy = (text: string, type: string) => {
    playClick();
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040507] flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-[#CCFF00] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-[#a0a0b8] font-mono">Loading athlete profile...</p>
        </div>
      </div>
    );
  }

  const u = profile?.user;
  const rating = Math.round(u?.glickoRating?.rating || 1500);
  const tier = getTier(rating);
  const isOwn = currentUser && currentUser.id === u?.id;
  const karmaScore = attendance?.karma ?? 100;

  return (
    <div className="min-h-screen bg-[#040507] pt-24 pb-24 px-4 text-white">
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
          className="rounded-3xl border border-white/10 bg-[#0A0C10] p-8 shadow-2xl relative overflow-hidden mb-8"
        >
          {/* Ambient glow header */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#CCFF00]/15 via-[#00F0FF]/10 to-transparent pointer-events-none" />

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
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="font-outfit font-black text-2xl sm:text-3xl text-white">{u.name}</h1>
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full" style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}40` }}>
                    {tier.label}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    karmaScore >= 90 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-[#FF2A55]/15 text-[#FF2A55] border border-[#FF2A55]/30'
                  }`}>
                    🛡️ {karmaScore}% Karma
                  </span>
                </div>
                <p className="text-xs text-[#a0a0b8] flex items-center gap-2 mb-2 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" /> {u.hostel || 'Main Campus'}
                  <span>•</span>
                  <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" /> Joined {new Date(u.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
                  onClick={() => playClick()}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Link>
              ) : (
                <Link
                  href="/challenges"
                  onClick={() => playDuel()}
                  className="btn-volt flex-1 md:flex-initial flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" /> Challenge 1v1
                </Link>
              )}
            </div>

          </div>

          {/* Core Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-[#CCFF00]">{rating}</div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5 font-mono">Glicko-2 ELO</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-[#00F0FF]">#{u.rank || 1}</div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5 font-mono">Global Rank</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-white">🪙 {u.coins || 100}</div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5 font-mono">Coins Balance</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-2xl font-black font-outfit text-[#FFD700] flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-400" /> 5W
              </div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5 font-mono">Current Streak</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center col-span-2 sm:col-span-1">
              <div className={`text-2xl font-black font-outfit ${karmaScore >= 80 ? 'text-emerald-400' : 'text-[#FF2A55]'}`}>
                {karmaScore}%
              </div>
              <div className="text-[11px] text-[#6b6b80] mt-0.5 font-mono">Fair Play Karma</div>
            </div>
          </div>
        </motion.div>

        {/* ── PROFILE DETAILS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Contact Cards & Attendance Karma Card */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Anti-Ghosting Reliability Badge Card */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-xl">
              <h3 className="font-outfit font-black text-base text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#CCFF00]" /> Attendance & Reliability Index
              </h3>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#a0a0b8]">Reliability Status</span>
                  <span className="text-xs font-black text-emerald-400">
                    {attendance?.badge || '🛡️ High Reliability'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${karmaScore}%` }}
                    className={`h-full rounded-full ${karmaScore >= 80 ? 'bg-[#CCFF00]' : 'bg-[#FF2A55]'}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#6b6b80] font-mono">
                  <span>Attended: {attendance?.attended || 0}</span>
                  <span>No-Shows: {attendance?.noShows || 0}</span>
                  <span>Total Matches: {attendance?.total || 0}</span>
                </div>
              </div>
            </div>

            {/* Direct Connect Hub */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-xl">
              <h3 className="font-outfit font-black text-base text-white mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00F0FF]" /> Athlete Contact Card
              </h3>

              <div className="space-y-3">
                {u.whatsapp && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">💬</span>
                      <div>
                        <div className="text-xs font-bold text-white">WhatsApp</div>
                        <div className="text-[11px] text-[#a0a0b8] font-mono">{u.whatsapp}</div>
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
                        <div className="text-[11px] text-[#a0a0b8] font-mono">{u.telegram}</div>
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
                        <div className="text-[11px] text-[#a0a0b8] font-mono">{u.instagram}</div>
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

          </div>

          {/* Right Column: Achievements & Career Trajectory */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Achievements Card */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-xl">
              <h3 className="font-outfit font-black text-base text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#CCFF00]" /> Athlete Achievements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACHIEVEMENTS.map(a => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      a.unlocked
                        ? 'bg-[#CCFF00]/5 border-[#CCFF00]/20'
                        : 'bg-white/[0.01] border-white/5 opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs text-white">{a.title}</h4>
                      <p className="text-[11px] text-[#6b6b80] mt-0.5 leading-relaxed">{a.desc}</p>
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
