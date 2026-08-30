'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = [
    { label: 'At least 8 characters', pass: form.password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(form.password) },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(form.password) },
    { label: 'Passwords match', pass: form.password.length > 0 && form.password === form.confirmPassword },
  ];

  const allValid = passwordChecks.every((c) => c.pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      setError('Please meet all password requirements.');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push('/login'), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {!done ? (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-[#7b2ff7]/20"
              style={{ background: 'rgba(123, 47, 247, 0.1)' }}>
              <Lock className="w-7 h-7 text-[#7b2ff7]" />
            </div>

            <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
              Set New Password
            </h1>
            <p className="text-[#6b6b80] mb-8">
              Create a strong password for your CourtMate account.
            </p>

            {error && (
              <div className="p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#a0a0b8] mb-2 font-[family-name:var(--font-outfit)] uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter new password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] focus:bg-white/8 transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80] hover:text-white">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a0a0b8] mb-2 font-[family-name:var(--font-outfit)] uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] focus:bg-white/8 transition-all"
                />
              </div>

              {/* Password strength checklist */}
              <div className="space-y-2">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${check.pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-[#4a4a5a]'}`}>
                      {check.pass && <CheckCircle className="w-3 h-3" />}
                    </div>
                    <span className={check.pass ? 'text-emerald-400' : 'text-[#6b6b80]'}>{check.label}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || !allValid}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20"
              style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white mb-2">
              Password Updated
            </h1>
            <p className="text-[#a0a0b8] mb-6">
              Your password has been successfully reset. Redirecting you to sign in...
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
            >
              Sign In Now
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
