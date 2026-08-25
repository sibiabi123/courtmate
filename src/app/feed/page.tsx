'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Users, RefreshCw, Share2, Eye, CheckCircle, Zap, MapPin, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { LiveScoreboardTicker } from '@/components/ui/LiveScoreboardTicker';
import { ProfileProgressWidget } from '@/components/ui/ProfileProgressWidget';

const SPORTS = ['All', 'Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Chess'];
const GROUNDS = ['Main Sports Arena', 'Cricket Nets Arena', 'Basketball Center Court', 'Indoor Badminton Complex', 'Table Tennis Hall', 'Volleyball Court', 'Athletic Complex', 'Outdoor Multi-Courts', 'Olympic Swimming Pool', 'Central Sports Ground'];
const SPORT_EMOJIS: Record<string, string> = { Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀', 'Table Tennis': '🏓', Volleyball: '🏐', Kabaddi: '🤼', Tennis: '🎾', Chess: '♟️', default: '🏅' };

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#ffd60a', bg: 'rgba(255,214,10,0.12)' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00f5d4', bg: 'rgba(0,245,212,0.12)' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  if (rating >= 1000) return { label: 'Bronze', emoji: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80', bg: 'rgba(107,107,128,0.12)' };
}

function Avatar({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (user?.avatar?.startsWith('http')) return <img src={user.avatar} alt={user.name} className={`${s} rounded-full object-cover shrink-0`} />;
  return <div className={`${s} rounded-full flex items-center justify-center font-black text-white shrink-0`} style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>{initials}</div>;
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
    navigator.clipboard.writeText(shareLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const whatsappMsg = `Join my ${post.sport} match at ${post.ground}! ${shareLink}`;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: 'rgba(15,15,22,0.98)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div>
            <h3 className="font-black text-white font-outfit text-lg">{SPORT_EMOJIS[post.sport] || '🏅'} {post.sport} Players</h3>
            <p className="text-xs text-[#6b6b80] font-body mt-0.5">{post.ground} · {participants.length}/{post.maxPlayers} slots filled</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:text-white hover:bg-white/8 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creator info */}
        {post.user && (
          <div className="mx-5 mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(123,47,247,0.1)', border: '1px solid rgba(123,47,247,0.2)' }}>
            <Avatar user={post.user} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{post.user.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7b2ff7]/20 text-[#7b2ff7] font-bold">Creator</span>
              </div>
              <p className="text-[11px] text-[#6b6b80]">{post.user.hostel}</p>
            </div>
          </div>
        )}

        {/* Participants list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[#7b2ff7]/30 border-t-[#7b2ff7] rounded-full animate-spin" /></div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-[#6b6b80] text-sm font-body">No one has joined yet. Be the first!</p>
            </div>
          ) : participants.map((p, i) => {
            const tier = getTier(p.glickoRating || 1500);
            const isMe = p.id === currentUser?.id;
            const isCreator = p.id === post.userId;
            const hasContact = p.contact?.phone || p.contact?.whatsapp || p.contact?.telegram || p.contact?.instagram;
            return (
              <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: isMe ? 'rgba(0,245,212,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isMe ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                <div className="flex items-center gap-3 p-3">
                  <span className="text-[#6b6b80] font-bold text-sm w-5 text-center">#{i + 1}</span>
                  <Avatar user={p} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      {isMe && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00f5d4]/15 text-[#00f5d4] font-bold">You</span>}
                      {isCreator && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#7b2ff7]/15 text-[#7b2ff7] font-bold">Creator</span>}
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: tier.bg, color: tier.color }}>{tier.emoji} {tier.label}</span>
                    </div>
                    <p className="text-[11px] text-[#6b6b80]">{p.hostel} · ELO {Math.round(p.glickoRating || 1500)}</p>
                    {p.bio && <p className="text-[11px] text-[#a0a0b8] mt-0.5 italic">"{p.bio}"</p>}
                  </div>
                  <div className="text-[11px] text-[#6b6b80]">{new Date(p.joinedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {/* Contact buttons */}
                {!isMe && hasContact && (
                  <div className="flex gap-1.5 px-3 pb-3">
                    {p.contact?.whatsapp && (
                      <a href={`https://wa.me/${p.contact.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>📲 WhatsApp</a>
                    )}
                    {p.contact?.phone && (
                      <a href={`tel:${p.contact.phone}`}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                        style={{ background: 'rgba(59,130,246,0.8)' }}>📞 Call</a>
                    )}
                    {p.contact?.telegram && (
                      <a href={`https://t.me/${p.contact.telegram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                        style={{ background: 'rgba(0,136,204,0.8)' }}>✈️ Telegram</a>
                    )}
                    {p.contact?.instagram && (
                      <a href={`https://instagram.com/${p.contact.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>📷 Instagram</a>
                    )}
                  </div>
                )}
                {!isMe && !hasContact && (
                  <p className="text-[10px] text-[#4b4b5a] px-3 pb-2 italic">No contact info shared</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Share Footer */}
        <div className="p-4 border-t border-white/8 flex gap-2">
          <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: copied ? '#10b981' : '#a0a0b8', border: '1px solid rgba(255,255,255,0.08)' }}>
            {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy Link</>}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
            📲 WhatsApp
          </a>
        </div>
      </motion.div>
    </>
  );
}

// ── Create Post Modal ───────────────────────────────────────────────────────
function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { currentUser } = useUIStore();
  const [form, setForm] = useState({ sport: 'Cricket', ground: GROUNDS[0], maxPlayers: 10, date: '', time: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { setError('You must be logged in.'); return; }
    setLoading(true); setError('');
    try {
      const scheduledStart = form.date && form.time ? new Date(`${form.date}T${form.time}`) : new Date(Date.now() + 3600000);
      const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, scheduledStart }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create post');
      // Reward coins for posting a match
      try {
        const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
        const { useUIStore } = await import('@/store/uiStore');
        useUIStore.getState().updateCoins(15, 'Posted a Match Lobby');
        useUIStore.getState().incrementMatchesPosted();
        emitCoinEarn({ amount: 15, reason: 'Match Lobby Created! (+15 🪙)', icon: '🏅' });
        const { sound } = await import('@/lib/sound');
        sound.playVictory();
      } catch {}
      onCreated(); onClose();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: 'rgba(15,15,22,0.98)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black font-outfit text-white">Post a Match</h3>
            <p className="text-xs text-[#6b6b80] mt-0.5 font-body">Find players for your next game</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:bg-white/8 transition-all"><X className="w-4 h-4" /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sport */}
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Sport</label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.filter(s => s !== 'All').map(s => (
                <button type="button" key={s} onClick={() => setForm(f => ({ ...f, sport: s }))}
                  className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: form.sport === s ? '#7b2ff7' : 'rgba(255,255,255,0.03)', color: form.sport === s ? 'white' : '#6b6b80', border: `1px solid ${form.sport === s ? '#7b2ff7' : 'rgba(255,255,255,0.08)'}` }}>
                  <span className="text-lg">{SPORT_EMOJIS[s] || '🏅'}</span>{s}
                </button>
              ))}
            </div>
          </div>

          {/* Ground */}
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Venue</label>
            <select value={form.ground} onChange={e => setForm(f => ({ ...f, ground: e.target.value }))}
              className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-[#7b2ff7] transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {GROUNDS.map(g => <option key={g} value={g} className="bg-[#111118]">{g}</option>)}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl px-3 py-3 text-sm text-white font-body focus:outline-none focus:border-[#7b2ff7] transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full rounded-xl px-3 py-3 text-sm text-white font-body focus:outline-none focus:border-[#7b2ff7] transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Max Players: {form.maxPlayers}</label>
            <input type="range" min={2} max={22} value={form.maxPlayers} onChange={e => setForm(f => ({ ...f, maxPlayers: Number(e.target.value) }))}
              className="w-full accent-[#7b2ff7]" />
            <div className="flex justify-between text-[10px] text-[#6b6b80] mt-1"><span>2</span><span>22</span></div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              placeholder="e.g. Friendly match, any skill level welcome! Bring your own equipment."
              className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-[#7b2ff7] transition-colors resize-none placeholder:text-[#4b4b5a]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Posting...</> : <><Zap className="w-4 h-4" />Post Match</>}
          </button>
        </form>
      </motion.div>
    </>
  );
}

// ── Post Card ───────────────────────────────────────────────────────────────
function PostCard({ post, onJoined, onViewPlayers }: { post: any; onJoined: () => void; onViewPlayers: (post: any) => void }) {
  const { currentUser } = useUIStore();
  const { earnForJoiningMatch } = require('@/hooks/useCoinEarn').useCoinEarn ? (() => {
    try { return require('@/hooks/useCoinEarn').useCoinEarn(); } catch { return {}; }
  })() : {};
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
        // Earn coins for joining
        try {
          const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
          const { useUIStore } = await import('@/store/uiStore');
          useUIStore.getState().updateCoins(10, 'Joined a Match');
          useUIStore.getState().incrementMatchesJoined();
          emitCoinEarn({ amount: 10, reason: 'Joined a Match Lobby!', icon: '⚡' });
        } catch {}
        const { sound } = await import('@/lib/sound');
        sound.playCoin();
      }
      else setError(data.error || 'Failed to join');
    } catch { setError('Network error'); }
    setJoining(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleWhatsApp = () => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    const msg = encodeURIComponent(`🏅 Join my ${post.sport} match at ${post.ground}!\n⏰ ${scheduledTime ? scheduledTime.toLocaleString('en-IN') : 'Soon'}\n👥 ${spotsLeft} slot${spotsLeft !== 1 ? 's' : ''} open!\n🔗 ${url}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`rounded-3xl border p-5 transition-all relative overflow-hidden group ${
        isUrgent ? 'border-[#ff006e]/50' : isFull ? 'border-white/5' : 'border-white/10 hover:border-[#7b2ff7]/40'
      }`}
      style={{
        background: 'linear-gradient(145deg, rgba(17,17,24,0.95), rgba(10,10,15,0.95))',
        boxShadow: isUrgent
          ? '0 4px 30px rgba(255,0,110,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Urgency top bar */}
      {isUrgent && !isFull && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ff006e] via-[#ffd60a] to-[#ff006e] animate-pulse" />
      )}

      {/* Sport icon watermark */}
      <div className="absolute top-4 right-4 text-5xl opacity-5 pointer-events-none select-none font-black">
        {sportEmoji}
      </div>

      {/* Creator row */}
      <div className="flex items-center gap-3 mb-4">
        {post.user && <Avatar user={post.user} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm font-outfit">{post.user?.name || 'Unknown'}</span>
            {isOwner && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7b2ff7]/15 text-[#7b2ff7] font-bold">Your Post</span>}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: tier.bg, color: tier.color }}>{tier.emoji} {tier.label}</span>
          </div>
          <p className="text-[11px] text-[#6b6b80] font-body">{post.user?.hostel}</p>
        </div>
        {/* Coin earn hint */}
        {!isOwner && !joined && !isFull && currentUser && (
          <span className="text-[10px] font-black text-[#ffd60a] bg-[#ffd60a]/10 border border-[#ffd60a]/20 px-2 py-1 rounded-lg">+10 🪙</span>
        )}
      </div>

      {/* Match info block */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{sportEmoji}</span>
          <h3 className="font-black text-white text-base font-outfit">{post.sport} Match</h3>
          {isUrgent && !isFull && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#ff006e]/20 text-[#ff006e] border border-[#ff006e]/30 animate-pulse">
              🔥 LAST SPOT!
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[#a0a0b8] font-body">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#00f5d4]" />{post.ground}</span>
          {scheduledTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#7b2ff7]" />{scheduledTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {scheduledTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        {post.description && <p className="text-xs text-[#a0a0b8] mt-2 font-body leading-relaxed">{post.description}</p>}
      </div>

      {/* Slots Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#6b6b80] font-body flex items-center gap-1"><Users className="w-3 h-3" />{post.currentPlayers}/{post.maxPlayers} players</span>
          <span className="font-black text-xs" style={{ color: isFull ? '#ef4444' : spotsLeft <= 2 ? '#f59e0b' : '#10b981' }}>
            {isFull ? '🔴 FULL' : spotsLeft <= 2 ? `⚠️ ${spotsLeft} left!` : `✅ ${spotsLeft} spots open`}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: isFull ? '#ef4444' : pct >= 80 ? 'linear-gradient(90deg, #f59e0b, #ff006e)' : 'linear-gradient(90deg, #7b2ff7, #00f5d4)' }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
          </motion.div>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs mb-3 font-body">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onViewPlayers(post)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:bg-white/8 text-[#a0a0b8] hover:text-white"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Eye className="w-3.5 h-3.5" />Players
        </button>

        {/* WhatsApp Share */}
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:bg-emerald-500/10 text-[#25D366] hover:text-emerald-300"
          style={{ border: '1px solid rgba(37,211,102,0.2)' }}
        >
          💬 WhatsApp
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:bg-white/8"
          style={{ color: copied ? '#10b981' : '#a0a0b8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {copied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Share2 className="w-3.5 h-3.5" />Link</>}
        </button>

        <div className="flex-1" />

        {isOwner ? (
          <span className="text-xs font-bold text-[#7b2ff7] px-4 py-2 rounded-xl" style={{ background: 'rgba(123,47,247,0.12)', border: '1px solid rgba(123,47,247,0.2)' }}>
            📋 Your Lobby
          </span>
        ) : joined ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-4 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle className="w-3.5 h-3.5" />Joined! +10 🪙
          </span>
        ) : !currentUser ? (
          <a href="/login" className="text-xs font-bold text-white px-5 py-2 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
            Sign In to Join
          </a>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining || isFull}
            className="text-xs font-black text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg"
            style={{ background: isFull ? 'rgba(42,42,58,1)' : 'linear-gradient(135deg, #7b2ff7, #00f5d4)', boxShadow: isFull ? 'none' : '0 0 20px rgba(123,47,247,0.3)' }}
          >
            {joining ? <span className="inline-flex items-center gap-1"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /></span> : isFull ? '🔴 Full' : '⚡ Join (+10 🪙)'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Feed Page ──────────────────────────────────────────────────────────
export default function FeedPage() {
  const { currentUser } = useUIStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [viewPost, setViewPost] = useState<any>(null);
  const [showMyMatches, setShowMyMatches] = useState(false);

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

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(fetchPosts, 30000);
    return () => clearInterval(t);
  }, [fetchPosts]);

  const myPosts = posts.filter(p => p.userId === currentUser?.id);
  const joinedPosts = posts.filter(p => p.userId !== currentUser?.id);

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-20 pb-28 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-black text-white font-outfit">Match Feed</h1>
            <p className="text-xs text-[#6b6b80] font-body">{posts.length} open matches · auto-refreshes</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchPosts} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6b6b80] hover:text-white hover:bg-white/8 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <RefreshCw className="w-4 h-4" />
            </button>
            {currentUser && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                <Plus className="w-4 h-4" />Post Match
              </button>
            )}
          </div>
        </div>

        {/* My Matches */}
        {currentUser && myPosts.length > 0 && (
          <div className="mb-5 rounded-2xl border border-[#7b2ff7]/20 overflow-hidden" style={{ background: 'rgba(123,47,247,0.05)' }}>
            <button onClick={() => setShowMyMatches(!showMyMatches)}
              className="w-full flex items-center justify-between px-4 py-3">
              <span className="font-bold text-[#7b2ff7] text-sm flex items-center gap-2 font-outfit">
                🏅 My Posted Matches <span className="bg-[#7b2ff7] text-white text-[10px] px-1.5 py-0.5 rounded-full">{myPosts.length}</span>
              </span>
              {showMyMatches ? <ChevronUp className="w-4 h-4 text-[#7b2ff7]" /> : <ChevronDown className="w-4 h-4 text-[#7b2ff7]" />}
            </button>
            <AnimatePresence>
              {showMyMatches && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3">
                    {myPosts.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-xl">{SPORT_EMOJIS[p.sport] || '🏅'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white font-outfit">{p.sport} at {p.ground}</p>
                          <p className="text-xs text-[#6b6b80] font-body">{p.currentPlayers}/{p.maxPlayers} players joined</p>
                        </div>
                        <button onClick={() => setViewPost(p)} className="text-xs font-bold text-[#00f5d4] flex items-center gap-1">
                          <Eye className="w-3 h-3" />View
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile Unlock Progress */}
        <div className="mb-6">
          <ProfileProgressWidget />
        </div>

        {/* Live Broadcast Scoreboard Ticker */}
        <div className="mb-6">
          <LiveScoreboardTicker />
        </div>

        {/* Sport Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
          {SPORTS.map(s => (
            <button key={s} onClick={() => setSport(s)}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: sport === s ? '#7b2ff7' : 'rgba(255,255,255,0.04)', color: sport === s ? 'white' : '#6b6b80', border: `1px solid ${sport === s ? '#7b2ff7' : 'rgba(255,255,255,0.08)'}` }}>
              {SPORT_EMOJIS[s] || ''} {s}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-2 border-[#7b2ff7]/30 border-t-[#7b2ff7] rounded-full animate-spin mb-4" />
            <p className="text-[#6b6b80] text-sm font-body">Loading matches...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{SPORT_EMOJIS[sport] || '🏅'}</div>
            <h3 className="text-white font-bold text-lg font-outfit mb-2">No {sport === 'All' ? '' : sport} matches right now</h3>
            <p className="text-[#6b6b80] text-sm mb-6 font-body">Be the first to post a match!</p>
            {currentUser ? (
              <button onClick={() => setShowCreate(true)} className="px-8 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                Post a Match
              </button>
            ) : (
              <a href="/login" className="px-8 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>Sign In to Post</a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(p => (
              <PostCard key={p.id} post={p} onJoined={fetchPosts} onViewPlayers={setViewPost} />
            ))}
          </div>
        )}

        {/* Floating Quick Match Button (mobile) */}
        {currentUser && (
          <motion.button onClick={() => setShowCreate(true)} whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center md:hidden"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', boxShadow: '0 0 30px rgba(123,47,247,0.5)' }}
            animate={{ boxShadow: ['0 0 20px rgba(123,47,247,0.4)', '0 0 40px rgba(0,245,212,0.4)', '0 0 20px rgba(123,47,247,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <Zap className="w-6 h-6 text-white" />
          </motion.button>
        )}

        {/* Modals */}
        <AnimatePresence>
          {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onCreated={fetchPosts} />}
          {viewPost && <ParticipantsModal post={viewPost} onClose={() => setViewPost(null)} />}
        </AnimatePresence>
      </div>
    </main>
  );
}
