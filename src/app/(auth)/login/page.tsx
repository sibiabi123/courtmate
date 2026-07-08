'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
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
      if (!res.ok || !data.success) {
        setError(data.error || 'Login failed. Check your credentials.');
        return;
      }
      // Set the session user in zustand store
      setCurrentUser(data.user);
      router.push('/feed');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left: VIT Campus Photo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/VIT_University_Vellore.jpg/1280px-VIT_University_Vellore.jpg"
          alt="VIT University Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,15,0.75), rgba(123,47,247,0.4))' }} />
        <div className="absolute bottom-12 left-10 right-10">
          <h2 className="text-4xl font-black font-outfit text-white mb-3">Court<span className="text-[#00f5d4]">Mate</span></h2>
          <p className="text-white/80 text-lg leading-relaxed font-body">Campus sports matchmaking for VIT Vellore. Find players, join matches, track your ELO.</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                <span className="text-white font-black text-sm">CM</span>
              </div>
              <span className="text-2xl font-black font-outfit text-white">Court<span className="text-[#00f5d4]">Mate</span></span>
            </Link>
          </div>

          <h1 className="text-3xl font-black font-outfit text-white mb-2">Welcome back</h1>
          <p className="text-[#6b6b80] mb-8 font-body">Sign in to your CourtMate account</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-outfit uppercase tracking-wider text-xs">VIT Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your.name2026@vitstudent.ac.in"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] focus:bg-white/8 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-outfit uppercase tracking-wider text-xs">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] focus:bg-white/8 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80] hover:text-white">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6b6b80] text-sm font-body">
              Don’t have an account?{' '}
              <Link href="/register" className="text-[#00f5d4] font-semibold hover:underline">Register here</Link>
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-white/5 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs text-[#6b6b80] font-body">Use your registered VIT email and password to sign in.</p>
            <p className="text-xs text-[#4a4a5a] mt-1 font-body">New to CourtMate? <Link href="/register" className="text-[#00f5d4] hover:underline">Create a free account</Link></p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
