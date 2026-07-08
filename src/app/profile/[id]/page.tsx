'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Shield, MapPin, Calendar, Edit2, TrendingUp, Coins, Activity, Target } from 'lucide-react';
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

interface DBUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  hostel: string;
  coins: number;
  role: string;
  glicko_rating?: number;
  glickoRating?: number;
  is_banned?: boolean;
  created_at?: string;
}

interface DBPost {
  id: string;
  sport: string;
  ground: string;
  status: string;
  current_players?: number;
  currentPlayers?: number;
  max_players?: number;
  maxPlayers?: number;
  scheduled_at?: string;
  scheduledAt?: string;
  created_at?: string;
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useUIStore();

  const [profileUser, setProfileUser] = useState<DBUser | null>(null);
  const [userPosts, setUserPosts] = useState<DBPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwn = currentUser?.id === id;

  useEffect(() => {
    // Fetch profile user from admin table API (read-only public data)
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Get all users and find by id
        const res = await fetch('/api/admin/table?table=users');
        const data = await res.json();
        const users: DBUser[] = data.rows || [];
        const found = users.find((u: DBUser) => u.id === id);
        if (found) {
          setProfileUser(found);
        } else if (isOwn && currentUser) {
          // Fallback: show current user from store
          setProfileUser({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            avatar: currentUser.avatar,
            hostel: currentUser.hostel,
            coins: currentUser.coins,
            role: currentUser.role || 'student',
          });
        } else {
          setError('User not found.');
        }

        // Fetch this user's posts
        const postsRes = await fetch('/api/admin/table?table=posts');
        const postsData = await postsRes.json();
        const allPosts: DBPost[] = postsData.rows || [];
        setUserPosts(allPosts.filter((p: any) => p.user_id === id).slice(0, 8));
      } catch (e) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwn, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#7b2ff7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6b6b80] text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-[#6b6b80] mb-6">{error || 'This user does not exist.'}</p>
          <Link href="/feed" className="px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const rating = profileUser.glicko_rating ?? profileUser.glickoRating ?? 1500;
  const tier = rating >= 2000 ? { label: 'Champion', color: '#ffd60a', emoji: '👑' }
    : rating >= 1700 ? { label: 'Diamond', color: '#00f5d4', emoji: '💎' }
    : rating >= 1500 ? { label: 'Platinum', color: '#7b2ff7', emoji: '⚡' }
    : rating >= 1300 ? { label: 'Gold', color: '#f59e0b', emoji: '🥇' }
    : { label: 'Rookie', color: '#6b6b80', emoji: '🌱' };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      {/* Hero Banner */}
      <div className="relative h-44 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(123,47,247,0.25), rgba(0,245,212,0.1))' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 p-6 mb-5" style={{ background: 'rgba(17,17,24,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative -mt-14">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.name} className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0f] object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0f] flex items-center justify-center text-3xl font-black text-white" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  {getInitials(profileUser.name)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 text-lg">{tier.emoji}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-black font-outfit text-white">{profileUser.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: `${tier.color}20`, color: tier.color }}>
                  {tier.label}
                </span>
                {profileUser.role === 'super_admin' || profileUser.role === 'admin' ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#7b2ff7]/20 text-[#7b2ff7]">
                    <Shield className="w-3 h-3 inline mr-1" />Admin
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-[#a0a0b8] mb-2 font-body">{profileUser.email}</p>
              <div className="flex items-center gap-4 text-xs text-[#6b6b80] flex-wrap">
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{profileUser.hostel}</span>
                {profileUser.created_at && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Joined {new Date(profileUser.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                )}
              </div>
            </div>

            {isOwn && (
              <Link href="/settings" className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-all font-semibold">
                <Edit2 className="w-3.5 h-3.5" />Edit Profile
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'ELO Rating', value: Math.round(rating), icon: <TrendingUp className="w-5 h-5" />, color: '#7b2ff7' },
            { label: 'Coins', value: profileUser.coins, icon: <Coins className="w-5 h-5" />, color: '#ffd60a' },
            { label: 'Matches Posted', value: userPosts.length, icon: <Activity className="w-5 h-5" />, color: '#00f5d4' },
            { label: 'Rank Tier', value: tier.label, icon: <Target className="w-5 h-5" />, color: tier.color },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-white/8 p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="mx-auto mb-1.5" style={{ color: s.color }}>{s.icon}</div>
              <div className="text-xl font-black font-outfit" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-[#6b6b80] mt-0.5 font-medium uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Posts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/8 p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 font-outfit">
            <Activity className="w-4 h-4 text-[#00f5d4]" />Recent Match Posts
          </h2>
          {userPosts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏟️</div>
              <p className="text-[#6b6b80] text-sm font-body">No match posts yet</p>
              {isOwn && (
                <Link href="/feed" className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {userPosts.map((post: any) => (
                <div key={post.id} className="flex items-center gap-3 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xl shrink-0">{SPORT_EMOJIS[post.sport] || SPORT_EMOJIS.default}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white font-outfit">{post.sport}</p>
                    <p className="text-xs text-[#6b6b80] truncate font-body">{post.ground}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      post.status === 'open' ? 'bg-emerald-500/15 text-emerald-400'
                      : post.status === 'full' ? 'bg-red-500/15 text-red-400'
                      : 'bg-[#6b6b80]/15 text-[#6b6b80]'
                    }`}>{post.status}</span>
                    <p className="text-xs text-[#6b6b80] mt-1">{post.current_players ?? post.currentPlayers ?? 1}/{post.max_players ?? post.maxPlayers ?? 10}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rank Progression */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/8 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 font-outfit">
            <Star className="w-4 h-4 text-[#ffd60a]" />Rank Progression
          </h2>
          <div className="space-y-2.5">
            {[
              { label: 'Rookie', min: 0, max: 1300, color: '#6b6b80', emoji: '🌱' },
              { label: 'Gold', min: 1300, max: 1500, color: '#f59e0b', emoji: '🥇' },
              { label: 'Platinum', min: 1500, max: 1700, color: '#7b2ff7', emoji: '⚡' },
              { label: 'Diamond', min: 1700, max: 2000, color: '#00f5d4', emoji: '💎' },
              { label: 'Champion', min: 2000, max: 2400, color: '#ffd60a', emoji: '👑' },
            ].map((tier) => {
              const isCurrent = rating >= tier.min && rating < tier.max;
              const pct = isCurrent ? Math.min(100, ((rating - tier.min) / (tier.max - tier.min)) * 100) : rating >= tier.max ? 100 : 0;
              return (
                <div key={tier.label} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isCurrent ? 'border border-white/15' : ''}`} style={{ background: isCurrent ? `${tier.color}10` : 'transparent' }}>
                  <span className="text-base shrink-0">{tier.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: isCurrent ? tier.color : '#6b6b80' }}>{tier.label}</span>
                      <span className="text-xs text-[#6b6b80]">{tier.min}–{tier.max}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: tier.color }} />
                    </div>
                  </div>
                  {isCurrent && <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full" style={{ background: tier.color }}>YOU</span>}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
