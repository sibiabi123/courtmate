'use client';

import { useEffect, useState } from 'react';
import { Zap, Trophy, Users, Activity } from 'lucide-react';

interface TickerItem {
  icon: React.ReactNode;
  text: string;
  accent: string;
}

// Fallback items shown only when no real data is available — generic, non-fabricated
const FALLBACK_ITEMS: TickerItem[] = [
  { icon: <Activity className="w-3.5 h-3.5" />, text: 'Campus Match Radar is live — post a match to get started', accent: '#CCFF00' },
  { icon: <Trophy className="w-3.5 h-3.5" />, text: 'Tournaments available — register your team now', accent: '#FFD700' },
  { icon: <Users className="w-3.5 h-3.5" />, text: 'Find teammates for Cricket, Football, Badminton & more', accent: '#00F0FF' },
  { icon: <Zap className="w-3.5 h-3.5" />, text: '1v1 Duels — challenge any player on campus to a ranked match', accent: '#CCFF00' },
];

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_ITEMS);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Fetch real stats and build ticker from live data
    Promise.all([
      fetch('/api/stats').then(r => r.json()).catch(() => null),
      fetch('/api/posts?limit=3').then(r => r.json()).catch(() => null),
    ]).then(([stats, postsData]) => {
      const live: TickerItem[] = [];

      if (stats?.activeMatches > 0) {
        live.push({
          icon: <Zap className="w-3.5 h-3.5" />,
          text: `${stats.activeMatches} active match ${stats.activeMatches === 1 ? 'lobby' : 'lobbies'} on campus right now`,
          accent: '#CCFF00',
        });
      }

      if (stats?.totalUsers > 0) {
        live.push({
          icon: <Users className="w-3.5 h-3.5" />,
          text: `${stats.totalUsers} athletes have joined CourtMate — find your match`,
          accent: '#00F0FF',
        });
      }

      // Build ticker from recent real posts
      if (postsData?.posts?.length > 0) {
        postsData.posts.slice(0, 3).forEach((post: any) => {
          const spotsLeft = post.maxPlayers - post.currentPlayers;
          if (spotsLeft > 0) {
            live.push({
              icon: <Users className="w-3.5 h-3.5" />,
              text: `${post.sport} at ${post.ground} — ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} open`,
              accent: '#CCFF00',
            });
          }
        });
      }

      // Use real data if we have meaningful items, otherwise keep fallback
      if (live.length >= 2) {
        setItems([...live, ...live]); // duplicate for seamless loop
      } else {
        setItems([...FALLBACK_ITEMS, ...FALLBACK_ITEMS]);
      }
    });
  }, []);

  const displayItems = [...items, ...items]; // ensure seamless scrolling

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
          {displayItems.map((item, i) => (
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
