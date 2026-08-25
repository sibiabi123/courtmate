'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Plus, X, Users, MapPin, Calendar, Clock, Award, Shield,
  Zap, Loader2, Sparkles, ChevronRight, CheckCircle2, Flame, Crown
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';
import { sound } from '@/lib/sound';

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Chess', 'Tennis'];
const VENUES = ['Main Sports Arena', 'Indoor Badminton Complex', 'Center Court Complex', 'Basketball Center Court', 'Table Tennis Hall', 'Outdoor Multi-Courts'];
const SPORT_EMOJIS: Record<string, string> = { Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀', 'Table Tennis': '🏓', Volleyball: '🏐', Chess: '♟️', Tennis: '🎾', default: '🏆' };

interface Tournament {
  id: string;
  name: string;
  sport: string;
  venue: string;
  start_date: string;
  max_participants: number;
  current_participants: number;
  prize: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description?: string;
  format?: string;
}

// Sample interactive bracket nodes
const BRACKET_ROUNDS = [
  {
    roundName: 'Quarterfinals',
    matches: [
      { id: 'm1', p1: 'Apex Warriors', s1: '21', p2: 'Neon Strikers', s2: '14', winner: 'Apex Warriors' },
      { id: 'm2', p1: 'Thunder Titans', s1: '19', p2: 'Shadow Squad', s2: '21', winner: 'Shadow Squad' },
      { id: 'm3', p1: 'Cyber Kings', s1: '21', p2: 'Vanguard FC', s2: '18', winner: 'Cyber Kings' },
      { id: 'm4', p1: 'Solar Phoenix', s1: '16', p2: 'Alpha Wolves', s2: '21', winner: 'Alpha Wolves' },
    ]
  },
  {
    roundName: 'Semifinals',
    matches: [
      { id: 'm5', p1: 'Apex Warriors', s1: '21', p2: 'Shadow Squad', s2: '19', winner: 'Apex Warriors' },
      { id: 'm6', p1: 'Cyber Kings', s1: '17', p2: 'Alpha Wolves', s2: '21', winner: 'Alpha Wolves' },
    ]
  },
  {
    roundName: 'Championship Final',
    matches: [
      { id: 'm7', p1: 'Apex Warriors', s1: '23', p2: 'Alpha Wolves', s2: '21', winner: 'Apex Warriors' },
    ]
  }
];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [activeBracketTournament, setActiveBracketTournament] = useState<Tournament | null>(null);
  const { currentUser, isAuthenticated } = useUIStore();

  // Create Form State
  const [form, setForm] = useState({
    name: '',
    sport: 'Badminton',
    venue: 'Indoor Badminton Complex',
    start_date: '',
    max_participants: 16,
    prize: 500,
    description: '',
    format: 'Single Elimination',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      if (data.success && Array.isArray(data.tournaments)) {
        setTournaments(data.tournaments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setCreating(true);
    setError('');
    sound.playBattle();

    try {
      const res = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        setShowCreate(false);
        fetchTournaments();
      } else {
        setError(data.error || 'Failed to create tournament');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (tId: string) => {
    if (!isAuthenticated) return;
    sound.playCoin();
    try {
      await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: tId }),
      });
      sound.playVictory();
      fetchTournaments();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = tournaments.filter(t => {
    if (selectedSport !== 'All' && t.sport !== selectedSport) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-20 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30 mb-3">
              <Trophy className="w-3.5 h-3.5" /> Official Championship Series
            </div>
            <h1 className="text-4xl font-black font-outfit text-white flex items-center gap-3">
              Tournaments <span style={{ background: 'linear-gradient(135deg, #ffd60a, #ff006e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>& Cups</span>
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-1">Compete in knockout brackets, win coin prize pots, and earn championship glory.</p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowCreate(true);
                }}
                className="flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white shadow-xl transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', boxShadow: '0 0 25px rgba(123,47,247,0.3)' }}
              >
                <Plus className="w-5 h-5" /> Host Tournament
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Championships' },
            { id: 'upcoming', label: '⏳ Upcoming & Open' },
            { id: 'ongoing', label: '⚡ Live In Progress' },
            { id: 'completed', label: '🏆 Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setFilterStatus(tab.id as any);
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                filterStatus === tab.id
                  ? 'bg-white/10 text-[#ffd60a] border border-[#ffd60a]/40 shadow-lg shadow-[#ffd60a]/5'
                  : 'text-[#6b6b80] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#00f5d4] animate-spin mb-4" />
            <p className="text-[#6b6b80] text-sm">Loading tournament circuits...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/[0.01]">
            <Trophy className="w-12 h-12 text-[#4a4a5a] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2 font-outfit">No Tournaments Found</h3>
            <p className="text-[#6b6b80] text-sm mb-6">Be the first athlete or organizer to host a championship event!</p>
            {currentUser && (
              <button
                onClick={() => setShowCreate(true)}
                className="px-6 py-3 rounded-2xl font-bold text-white text-xs"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
              >
                Host A Tournament Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-white/25 transition-all group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{SPORT_EMOJIS[t.sport] || '🏆'}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      t.status === 'upcoming' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      t.status === 'ongoing' ? 'bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30 animate-pulse' :
                      'bg-white/10 text-[#a0a0b8]'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <h3 className="font-outfit font-black text-white text-lg mb-2 group-hover:text-[#00f5d4] transition-colors line-clamp-2">
                    {t.name}
                  </h3>

                  {t.description && (
                    <p className="text-xs text-[#a0a0b8] line-clamp-2 mb-4 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  {/* Info Meta Grid */}
                  <div className="space-y-2 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-5 text-xs text-[#a0a0b8]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#00f5d4]" /> Venue</span>
                      <span className="font-semibold text-white truncate max-w-[140px]">{t.venue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#7b2ff7]" /> Slots</span>
                      <span className="font-bold text-white">{t.current_participants || 0} / {t.max_participants} Players</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#ffd60a]"><Trophy className="w-3.5 h-3.5" /> Prize Pot</span>
                      <span className="font-black text-[#ffd60a]">🪙 {t.prize} Coins</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveBracketTournament(t);
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#ffd60a]" /> View Bracket
                  </button>

                  {t.status === 'upcoming' && (
                    <button
                      onClick={() => handleJoin(t.id)}
                      className="flex-1 py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                    >
                      Join Tournament
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── INTERACTIVE BRACKET PREVIEW SECTION ── */}
        <div className="rounded-3xl border border-white/10 bg-[#111118]/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-[#ffd60a]/20 border border-[#ffd60a]/40 text-[#ffd60a]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-outfit font-black text-xl text-white">
                  Interactive Championship Bracket Tree
                </h3>
                <p className="text-xs text-[#a0a0b8]">Live knockout progression, score lines, and grand champions</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/30">
              Live Stage Simulation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 overflow-x-auto pb-4">
            {BRACKET_ROUNDS.map((round, rIdx) => (
              <div key={round.roundName} className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-[#ffd60a] border-b border-white/10 pb-2 flex items-center justify-between">
                  <span>{round.roundName}</span>
                  <span className="text-[10px] text-[#6b6b80]">Round {rIdx + 1}</span>
                </div>

                <div className="space-y-3">
                  {round.matches.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#00f5d4]/40 transition-all space-y-1.5">
                      <div className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl ${m.winner === m.p1 ? 'bg-[#00f5d4]/10 text-[#00f5d4] font-bold' : 'text-[#a0a0b8]'}`}>
                        <span className="truncate max-w-[140px]">{m.p1}</span>
                        <span className="font-mono">{m.s1}</span>
                      </div>
                      <div className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl ${m.winner === m.p2 ? 'bg-[#00f5d4]/10 text-[#00f5d4] font-bold' : 'text-[#a0a0b8]'}`}>
                        <span className="truncate max-w-[140px]">{m.p2}</span>
                        <span className="font-mono">{m.s2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CREATE TOURNAMENT MODAL ── */}
        <AnimatePresence>
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#111118] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#ffd60a]/20 border border-[#ffd60a]/40 text-[#ffd60a]">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <h3 className="font-outfit font-black text-xl text-white">Host A Championship</h3>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="text-[#a0a0b8] hover:text-white">
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
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Championship Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premier Badminton Open 2026"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Sport</label>
                      <select
                        value={form.sport}
                        onChange={e => setForm({ ...form, sport: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      >
                        {SPORTS.map(s => <option key={s} value={s} className="bg-[#111118]">{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Venue</label>
                      <select
                        value={form.venue}
                        onChange={e => setForm({ ...form, venue: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      >
                        {VENUES.map(v => <option key={v} value={v} className="bg-[#111118]">{v}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Max Players / Squads</label>
                      <input
                        type="number"
                        min={4}
                        max={64}
                        value={form.max_participants}
                        onChange={e => setForm({ ...form, max_participants: parseInt(e.target.value) || 16 })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Prize Pot (Coins 🪙)</label>
                      <input
                        type="number"
                        min={100}
                        value={form.prize}
                        onChange={e => setForm({ ...form, prize: parseInt(e.target.value) || 500 })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Tournament Description & Rules</label>
                    <textarea
                      rows={3}
                      placeholder="Format details, equipment requirements, contact information..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f5d4] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all shadow-xl disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                    Publish Championship Circuit
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
