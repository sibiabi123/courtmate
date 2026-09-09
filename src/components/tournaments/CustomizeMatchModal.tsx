'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Edit3, Save, MapPin, Clock, Trophy, Loader2 } from 'lucide-react';
import { sound } from '@/lib/sound';

interface Match {
  id: string;
  round_name: string;
  match_number: number;
  team1_name: string;
  team2_name: string;
  score1: number;
  score2: number;
  winner_name?: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'disputed';
  court_venue?: string;
  scheduled_time?: string;
}

interface CustomizeMatchModalProps {
  isOpen: boolean;
  match: Match;
  onClose: () => void;
  onUpdated: () => void;
}

export function CustomizeMatchModal({
  isOpen,
  match,
  onClose,
  onUpdated,
}: CustomizeMatchModalProps) {
  const [form, setForm] = useState({
    team1_name: match.team1_name || '',
    team2_name: match.team2_name || '',
    score1: match.score1 ?? 0,
    score2: match.score2 ?? 0,
    winner_name: match.winner_name || '',
    court_venue: match.court_venue || 'Center Court',
    scheduled_time: match.scheduled_time || '10:00 AM',
    status: match.status || 'scheduled',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    sound.playClick();

    try {
      const res = await fetch('/api/tournaments/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        onUpdated();
        onClose();
      } else {
        setError(data.error || 'Failed to save match customization');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#111118] p-6 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 font-black">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-xl text-white">Customize Match #{match.match_number}</h3>
              <p className="text-xs text-[#6b6b80]">{match.round_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a0a0b8] hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teams Customization */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Team 1 Name</label>
              <input
                type="text"
                required
                value={form.team1_name}
                onChange={(e) => setForm({ ...form, team1_name: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Team 2 Name</label>
              <input
                type="text"
                required
                value={form.team2_name}
                onChange={(e) => setForm({ ...form, team2_name: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Scores Customization */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Team 1 Score</label>
              <input
                type="number"
                min={0}
                value={form.score1}
                onChange={(e) => setForm({ ...form, score1: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Team 2 Score</label>
              <input
                type="number"
                min={0}
                value={form.score2}
                onChange={(e) => setForm({ ...form, score2: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Venue & Scheduled Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#CCFF00]" /> Court / Venue
              </label>
              <input
                type="text"
                value={form.court_venue}
                onChange={(e) => setForm({ ...form, court_venue: e.target.value })}
                placeholder="e.g. Court 1"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00F0FF]" /> Scheduled Time
              </label>
              <input
                type="text"
                value={form.scheduled_time}
                onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                placeholder="e.g. 10:30 AM"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Status & Winner override */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Match Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              >
                <option value="scheduled" className="bg-[#111118]">⏳ Scheduled</option>
                <option value="live" className="bg-[#111118]">● Live Now</option>
                <option value="completed" className="bg-[#111118]">✓ Completed / Final</option>
                <option value="disputed" className="bg-[#111118]">⚠️ Under Dispute</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-[#ffd60a]" /> Winner (Advancing)
              </label>
              <select
                value={form.winner_name || ''}
                onChange={(e) => setForm({ ...form, winner_name: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffd60a]"
              >
                <option value="" className="bg-[#111118]">Auto-Calculate from Score</option>
                {form.team1_name && <option value={form.team1_name} className="bg-[#111118]">{form.team1_name}</option>}
                {form.team2_name && <option value={form.team2_name} className="bg-[#111118]">{form.team2_name}</option>}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[#040507] text-sm btn-volt transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save &amp; Update Bracket Match
          </button>
        </form>
      </motion.div>
    </div>
  );
}
