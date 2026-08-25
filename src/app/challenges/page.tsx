'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Zap, Plus, X, Clock, MapPin, Users, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';

const SPORTS = ['All', 'Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Chess'];
const GROUNDS = ['Main Sports Arena', 'Cricket Nets Arena', 'Basketball Center Court', 'Indoor Badminton Complex', 'Table Tennis Hall', 'Volleyball Court', 'Athletic Complex', 'Outdoor Multi-Courts'];
const SPORT_EMOJIS: Record<string, string> = { Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀', 'Table Tennis': '🏓', Volleyball: '🏐', Kabaddi: '🤼', Tennis: '🎾', Chess: '♟️', default: '🏅' };

function getTier(rating: number) {
  if (rating >= 2000) return { label: 'Champion', emoji: '👑', color: '#ffd60a' };
  if (rating >= 1800) return { label: 'Diamond', emoji: '💎', color: '#00f5d4' };
  if (rating >= 1600) return { label: 'Platinum', emoji: '⚡', color: '#a855f7' };
  if (rating >= 1400) return { label: 'Gold', emoji: '🥇', color: '#f59e0b' };
  if (rating >= 1200) return { label: 'Silver', emoji: '🥈', color: '#94a3b8' };
  if (rating >= 1000) return { label: 'Bronze', emoji: '🥉', color: '#cd7f32' };
  return { label: 'Rookie', emoji: '🌱', color: '#6b6b80' };
}

function Avatar({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (user?.avatar?.startsWith('http')) return <img src={user.avatar} alt={user.name} className={`${s} rounded-full object-cover shrink-0`} />;
  return <div className={`${s} rounded-full flex items-center justify-center font-black text-white shrink-0`} style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>{initials}</div>;
}

export default function ChallengesPage() {
  const { currentUser, isAuthenticated } = useUIStore();
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>('open');
  const [selectedSport, setSelectedSport] = useState('All');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    sport: 'Cricket',
    ground: 'Main Ground',
    scheduledAt: '',
    description: '',
    mode: 'ranked',
    rankingPointsStake: 25,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      let url = '/api/challenges';
      if (activeTab === 'mine' && currentUser) {
        url += `?status=all&userId=${currentUser.id}`;
      } else {
        url += `?status=open`;
      }
      if (selectedSport !== 'All') {
        url += `${url.includes('?') ? '&' : '?'}sport=${encodeURIComponent(selectedSport)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [activeTab, selectedSport, currentUser]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('You must be signed in to post a challenge.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post challenge');
      }
      setShowCreate(false);
      fetchChallenges();
    } catch (err: any) {
      setError(err.message || 'Error creating challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (id: string) => {
    if (!isAuthenticated) {
      alert('Please sign in to accept challenges.');
      return;
    }
    setAcceptingId(id);
    try {
      const res = await fetch('/api/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: id, action: 'accept' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchChallenges();
      } else {
        alert(data.error || 'Could not accept challenge.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl p-8 mb-8 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(123,47,247,0.15), rgba(0,245,212,0.1))' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(123,47,247,0.2)', color: '#00f5d4', border: '1px solid rgba(0,245,212,0.3)' }}>
                <Swords className="w-3.5 h-3.5" /> 1v1 & Squad Arena
              </div>
              <h1 className="text-3xl md:text-4xl font-black font-outfit text-white">Campus <span className="text-[#00f5d4]">Challenges</span></h1>
              <p className="text-[#a0a0b8] text-sm mt-1 max-w-xl">Challenge fellow players, stake rank points, prove your skills on campus courts, and rise up the leaderboard!</p>
            </div>

            <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white transition-all shadow-lg hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              <Plus className="w-5 h-5" /> Post A Challenge
            </button>
          </div>
        </motion.div>

        {/* Tab & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
            <button onClick={() => setActiveTab('open')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'open' ? 'bg-[#7b2ff7] text-white shadow-lg' : 'text-[#a0a0b8] hover:text-white'}`}>
              Open Challenges
            </button>
            <button onClick={() => setActiveTab('mine')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mine' ? 'bg-[#7b2ff7] text-white shadow-lg' : 'text-[#a0a0b8] hover:text-white'}`}>
              My Challenges
            </button>
          </div>

          {/* Sport Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
            {SPORTS.map((s) => (
              <button key={s} onClick={() => setSelectedSport(s)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedSport === s ? 'bg-[#00f5d4] text-black' : 'bg-white/5 border border-white/10 text-[#a0a0b8] hover:text-white'}`}>
                {SPORT_EMOJIS[s] || '🎯'} {s}
              </button>
            ))}
          </div>
        </div>

        {/* List of Challenges */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00f5d4] animate-spin mb-3" />
            <p className="text-sm text-[#6b6b80]">Fetching active challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-white/5 bg-white/5">
            <Swords className="w-12 h-12 text-[#6b6b80] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Challenges Found</h3>
            <p className="text-sm text-[#6b6b80] max-w-md mx-auto mb-6">Be the first to step up! Issue a challenge to players across campus.</p>
            <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 text-white border border-white/10 hover:bg-white/20">
              Create First Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((c) => {
              const tier = getTier(c.challenger_rating || 1500);
              const isMine = currentUser && c.challenger_id === currentUser.id;
              const emoji = SPORT_EMOJIS[c.sport] || '🏅';

              return (
                <motion.div key={c.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-5 relative border border-white/10 transition-all hover:border-[#00f5d4]/50" style={{ background: 'rgba(17,17,24,0.85)', backdropFilter: 'blur(16px)' }}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={{ name: c.challenger_name, avatar: c.challenger_avatar }} />
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          {c.challenger_name || 'Anonymous'}
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${tier.color}20`, color: tier.color }}>
                            {tier.emoji} {tier.label}
                          </span>
                        </h4>
                        <p className="text-xs text-[#6b6b80]">{c.challenger_hostel || 'Campus Player'}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${c.mode === 'ranked' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                      {c.mode === 'ranked' ? `⚡ Ranked (+${c.ranking_points_stake || 25} RP)` : '🎮 Casual'}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3.5 mb-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-white text-sm">
                      <span className="flex items-center gap-2">{emoji} {c.sport} Match</span>
                      <span className="text-[#00f5d4]">{c.status.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#a0a0b8]">
                      <MapPin className="w-3.5 h-3.5 text-[#7b2ff7]" /> {c.ground}
                    </div>
                    <div className="flex items-center gap-2 text-[#a0a0b8]">
                      <Clock className="w-3.5 h-3.5 text-[#00f5d4]" /> {c.scheduled_at}
                    </div>
                    {c.description && <p className="text-[#6b6b80] italic pt-1">"{c.description}"</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    {c.status === 'open' && !isMine ? (
                      <button onClick={() => handleAccept(c.id)} disabled={acceptingId === c.id} className="w-full py-2.5 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #00f5d4, #7b2ff7)' }}>
                        {acceptingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                        Accept Challenge
                      </button>
                    ) : isMine ? (
                      <span className="text-xs text-[#6b6b80] font-semibold italic">Your Challenge (Waiting for opponent)</span>
                    ) : (
                      <span className="text-xs text-[#00f5d4] font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Accepted by {c.challenged_name || 'Player'}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create Challenge Modal */}
        <AnimatePresence>
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-3xl p-6 relative border border-white/10 bg-[#111118]">
                <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 text-[#6b6b80] hover:text-white">
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-black font-outfit text-white mb-1 flex items-center gap-2">
                  <Swords className="w-6 h-6 text-[#00f5d4]" /> Issue A Challenge
                </h2>
                <p className="text-xs text-[#6b6b80] mb-6">Select sport, venue, and stakes for your match.</p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase mb-1">Sport</label>
                    <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff7]">
                      {SPORTS.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s} style={{ background: '#111118' }}>{SPORT_EMOJIS[s]} {s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase mb-1">Ground / Venue</label>
                    <select value={form.ground} onChange={(e) => setForm({ ...form, ground: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff7]">
                      {GROUNDS.map((g) => (
                        <option key={g} value={g} style={{ background: '#111118' }}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase mb-1">Scheduled Date & Time</label>
                    <input type="text" placeholder="e.g. Today, 5:30 PM" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff7]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase mb-1">Match Mode</label>
                      <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff7]">
                        <option value="ranked" style={{ background: '#111118' }}>⚡ Ranked (ELO)</option>
                        <option value="casual" style={{ background: '#111118' }}>🎮 Casual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase mb-1">Rank Points Stake</label>
                      <input type="number" min="0" max="100" value={form.rankingPointsStake} onChange={(e) => setForm({ ...form, rankingPointsStake: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff7]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase mb-1">Notes / Description</label>
                    <input type="text" placeholder="e.g. 1v1 Singles, bring your own racket" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff7]" />
                  </div>

                  <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all mt-4 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                    {submitting ? 'Publishing Challenge...' : 'Post Challenge'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
