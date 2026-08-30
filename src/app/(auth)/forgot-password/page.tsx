'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending a reset email
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left: Visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1461896836934-bd45ba3b1a21?auto=format&fit=crop&w=1280&q=80"
          alt="Athlete"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,15,0.85), rgba(123,47,247,0.35))' }} />
        <div className="absolute bottom-12 left-10 right-10">
          <h2 className="text-4xl font-black font-[family-name:var(--font-outfit)] text-white mb-3">
            Court<span className="text-[#00f5d4]">Mate</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Don't worry — happens to the best athletes. We'll help you get back in the game.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[#a0a0b8] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>

          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-[#7b2ff7]/20"
                style={{ background: 'rgba(123, 47, 247, 0.1)' }}>
                <Mail className="w-7 h-7 text-[#7b2ff7]" />
              </div>

              <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-[#6b6b80] mb-8">
                Enter the email address linked to your account. We'll send you a password reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#a0a0b8] mb-2 font-[family-name:var(--font-outfit)] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] focus:bg-white/8 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              {/* Success state */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20"
                style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>

              <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-[#a0a0b8] mb-3">
                We've sent a password reset link to:
              </p>
              <p className="text-white font-semibold mb-6">{email}</p>

              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                <p className="text-xs text-[#6b6b80]">
                  • The link expires in 30 minutes
                </p>
                <p className="text-xs text-[#6b6b80]">
                  • Check your spam folder if you don't see it
                </p>
                <p className="text-xs text-[#6b6b80]">
                  • <button onClick={() => setSent(false)} className="text-[#00f5d4] hover:underline">Try a different email</button>
                </p>
              </div>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-[#6b6b80]">
              Remember your password?{' '}
              <Link href="/login" className="text-[#00f5d4] font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
