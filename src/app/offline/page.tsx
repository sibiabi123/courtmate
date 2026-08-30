'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Dim glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6b6b80 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-lg"
      >
        {/* Icon */}
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <WifiOff className="w-10 h-10 text-[#6b6b80]" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] text-white mb-3">
          You're Offline
        </h1>
        <p className="text-[#a0a0b8] text-base leading-relaxed mb-8 max-w-md mx-auto">
          It looks like you've lost your internet connection. Check your network and try again — your data is safe.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>

        <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-xs text-[#6b6b80]">
            Some pages may still work from cache while you're offline.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
