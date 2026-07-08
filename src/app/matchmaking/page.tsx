'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Target, Clock, CheckCircle, XCircle, RefreshCw, Star } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Chess'];
const SKILL_LEVELS = ['Any', 'Beginner', 'Intermediate', 'Advanced'];
const SPORT_EMOJIS: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀',
  'Table Tennis': '🏓', Volleyball: '🏐', Kabaddi: '🤼', Tennis: '🎾', Chess: '♟️',
};

interface MatchCandidate {
  id: string;
  name: string;
  hostel: string;
  rating: number;
  avatar?: string;
  sport: string;
  postId: string;
  ground: string;
  scheduledAt: string;
  currentPlayers: number;
  maxPlayers: number;
  spotsLeft: number;
}

function RatingBadge({ rating }: { rating: number }) {
  const tier = rating >= 2000 ? { label: 'Champion', color: '#ffd60a', bg: '#ffd60a15' }
    : rating >= 1700 ? { label: 'Diamond', color: '#00f5d4', bg: '#00f5d415' }
    : rating >= 1500 ? { label: 'Platinum', color: '#7b2ff7', bg: '#7b2ff715' }
    : rating >= 1300 ? { label: 'Gold', color: '#f59e0b', bg: '#f59e0b15' }
    : { label: 'Rookie', color: '#6b6b80', bg: '#6b6b8015' };
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ color: tier.color, background: tier.bg }}>
      {tier.label} · {Math.round(rating)}
    </span>
  );
}

