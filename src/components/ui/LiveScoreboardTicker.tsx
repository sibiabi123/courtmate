'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Activity, Flame, Zap, ThumbsUp, Radio, Sparkles,
  ChevronRight, Volume2, Shield
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface LiveMatch {
  id: string;
  sport: string;
  icon: string;
  venue: string;
  teamA: string;
  scoreA: number;
  teamB: string;
  scoreB: number;
  status: string;
  commentary: string;
  cheers: number;
}

const INITIAL_MATCHES: LiveMatch[] = [
  {
    id: 'lm1',
    sport: 'Badminton',
    icon: '🏸',
    venue: 'Indoor Badminton Complex',
    teamA: 'Arjun Kumar',
    scoreA: 20,
    teamB: 'Priya Sharma',
    scoreB: 19,
    status: 'Game 3 • Match Point 🔥',
    commentary: 'Intense 32-shot cross-court rally! Arjun sets up a steep forehand smash at the line!',
    cheers: 42,
  },
  {
    id: 'lm2',
    sport: 'Football 7v7',
    icon: '⚽',
    venue: 'Main Sports Arena',
    teamA: 'Shadow Squad',
    scoreA: 2,
    teamB: 'Cyber Kings',
    scoreB: 1,
    status: "88' Minute • Final Push",
    commentary: 'Cyber Kings earn a dangerous free-kick just outside the penalty box!',
    cheers: 68,
  },
  {
    id: 'lm3',
    sport: 'Basketball 5v5',
    icon: '🏀',
    venue: 'Center Court Hardwood',
    teamA: 'Apex Warriors',
    scoreA: 62,
    teamB: 'Alpha Wolves',
    scoreB: 58,
    status: 'Q4 1:20 Remaining',
    commentary: 'Fast break transition layup extends the lead to 4 points in clutch time!',
    cheers: 35,
  }
];

export function LiveScoreboardTicker() {
  const [matches, setMatches] = useState<LiveMatch[]>(INITIAL_MATCHES);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMatchIndex(prev => (prev + 1) % INITIAL_MATCHES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCheer = (matchId: string) => {
    sound.playCoin();
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return { ...m, cheers: m.cheers + 1 };
      }
      return m;
    }));
  };

  const current = matches[activeMatchIndex];

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <h3 className="font-outfit font-black text-sm uppercase tracking-widest text-white flex items-center gap-1.5">
            LIVE BROADCAST TICKER <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">ON AIR</span>
          </h3>
        </div>

        <div className="flex gap-1">
          {matches.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                sound.playClick();
                setActiveMatchIndex(idx);
              }}
              className={`h-2 rounded-full transition-all ${
                activeMatchIndex === idx ? 'w-6 bg-[#00f5d4]' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Match Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#00f5d4] flex items-center gap-1.5">
              <span>{current.icon}</span> {current.sport} • {current.venue}
            </span>
            <span className="text-[11px] font-black text-[#ffd60a] bg-[#ffd60a]/10 px-2.5 py-0.5 rounded-full border border-[#ffd60a]/20">
              {current.status}
            </span>
          </div>

          {/* Live Scoreface */}
          <div className="grid grid-cols-5 items-center gap-2 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="col-span-2 text-right">
              <p className="font-outfit font-black text-base text-white truncate">{current.teamA}</p>
            </div>
            <div className="col-span-1 flex items-center justify-center gap-2 font-mono font-black text-2xl text-white">
              <span className="text-[#00f5d4]">{current.scoreA}</span>
              <span className="text-white/30">:</span>
              <span className="text-[#ff006e]">{current.scoreB}</span>
            </div>
            <div className="col-span-2 text-left">
              <p className="font-outfit font-black text-base text-white truncate">{current.teamB}</p>
            </div>
          </div>

          {/* Live Commentary Quote */}
          <div className="p-3 rounded-2xl bg-[#0a0a0f] border border-white/5 text-xs text-[#a0a0b8] flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="leading-relaxed"><strong className="text-white font-bold">Commentary: </strong>{current.commentary}</p>
          </div>

          {/* Fan Cheer Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#6b6b80]">Cheer for this live match:</span>
            <button
              onClick={() => handleCheer(current.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff006e] to-[#7b2ff7] hover:scale-105 transition-all shadow-lg"
            >
              <Flame className="w-3.5 h-3.5" /> Hype Score ({current.cheers})
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
