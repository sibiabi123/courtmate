'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Swords, Gamepad2, Trophy, User } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/feed', label: 'Feed', icon: Swords },
  { href: '/arcade', label: 'Arcade', icon: Gamepad2, center: true },
  { href: '/tournaments', label: 'Tourneys', icon: Trophy },
  { href: '/profile/u1', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong border-t border-white/5">
        <div className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            if (tab.center) {
              return (
                <Link key={tab.href} href={tab.href} className="relative -mt-4">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-[#7b2ff7] to-[#00f5d4] shadow-[0_0_20px_rgba(0,245,212,0.4)]'
                        : 'bg-[#1a1a2e] hover:bg-[#25253d]'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-[#6b6b80]'}`} />
                  </motion.div>
                  <span
                    className={`mt-1 block text-center text-[10px] ${
                      isActive ? 'text-[#00f5d4]' : 'text-[#6b6b80]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link key={tab.href} href={tab.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-0.5 py-2 px-3"
                >
                  <div className="relative">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-[#00f5d4]' : 'text-[#6b6b80]'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="mobile-indicator"
                        className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#00f5d4]"
                        style={{ boxShadow: '0 0 8px rgba(0,245,212,0.8)' }}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] ${
                      isActive ? 'text-[#00f5d4]' : 'text-[#6b6b80]'
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
