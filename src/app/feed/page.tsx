'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Users, RefreshCw, Share2, Eye, CheckCircle, Zap, MapPin, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const SPORTS = ['All', 'Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Chess'];
const GROUNDS = ['Main Ground (Football/Cricket)', 'MH Cricket Net', 'Basketball Court', 'Indoor Badminton Hall', 'Table Tennis Room', 'Volleyball Court', 'Gymkhana Hall', 'Outdoor Multi-Courts', 'Swimming Pool', 'Anna Auditorium Ground'];
const SPORT_EMOJIS: Record<string, string> = { Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀', 'Table Tennis': '🏓', Volleyball: '🏐', Kabaddi: '🤼', Tennis: '🎾', Chess: '♟️', default: '🏅' };

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', color: '#ffd60a' };
  if (rating >= 1800) return { label: 'Diamond', color: '#00f5d4' };
  if (rating >= 1600) return { label: 'Platinum', color: '#a855f7' };
  if (rating >= 1400) return { label: 'Gold', color: '#f59e0b' };
  return { label: 'Rookie', color: '#6b6b80' };
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
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${tier.color}15`, color: tier.color }}>{tier.label}</span>
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
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isOwner = currentUser?.id === post.userId;
  const isFull = post.currentPlayers >= post.maxPlayers;
  const pct = Math.min(100, (post.currentPlayers / post.maxPlayers) * 100);
  const scheduledTime = post.scheduledStart ? new Date(post.scheduledStart) : null;
  const tier = getTier(post.user?.glickoRating ?? 1500);

  const handleJoin = async () => {
    if (!currentUser) return;
    setJoining(true); setError('');
    try {
      const res = await fetch('/api/posts/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) });
      const data = await res.json();
      if (data.success) { setJoined(true); onJoined(); }
      else setError(data.error || 'Failed to join');
    } catch { setError('Network error'); }
    setJoining(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 p-5 hover:border-white/15 transition-all"
      style={{ background: 'rgba(17,17,24,0.9)' }}>

      {/* Creator row */}
      <div className="flex items-center gap-3 mb-4">
        {post.user && <Avatar user={post.user} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm font-outfit">{post.user?.name || 'Unknown'}</span>
            {isOwner && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7b2ff7]/15 text-[#7b2ff7] font-bold">Your Post</span>}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${tier.color}15`, color: tier.color }}>{tier.label}</span>
          </div>
          <p className="text-[11px] text-[#6b6b80] font-body">{post.user?.hostel}</p>
        </div>
        <div className="text-2xl">{SPORT_EMOJIS[post.sport] || '🏅'}</div>
      </div>

      {/* Match details */}
      <div className="mb-3">
        <h3 className="font-black text-white text-base font-outfit mb-1">{post.sport} Match</h3>
        <div className="flex flex-wrap gap-3 text-xs text-[#a0a0b8] font-body">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#00f5d4]" />{post.ground}</span>
          {scheduledTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#7b2ff7]" />{scheduledTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {scheduledTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        {post.description && <p className="text-sm text-[#a0a0b8] mt-2 font-body leading-relaxed">{post.description}</p>}
      </div>

      {/* Slots Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#6b6b80] font-body flex items-center gap-1"><Users className="w-3 h-3" />{post.currentPlayers}/{post.maxPlayers} players</span>
          <span className="font-bold" style={{ color: isFull ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981' }}>
            {isFull ? 'FULL' : `${post.maxPlayers - post.currentPlayers} spots left`}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
            className="h-full rounded-full" style={{ background: isFull ? '#ef4444' : 'linear-gradient(90deg, #7b2ff7, #00f5d4)' }} />
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-xs mb-3 font-body">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* View Players */}
        <button onClick={() => onViewPlayers(post)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:bg-white/8"
          style={{ color: '#a0a0b8', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Eye className="w-3.5 h-3.5" />Players
        </button>

        {/* Share */}
        <button onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:bg-white/8"
          style={{ color: copied ? '#10b981' : '#a0a0b8', border: '1px solid rgba(255,255,255,0.08)' }}>
          {copied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Share2 className="w-3.5 h-3.5" />Share</>}
        </button>

        <div className="flex-1" />

        {/* Join / Owner / Full */}
        {isOwner ? (
          <span className="text-xs font-bold text-[#7b2ff7] px-4 py-2 rounded-xl" style={{ background: 'rgba(123,47,247,0.12)', border: '1px solid rgba(123,47,247,0.2)' }}>
            Manage Match
          </span>
        ) : joined ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-4 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle className="w-3.5 h-3.5" />Joined!
          </span>
        ) : !currentUser ? (
          <a href="/login" className="text-xs font-bold text-white px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>Sign In to Join</a>
        ) : (
          <button onClick={handleJoin} disabled={joining || isFull}
            className="text-xs font-bold text-white px-5 py-2 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: isFull ? '#2a2a3a' : 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
            {joining ? '...' : isFull ? 'Full' : 'Join'}
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
