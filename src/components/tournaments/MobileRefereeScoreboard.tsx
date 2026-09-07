'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, X, Plus, Minus, Check, ShieldCheck, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import { playClick, playSuccess, playDuel } from '@/lib/sound';

interface BracketMatch {
  id: string;
  tournament_id: string;
  round_name: string;
  match_number: number;
  team1_name: string;
  team2_name: string;
  score1: number;
  score2: number;
  winner_name?: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'disputed';
  captain1_verified: number;
  captain2_verified: number;
  court_venue?: string;
  scheduled_time?: string;
}

interface MobileRefereeScoreboardProps {
  isOpen: boolean;
  onClose: () => void;
  match: BracketMatch;
  onMatchUpdated: () => void;
}

export function MobileRefereeScoreboard({
  isOpen,
  onClose,
  match,
  onMatchUpdated,
}: MobileRefereeScoreboardProps) {
  const [s1, setS1] = useState(match.score1 ?? 0);
  const [s2, setS2] = useState(match.score2 ?? 0);
  const [c1, setC1] = useState(match.captain1_verified ?? 0);
  const [c2, setC2] = useState(match.captain2_verified ?? 0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen || !match) return null;

  const handleScoreChange = (team: 1 | 2, delta: number) => {
    playClick();
    if (team === 1) setS1(prev => Math.max(0, prev + delta));
    else setS2(prev => Math.max(0, prev + delta));
  };

  const handleSaveScore = async (verifyCaptain?: 1 | 2) => {
    playClick();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/tournaments/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          score1: s1,
          score2: s2,
          status: (c1 || verifyCaptain === 1) && (c2 || verifyCaptain === 2) ? 'completed' : 'live',
          verifyAsCaptain: verifyCaptain,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSuccess();
        setToast(data.message);
        if (verifyCaptain === 1) setC1(1);
        if (verifyCaptain === 2) setC2(1);
        onMatchUpdated();
      } else {
        setToast(data.error || 'Failed to update score');
      }
    } catch {
      setToast('Network error');
    } finally {
      setSaving(false);
    }
  };

  const isLocked = c1 === 1 && c2 === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider">
                {match.round_name} · Match #{match.match_number}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#a0a0b8] font-mono">
                {match.court_venue || 'Center Court'}
              </span>
            </div>
            <h3 className="font-outfit font-black text-lg text-white mt-0.5">
              Live Referee Scoring Console
            </h3>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toast && (
          <div className="mt-4 p-3 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold text-center font-mono">
            {toast}
          </div>
        )}

        {/* Big Dual-Team Scoreboard */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          {/* Team 1 */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
            <span className="font-outfit font-bold text-xs text-white truncate max-w-[130px] mb-2">
              {match.team1_name}
            </span>
            <div className="text-5xl font-black font-mono text-[#CCFF00] my-2">
              {s1}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleScoreChange(1, -1)}
                disabled={isLocked || s1 <= 0}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScoreChange(1, 1)}
                disabled={isLocked}
                className="w-12 h-9 rounded-xl btn-volt text-xs font-black flex items-center justify-center disabled:opacity-30"
              >
                <Plus className="w-4 h-4 mr-0.5" /> 1
              </button>
            </div>
            <div className="mt-3">
              {c1 === 1 ? (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-3 h-3" /> Captain Confirmed
                </span>
              ) : (
                <button
                  onClick={() => handleSaveScore(1)}
                  disabled={saving || isLocked}
                  className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 hover:bg-[#CCFF00]/20 transition-all"
                >
                  Verify as Captain 1
                </button>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
            <span className="font-outfit font-bold text-xs text-white truncate max-w-[130px] mb-2">
              {match.team2_name}
            </span>
            <div className="text-5xl font-black font-mono text-[#00F0FF] my-2">
              {s2}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleScoreChange(2, -1)}
                disabled={isLocked || s2 <= 0}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScoreChange(2, 1)}
                disabled={isLocked}
                className="w-12 h-9 rounded-xl bg-[#00F0FF] text-[#040507] hover:bg-[#00d0dd] font-black text-xs flex items-center justify-center disabled:opacity-30"
              >
                <Plus className="w-4 h-4 mr-0.5" /> 1
              </button>
            </div>
            <div className="mt-3">
              {c2 === 1 ? (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-3 h-3" /> Captain Confirmed
                </span>
              ) : (
                <button
                  onClick={() => handleSaveScore(2)}
                  disabled={saving || isLocked}
                  className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 hover:bg-[#00F0FF]/20 transition-all"
                >
                  Verify as Captain 2
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dual-Captain Verification Notice */}
        <div className="mt-5 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 text-[11px] text-[#a0a0b8]">
          <ShieldCheck className="w-4 h-4 text-[#CCFF00] shrink-0" />
          <span>
            {isLocked
              ? '✓ Dual-Captain verification complete. Result is locked and advanced.'
              : 'Both team captains must tap their verification button to finalize and advance the winner in the tournament bracket.'}
          </span>
        </div>

        {/* Action Footer */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => handleSaveScore()}
            disabled={saving || isLocked}
            className="flex-1 py-3 rounded-xl text-xs font-black btn-volt flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Live Score</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
