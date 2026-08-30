'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Clock, Users, RefreshCw, Share2, Eye, CheckCircle, Zap, MapPin,
  ChevronDown, ChevronUp, Copy, Check, MessageSquare, Shield, AlertTriangle,
  UserCheck, UserX, Loader2, Building2, Crown, Store, Flame, Package
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { LiveScoreboardTicker } from '@/components/ui/LiveScoreboardTicker';
import { ProfileProgressWidget } from '@/components/ui/ProfileProgressWidget';
import { LobbyChatDrawer } from '@/components/ui/LobbyChatDrawer';
import { TurfBookingWidget } from '@/components/ui/TurfBookingWidget';
import { NativeSponsorCard } from '@/components/ads/NativeSponsorCard';
import { AffiliateGearWidget } from '@/components/ads/AffiliateGearWidget';
import { SOSFlareModal } from '@/components/features/SOSFlareModal';
import { CourtCrowdRadar } from '@/components/features/CourtCrowdRadar';
import { PeerGearLocker } from '@/components/features/PeerGearLocker';
import { playClick, playCoin, playSuccess, playDuel } from '@/lib/sound';
import { getActiveCampusConfig } from '@/lib/campus-config';

const SPORTS = ['All', 'Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Chess'];
const SPORT_EMOJIS: Record<string, string> = { Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀', 'Table Tennis': '🏓', Volleyball: '🏐', Kabaddi: '🤼', Tennis: '🎾', Chess: '♟️', default: '🏅' };

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#FFD700', bg: 'rgba(255,215,0,0.12)' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00F0FF', bg: 'rgba(0,240,255,0.12)' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#CCFF00', bg: 'rgba(204,255,0,0.12)' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#FFD700', bg: 'rgba(255,215,0,0.12)' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#c0c0c0', bg: 'rgba(192,192,192,0.12)' };
  if (rating >= 1000) return { label: 'Bronze', emoji: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80', bg: 'rgba(107,107,128,0.12)' };
}

function Avatar({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (user?.avatar?.startsWith('http')) return <img src={user.avatar} alt={user.name} className={`${s} rounded-full object-cover shrink-0`} />;
  return <div className={`${s} rounded-xl flex items-center justify-center font-black text-[#040507] shrink-0 font-[family-name:var(--font-outfit)]`} style={{ background: 'linear-gradient(135deg, #CCFF00, #00F0FF)' }}>{initials}</div>;
}

// ── Participants Modal ──────────────────────────────────────────────────────
function ParticipantsModal({ post, onClose }: { post: any; onClose: () => void }) {
  const { currentUser } = useUIStore();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/participants?postId=${post.id}`)
      .then(r => r.json())
      .then(d => setParticipants(Array.isArray(d.participants) ? d.participants : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  }, [post.id]);

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/feed?post=${post.id}` : '';

  const handleCopy = () => {
    playClick();
    navigator.clipboard.writeText(shareLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const whatsappMsg = `Join my ${post.sport} match at ${post.ground}! ${shareLink}`;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#0A0C10]">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div>
            <h3 className="font-black text-white font-[family-name:var(--font-outfit)] text-lg">{SPORT_EMOJIS[post.sport] || '🏅'} {post.sport} Athletes</h3>
            <p className="text-xs text-[#6b6b80] mt-0.5 stat-mono">{post.ground} · {participants.length}/{post.maxPlayers} slots filled</p>
          </div>
          <button onClick={() => { playClick(); onClose(); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:text-white hover:bg-white/8 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {post.user && (
          <div className="mx-5 mt-4 p-3 rounded-xl flex items-center gap-3 bg-[#CCFF00]/10 border border-[#CCFF00]/20">
            <Avatar user={post.user} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{post.user.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold stat-mono">HOST</span>
              </div>
              <p className="text-[11px] text-[#6b6b80]">{post.user.hostel}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[#CCFF00]/30 border-t-[#CCFF00] rounded-full animate-spin" /></div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-[#6b6b80] text-sm">No one has joined yet. Be the first!</p>
            </div>
          ) : participants.map((p, i) => {
            const tier = getTier(p.glickoRating || 1500);
            const isMe = p.id === currentUser?.id;
            const isCreator = p.id === post.userId;
            return (
              <div key={p.id} className="rounded-xl overflow-hidden p-3 bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <span className="text-[#6b6b80] font-bold text-sm w-5 text-center stat-mono">#{i + 1}</span>
                <Avatar user={p} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    {isMe && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] font-bold stat-mono">YOU</span>}
                    {isCreator && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] font-bold stat-mono">HOST</span>}
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold stat-mono" style={{ background: tier.bg, color: tier.color }}>{tier.emoji} {tier.label}</span>
                  </div>
                  <p className="text-[11px] text-[#6b6b80] stat-mono">{p.hostel} · {Math.round(p.glickoRating || 1500)} RP</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/8 flex gap-2">
          <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-white/10 text-white">
            {copied ? <><Check className="w-4 h-4 text-[#CCFF00]" />Copied Link!</> : <><Copy className="w-4 h-4" />Copy Link</>}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500">
            📲 WhatsApp
          </a>
        </div>
      </motion.div>
    </>
  );
}

// ── Create Post Modal ───────────────────────────────────────────────────────
function CreatePostModal({
  onClose,
  onCreated,
  campusVenues = [],
}: {
  onClose: () => void;
  onCreated: () => void;
  campusVenues?: any[];
}) {
  const { currentUser } = useUIStore();
  const availableVenues = campusVenues.length > 0 ? campusVenues.map(v => v.name) : [
    'Main Sports Arena', 'Indoor Badminton Complex', 'Basketball Center Court', 'Cricket Nets Arena', 'Multi-Sports Field'
  ];

  const [form, setForm] = useState({
    sport: 'Badminton',
    ground: availableVenues[0],
    maxPlayers: 4,
    date: '',
    time: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { setError('You must be logged in.'); return; }
    setLoading(true); setError('');
    try {
      const scheduledStart = form.date && form.time ? new Date(`${form.date}T${form.time}`) : new Date(Date.now() + 3600000);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduledStart, collegeId: 'vit-vellore' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create post');
      
      try {
        const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
        const { useUIStore } = await import('@/store/uiStore');
        useUIStore.getState().updateCoins(15, 'Posted a Match Lobby');
        useUIStore.getState().incrementMatchesPosted();
        emitCoinEarn({ amount: 15, reason: 'Match Lobby Created! (+15 🪙)', icon: '🏅' });
        playSuccess();
      } catch {}
      onCreated(); onClose();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 p-6 shadow-2xl bg-[#0A0C10]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black font-[family-name:var(--font-outfit)] text-white">Post Match Lobby</h3>
            <p className="text-xs text-[#6b6b80] mt-0.5">Host a game and gather players on your campus</p>
          </div>
          <button onClick={() => { playClick(); onClose(); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:bg-white/8 transition-all"><X className="w-4 h-4" /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Sport</label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.filter(s => s !== 'All').map(s => (
                <button type="button" key={s} onClick={() => { playClick(); setForm(f => ({ ...f, sport: s })); }}
                  className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    form.sport === s
                      ? 'bg-[#CCFF00] text-[#040507] shadow-md shadow-[#CCFF00]/20'
                      : 'bg-white/5 text-[#6b6b80] border border-white/5 hover:text-white'
                  }`}>
                  <span className="text-lg">{SPORT_EMOJIS[s] || '🏅'}</span>{s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Campus Arena / Venue</label>
            <select value={form.ground} onChange={e => { playClick(); setForm(f => ({ ...f, ground: e.target.value })); }}
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors bg-white/5 border border-white/10">
              {availableVenues.map(g => <option key={g} value={g} className="bg-[#0A0C10]">{g}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors bg-white/5 border border-white/10"
                style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors bg-white/5 border border-white/10"
                style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2 stat-mono">Max Players: {form.maxPlayers}</label>
            <input type="range" min={2} max={22} value={form.maxPlayers} onChange={e => setForm(f => ({ ...f, maxPlayers: Number(e.target.value) }))}
              className="w-full accent-[#CCFF00]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              placeholder="e.g. Competitive doubles match, bring your own racket!"
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00] resize-none bg-white/5 border border-white/10" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-black text-[#040507] text-sm btn-volt"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-[#040507]/40 border-t-[#040507] rounded-full animate-spin" />Hosting...</> : <><Zap className="w-4 h-4" />Host Match (+15 🪙)</>}
          </button>
        </form>
      </motion.div>
    </>
  );
}

// ── Post Card ───────────────────────────────────────────────────────────────
function PostCard({
  post,
  onJoined,
  onViewPlayers,
  onOpenChat,
  onOpenTurf,
}: {
  post: any;
  onJoined: () => void;
  onViewPlayers: (post: any) => void;
  onOpenChat: (post: any) => void;
  onOpenTurf: (post: any) => void;
}) {
  const { currentUser } = useUIStore();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isOwner = currentUser?.id === post.userId;
  const isFull = post.currentPlayers >= post.maxPlayers;
  const pct = Math.min(100, (post.currentPlayers / post.maxPlayers) * 100);
  const scheduledTime = post.scheduledStart ? new Date(post.scheduledStart) : null;
  const tier = getTier(post.user?.glickoRating ?? 1500);
  const spotsLeft = post.maxPlayers - post.currentPlayers;
  const isUrgent = spotsLeft === 1;
  const sportEmoji = SPORT_EMOJIS[post.sport] || '🏅';

  const handleJoin = async () => {
    if (!currentUser) return;
    setJoining(true); setError('');
    try {
      const res = await fetch('/api/posts/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) });
      const data = await res.json();
      if (data.success) {
        setJoined(true);
        onJoined();
        playCoin();
        try {
          const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
          const { useUIStore } = await import('@/store/uiStore');
          useUIStore.getState().updateCoins(10, 'Joined a Match');
          useUIStore.getState().incrementMatchesJoined();
          emitCoinEarn({ amount: 10, reason: 'Joined a Match Lobby!', icon: '⚡' });
        } catch {}
      }
      else setError(data.error || 'Failed to join');
    } catch { setError('Network error'); }
    setJoining(false);
  };

  const handleShare = () => {
    playClick();
    const url = `${window.location.origin}/feed?post=${post.id}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleWhatsApp = () => {
    playClick();
    const url = `${window.location.origin}/feed?post=${post.id}`;
    const msg = encodeURIComponent(`🏅 [${post.sport} MATCH LINEUP]\n📍 Venue: ${post.ground}\n⏰ Time: ${scheduledTime ? scheduledTime.toLocaleString('en-IN') : 'Soon'}\n👥 Squad: ${post.currentPlayers}/${post.maxPlayers} Filled (${spotsLeft} Spot${spotsLeft !== 1 ? 's' : ''} Open!)\n\n👉 Tap to lock in your slot: ${url}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`rounded-3xl border p-5 transition-all relative overflow-hidden group ${
        isUrgent ? 'border-[#FF2A55]/50' : isFull ? 'border-white/5' : 'border-white/10 hover:border-[#CCFF00]/40'
      }`}
      style={{
        background: '#0A0C10',
        boxShadow: isUrgent ? '0 4px 30px rgba(255,42,85,0.15)' : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        {post.user && <Avatar user={post.user} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm font-[family-name:var(--font-outfit)]">{post.user?.name || 'Unknown'}</span>
            {isOwner && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] font-bold stat-mono">HOST</span>}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold stat-mono" style={{ background: tier.bg, color: tier.color }}>{tier.emoji} {tier.label}</span>
          </div>
          <p className="text-[11px] text-[#6b6b80]">{post.user?.hostel}</p>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-4 bg-white/[0.025] border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{sportEmoji}</span>
          <h3 className="font-black text-white text-base font-[family-name:var(--font-outfit)]">{post.sport} Match</h3>
          {isUrgent && !isFull && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF2A55]/20 text-[#FF2A55] border border-[#FF2A55]/30 animate-pulse stat-mono">
              🔥 LAST SPOT!
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[#a0a0b8]">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#CCFF00]" />{post.ground}</span>
          {scheduledTime && <span className="flex items-center gap-1 stat-mono"><Clock className="w-3 h-3 text-[#00F0FF]" />{scheduledTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {scheduledTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#6b6b80] flex items-center gap-1 stat-mono"><Users className="w-3 h-3" />{post.currentPlayers}/{post.maxPlayers} ATHLETES</span>
          <span className="font-black text-xs stat-mono" style={{ color: isFull ? '#FF2A55' : spotsLeft <= 2 ? '#CCFF00' : '#00F0FF' }}>
            {isFull ? '🔴 FULL' : spotsLeft <= 2 ? `⚠️ ${spotsLeft} LEFT` : `✅ ${spotsLeft} SPOTS OPEN`}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-white/5">
          <div
            style={{ width: `${pct}%`, background: isFull ? '#FF2A55' : 'linear-gradient(90deg, #CCFF00, #00F0FF)' }}
            className="h-full rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { playClick(); onViewPlayers(post); }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
        >
          <Eye className="w-3.5 h-3.5" />Players
        </button>

        <button
          onClick={() => { playClick(); onOpenChat(post); }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/25"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Chat & Pings
        </button>

        <button
          onClick={() => { playClick(); onOpenTurf(post); }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25"
        >
          <Store className="w-3.5 h-3.5" /> Book Turf
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-emerald-500/10 text-[#25D366] border border-[#25D366]/30"
        >
          💬 WhatsApp
        </button>

        <div className="flex-1" />

        {isOwner ? (
          <span className="text-xs font-bold text-[#CCFF00] px-4 py-2 rounded-xl stat-mono bg-[#CCFF00]/10 border border-[#CCFF00]/30">
            HOST
          </span>
        ) : joined ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#CCFF00] px-4 py-2 rounded-xl stat-mono bg-[#CCFF00]/10 border border-[#CCFF00]/30">
            <CheckCircle className="w-3.5 h-3.5" />JOINED
          </span>
        ) : !currentUser ? (
          <a href="/login" className="btn-volt text-xs font-black px-5 py-2">
            Sign In
          </a>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining || isFull}
            className="btn-volt text-xs font-black px-5 py-2"
          >
            {joining ? '...' : isFull ? '🔴 Full' : '⚡ Join (+10 🪙)'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Feed Page ──────────────────────────────────────────────────────────
export default function FeedPage() {
  const { currentUser } = useUIStore();
  const campusConfig = getActiveCampusConfig();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [viewPost, setViewPost] = useState<any>(null);
  const [chatPost, setChatPost] = useState<any>(null);
  const [turfPost, setTurfPost] = useState<any>(null);
  const [activeFlares, setActiveFlares] = useState<any[]>([]);

  const fetchPosts = useCallback(async () => {
    try {
      const url = sport !== 'All' ? `/api/posts?sport=${encodeURIComponent(sport)}` : '/api/posts';
      const res = await fetch(url);
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  }, [sport]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleBroadcastFlare = (flare: any) => {
    setActiveFlares(prev => [flare, ...prev]);
  };

  return (
    <main className="min-h-screen bg-[#040507] pt-24 pb-28 px-4 text-white">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 mb-1.5">
              <span>{campusConfig.emblem}</span> {campusConfig.shortName} Campus Hub
            </div>
            <h1 className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">Campus Match Radar</h1>
            <p className="text-xs text-[#6b6b80] stat-mono">{posts.length} ACTIVE MATCH LOBBIES</p>
          </div>

          <div className="flex items-center gap-2">
            {/* SOS Flash Flare Button */}
            <button
              onClick={() => {
                playClick();
                setShowSOS(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF2A55] to-[#DB0A40] shadow-lg shadow-[#FF2A55]/30 flex items-center gap-1.5 animate-pulse"
            >
              <Flame className="w-3.5 h-3.5 fill-current" /> SOS Flare
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  playClick();
                  setShowCreate(true);
                }}
                className="btn-volt flex items-center gap-1.5 px-4 py-2 text-xs font-black"
              >
                <Plus className="w-3.5 h-3.5" /> Host Match
              </button>
            )}
          </div>
        </div>

        {/* Active Emergency SOS Flares Broadcast Banner */}
        {activeFlares.length > 0 && (
          <div className="space-y-2">
            {activeFlares.map(f => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl border border-[#FF2A55]/50 bg-[#FF2A55]/15 flex items-center justify-between gap-3 shadow-lg shadow-[#FF2A55]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF2A55] text-white flex items-center justify-center text-lg shrink-0">
                    🚨
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">
                      [URGENT] {f.spotsNeeded} Player Needed for {f.sport}!
                    </span>
                    <span className="text-[11px] text-[#a0a0b8]">
                      📍 {f.venue} · Broadcasted by {f.hostName} ({f.hostHostel}) · Starts in {f.expiresIn}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`I can join your ${f.sport} match at ${f.venue} right now!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#FF2A55] text-white shrink-0 shadow-md"
                >
                  Join Flare
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {/* Live Campus Court Crowd Radar */}
        <CourtCrowdRadar />

        {/* Campus Peer Gear Locker */}
        <PeerGearLocker />

        {/* Sport Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SPORTS.map(s => (
            <button
              key={s}
              onClick={() => {
                playClick();
                setSport(s);
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                sport === s
                  ? 'bg-[#CCFF00] text-[#040507] shadow-md shadow-[#CCFF00]/20'
                  : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/5'
              }`}
            >
              {SPORT_EMOJIS[s] || ''} {s}
            </button>
          ))}
        </div>

        {/* Match Posts & Native Sponsors */}
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-8 h-8 border-2 border-[#CCFF00]/30 border-t-[#CCFF00] rounded-full animate-spin mb-3" />
            <p className="text-[#6b6b80] text-xs font-mono">LOADING CAMPUS LOBBIES...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-white/5 bg-[#0A0C10] p-8">
            <div className="text-4xl mb-3">{SPORT_EMOJIS[sport] || '🏅'}</div>
            <h3 className="text-white font-bold text-base mb-1">No active {sport === 'All' ? '' : sport} matches on campus</h3>
            <p className="text-[#6b6b80] text-xs mb-4">Be the first athlete to host a lobby!</p>
            {currentUser ? (
              <button onClick={() => setShowCreate(true)} className="btn-volt px-6 py-2.5 text-xs font-black">
                Host a Match
              </button>
            ) : (
              <a href="/login" className="btn-volt px-6 py-2.5 text-xs font-black">Sign In to Host</a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p, idx) => (
              <div key={p.id} className="space-y-4">
                <PostCard
                  post={p}
                  onJoined={fetchPosts}
                  onViewPlayers={setViewPost}
                  onOpenChat={setChatPost}
                  onOpenTurf={setTurfPost}
                />

                {/* Native Sponsor Card every 3rd match */}
                {(idx + 1) % 3 === 0 && (
                  <NativeSponsorCard index={Math.floor(idx / 3)} />
                )}

                {/* Campus Gear Deals Widget after 2nd match */}
                {idx === 1 && (
                  <AffiliateGearWidget />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {showCreate && (
            <CreatePostModal
              onClose={() => setShowCreate(false)}
              onCreated={fetchPosts}
              campusVenues={campusConfig.venues}
            />
          )}
          {showSOS && (
            <SOSFlareModal
              isOpen={showSOS}
              onClose={() => setShowSOS(false)}
              onBroadcast={handleBroadcastFlare}
            />
          )}
          {viewPost && <ParticipantsModal post={viewPost} onClose={() => setViewPost(null)} />}
        </AnimatePresence>

        {/* In-Lobby Chat Drawer */}
        <LobbyChatDrawer
          postId={chatPost?.id || ''}
          sport={chatPost?.sport || 'Match'}
          ground={chatPost?.ground}
          isOpen={Boolean(chatPost)}
          onClose={() => setChatPost(null)}
          currentUser={currentUser}
        />

        {/* Commercial Turf Booking Modal */}
        <TurfBookingWidget
          collegeName={campusConfig.shortName}
          sport={turfPost?.sport || 'Football'}
          isOpen={Boolean(turfPost)}
          onClose={() => setTurfPost(null)}
        />
      </div>
    </main>
  );
}
