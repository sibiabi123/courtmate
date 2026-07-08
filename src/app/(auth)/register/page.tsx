'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const VIT_HOSTELS = [
  'Day Scholar',
  "Men's Hostel A", "Men's Hostel B", "Men's Hostel C", "Men's Hostel D",
  "Men's Hostel E", "Men's Hostel F", "Men's Hostel G", "Men's Hostel H",
  "Men's Hostel J", "Men's Hostel K", "Men's Hostel L", "Men's Hostel M",
  "Men's Hostel N", "Men's Hostel P", "Men's Hostel Q", "Men's Hostel R",
  "Ladies Hostel A", "Ladies Hostel B", "Ladies Hostel C",
  "Ladies Hostel D", "Ladies Hostel E", "Ladies Hostel F",
];

function getPasswordStrength(pwd: string): { label: string; color: string; pct: number } {
  if (pwd.length === 0) return { label: '', color: '#333', pct: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Weak', color: '#ef4444', pct: 25 };
  if (score === 2) return { label: 'Fair', color: '#f59e0b', pct: 50 };
  if (score === 3) return { label: 'Good', color: '#3b82f6', pct: 75 };
  return { label: 'Strong', color: '#10b981', pct: 100 };
}

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useUIStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', hostel: 'Day Scholar' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const pwdStrength = getPasswordStrength(form.password);
  const emailValid = form.email.endsWith('@vitstudent.ac.in') || form.email.endsWith('@vit.ac.in');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailValid) { setError('Please use your VIT email (@vitstudent.ac.in or @vit.ac.in).'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!agreed) { setError('Please accept the terms to continue.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, hostel: form.hostel }),
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
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left: Campus photo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/VIT_University_Vellore.jpg/1280px-VIT_University_Vellore.jpg"
          alt="VIT Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,15,0.75), rgba(0,245,212,0.3))' }} />
        <div className="absolute bottom-12 left-10 right-10">
          <h2 className="text-4xl font-black font-outfit text-white mb-3">Join Court<span className="text-[#00f5d4]">Mate</span></h2>
          <p className="text-white/80 text-lg font-body">Create your student sports card, claim 100 welcome coins, and find your squad today.</p>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-8">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                <span className="text-white font-black text-sm">CM</span>
              </div>
              <span className="text-2xl font-black font-outfit text-white">Court<span className="text-[#00f5d4]">Mate</span></span>
            </Link>
          </div>

          <h1 className="text-3xl font-black font-outfit text-white mb-2">Create your account</h1>
          <p className="text-[#6b6b80] mb-8 font-body">Join VIT’s campus sports matchmaking platform</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-outfit uppercase tracking-wider text-xs">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-outfit uppercase tracking-wider text-xs">VIT Email</label>
              <div className="relative">
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="yourname@vitstudent.ac.in" required
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-10 text-white placeholder-[#4a4a5a] focus:outline-none transition-all ${
                    form.email && !emailValid ? 'border-red-500/50' : form.email && emailValid ? 'border-emerald-500/50' : 'border-white/10 focus:border-[#7b2ff7]'
                  }`} />
                {form.email && emailValid && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />}
              </div>
              {form.email && !emailValid && <p className="text-xs text-red-400 mt-1 font-body">Must be a @vitstudent.ac.in or @vit.ac.in email</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-outfit uppercase tracking-wider text-xs">Hostel / Campus block</label>
              <select value={form.hostel} onChange={e => setForm({ ...form, hostel: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7b2ff7] transition-all" style={{ appearance: 'none' }}>
                {VIT_HOSTELS.map(h => <option key={h} value={h} style={{ background: '#111118' }}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-outfit uppercase tracking-wider text-xs">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80] hover:text-white">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pwdStrength.pct}%`, background: pwdStrength.color }} />
                  </div>
                  <p className="text-xs mt-1 font-semibold" style={{ color: pwdStrength.color }}>{pwdStrength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-2 font-outfit uppercase tracking-wider text-xs">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Re-enter password" required
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none transition-all ${
                  form.confirm && form.confirm !== form.password ? 'border-red-500/50' : form.confirm && form.confirm === form.password ? 'border-emerald-500/50' : 'border-white/10 focus:border-[#7b2ff7]'
                }`} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-[#7b2ff7]" />
              <span className="text-sm text-[#6b6b80] font-body">I agree to the <span className="text-[#00f5d4] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#00f5d4] hover:underline cursor-pointer">Privacy Policy</span></span>
            </label>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b6b80] mt-6 font-body">
            Already have an account? <Link href="/login" className="text-[#00f5d4] font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
