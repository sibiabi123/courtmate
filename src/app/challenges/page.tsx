'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Trophy, Zap, Plus, X, Clock, MapPin, Users, Shield, Check,
  AlertCircle, Loader2, Flame, Award, ThumbsUp, Sparkles, TrendingUp
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';
import { sound } from '@/lib/sound';

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

// Calculate estimated win percentage based on ELO delta
function getWinProbability(ratingA: number, ratingB: number) {
  const delta = ratingB - ratingA;
  const prob = 1 / (1 + Math.pow(10, delta / 400));
  return Math.round(prob * 100);
}

interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  sport: string;
  mode: 'ranked' | 'casual';
  stake_points: number;
  ground: string;
  match_time: string;
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  winner_id: string | null;
  created_at: string;
  challenger_name?: string;
  challenger_avatar?: string;
  challenger_rating?: number;
  opponent_name?: string;
  opponent_avatar?: string;
  opponent_rating?: number;
}

export default function ChallengesPage() {
  const { currentUser, isAuthenticated } = useUIStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All');
  const [tab, setTab] = useState<'open' | 'my' | 'completed'>('open');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState<Challenge | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, { fire: number; hype: number }>>({});

  // Create Form State
  const [sport, setSport] = useState('Badminton');
  const [mode, setMode] = useState<'ranked' | 'casual'>('ranked');
  const [stakePoints, setStakePoints] = useState(25);
  const [ground, setGround] = useState('Indoor Badminton Complex');
  const [matchTime, setMatchTime] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Report Match State
  const [myScore, setMyScore] = useState('21');
  const [oppScore, setOppScore] = useState('18');
  const [reporting, setReporting] = useState(false);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data.success && Array.isArray(data.challenges)) {
        setChallenges(data.challenges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
    const interval = setInterval(fetchChallenges, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setError('');
    setCreating(true);
    sound.playBattle();

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport,
          mode,
          stake_points: mode === 'ranked' ? stakePoints : 0,
          ground,
          match_time: matchTime || new Date(Date.now() + 3600000).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playCoin();
        try {
          const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
          const { useUIStore } = await import('@/store/uiStore');
          useUIStore.getState().updateCoins(25, 'Issued 1v1 Challenge');
          useUIStore.getState().incrementChallengesIssued();
          emitCoinEarn({ amount: 25, reason: 'Challenge Issued to Arena! (+25 🪙)', icon: '⚔️' });
        } catch {}
        setShowCreateModal(false);
        fetchChallenges();
      } else {
        setError(data.error || 'Failed to create challenge.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleAccept = async (challengeId: string) => {
    if (!isAuthenticated) return;
    sound.playBattle();
    try {
      const res = await fetch('/api/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, action: 'accept' }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        try {
          const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
          const { useUIStore } = await import('@/store/uiStore');
          useUIStore.getState().updateCoins(10, 'Accepted 1v1 Duel');
          emitCoinEarn({ amount: 10, reason: 'Accepted 1v1 Duel! (+10 🪙)', icon: '⚡' });
        } catch {}
        fetchChallenges();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportResult = async () => {
    if (!showReportModal || !currentUser) return;
    setReporting(true);
    sound.playVictory();

    try {
      const isMeWinner = parseInt(myScore) > parseInt(oppScore);
      const winnerId = isMeWinner ? currentUser.id : showReportModal.opponent_id;
      const res = await fetch('/api/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: showReportModal.id,
          action: 'complete',
          winnerId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (isMeWinner) {
          const stake = showReportModal.stake_points || 25;
          try {
            const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
            const { useUIStore } = await import('@/store/uiStore');
            useUIStore.getState().updateCoins(stake, 'Won Ranked Duel');
            emitCoinEarn({ amount: stake, reason: `Victory in Ranked Duel! (+${stake} 🪙)`, icon: '👑' });
          } catch {}
        }
        setShowReportModal(null);
        fetchChallenges();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReporting(false);
    }
  };

  const handleReact = (id: string, type: 'fire' | 'hype') => {
    sound.playClick();
    setReactionCounts(prev => {
      const current = prev[id] || { fire: 3, hype: 2 };
      return {
        ...prev,
        [id]: { ...current, [type]: current[type] + 1 }
      };
    });
  };

  const filteredChallenges = challenges.filter(c => {
    if (selectedSport !== 'All' && c.sport !== selectedSport) return false;
    if (tab === 'open') return c.status === 'open';
    if (tab === 'my') return currentUser && (c.challenger_id === currentUser.id || c.opponent_id === currentUser.id);
    if (tab === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-20 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#7b2ff7]/15 text-[#00f5d4] border border-[#7b2ff7]/30 mb-3">
              <Swords className="w-3.5 h-3.5" /> 1v1 & Squad Challenge Arena
            </div>
            <h1 className="text-4xl font-black font-outfit text-white flex items-center gap-3">
              Challenge <span style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Arena</span>
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-1">Issue ranked duels, stake ranking points, and battle for global tier prestige.</p>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white shadow-xl transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', boxShadow: '0 0 25px rgba(123,47,247,0.3)' }}
              >
                <Plus className="w-5 h-5" /> Post A Challenge
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => sound.playClick()}
                className="flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
              >
                Sign In to Challenge
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'open', label: '⚡ Open Challenges', count: challenges.filter(c => c.status === 'open').length },
            { id: 'my', label: '🛡️ My Duels', count: currentUser ? challenges.filter(c => c.challenger_id === currentUser.id || c.opponent_id === currentUser.id).length : 0 },
            { id: 'completed', label: '🏆 Hall of Results', count: challenges.filter(c => c.status === 'completed').length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                sound.playClick();
                setTab(t.id as any);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                tab === t.id
                  ? 'bg-white/10 text-[#00f5d4] border border-[#00f5d4]/40 shadow-lg shadow-[#00f5d4]/5'
                  : 'text-[#6b6b80] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{t.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 font-mono">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Sport Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {SPORTS.map(s => (
            <button
              key={s}
              onClick={() => {
                sound.playClick();
                setSelectedSport(s);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedSport === s
                  ? 'bg-[#7b2ff7] text-white border border-[#7b2ff7]'
                  : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/5'
              }`}
            >
              <span>{SPORT_EMOJIS[s] || '🏅'}</span>
              <span>{s}</span>
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#00f5d4] animate-spin mb-4" />
            <p className="text-[#6b6b80] text-sm">Scanning Challenge Arena...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.01]">
            <Swords className="w-12 h-12 text-[#4a4a5a] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1 font-outfit">No Active Challenges Found</h3>
            <p className="text-xs text-[#6b6b80] max-w-sm mx-auto mb-6">Be the first to issue a challenge and stake ranking points!</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-2xl font-bold text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
              >
                Create Challenge Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((c, i) => {
              const cRating = c.challenger_rating || 1500;
              const oRating = c.opponent_rating || 1500;
              const winProb = getWinProbability(cRating, oRating);
              const cTier = getTier(cRating);
              const oTier = getTier(oRating);
              const reactions = reactionCounts[c.id] || { fire: 4 + (i % 3), hype: 3 + (i % 2) };

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-white/25 transition-all group"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{SPORT_EMOJIS[c.sport] || '🏅'}</span>
                        <div>
                          <h4 className="font-outfit font-black text-white text-base">{c.sport}</h4>
                          <p className="text-[11px] text-[#6b6b80] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#00f5d4]" /> {c.ground}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          c.mode === 'ranked' ? 'bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30' : 'bg-blue-500/15 text-blue-400'
                        }`}>
                          {c.mode === 'ranked' ? `⚡ ${c.stake_points} RP Stake` : 'Casual'}
                        </span>
                      </div>
                    </div>

                    {/* 1v1 Battle Faceoff Card */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {/* Challenger */}
                        <div className="flex items-center gap-2.5">
                          <img
                            src={c.challenger_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${c.challenger_name}`}
                            alt={c.challenger_name || 'Challenger'}
                            className="h-10 w-10 rounded-xl bg-white/5 p-1 border border-white/10 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-xs text-white truncate max-w-[90px]">{c.challenger_name || 'Player'}</p>
                            <span className="text-[10px] font-semibold" style={{ color: cTier.color }}>
                              {cTier.emoji} {cRating}
                            </span>
                          </div>
                        </div>

                        {/* VS Badge */}
                        <div className="h-7 w-7 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          VS
                        </div>

                        {/* Opponent */}
                        <div className="flex items-center gap-2.5 text-right flex-row-reverse">
                          {c.opponent_name ? (
                            <>
                              <img
                                src={c.opponent_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${c.opponent_name}`}
                                alt={c.opponent_name}
                                className="h-10 w-10 rounded-xl bg-white/5 p-1 border border-white/10 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-xs text-white truncate max-w-[90px]">{c.opponent_name}</p>
                                <span className="text-[10px] font-semibold" style={{ color: oTier.color }}>
                                  {oTier.emoji} {oRating}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="h-10 px-3 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-[10px] text-[#6b6b80] font-bold">
                              Waiting...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ELO Win Probability Bar */}
                      {c.opponent_name && (
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-[#6b6b80] mb-1">
                            <span>{winProb}% Win Chance</span>
                            <span>{100 - winProb}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
                            <div style={{ width: `${winProb}%` }} className="bg-[#7b2ff7]" />
                            <div style={{ width: `${100 - winProb}%` }} className="bg-[#00f5d4]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#6b6b80] mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(c.match_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </span>

                      {/* Cheering Reactions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReact(c.id, 'fire')}
                          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-orange-400 border border-white/5 transition-all"
                        >
                          <Flame className="w-3 h-3" /> {reactions.fire}
                        </button>
                        <button
                          onClick={() => handleReact(c.id, 'hype')}
                          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-yellow-400 border border-white/5 transition-all"
                        >
                          ⚡ {reactions.hype}
                        </button>
                      </div>
                    </div>

                    {/* Status / Accept Button */}
                    {c.status === 'open' && (
                      currentUser && currentUser.id !== c.challenger_id ? (
                        <button
                          onClick={() => handleAccept(c.id)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:scale-[1.02]"
                          style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                        >
                          <Swords className="w-3.5 h-3.5" /> Accept Challenge
                        </button>
                      ) : currentUser && currentUser.id === c.challenger_id ? (
                        <div className="text-center py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#00f5d4]">
                          🎯 Your Open Challenge
                        </div>
                      ) : (
                        <Link
                          href="/login"
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 transition-all"
                        >
                          Sign In to Accept
                        </Link>
                      )
                    )}

                    {c.status === 'accepted' && (
                      currentUser && (c.challenger_id === currentUser.id || c.opponent_id === currentUser.id) ? (
                        <button
                          onClick={() => setShowReportModal(c)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white bg-[#ffd60a]/20 border border-[#ffd60a]/40 text-[#ffd60a] hover:bg-[#ffd60a]/30 transition-all"
                        >
                          <Trophy className="w-3.5 h-3.5" /> Report Match Score
                        </button>
                      ) : (
                        <div className="text-center py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-400">
                          ⚔️ Match In Progress
                        </div>
                      )
                    )}

                    {c.status === 'completed' && (
                      <div className="text-center py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Match Completed
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── CREATE CHALLENGE MODAL ── */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#111118] p-6 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#7b2ff7]/20 border border-[#7b2ff7]/40 text-[#00f5d4]">
                      <Swords className="h-5 w-5" />
                    </div>
                    <h3 className="font-outfit font-black text-xl text-white">Post 1v1 Challenge</h3>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="text-[#a0a0b8] hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Select Sport</label>
                    <select
                      value={sport}
                      onChange={e => setSport(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                    >
                      {SPORTS.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s} className="bg-[#111118]">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Mode</label>
                      <select
                        value={mode}
                        onChange={e => setMode(e.target.value as any)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      >
                        <option value="ranked" className="bg-[#111118]">Ranked (Stake RP)</option>
                        <option value="casual" className="bg-[#111118]">Casual Play</option>
                      </select>
                    </div>

                    {mode === 'ranked' ? (
                      <div>
                        <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Stake (RP)</label>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={stakePoints}
                          onChange={e => setStakePoints(parseInt(e.target.value) || 25)}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-[#6b6b80] pt-6">No rating points at risk</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Ground / Venue</label>
                    <select
                      value={ground}
                      onChange={e => setGround(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                    >
                      {GROUNDS.map(g => (
                        <option key={g} value={g} className="bg-[#111118]">{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Scheduled Match Time</label>
                    <input
                      type="datetime-local"
                      value={matchTime}
                      onChange={e => setMatchTime(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all shadow-xl disabled:opacity-50 mt-2"
                    style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                    Issue Challenge to Arena
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── REPORT SCORE MODAL ── */}
        <AnimatePresence>
          {showReportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="w-full max-w-md rounded-3xl border border-white/15 bg-[#111118] p-6 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[#ffd60a]" />
                    <h3 className="font-outfit font-black text-xl text-white">Record Match Score</h3>
                  </div>
                  <button onClick={() => setShowReportModal(null)} className="text-[#a0a0b8] hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-xs text-[#a0a0b8]">Enter final set/point score to declare the duel winner and recalculate ELO ratings:</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#00f5d4] uppercase mb-1">Your Score</label>
                      <input
                        type="number"
                        min={0}
                        value={myScore}
                        onChange={e => setMyScore(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-lg font-black text-white focus:outline-none focus:border-[#00f5d4]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-red-400 uppercase mb-1">Opponent Score</label>
                      <input
                        type="number"
                        min={0}
                        value={oppScore}
                        onChange={e => setOppScore(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-lg font-black text-white focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#ffd60a]/10 border border-[#ffd60a]/20 text-xs text-[#ffd60a] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Winner receives +{showReportModal.stake_points || 25} RP ELO boost!</span>
                  </div>
                </div>

                <button
                  onClick={handleReportResult}
                  disabled={reporting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                >
                  {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  Confirm Result & Adjust ELO
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
