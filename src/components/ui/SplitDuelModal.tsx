'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, MapPin, Clock, Coins, ChevronDown } from 'lucide-react';
import { playDuel, playSuccess, playClick } from '@/lib/sound';

interface Athlete {
  id: number | string;
  name: string;
  rating: number;
  tier: string;
  sport: string;
  winRate: number;
  streak: number;
}

interface SplitDuelModalProps {
  isOpen: boolean;
  challenger: Athlete;
  opponent: Athlete;
  onClose: () => void;
  onConfirm: (stake: number, sport: string, venue: string) => void;
}

const SPORTS = ['Badminton', 'Cricket', 'Football', 'Basketball', 'Table Tennis', 'Tennis', 'Chess', 'Volleyball'];
const VENUES = ['Indoor Badminton Court', 'Main Ground', 'Basketball Court', 'TT Room', 'Tennis Court', 'Chess Room'];
const STAKE_PRESETS = [50, 100, 250, 500];

const TIER_COLORS: Record<string, string> = {
  Champion: '#FFD700',
  Diamond: '#00F0FF',
  Platinum: '#CCFF00',
  Gold: '#FFD700',
  Silver: '#c0c0c0',
  Bronze: '#cd7f32',
};

export function SplitDuelModal({ isOpen, challenger, opponent, onClose, onConfirm }: SplitDuelModalProps) {
  const [stake, setStake] = useState(100);
  const [sport, setSport] = useState(challenger.sport || 'Badminton');
  const [venue, setVenue] = useState(VENUES[0]);
  const [confirmed, setConfirmed] = useState(false);

  // Hold-to-confirm state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHolding = holdProgress > 0 && holdProgress < 100;

  const startHold = useCallback(() => {
    if (holdIntervalRef.current) return;
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(p => {
        if (p >= 100) {
          clearInterval(holdIntervalRef.current!);
          holdIntervalRef.current = null;
          return 100;
        }
        return p + 4;
      });
    }, 40);
  }, []);

  const stopHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (holdProgress < 100) setHoldProgress(0);
  }, [holdProgress]);

  useEffect(() => {
    if (holdProgress >= 100) {
      playSuccess();
      setConfirmed(true);
      setTimeout(() => {
        onConfirm(stake, sport, venue);
        onClose();
        setConfirmed(false);
        setHoldProgress(0);
      }, 1200);
    }
  }, [holdProgress]);

  const challengerColor = TIER_COLORS[challenger.tier] ?? '#a0a0b8';
  const opponentColor = TIER_COLORS[opponent.tier] ?? '#a0a0b8';
  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const circumference = 2 * Math.PI * 36; // radius 36
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-2xl rounded-2xl border overflow-hidden"
            style={{ background: '#0A0C10', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {/* Volt accent top bar */}
            <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #7b2ff7, #CCFF00, #00F0FF)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="font-black font-[family-name:var(--font-outfit)] text-white text-lg flex items-center gap-2">
                ⚔️ Duel Arena
              </h2>
              <button onClick={() => { playClick(); onClose(); }}
                className="p-1.5 rounded-lg text-[#6b6b80] hover:text-white hover:bg-white/5 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* VS Split */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-0">
              {/* Challenger */}
              <div className="p-5 flex flex-col items-center text-center border-r border-white/5"
                style={{ background: `linear-gradient(180deg, ${challengerColor}08, transparent)` }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                  style={{ color: challengerColor }}>YOU</div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl mb-3 font-[family-name:var(--font-outfit)]"
                  style={{ background: `linear-gradient(135deg, ${challengerColor}, ${challengerColor}88)`, color: '#040507' }}>
                  {initials(challenger.name)}
                </div>
                <p className="font-bold text-white text-sm mb-1">{challenger.name}</p>
                <p className="stat-mono text-xs mb-2" style={{ color: challengerColor }}>{challenger.rating} RP</p>
                <div className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: challengerColor + '20', color: challengerColor, border: `1px solid ${challengerColor}40` }}>
                  {challenger.tier}
                </div>
                {challenger.streak >= 3 && (
                  <div className="mt-2 text-xs">🔥 {challenger.streak}W Streak</div>
                )}
              </div>

              {/* Center VS */}
              <div className="flex flex-col items-center justify-center px-4 py-5 gap-3">
                <div className="font-black text-3xl font-[family-name:var(--font-outfit)]"
                  style={{ background: 'linear-gradient(180deg, #CCFF00, #00F0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  VS
                </div>
                <div className="px-3 py-1.5 rounded-xl border border-white/10 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-[9px] text-[#6b6b80] uppercase tracking-wider">Stake Pool</div>
                  <div className="stat-mono font-bold text-sm text-[#CCFF00] mt-0.5">🪙 {stake * 2}</div>
                </div>
              </div>

              {/* Opponent */}
              <div className="p-5 flex flex-col items-center text-center border-l border-white/5"
                style={{ background: `linear-gradient(180deg, ${opponentColor}08, transparent)` }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                  style={{ color: opponentColor }}>OPPONENT</div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl mb-3 font-[family-name:var(--font-outfit)]"
                  style={{ background: `linear-gradient(135deg, ${opponentColor}, ${opponentColor}88)`, color: '#040507' }}>
                  {initials(opponent.name)}
                </div>
                <p className="font-bold text-white text-sm mb-1">{opponent.name}</p>
                <p className="stat-mono text-xs mb-2" style={{ color: opponentColor }}>{opponent.rating} RP</p>
                <div className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: opponentColor + '20', color: opponentColor, border: `1px solid ${opponentColor}40` }}>
                  {opponent.tier}
                </div>
                {opponent.streak >= 3 && (
                  <div className="mt-2 text-xs">🔥 {opponent.streak}W Streak</div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="px-5 py-4 border-t border-white/5 space-y-4">
              {/* Stake */}
              <div>
                <label className="text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2 block">
                  Stake Coins (Each Player)
                </label>
                <div className="flex gap-2">
                  {STAKE_PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => { playClick(); setStake(p); }}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border tactile-press ${
                        stake === p
                          ? 'text-[#040507] border-transparent'
                          : 'text-[#6b6b80] border-white/5 hover:border-white/10 hover:text-white'
                      }`}
                      style={stake === p ? { background: 'linear-gradient(135deg, #CCFF00, #a3cc00)' } : { background: 'rgba(255,255,255,0.03)' }}
                    >
                      🪙 {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Sport */}
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2 block">Sport</label>
                  <div className="relative">
                    <select
                      value={sport}
                      onChange={e => { playClick(); setSport(e.target.value); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-[#CCFF00]/40 pr-8 transition-colors"
                    >
                      {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b6b80] pointer-events-none" />
                  </div>
                </div>
                {/* Venue */}
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-2 block">Venue</label>
                  <div className="relative">
                    <select
                      value={venue}
                      onChange={e => { playClick(); setVenue(e.target.value); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-[#CCFF00]/40 pr-8 transition-colors"
                    >
                      {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b6b80] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Hold to Confirm Button */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <div className="relative flex items-center justify-center">
                  {/* SVG ring */}
                  <svg width="88" height="88" className="rotate-[-90deg]">
                    <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle
                      cx="44" cy="44" r="36" fill="none"
                      stroke="#CCFF00" strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                    />
                  </svg>
                  <button
                    className="absolute inset-0 flex items-center justify-center rounded-full font-black text-xs font-[family-name:var(--font-outfit)] transition-all select-none"
                    style={{
                      color: confirmed ? '#CCFF00' : holdProgress > 50 ? '#CCFF00' : 'white',
                      background: holdProgress > 0 ? 'rgba(204,255,0,0.08)' : 'transparent',
                    }}
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                  >
                    {confirmed ? '✓ SENT' : holdProgress > 50 ? 'HOLD...' : 'HOLD'}
                  </button>
                </div>
                <p className="text-[10px] text-[#6b6b80]">
                  {confirmed ? 'Challenge sent!' : 'Hold the button to confirm the duel'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
