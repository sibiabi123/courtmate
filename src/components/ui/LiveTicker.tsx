'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trophy, Swords, Users } from 'lucide-react';

interface TickerItem {
  icon: React.ReactNode;
  text: string;
  accent: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { icon: <Swords className="w-3.5 h-3.5" />, text: 'Arjun S. defeated Rohan K. in Badminton (+32 RP)', accent: '#CCFF00' },
  { icon: <Zap className="w-3.5 h-3.5" />, text: '26 pickup matches active right now on campus', accent: '#00F0FF' },
  { icon: <Trophy className="w-3.5 h-3.5" />, text: 'Campus Cricket Cup Finals — Registration Open', accent: '#FFD700' },
  { icon: <Swords className="w-3.5 h-3.5" />, text: 'Sneha R. issued a 1v1 Badminton challenge — 250 coins at stake', accent: '#FF2A55' },
  { icon: <Users className="w-3.5 h-3.5" />, text: 'Football 7v7 at Main Ground — 3 spots left', accent: '#CCFF00' },
  { icon: <Zap className="w-3.5 h-3.5" />, text: 'Karthik V. reached Diamond tier (1902 RP) 💎', accent: '#00F0FF' },
  { icon: <Trophy className="w-3.5 h-3.5" />, text: 'Inter-Hostel Basketball League — Starts Saturday', accent: '#FFD700' },
  { icon: <Swords className="w-3.5 h-3.5" />, text: 'Meera P. won a Table Tennis duel (+18 RP, 200 coins earned)', accent: '#CCFF00' },
];

export function LiveTicker() {
  const [isHovered, setIsHovered] = useState(false);
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <div
      className="w-full border-b border-white/5 overflow-hidden relative"
      style={{ background: 'rgba(4, 5, 7, 0.95)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #040507, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #040507, transparent)' }} />

      {/* Live dot */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: '#CCFF00' }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#CCFF00' }} />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] stat-mono"
          style={{ color: '#CCFF00' }}>LIVE</span>
      </div>

      {/* Scrolling content */}
      <div className="flex pl-20" style={{ height: '32px' }}>
        <div
          className="flex items-center whitespace-nowrap"
          style={{
            animation: isHovered ? 'none' : 'ticker 50s linear infinite',
            willChange: 'transform',
          }}
        >
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2 px-6 text-xs">
              <span style={{ color: item.accent }}>{item.icon}</span>
              <span className="text-[#a0a0b8]">{item.text}</span>
              <span className="text-white/10 mx-2">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
