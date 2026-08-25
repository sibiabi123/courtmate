'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Share2, Sparkles, Trophy, Flame, Shield, Award,
  Check, Star, Zap
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface AthleteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatar?: string;
    sport?: string;
    rating?: number;
    hostel?: string;
    streak?: number;
  };
}

export function AthleteCardModal({ isOpen, onClose, user }: AthleteCardModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  const rating = Math.round(user.rating || 1780);
  const ovr = Math.min(99, Math.round(rating / 22));

  const stats = [
    { label: 'PAC', val: 89 },
    { label: 'PWR', val: 94 },
    { label: 'AGI', val: 91 },
    { label: 'STM', val: 88 },
    { label: 'TAC', val: 95 },
    { label: 'CLU', val: 92 },
  ];

  const handleDownload = () => {
    sound.playVictory();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="relative w-full max-w-sm flex flex-col items-center"
          >
            {/* Close button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ── ULTIMATE ATHLETE CARD ── */}
            <div
              className="w-full h-[520px] rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border-2 border-[#ffd60a]/60"
              style={{
                background: 'linear-gradient(145deg, #1f1b2e 0%, #111018 50%, #0d0a14 100%)',
                boxShadow: '0 0 50px rgba(255, 214, 10, 0.25), inset 0 0 30px rgba(123, 47, 247, 0.3)',
              }}
            >
              {/* Holographic Foil overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 0%, #00f5d4 0%, transparent 60%), radial-gradient(circle at 100% 100%, #ff006e 0%, transparent 50%)',
                }}
              />

              {/* Card Top Header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col items-center">
                  <span className="font-outfit font-black text-4xl leading-none text-[#ffd60a] drop-shadow-[0_2px_10px_rgba(255,214,10,0.5)]">
                    {ovr}
                  </span>
                  <span className="text-[11px] font-black tracking-widest text-[#00f5d4] uppercase mt-0.5">
                    {user.sport || 'PRO'}
                  </span>
                  <div className="w-8 h-0.5 bg-[#ffd60a]/50 my-1 rounded-full" />
                  <Trophy className="w-4 h-4 text-[#ffd60a]" />
                </div>

                {/* Avatar with Halo */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#ffd60a] to-[#00f5d4] blur-md opacity-60 animate-pulse" />
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`}
                    alt={user.name}
                    className="relative h-28 w-28 rounded-2xl object-cover bg-[#0a0a0f] border-2 border-white/20 p-1 shadow-2xl"
                  />
                </div>
              </div>

              {/* Player Name & Region */}
              <div className="text-center relative z-10 my-2">
                <h3 className="font-outfit font-black text-2xl tracking-wider uppercase text-white drop-shadow-md truncate">
                  {user.name}
                </h3>
                <p className="text-[11px] font-bold text-[#a0a0b8] tracking-widest uppercase flex items-center justify-center gap-1.5 mt-0.5">
                  <span>{user.hostel || 'Main Campus'}</span>
                  <span>•</span>
                  <span className="text-[#ffd60a]">{rating} ELO</span>
                </p>
              </div>

              {/* Attribute Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 relative z-10 backdrop-blur-md">
                {stats.map(s => (
                  <div key={s.label} className="text-center">
                    <span className="text-xs font-bold text-[#6b6b80] mr-1">{s.label}</span>
                    <span className="font-outfit font-black text-sm text-white">{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Card Branding */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-[#6b6b80] font-bold relative z-10">
                <span className="flex items-center gap-1 text-[#ffd60a]">
                  <Flame className="w-3 h-3 text-[#ff006e]" /> {user.streak || 5} Win Streak
                </span>
                <span className="tracking-widest uppercase text-white/50">COURTMATE ULTIMATE</span>
              </div>
            </div>

            {/* Modal Action Controls */}
            <div className="flex items-center gap-3 w-full mt-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs text-white shadow-xl transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
              >
                {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
                {downloaded ? 'Card Saved!' : 'Download Athlete Card'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
