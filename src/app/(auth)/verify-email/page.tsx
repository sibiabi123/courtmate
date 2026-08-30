'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MailCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'pending' | 'verified' | 'expired'>('pending');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    setResending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setResending(false);
    setCountdown(60);
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        {status === 'pending' && (
          <>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-[#7b2ff7]/20"
              style={{ background: 'rgba(123, 47, 247, 0.1)' }}
            >
              <MailCheck className="w-10 h-10 text-[#7b2ff7]" />
            </motion.div>

            <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
              Verify Your Email
            </h1>
            <p className="text-[#a0a0b8] text-base leading-relaxed mb-2">
              We've sent a verification link to your email address. Click the link to activate your CourtMate account.
            </p>
            <p className="text-sm text-[#6b6b80] mb-8">
              Check your inbox and spam folder.
            </p>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {resending
                ? 'Sending...'
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend Verification Email'}
            </button>

            {/* Help tips */}
            <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left space-y-2">
              <p className="text-xs text-[#a0a0b8] font-semibold mb-2">Having trouble?</p>
              <p className="text-xs text-[#6b6b80]">• Check your spam or junk folder</p>
              <p className="text-xs text-[#6b6b80]">• Make sure you entered the correct email</p>
              <p className="text-xs text-[#6b6b80]">
                • Still stuck? <Link href="/support" className="text-[#00f5d4] hover:underline">Contact Support</Link>
              </p>
            </div>
          </>
        )}

        {status === 'verified' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20"
              style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-3">
              Email Verified!
            </h1>
            <p className="text-[#a0a0b8] mb-6">
              Your account is now active. Welcome to CourtMate.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
            >
              Sign In to Start Playing
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
