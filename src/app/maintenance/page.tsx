'use client';

import { motion } from 'framer-motion';
import { Wrench, Clock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Amber ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-lg"
      >
        {/* Icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20"
          style={{ background: 'rgba(245, 158, 11, 0.1)' }}
        >
          <Wrench className="w-10 h-10 text-amber-400" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] text-white mb-3">
          We'll Be Right Back
        </h1>
        <p className="text-[#a0a0b8] text-base leading-relaxed mb-6 max-w-md mx-auto">
          CourtMate is undergoing scheduled maintenance to improve performance and add new features. We'll be back shortly.
        </p>

        {/* ETA */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#a0a0b8]">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Estimated downtime: <strong className="text-white">30 minutes</strong></span>
        </div>

        {/* Status updates */}
        <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-xs text-[#6b6b80]">
            Follow <a href="https://twitter.com/courtmate" className="text-[#00f5d4] hover:underline" target="_blank" rel="noopener noreferrer">@courtmate</a> for real-time status updates
          </p>
        </div>
      </motion.div>
    </div>
  );
}
