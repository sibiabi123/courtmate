'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Rss, Swords, Globe, BarChart3, Crown } from 'lucide-react';
import { playClick } from '@/lib/sound';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/challenges', label: 'Duels', icon: Swords, center: true },
  { href: '/rivalry', label: 'Rivalry', icon: Globe },
  { href: '/leaderboard', label: 'Rankings', icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="border-t border-white/10 bg-[#040507]/95 backdrop-blur-xl">
        <div className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
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
                  className="relative -mt-5"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all ${
                      isActive
                        ? 'bg-[#CCFF00] text-[#040507] shadow-[0_0_25px_rgba(204,255,0,0.5)] font-black'
                        : 'bg-[#0A0C10] text-[#a0a0b8] border border-white/10'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <span
                    className={`mt-1 block text-center text-[10px] font-bold font-mono ${
                      isActive ? 'text-[#CCFF00]' : 'text-[#6b6b80]'
                    }`}
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
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-0.5 py-2 px-3"
                >
                  <div className="relative">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-[#CCFF00]' : 'text-[#6b6b80]'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="mobile-indicator"
                        className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#CCFF00]"
                        style={{ boxShadow: '0 0 10px rgba(204,255,0,0.8)' }}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? 'text-[#CCFF00]' : 'text-[#6b6b80]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
