'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, MapPin, GraduationCap, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { getActiveCampusConfig } from '@/lib/campus-config';

function getPasswordStrength(pwd: string): { label: string; color: string; pct: number } {
  if (pwd.length === 0) return { label: '', color: '#333', pct: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Weak', color: '#FF2A55', pct: 25 };
  if (score === 2) return { label: 'Fair', color: '#f59e0b', pct: 50 };
  if (score === 3) return { label: 'Good', color: '#00F0FF', pct: 75 };
  return { label: 'Strong', color: '#CCFF00', pct: 100 };
}

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useUIStore();
  const campusConfig = getActiveCampusConfig();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    hostel: campusConfig.hostels[0]?.name || 'MH-A Block',
  });

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const pwdStrength = getPasswordStrength(form.password);
  const emailValid = /^[^@]+@[^@]+\.[^@]+$/.test(form.email);
  const emailDomain = form.email.split('@')[1]?.toLowerCase();
  const isVerifiedAcademic = emailDomain?.includes('vit') || emailDomain?.endsWith('.ac.in') || emailDomain?.endsWith('.edu');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailValid) { setError('Please enter a valid email address.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!agreed) { setError('Please accept the Fair Play guidelines.'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          collegeId: 'vit-vellore',
          collegeName: campusConfig.collegeName,
          hostel: form.hostel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Try again.');
        return;
      }
      setCurrentUser(data.user);
      router.push('/feed');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040507] flex">
      {/* Left: Collegiate Hero Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-[#08090C] border-r border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#CCFF00_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#040507] font-black text-sm">
              CM
            </div>
            <span className="text-2xl font-black font-outfit text-white">Court<span className="text-[#CCFF00]">Mate</span></span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 mb-4">
            <span>{campusConfig.emblem}</span> {campusConfig.shortName} Athletic Network
          </div>
          <h2 className="text-4xl font-black font-outfit text-white leading-tight mb-4">
            Host Games, Stake 1v1 Duels & Dominate the <span className="text-[#CCFF00]">Hostel Cup</span>.
          </h2>
          <p className="text-[#a0a0b8] text-sm leading-relaxed max-w-md">
            Join thousands of campus athletes. Coordinate pickup matches across campus sports arenas, claim your 3D sports card, and compete for hostel supremacy.
          </p>
        </div>

        {/* Live campus chips */}
        <div className="relative z-10 pt-8 border-t border-white/10">
          <p className="text-xs font-black uppercase tracking-wider text-[#6b6b80] mb-3">Campus Facilities</p>
          <div className="flex flex-wrap gap-2">
            {campusConfig.venues.slice(0, 5).map(v => (
              <span key={v.id} className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#CCFF00]" /> {v.name.split('(')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Clean Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-8">
          
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-[#040507] font-black flex items-center justify-center text-xs">
                CM
              </div>
              <span className="text-2xl font-black font-outfit text-white">Court<span className="text-[#CCFF00]">Mate</span></span>
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-8 shadow-2xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-full border border-[#CCFF00]/20 mb-2">
                <span>{campusConfig.emblem}</span> {campusConfig.shortName}
              </div>
              <h1 className="text-2xl font-black font-outfit text-white">Create Athlete Profile</h1>
              <p className="text-xs text-[#a0a0b8] mt-1">Get your 3D card and 100 welcome coins 🪙</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#FF2A55]/10 border border-[#FF2A55]/30 text-[#FF2A55] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Sharma"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              {/* Email with Verified Badge Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">Campus / Personal Email</label>
                  {isVerifiedAcademic && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <GraduationCap className="w-3 h-3" /> Verified Student
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  placeholder="name.2026@vitstudent.ac.in or personal email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              {/* Hostel / Residence */}
              <div>
                <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-1.5">
                  Hostel Block / Residence
                </label>
                <select
                  value={form.hostel}
                  onChange={e => setForm(prev => ({ ...prev, hostel: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  {campusConfig.hostels.map(h => (
                    <option key={h.id} value={h.name} className="bg-[#0A0C10]">{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      placeholder="8+ characters"
                      value={form.password}
                      onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-10 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b80] hover:text-white"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-1.5">Confirm</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={e => setForm(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${pwdStrength.pct}%`, background: pwdStrength.color }}
                      className="h-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: pwdStrength.color }}>
                    Strength: {pwdStrength.label}
                  </span>
                </div>
              )}

              {/* Terms checkbox */}
              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded accent-[#CCFF00]"
                />
                <span className="text-[11px] text-[#a0a0b8] leading-tight">
                  I agree to the Fair Play Guidelines and Campus Sports Honor Code.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreed}
                className="btn-volt w-full flex items-center justify-center gap-2 py-3.5 mt-4"
              >
                {loading ? <span className="w-4 h-4 border-2 border-[#040507]/40 border-t-[#040507] rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create Athlete Card (+100 🪙)
              </button>
            </form>

            <p className="text-center text-xs text-[#6b6b80] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#CCFF00] hover:underline font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
