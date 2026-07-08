'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Loader2, Plus, X, Clock, Users, RefreshCw } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';

const SPORTS = ['All', 'Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Chess'];
const GROUNDS = ['Main Ground (Football/Cricket)', 'MH Cricket Net', 'Basketball Court', 'Indoor Badminton Hall', 'Table Tennis Room', 'Volleyball Court', 'Gymkhana Hall', 'Outdoor Multi-Courts', 'Swimming Pool'];

const SPORT_EMOJIS: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀',
  'Table Tennis': '🏓', Volleyball: '🏐', Kabaddi: '🤼', Tennis: '🎾', Chess: '♟️', default: '🏅',
};

interface Post {
  id: string; userId: string; sport: string; ground: string;
  maxPlayers: number; currentPlayers: number; scheduledStart: string;
  status: string; description: string; createdAt: string;
  user?: { id: string; name: string; avatar: string; hostel: string } | null;
  responses?: { id: string; userId: string; status: string; createdAt: string }[];
}

function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { currentUser } = useUIStore();
  const [form, setForm] = useState({ sport: SPORTS[1], ground: GROUNDS[0], maxPlayers: 10, date: '', time: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { setError('You must be logged in to post a match.'); return; }
    setLoading(true); setError('');
    try {
      const scheduledStart = form.date && form.time ? new Date(`${form.date}T${form.time}`) : new Date();
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduledStart }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create post');
      onCreated(); onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: 'rgba(17,17,24,0.98)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black font-outfit text-white">Post a Match</h3>
            <p className="text-xs text-[#6b6b80] mt-0.5 font-body">Find players for your next game</p>
          </div>
          <button onClick={onClose} className="text-[#6b6b80] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Sport</label>
            <select value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} style={{ background: '#111118' }}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all">
              {SPORTS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{SPORT_EMOJIS[s] || '🏅'} {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Ground / Venue</label>
            <select value={form.ground} onChange={e => setForm({ ...form, ground: e.target.value })} style={{ background: '#111118' }}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all">
              {GROUNDS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Players Needed (max)</label>
            <input type="number" min={2} max={50} value={form.maxPlayers} onChange={e => setForm({ ...form, maxPlayers: parseInt(e.target.value) || 10 })}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Date</label>
              <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Time</label>
              <input type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Posting...' : 'Post Match 🚀'}
          </button>
        </form>
      </motion.div>
    </>
  );
}

function PostCard({ post, onJoin, currentUserId }: { post: Post; onJoin: (id: string) => void; currentUserId?: string }) {
  const spotsLeft = post.maxPlayers - post.currentPlayers;
  const isCreator = currentUserId === post.userId;
  const isJoined = post.responses?.some(r => r.userId === currentUserId && r.status === 'joined') || false;
  const statusColor = post.status === 'open' ? '#00f5d4' : post.status === 'full' ? '#ffd60a' : post.status === 'live' ? '#10b981' : '#6b6b80';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 transition-all hover:border-white/20 hover:scale-[1.01]"
      style={{ background: 'rgba(17,17,24,0.8)', borderColor: `${statusColor}25`, backdropFilter: 'blur(12px)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-2xl">{SPORT_EMOJIS[post.sport] || SPORT_EMOJIS.default}</span>
            <span className="font-bold text-white font-outfit text-lg">{post.sport}</span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: `${statusColor}20`, color: statusColor }}>
              {post.status === 'live' && <span className="animate-pulse">●</span>}{post.status}
            </span>
          </div>
          <p className="text-[#a0a0b8] text-sm flex items-center gap-1.5 font-body">
            <MapPin className="w-3.5 h-3.5 text-[#00f5d4] shrink-0" />{post.ground}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black font-outfit" style={{ color: statusColor }}>{post.currentPlayers}/{post.maxPlayers}</p>
          <p className="text-[#6b6b80] text-xs font-body">{spotsLeft > 0 ? `${spotsLeft} open` : 'Full'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {post.user?.avatar ? (
            <img src={post.user.avatar} alt={post.user.name} className="w-6 h-6 rounded-full bg-white/10 object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7b2ff7] to-[#00f5d4] flex items-center justify-center text-[10px] font-bold text-white">
              {post.user?.name?.[0] || '?'}
            </div>
          )}
          <p className="text-[#6b6b80] text-xs font-body">
            <Clock className="w-3 h-3 inline mr-0.5" />
            {post.scheduledStart ? new Date(post.scheduledStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
            {post.user?.hostel && ` · ${post.user.hostel}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCreator ? (
            <span className="text-xs text-[#7b2ff7] border border-[#7b2ff7]/20 bg-[#7b2ff7]/10 rounded-xl px-3 py-1 font-bold">Host</span>
          ) : isJoined ? (
            <span className="text-xs text-[#00f5d4] border border-[#00f5d4]/20 bg-[#00f5d4]/10 rounded-xl px-3 py-1 font-bold">✓ Joined</span>
          ) : post.status === 'open' && spotsLeft > 0 ? (
            <button onClick={() => onJoin(post.id)}
              className="rounded-xl px-4 py-1.5 text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              Join Match
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default function FeedPage() {
  const [selectedSport, setSelectedSport] = useState('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { currentUser } = useUIStore();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedSport !== 'All' ? `/api/posts?sport=${encodeURIComponent(selectedSport)}` : '/api/posts';
      const res = await fetch(url);
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  }, [selectedSport]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleJoin = async (postId: string) => {
    if (!currentUser) { alert('Please log in to join a match.'); return; }
    try {
      const res = await fetch('/api/posts/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => p.id === postId
          ? { ...p, currentPlayers: p.currentPlayers + 1, status: p.currentPlayers + 1 >= p.maxPlayers ? 'full' : 'open' }
          : p));
      } else {
        alert(data.error || 'Failed to join match');
      }
    } catch { alert('Network error. Try again.'); }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black font-outfit text-white flex items-center gap-2">
              <Zap className="w-7 h-7 text-[#00f5d4]" />Live Match Feed
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-1 font-body">Find campus players and book matches in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchPosts} className="p-2.5 rounded-xl border border-white/10 text-[#6b6b80] hover:text-white hover:bg-white/5 transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            {currentUser ? (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white text-sm transition-all hover:scale-105 shadow-lg shadow-[#7b2ff7]/20"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                <Plus className="w-4 h-4" />Post Match
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white text-sm border border-white/15 hover:bg-white/5 transition-all">
                Sign In to Post
              </Link>
            )}
          </div>
        </div>

        {/* Sport Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
          {SPORTS.map(sport => (
            <button key={sport} onClick={() => setSelectedSport(sport)}
              className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              style={{ background: selectedSport === sport ? '#7b2ff7' : 'rgba(255,255,255,0.04)', color: selectedSport === sport ? 'white' : '#a0a0b8', border: `1px solid ${selectedSport === sport ? '#7b2ff7' : 'rgba(255,255,255,0.08)'}` }}>
              {sport !== 'All' && (SPORT_EMOJIS[sport] || '🏅') + ' '}{sport}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#00f5d4] animate-spin mb-4" />
            <p className="text-[#6b6b80] text-sm font-body">Fetching active match cards...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-6xl mb-6">🏟️</div>
            <p className="text-white font-black text-xl mb-2 font-outfit">No active matches</p>
            <p className="text-[#a0a0b8] text-sm mb-6 font-body">
              {selectedSport !== 'All' ? `No ${selectedSport} matches right now.` : 'Be the first to host a match on campus!'}
            </p>
            {currentUser ? (
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white text-sm cursor-pointer hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                <Plus className="w-4 h-4" />Create Match Post
              </button>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                Sign In to Post
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onJoin={handleJoin} currentUserId={currentUser?.id} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onCreated={fetchPosts} />}
      </AnimatePresence>
    </main>
  );
}
