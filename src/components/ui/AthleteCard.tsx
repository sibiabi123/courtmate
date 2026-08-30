'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Zap, Crown, Shield, ChevronRight } from 'lucide-react';
import { playClick, playDuel } from '@/lib/sound';

interface AthleteCardProps {
  athlete: {
    id: number | string;
    name: string;
    avatar?: string;
    rating: number;
    tier: string;
    sport: string;
    winRate: number;
    streak: number;
    wins: number;
    district?: string;
  };
  rank?: number;
  onChallenge?: (athleteId: number | string) => void;
  compact?: boolean;
}

const TIER_CONFIG: Record<string, { label: string; icon: React.ReactNode; gradient: string; foil: string; glow: string; textColor: string }> = {
  Champion: {
    label: 'Champion',
    icon: <Crown className="w-3 h-3" />,
    gradient: 'linear-gradient(135deg, #FFD700, #ff9500, #FFD700)',
    foil: 'foil-champion',
    glow: 'rgba(255, 215, 0, 0.4)',
    textColor: '#FFD700',
  },
  Diamond: {
    label: 'Diamond',
    icon: <Star className="w-3 h-3" />,
    gradient: 'linear-gradient(135deg, #00F0FF, #0080ff)',
    foil: 'foil-diamond',
    glow: 'rgba(0, 240, 255, 0.35)',
    textColor: '#00F0FF',
  },
  Platinum: {
    label: 'Platinum',
    icon: <Zap className="w-3 h-3" />,
    gradient: 'linear-gradient(135deg, #CCFF00, #00F0FF)',
    foil: 'foil-platinum',
    glow: 'rgba(204, 255, 0, 0.3)',
    textColor: '#CCFF00',
  },
  Gold: {
    label: 'Gold',
    icon: <Star className="w-3 h-3" />,
    gradient: 'linear-gradient(135deg, #FFD700, #ff9500)',
    foil: 'foil-champion',
    glow: 'rgba(255, 215, 0, 0.25)',
    textColor: '#FFD700',
  },
  Silver: {
    label: 'Silver',
    icon: <Shield className="w-3 h-3" />,
    gradient: 'linear-gradient(135deg, #c0c0c0, #888)',
    foil: 'foil-platinum',
    glow: 'rgba(192, 192, 192, 0.2)',
    textColor: '#c0c0c0',
  },
  Bronze: {
    label: 'Bronze',
    icon: <Shield className="w-3 h-3" />,
    gradient: 'linear-gradient(135deg, #cd7f32, #8B4513)',
    foil: '',
    glow: 'rgba(205, 127, 50, 0.2)',
    textColor: '#cd7f32',
  },
};

const SKILL_LABELS = ['Win Rate', 'Form', 'Clutch', 'Exp', 'Fair Play'];

function getSkills(winRate: number, streak: number, wins: number) {
  return [
    Math.min(100, winRate),
    Math.min(100, 40 + streak * 8),
    Math.min(100, 50 + (wins % 10) * 5),
    Math.min(100, Math.min(wins * 1.5, 100)),
    Math.min(100, 70 + Math.random() * 20),
  ].map(Math.round);
}

export function AthleteCard({ athlete, rank, onChallenge, compact = false }: AthleteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const tier = TIER_CONFIG[athlete.tier] ?? TIER_CONFIG.Bronze;
  const skills = getSkills(athlete.winRate, athlete.streak, athlete.wins);
  const initials = athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 14;
    setTilt({ x, y });
  }, []);

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovering(false);
  };

  if (compact) {
    return (
      <div
        className={`relative rounded-xl border p-3 flex items-center gap-3 transition-all cursor-pointer kinetic-card ${tier.foil}`}
        style={{ borderColor: isHovering ? tier.glow : 'rgba(255,255,255,0.07)' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => { playClick(); onChallenge?.(athlete.id); }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-[family-name:var(--font-outfit)]"
          style={{ background: tier.gradient, color: '#040507' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{athlete.name}</p>
          <p className="text-xs stat-mono" style={{ color: tier.textColor }}>{athlete.rating} RP</p>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: tier.textColor }}>
          {tier.icon}
          <span className="font-semibold">{athlete.tier}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-2xl border overflow-hidden cursor-pointer select-none ${tier.foil}`}
      style={{
        background: 'linear-gradient(145deg, #0f1218, #12151c)',
        borderColor: isHovering ? tier.textColor + '40' : 'rgba(255,255,255,0.08)',
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovering ? 'transform 0.05s ease' : 'transform 0.5s ease, border-color 0.3s ease',
        boxShadow: isHovering ? `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${tier.glow}` : '0 8px 30px rgba(0,0,0,0.4)',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tier accent bar */}
      <div className="h-1 w-full" style={{ background: tier.gradient }} />

      {/* Rank badge */}
      {rank && (
        <div className="absolute top-3 left-3 z-10">
          <div className="px-2 py-0.5 rounded-md text-[10px] font-bold stat-mono"
            style={{ background: tier.gradient, color: '#040507' }}>
            #{rank}
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl font-[family-name:var(--font-outfit)] shrink-0"
              style={{ background: tier.gradient, color: '#040507' }}>
              {initials}
            </div>
            {athlete.streak >= 3 && (
              <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: '#FF2A55', color: 'white' }}>
                🔥{athlete.streak}W
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-black text-white text-base font-[family-name:var(--font-outfit)] leading-tight truncate">
              {athlete.name}
            </h3>
            <p className="text-xs text-[#6b6b80] mt-0.5 truncate">{athlete.sport} · {athlete.district ?? 'Campus'}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: tier.gradient, color: '#040507' }}>
                {tier.icon} {tier.label}
              </span>
            </div>
          </div>
        </div>

        {/* ELO Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'ELO', value: athlete.rating, mono: true, color: tier.textColor },
            { label: 'Win%', value: `${athlete.winRate}%`, mono: true, color: '#a0a0b8' },
            { label: 'Wins', value: athlete.wins, mono: true, color: '#a0a0b8' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-2.5 text-center border border-white/[0.04]"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="stat-mono font-bold text-sm" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[9px] text-[#6b6b80] uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Skill Bars */}
        <div className="space-y-2 mb-4">
          {SKILL_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[9px] text-[#6b6b80] uppercase tracking-wide w-14 shrink-0">{label}</span>
              <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-1 rounded-full skill-bar-fill"
                  style={{ width: `${skills[i]}%` }}
                />
              </div>
              <span className="text-[9px] stat-mono text-[#6b6b80] w-6 text-right">{skills[i]}</span>
            </div>
          ))}
        </div>

        {/* Challenge Button */}
        <button
          onClick={() => { playDuel(); onChallenge?.(athlete.id); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[#040507] text-sm transition-all tactile-press"
          style={{ background: tier.gradient, boxShadow: `0 4px 20px ${tier.glow}` }}
        >
          ⚔️ Issue Duel
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
