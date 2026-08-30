'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Trophy, Swords } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7b2ff7 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00f5d4 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative text-center max-w-lg"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-[120px] sm:text-[160px] font-black font-[family-name:var(--font-outfit)] leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] text-white mb-3">
            Out of Bounds
          </h2>
          <p className="text-[#a0a0b8] text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto">
            This page doesn't exist — it may have been moved or the URL is incorrect. Let's get you back in the game.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
          >
            <Home className="w-4 h-4" />
            Back Home
          </Link>
          <Link
            href="/feed"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Search className="w-4 h-4" />
            Browse Feed
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 pt-6 border-t border-white/5"
        >
          <p className="text-xs text-[#6b6b80] mb-4 uppercase tracking-wider font-[family-name:var(--font-outfit)]">Or go directly to</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { href: '/challenges', label: 'Challenges', icon: Swords },
              { href: '/tournaments', label: 'Tournaments', icon: Trophy },
              { href: '/leaderboard', label: 'Rankings', icon: ArrowLeft },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm text-[#a0a0b8] hover:text-[#00f5d4] transition-colors"
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
