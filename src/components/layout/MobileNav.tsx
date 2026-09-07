'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Rss, Trophy, BarChart3, Swords } from 'lucide-react';
import { playClick } from '@/lib/sound';

const tabs = [
  { href: '/',            label: 'Home',       icon: Home },
  { href: '/challenges',  label: 'Duels',      icon: Swords },
  { href: '/feed',        label: 'Feed',       icon: Rss,      center: true },
  { href: '/tournaments', label: 'Cups',        icon: Trophy },
  { href: '/leaderboard', label: 'Rankings',   icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="border-t"
        style={{
          background: 'rgba(3,5,8,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-end justify-around px-1 pb-[env(safe-area-inset-bottom,8px)]">
          {tabs.map(tab => {
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            if (tab.center) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => playClick()}
                  className="relative -mt-4 flex flex-col items-center"
                >
                  <motion.div
                    whileTap={{ scale: 0.90 }}
                    className="flex h-12 w-12 items-center justify-center rounded-[var(--r-xl)] shadow-lg transition-all"
                    style={{
                      background: isActive ? 'var(--volt)' : 'var(--surface-2)',
                      color: isActive ? 'var(--ink)' : 'var(--text-secondary)',
                      border: isActive ? 'none' : '1px solid var(--border)',
                      boxShadow: isActive ? '0 0 20px var(--volt-dim), 0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <span
                    className="mt-1 block text-center text-[10px] font-semibold"
                    style={{ color: isActive ? 'var(--volt)' : 'var(--text-muted)' }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => playClick()}
                className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[52px]"
              >
                <motion.div whileTap={{ scale: 0.88 }} className="relative flex items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-bg"
                      className="absolute inset-0 -m-1.5 rounded-lg"
                      style={{ background: 'rgba(200,255,0,0.08)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className="h-[18px] w-[18px] relative z-10 transition-colors"
                    style={{ color: isActive ? 'var(--volt)' : 'var(--text-muted)' }}
                  />
                </motion.div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? 'var(--volt)' : 'var(--text-muted)' }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
