'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, GraduationCap, MapPin } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { getActiveCampusConfig } from '@/lib/campus-config';

function getPwdStrength(pwd: string): { label: string; color: string; pct: number } {
  if (!pwd) return { label: '', color: 'var(--border)', pct: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Weak',   color: 'var(--danger)',  pct: 25 };
  if (score === 2) return { label: 'Fair',   color: 'var(--warning)', pct: 50 };
  if (score === 3) return { label: 'Good',   color: 'var(--signal)',  pct: 75 };
  return               { label: 'Strong', color: 'var(--volt)',    pct: 100 };
}

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useUIStore();
  const campusConfig = getActiveCampusConfig();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    hostel: campusConfig.hostels[0]?.name || 'MH-A Block',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [agreed, setAgreed]   = useState(false);

  const pwdStrength    = getPwdStrength(form.password);
  const emailDomain    = form.email.split('@')[1]?.toLowerCase();
  const isAcademic     = emailDomain?.includes('vit') || emailDomain?.endsWith('.ac.in') || emailDomain?.endsWith('.edu');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters.'); return; }
    if (!agreed)                         { setError('Please accept the Fair Play guidelines.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          collegeId: 'vit-vellore', collegeName: campusConfig.collegeName, hostel: form.hostel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Registration failed.'); return; }
      setCurrentUser(data.user);
      router.push('/feed');
    } catch { setError('Network error. Please try again.'); }
    finally   { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--void)' }}>

      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 40% 40%, rgba(200,255,0,0.05) 0%, transparent 65%)' }} />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--volt)' }}>
              <span className="font-black text-[11px]" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>CM</span>
            </div>
            <span className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Court<span style={{ color: 'var(--volt)' }}>Mate</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-5"
            style={{ background: 'var(--volt-dim)', color: 'var(--volt)', border: '1px solid var(--volt-border)' }}>
            {campusConfig.emblem} {campusConfig.shortName}
          </span>

          <h2 className="text-3xl font-black leading-tight mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Host matches.<br />Build your rank.<br />Own the <span style={{ color: 'var(--volt)' }}>court.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Join campus athletes. Coordinate pickup games, compete in hostel tournaments, and climb the leaderboard.
          </p>
        </div>

        <div className="relative z-10" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <p className="label-cap mb-3">Campus Venues</p>
          <div className="flex flex-wrap gap-2">
            {campusConfig.venues.slice(0, 5).map(v => (
              <span key={v.id} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--volt)' }} />
                {v.name.split('(')[0].trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8">

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
            Create your profile
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>Free. No card required.</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-[var(--r-lg)] text-sm mb-5"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label-cap mb-2 block">Full Name</label>
              <input type="text" required placeholder="e.g. Arjun Sharma"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-base" />
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-cap">Email</label>
                {isAcademic && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold"
                    style={{ color: 'var(--success)' }}>
                    <GraduationCap className="w-3 h-3" /> Verified Student
                  </span>
                )}
              </div>
              <input type="email" required placeholder="name@vitstudent.ac.in"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-base" />
            </div>

            {/* Hostel */}
            <div>
              <label className="label-cap mb-2 block">Hostel / Residence</label>
              <select value={form.hostel} onChange={e => setForm(p => ({ ...p, hostel: e.target.value }))}
                className="input-base"
                style={{ backgroundImage: 'none' }}>
                {campusConfig.hostels.map(h => (
                  <option key={h.id} value={h.name}
                    style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-cap mb-2 block">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required placeholder="8+ chars"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="input-base pr-9" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0"
                    style={{ color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label-cap mb-2 block">Confirm</label>
                <input type={showPwd ? 'text' : 'password'} required placeholder="Repeat"
                  value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  className="input-base" />
              </div>
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="space-y-1">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pwdStrength.pct}%`, background: pwdStrength.color }} />
                </div>
                <span className="text-[10px] font-semibold stat-mono" style={{ color: pwdStrength.color }}>
                  {pwdStrength.label}
                </span>
              </div>
            )}

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 rounded" style={{ accentColor: 'var(--volt)' }} />
              <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                I agree to the{' '}
                <Link href="/community-guidelines" className="hover:underline" style={{ color: 'var(--signal)' }}>
                  Fair Play Guidelines
                </Link>
                {' '}and Campus Sports Honor Code.
              </span>
            </label>

            <button type="submit" disabled={loading || !agreed}
              className="btn-primary w-full py-3 text-sm font-bold">
              {loading
                ? <><span className="w-4 h-4 rounded-full border-2 border-[var(--ink)] border-t-transparent animate-spin" />Creating profile...</>
                : 'Create Athlete Profile'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--volt)' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
