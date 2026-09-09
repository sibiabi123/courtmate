'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Trophy, Users, RefreshCw, Loader2 } from 'lucide-react';
import { sound } from '@/lib/sound';

interface CustomizeBracketModalProps {
  isOpen: boolean;
  tournamentId: string;
  onClose: () => void;
  onGenerated: () => void;
}

export function CustomizeBracketModal({
  isOpen,
  tournamentId,
  onClose,
  onGenerated,
}: CustomizeBracketModalProps) {
  const [size, setSize] = useState<4 | 8 | 16>(8);
  const [teams, setTeams] = useState<string[]>([
    'MH-D Red Dragons',
    'MH-A Warriors',
    'LH-B Valkyries',
    'LH-A Phoenix',
    'MH-Q Titans',
    'MH-K Strikers',
    'Day Scholars XI',
    'MH-G Lions',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSizeChange = (newSize: 4 | 8 | 16) => {
    sound.playClick();
    setSize(newSize);
    setTeams((prev) => {
      const copy = [...prev];
      if (copy.length < newSize) {
        for (let i = copy.length; i < newSize; i++) {
          copy.push(`Seed #${i + 1}`);
        }
      }
      return copy.slice(0, newSize);
    });
  };

  const handleTeamChange = (index: number, val: string) => {
    const updated = [...teams];
    updated[index] = val;
    setTeams(updated);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    sound.playBattle();

    try {
      const res = await fetch('/api/tournaments/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_bracket',
          tournamentId,
          size,
          teams,
        }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        onGenerated();
        onClose();
      } else {
        setError(data.error || 'Failed to generate custom bracket');
      }
    } catch {
      setError('Network error. Try again.');
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
        className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#111118] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#7b2ff7]/20 text-[#7b2ff7] border border-[#7b2ff7]/40 font-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-xl text-white">Generate Custom Bracket</h3>
              <p className="text-xs text-[#6b6b80]">Set bracket size and seed teams into the championship tree</p>
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

        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Format / Bracket Size Selection */}
          <div>
            <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
              Select Bracket Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([4, 8, 16] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleSizeChange(s)}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    size === s
                      ? 'bg-[#7b2ff7]/20 border-[#7b2ff7] text-white shadow-lg shadow-[#7b2ff7]/20'
                      : 'bg-white/5 border-white/10 text-[#6b6b80] hover:text-white'
                  }`}
                >
                  <span className="text-base font-black font-outfit">{s} Teams</span>
                  <span className="text-[10px] text-[#a0a0b8]">
                    {s === 4 ? 'Semis -> Final' : s === 8 ? 'Quarters -> Final' : 'Round 16 -> Final'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Seed Teams Customization */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">
                Seed Teams / Competitors ({teams.length})
              </label>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  const hostelNames = [
                    'MH-A Block Dragons', 'MH-B Block Strikers', 'MH-C Block Titans', 'MH-D Red Dragons',
                    'LH-A Phoenix', 'LH-B Valkyries', 'LH-C Queens', 'LH-F Warriors',
                    'Day Scholars XI', 'Vellore Knights', 'Cyber Ninjas', 'Campus Kings',
                    'Main Ground XI', 'Gymkhana Aces', 'Spartan Squad', 'VIT Legends'
                  ];
                  setTeams(hostelNames.slice(0, size));
                }}
                className="text-[11px] font-bold text-[#00f5d4] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Auto-fill Campus Teams
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-2 bg-white/[0.02] border border-white/5 rounded-2xl">
              {teams.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#6b6b80] w-6 shrink-0 text-right">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={t}
                    onChange={(e) => handleTeamChange(idx, e.target.value)}
                    placeholder={`Team ${idx + 1}`}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7b2ff7]"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
            Build &amp; Launch {size}-Team Custom Bracket
          </button>
        </form>
      </motion.div>
    </div>
  );
}
