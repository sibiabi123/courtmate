'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Shield, MapPin, Calendar, Edit2, TrendingUp, Activity, Target, Phone, Send } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const SPORT_EMOJIS: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀',
  'Table Tennis': '🏓', Volleyball: '🏐', Kabaddi: '🤼', Tennis: '🎾',
  Chess: '♟️', default: '🏅',
};

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', color: '#ffd60a', emoji: '👑', min: 2000, max: 2400 };
  if (rating >= 1700) return { label: 'Diamond', color: '#00f5d4', emoji: '💎', min: 1700, max: 2000 };
  if (rating >= 1500) return { label: 'Platinum', color: '#7b2ff7', emoji: '⚡', min: 1500, max: 1700 };
  if (rating >= 1300) return { label: 'Gold', color: '#f59e0b', emoji: '🥇', min: 1300, max: 1500 };
  return { label: 'Rookie', color: '#6b6b80', emoji: '🌱', min: 0, max: 1300 };
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useUIStore();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwn = currentUser?.id === id;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/profile?id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d);
        else setError(d.error || 'User not found');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#7b2ff7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6b6b80] text-sm font-body">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-white mb-2 font-outfit">Profile Not Found</h2>
          <p className="text-[#6b6b80] mb-6 font-body">{error || 'This user does not exist.'}</p>
          <Link href="/feed" className="px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const user = data.user;
  const posts = data.posts || [];
  const tournaments = data.tournaments || [];
  const rating = user.glickoRating?.rating ?? 1500;
  const tier = getTier(rating);
  const tierPct = Math.min(100, ((rating - tier.min) / (tier.max - tier.min)) * 100);

  const allTiers = [
    { label: 'Rookie', emoji: '🌱', color: '#6b6b80', min: 0, max: 1300 },
    { label: 'Gold', emoji: '🥇', color: '#f59e0b', min: 1300, max: 1500 },
    { label: 'Platinum', emoji: '⚡', color: '#7b2ff7', min: 1500, max: 1700 },
    { label: 'Diamond', emoji: '💎', color: '#00f5d4', min: 1700, max: 2000 },
    { label: 'Champion', emoji: '👑', color: '#ffd60a', min: 2000, max: 2400 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Hero Banner */}
      <div className="relative h-44 overflow-hidden" style={{ background: `linear-gradient(135deg, ${tier.color}30, rgba(0,0,0,0.6))` }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-20" style={{ background: tier.color }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 p-6 mb-5" style={{ background: 'rgba(17,17,24,0.97)', backdropFilter: 'blur(20px)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative -mt-14">
              {user.avatar?.startsWith('http') ? (
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0f] object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0f] flex items-center justify-center text-3xl font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  {getInitials(user.name)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 text-lg">{tier.emoji}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-black font-outfit text-white">{user.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: `${tier.color}20`, color: tier.color }}>
                  {tier.emoji} {tier.label}
                </span>
                {(user.role === 'super_admin' || user.role === 'admin') && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#7b2ff7]/20 text-[#7b2ff7]">
                    <Shield className="w-3 h-3 inline mr-1" />Admin
                  </span>
                )}
                {user.rank && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ffd60a]/15 text-[#ffd60a]">
                    #{user.rank} Campus
                  </span>
                )}
              </div>
              {user.bio && <p className="text-sm text-[#a0a0b8] mb-2 font-body italic">"{user.bio}"</p>}
              <div className="flex items-center gap-4 text-xs text-[#6b6b80] flex-wrap">
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{user.hostel}</span>
                {user.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Contact links */}
              {!isOwn && (user.whatsapp || user.telegram || user.instagram || user.phone) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {user.whatsapp && (
                    <a href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white"
                      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>📲 WhatsApp</a>
                  )}
                  {user.phone && (
                    <a href={`tel:${user.phone}`} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white"
                      style={{ background: 'rgba(59,130,246,0.8)' }}>📞 Call</a>
                  )}
                  {user.telegram && (
                    <a href={`https://t.me/${user.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white"
                      style={{ background: 'rgba(0,136,204,0.8)' }}>✈️ Telegram</a>
                  )}
                  {user.instagram && (
                    <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white"
                      style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>📷 Instagram</a>
                  )}
                </div>
              )}
            </div>

            {isOwn && (
              <Link href="/settings" className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-all font-semibold shrink-0">
                <Edit2 className="w-3.5 h-3.5" />Edit Profile
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'ELO Rating', value: Math.round(rating), icon: '⚡', color: '#7b2ff7', bg: 'rgba(123,47,247,0.1)' },
            { label: 'Coins', value: `🪙 ${Number(user.coins) || 0}`, icon: '💰', color: '#ffd60a', bg: 'rgba(255,214,10,0.08)' },
            { label: 'Matches Posted', value: posts.length, icon: '🏟️', color: '#00f5d4', bg: 'rgba(0,245,212,0.08)' },
            { label: 'Campus Rank', value: user.rank ? `#${user.rank}` : 'N/A', icon: '🏆', color: tier.color, bg: `${tier.color}10` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-white/8 p-4 text-center" style={{ background: s.bg }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black font-outfit" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-[#6b6b80] mt-0.5 font-medium uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ELO Progress Bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/8 p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 font-outfit">
            <Star className="w-4 h-4 text-[#ffd60a]" />Rank Progression
          </h2>
          <div className="space-y-2.5">
            {allTiers.map(t => {
              const isCurrent = rating >= t.min && rating < t.max;
              const pct = isCurrent ? Math.min(100, ((rating - t.min) / (t.max - t.min)) * 100) : rating >= t.max ? 100 : 0;
              return (
                <div key={t.label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${isCurrent ? 'border border-white/15' : ''}`}
                  style={{ background: isCurrent ? `${t.color}10` : 'transparent' }}>
                  <span className="text-base shrink-0">{t.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: isCurrent ? t.color : '#6b6b80' }}>{t.label}</span>
                      <span className="text-xs text-[#6b6b80]">{t.min}–{t.max}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full rounded-full" style={{ background: t.color }} />
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] text-white font-black px-2 py-0.5 rounded-full shrink-0" style={{ background: t.color }}>
                      {Math.round(rating)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Match Posts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/8 p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 font-outfit">
            <Activity className="w-4 h-4 text-[#00f5d4]" />Recent Match Posts
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏟️</div>
              <p className="text-[#6b6b80] text-sm font-body">No match posts yet</p>
              {isOwn && (
                <Link href="/feed" className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  Post Your First Match
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post: any) => (
                <div key={post.id} className="flex items-center gap-3 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xl shrink-0">{SPORT_EMOJIS[post.sport] || SPORT_EMOJIS.default}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white font-outfit">{post.sport}</p>
                    <p className="text-xs text-[#6b6b80] truncate font-body">{post.ground}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${post.status === 'open' ? 'bg-emerald-500/15 text-emerald-400' : post.status === 'full' ? 'bg-red-500/15 text-red-400' : 'bg-[#6b6b80]/15 text-[#6b6b80]'}`}>
                      {post.status}
                    </span>
                    <p className="text-xs text-[#6b6b80] mt-1">
                      {Number(post.current_players) || 1}/{Number(post.max_players) || 10} players
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tournaments */}
        {tournaments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="rounded-2xl border border-white/8 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h2 className="font-bold text-white mb-4 flex items-center gap-2 font-outfit">
              <Trophy className="w-4 h-4 text-[#ffd60a]" />Tournaments Joined
            </h2>
            <div className="space-y-2">
              {tournaments.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl p-3 border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xl">{SPORT_EMOJIS[t.sport] || '🏆'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white font-outfit truncate">{t.name}</p>
                    <p className="text-xs text-[#6b6b80] font-body">{t.sport}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400' : t.status === 'ongoing' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#6b6b80]/15 text-[#6b6b80]'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
