'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useUIStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Login failed. Check your credentials.'); return; }
      setCurrentUser(data.user);
      router.push('/feed');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--void)' }}>

      {/* Left panel — branded */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 40% 50%, rgba(200,255,0,0.06) 0%, transparent 65%)' }} />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--volt)' }}>
              <span className="font-black text-sm" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>CM</span>
            </div>
            <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              <span style={{ color: 'var(--text-primary)' }}>Court</span>
              <span style={{ color: 'var(--volt)' }}>Mate</span>
            </span>
          </div>

          {/* Mock match cards — pure CSS, no JS */}
          <div className="space-y-3 mb-10 text-left">
            {[
              { emoji: '🏸', game: 'Badminton', location: 'Indoor Court 2', slots: '2/4', status: 'Open' },
              { emoji: '⚽', game: 'Football 7v7', location: 'Main Ground', slots: '12/14', status: 'Filling fast' },
              { emoji: '🏀', game: 'Basketball', location: 'Center Court', slots: '4/10', status: 'Open' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--r-lg)]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', opacity: 1 - i * 0.12 }}>
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.game}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.location} · {m.slots} players</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'var(--volt-dim)', color: 'var(--volt)', border: '1px solid var(--volt-border)' }}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Campus sports matchmaking for serious athletes.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--volt)' }}>
              <span className="font-black text-[11px]" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>CM</span>
            </div>
            <span className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              <span style={{ color: 'var(--text-primary)' }}>Court</span><span style={{ color: 'var(--volt)' }}>Mate</span>
            </span>
          </div>

          <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Sign in to your CourtMate account</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-[var(--r-lg)] text-sm mb-6"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-cap mb-2 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@vit.ac.in"
                required
                className="input-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-cap">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-medium hover:underline"
                  style={{ color: 'var(--signal)' }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="input-base pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm font-bold mt-2">
              {loading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-[var(--ink)] border-t-transparent animate-spin" />Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--volt)' }}>
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