export default function MatchmakingPage() {
  const { currentUser } = useUIStore();
  const [sport, setSport] = useState('Badminton');
  const [skillLevel, setSkillLevel] = useState('Any');
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [searchDone, setSearchDone] = useState(false);

  const handleSearch = async () => {
    if (!currentUser) return;
    setSearching(true);
    setSearchDone(false);
    setCandidates([]);

    // Simulate a smart matchmaking search with animation
    await new Promise(r => setTimeout(r, 2200));

    try {
      const res = await fetch(`/api/posts?sport=${encodeURIComponent(sport)}`);
      const data = await res.json();
      const posts: any[] = data.posts || [];

      const myRating = currentUser.glickoRating?.rating ?? 1500;
      const ratingTolerance = skillLevel === 'Any' ? 9999
        : skillLevel === 'Beginner' ? 300
        : skillLevel === 'Intermediate' ? 250
        : 300;

      const filtered = posts
        .filter((p: any) => {
          if (p.userId === currentUser.id) return false;
          if (p.status !== 'open' || p.currentPlayers >= p.maxPlayers) return false;
          // Rating range
          const userRating = p.user?.glickoRating ?? 1500;
          return Math.abs(userRating - myRating) <= ratingTolerance;
        })
        .map((p: any) => ({
          id: p.user?.id || p.userId,
          name: p.user?.name || 'Player',
          hostel: p.user?.hostel || 'VIT Campus',
          rating: p.user?.glickoRating ?? 1500,
          avatar: p.user?.avatar,
          sport: p.sport,
          postId: p.id,
          ground: p.ground,
          scheduledAt: p.scheduledStart || p.scheduledAt,
          currentPlayers: p.currentPlayers,
          maxPlayers: p.maxPlayers,
          spotsLeft: p.maxPlayers - p.currentPlayers,
        }))
        .slice(0, 6);

      setCandidates(filtered);
    } catch {
      setCandidates([]);
    }
    setSearching(false);
    setSearchDone(true);
  };

  const handleJoin = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/posts/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        setJoined(prev => [...prev, postId]);
        setCandidates(prev => prev.map(c => c.postId === postId ? { ...c, currentPlayers: c.currentPlayers + 1, spotsLeft: c.spotsLeft - 1 } : c));
      }
    } catch { }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(123,47,247,0.15)', color: '#7b2ff7', border: '1px solid rgba(123,47,247,0.25)' }}>
            <Zap className="w-3.5 h-3.5" />AI-Powered Matchmaking
          </div>
          <h1 className="text-4xl font-black font-outfit text-white mb-3">Find Your <span style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Perfect Match</span></h1>
          <p className="text-[#a0a0b8] font-body max-w-lg mx-auto">Smart Glicko-2 rating-based matchmaking connects you with campus players at your exact skill level.</p>
        </motion.div>

        {/* Search Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 p-6 mb-8" style={{ background: 'rgba(17,17,24,0.9)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Sport</label>
              <div className="grid grid-cols-3 gap-2">
                {SPORTS.map(s => (
                  <button key={s} onClick={() => setSport(s)}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 text-xs font-bold transition-all"
                    style={{ background: sport === s ? '#7b2ff7' : 'rgba(255,255,255,0.04)', color: sport === s ? 'white' : '#6b6b80', border: `1px solid ${sport === s ? '#7b2ff7' : 'rgba(255,255,255,0.08)'}` }}>
                    <span className="text-lg">{SPORT_EMOJIS[s] || '🏅'}</span>
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2">Skill Level Match</label>
              <div className="space-y-2">
                {SKILL_LEVELS.map(s => (
                  <button key={s} onClick={() => setSkillLevel(s)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-bold text-left transition-all"
                    style={{ background: skillLevel === s ? 'rgba(123,47,247,0.2)' : 'rgba(255,255,255,0.03)', color: skillLevel === s ? '#7b2ff7' : '#6b6b80', border: `1px solid ${skillLevel === s ? '#7b2ff7' : 'rgba(255,255,255,0.08)'}` }}>
                    {s === 'Any' ? '🌍 Any Skill Level' : s === 'Beginner' ? '🌱 Beginner (1000–1400)' : s === 'Intermediate' ? '⚡ Intermediate (1400–1700)' : '💎 Advanced (1700+)'}
                  </button>
                ))}
              </div>

              {currentUser && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-[#6b6b80] uppercase tracking-wider mb-1 font-body">Your ELO Rating</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#ffd60a]" />
                    <span className="font-black text-white font-outfit">{Math.round(currentUser.glickoRating?.rating ?? 1500)}</span>
                    <RatingBadge rating={currentUser.glickoRating?.rating ?? 1500} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {!currentUser ? (
            <div className="text-center py-4">
              <p className="text-[#6b6b80] text-sm mb-4 font-body">Sign in to use smart matchmaking</p>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                Sign In to Find Matches
              </Link>
            </div>
          ) : (
            <button onClick={handleSearch} disabled={searching}
              className="w-full flex items-center justify-center gap-3 rounded-xl py-4 font-black text-white text-base transition-all hover:scale-[1.02] disabled:opacity-70 shadow-2xl shadow-[#7b2ff7]/30"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              {searching ? (
                <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Searching Campus Players...</>
              ) : (
                <><Zap className="w-5 h-5" />Find My Match {SPORT_EMOJIS[sport]}</>
              )}
            </button>
          )}
        </motion.div>

        {/* Searching Animation */}
        <AnimatePresence>
          {searching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-[#7b2ff7]/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-[#00f5d4]/30 animate-ping" style={{ animationDelay: '0.3s' }} />
                <div className="absolute inset-4 rounded-full border-2 border-[#7b2ff7]/50 animate-ping" style={{ animationDelay: '0.6s' }} />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">{SPORT_EMOJIS[sport] || '🏅'}</div>
              </div>
              <p className="text-white font-bold font-outfit text-lg mb-2">Scanning campus courts...</p>
              <p className="text-[#6b6b80] text-sm font-body">Matching with players in your ELO range</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {searchDone && !searching && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white font-outfit text-lg">
                {candidates.length > 0 ? `${candidates.length} Matches Found` : 'No Matches Found'}
              </h2>
              <button onClick={handleSearch} className="flex items-center gap-1.5 text-xs text-[#7b2ff7] font-bold hover:text-[#00f5d4] transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />Re-scan
              </button>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-5xl mb-4">{SPORT_EMOJIS[sport] || '🏅'}</div>
                <h3 className="font-bold text-white text-lg mb-2 font-outfit">No {sport} matches right now</h3>
                <p className="text-[#6b6b80] text-sm mb-6 font-body">No players near your skill level are posting {sport} games. Be the first!</p>
                <Link href="/feed" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  Post a {sport} Match
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((c, i) => {
                  const isJoined = joined.includes(c.postId);
                  return (
                    <motion.div key={c.postId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="rounded-2xl border border-white/8 p-5 hover:border-white/20 transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shrink-0" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                          {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full rounded-xl object-cover" /> : c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-white font-outfit">{c.name}</span>
                            <RatingBadge rating={c.rating} />
                          </div>
                          <p className="text-xs text-[#6b6b80] font-body mb-2">{c.hostel}</p>
                          <div className="flex items-center gap-4 text-xs text-[#a0a0b8] font-body flex-wrap">
                            <span className="flex items-center gap-1"><Target className="w-3 h-3 text-[#00f5d4]" />{c.ground}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#7b2ff7]" />{c.currentPlayers}/{c.maxPlayers} players · {c.spotsLeft} spots left</span>
                            {c.scheduledAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(c.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {isJoined ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                              <CheckCircle className="w-3.5 h-3.5" />Joined!
                            </span>
                          ) : (
                            <button onClick={() => handleJoin(c.postId)}
                              className="text-xs font-bold text-white px-4 py-2 rounded-xl transition-all hover:scale-105 hover:shadow-lg shadow-[#7b2ff7]/20"
                              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                              Join Match
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* How It Works */}
        {!searchDone && !searching && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-center text-sm font-bold text-[#6b6b80] uppercase tracking-widest mb-6 font-body">How Matchmaking Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🎯', title: 'ELO-Based Pairing', desc: 'Glicko-2 algorithm pairs you with players at your exact skill tier' },
                { icon: '⚡', title: 'Real-Time Scanning', desc: 'Scans all live match posts to find players who need exactly what you offer' },
                { icon: '🏆', title: 'Instant Join', desc: 'One click to join. Match chat opens automatically for coordination' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-white/6 p-5 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-white text-sm mb-1.5 font-outfit">{item.title}</h3>
                  <p className="text-xs text-[#6b6b80] font-body leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
