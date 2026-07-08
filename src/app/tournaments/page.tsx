'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, X, Loader2, Calendar, MapPin, Users, Coins } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Chess'];
const VENUES = ['Main Ground', 'Indoor Badminton Hall', 'Basketball Court', 'Table Tennis Room', 'Volleyball Court', 'Gymkhana Hall', 'Swimming Pool'];

interface Tournament {
  id: string;
  name: string;
  sport: string;
  status: string;
  prize: number;
  max_participants?: number;
  maxParticipants?: number;
  scheduled_at?: string;
  scheduledAt?: string;
  venue?: string;
  description?: string;
  organizer_id?: string;
  created_at?: string;
}

function CreateTournamentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { currentUser } = useUIStore();
  const [form, setForm] = useState({ name: '', sport: SPORTS[0], maxParticipants: 16, prize: 0, venue: VENUES[0], description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { setError('You must be logged in to create a tournament.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create tournament');
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: 'rgba(17,17,24,0.98)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black font-outfit text-white">Create Tournament</h3>
            <p className="text-xs text-[#6b6b80] mt-0.5 font-body">Organize a campus championship</p>
          </div>
          <button onClick={onClose} className="text-[#6b6b80] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Tournament Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. VIT Cricket Championship 2026"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Sport</label>
              <select value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} style={{ background: '#111118' }}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all">
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Venue</label>
              <select value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} style={{ background: '#111118' }}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all">
                {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Max Participants</label>
              <input type="number" min={4} max={64} value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: parseInt(e.target.value) || 16 })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Prize (Coins 🪙)</label>
              <input type="number" min={0} value={form.prize} onChange={e => setForm({ ...form, prize: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7] transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Rules, format, contact info..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all resize-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating...</> : <><Plus className="w-4 h-4" />Create Tournament</>}
          </button>
        </form>
      </motion.div>
    </>
  );
}

const SPORT_EMOJIS: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀',
  'Table Tennis': '🏓', Volleyball: '🏐', Chess: '♟️', Kabaddi: '🤼', Tennis: '🎾', default: '🏆',
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const { currentUser } = useUIStore();

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/table?table=tournaments');
      const data = await res.json();
      setTournaments(Array.isArray(data.rows) ? data.rows : []);
    } catch { setTournaments([]); }
    setLoading(false);
  };

  useEffect(() => { fetchTournaments(); }, []);

  const filtered = tournaments.filter(t => filterStatus === 'all' || t.status === filterStatus);

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black font-outfit text-white flex items-center gap-2">
              <Trophy className="w-8 h-8 text-[#ffd60a]" />Championships
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-1 font-body">Official VIT campus tournament brackets and standings</p>
          </div>
          {currentUser && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white text-sm transition-all hover:scale-105 shadow-lg shadow-[#7b2ff7]/20"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              <Plus className="w-4 h-4" />Organize Tournament
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'upcoming', 'ongoing', 'completed'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all"
              style={{ background: filterStatus === s ? '#7b2ff7' : 'rgba(255,255,255,0.04)', color: filterStatus === s ? 'white' : '#6b6b80', border: `1px solid ${filterStatus === s ? '#7b2ff7' : 'rgba(255,255,255,0.08)'}` }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#00f5d4] animate-spin mb-4" />
            <p className="text-[#6b6b80] text-sm font-body">Loading tournaments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Trophy className="w-12 h-12 text-[#4a4a5a] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2 font-outfit">No Tournaments Yet</h3>
            <p className="text-[#6b6b80] text-sm mb-6 font-body">
              {currentUser ? 'Be the first to organize a VIT campus tournament!' : 'Log in to organize a campus tournament.'}
            </p>
            {currentUser ? (
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                <Plus className="w-4 h-4" />Create Tournament
              </button>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                Sign In to Organize
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/tournaments/${t.id}`}
                  className="block rounded-2xl border border-white/8 p-5 hover:border-white/20 transition-all hover:shadow-lg group"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: 'rgba(123,47,247,0.15)' }}>
                        {SPORT_EMOJIS[t.sport] || SPORT_EMOJIS.default}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-white font-outfit group-hover:text-[#00f5d4] transition-colors">{t.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            t.status === 'ongoing' ? 'bg-emerald-500/15 text-emerald-400'
                            : t.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-white/8 text-[#6b6b80]'
                          }`}>{t.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#6b6b80] flex-wrap font-body">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#00f5d4]" />{t.venue || t.sport}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />Up to {t.max_participants ?? t.maxParticipants ?? 16} players</span>
                          {t.scheduled_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(t.scheduled_at).toLocaleDateString('en-IN')}</span>}
                        </div>
                        {t.description && <p className="text-xs text-[#6b6b80] mt-1.5 line-clamp-1 font-body">{t.description}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[#ffd60a] font-black text-lg">
                        <Coins className="w-4 h-4" />{t.prize}
                      </div>
                      <div className="text-[10px] text-[#6b6b80] mt-0.5">Prize Pool</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateTournamentModal onClose={() => setShowCreate(false)} onCreated={fetchTournaments} />}
      </AnimatePresence>
    </main>
  );
}
