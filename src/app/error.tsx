'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[CourtMate Error]', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Red ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative text-center max-w-lg"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </motion.div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] text-white mb-3">
          Something Went Wrong
        </h1>
        <p className="text-[#a0a0b8] text-base leading-relaxed mb-2 max-w-md mx-auto">
          An unexpected error occurred. This has been logged and our team will investigate.
        </p>
        {error.digest && (
          <p className="text-xs text-[#6b6b80] mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Back Home
          </a>
        </div>

        {/* Support hint */}
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-xs text-[#6b6b80] flex items-center justify-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            If this keeps happening, <a href="/support" className="text-[#00f5d4] hover:underline">contact support</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
