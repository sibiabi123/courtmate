'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Search, Building2, MapPin, GraduationCap, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { GLOBAL_COLLEGES, College } from '@/data/colleges';

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
  
  const [selectedCollege, setSelectedCollege] = useState<College>(GLOBAL_COLLEGES[0]);
  const [customCollegeName, setCustomCollegeName] = useState('');
  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    hostel: GLOBAL_COLLEGES[0].residences[0] || 'Day Scholar',
  });

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const pwdStrength = getPasswordStrength(form.password);
  const emailValid = /^[^@]+@[^@]+\.[^@]+$/.test(form.email);
  const emailDomain = form.email.split('@')[1]?.toLowerCase();
  const isVerifiedAcademic = selectedCollege.verifiedDomains?.some(d => emailDomain?.endsWith(d)) || emailDomain?.endsWith('.edu') || emailDomain?.endsWith('.ac.in');

  const filteredColleges = GLOBAL_COLLEGES.filter(
    c => c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
         c.shortName.toLowerCase().includes(collegeSearch.toLowerCase()) ||
         c.country.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const handleCollegeChange = (c: College) => {
    setSelectedCollege(c);
    setIsCustomCollege(false);
    setForm(prev => ({ ...prev, hostel: c.residences[0] || 'Day Scholar / Off-Campus' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailValid) { setError('Please enter a valid email address.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!agreed) { setError('Please accept the terms to continue.'); return; }
    setLoading(true);

    try {
      const collegeId = isCustomCollege ? 'custom-' + customCollegeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : selectedCollege.id;
      const collegeName = isCustomCollege ? customCollegeName : selectedCollege.name;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          collegeId,
          collegeName,
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
      {/* Left: Global Collegiate Hero */}
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
            <GraduationCap className="w-4 h-4" /> Global Collegiate Athletic Network
          </div>
          <h2 className="text-4xl font-black font-outfit text-white leading-tight mb-4">
            Compete, Duel & Dominate Within <span className="text-[#CCFF00]">Your College</span> & Worldwide.
          </h2>
          <p className="text-[#a0a0b8] text-sm leading-relaxed max-w-md">
            Join 200+ universities worldwide. Host match lobbies on campus courts, stake ELO in 1v1 duels, and represent your university in global derbies.
          </p>
        </div>

        {/* Live campus chips */}
        <div className="relative z-10 pt-8 border-t border-white/10">
          <p className="text-xs font-black uppercase tracking-wider text-[#6b6b80] mb-3">Featured Campuses</p>
          <div className="flex flex-wrap gap-2">
            {GLOBAL_COLLEGES.slice(0, 6).map(c => (
              <span key={c.id} className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
                <span>{c.emblem}</span> {c.shortName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg py-8">
          
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
              
              {/* College Selection */}
              <div>
                <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                  Select University / College
                </label>
                
                {!isCustomCollege ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#6b6b80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search MIT, Stanford, IIT, Oxford, VIT..."
                        value={collegeSearch}
                        onChange={e => setCollegeSearch(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1 border border-white/10 rounded-xl p-1.5 bg-[#08090C]">
                      {filteredColleges.map(c => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => handleCollegeChange(c)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                            selectedCollege.id === c.id
                              ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30'
                              : 'text-white/80 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{c.emblem}</span>
                            <span className="truncate">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-[#6b6b80] shrink-0">{c.city}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCustomCollege(true)}
                      className="text-[11px] text-[#00F0FF] hover:underline font-bold"
                    >
                      + My university is not listed
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter Full University Name..."
                      value={customCollegeName}
                      onChange={e => setCustomCollegeName(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCollege(false)}
                      className="text-[11px] text-[#CCFF00] hover:underline font-bold"
                    >
                      ← Pick from verified university list
                    </button>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Kumar"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              {/* Email with Verified Badge Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">Email Address</label>
                  {isVerifiedAcademic && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <GraduationCap className="w-3 h-3" /> Verified Student Domain
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  placeholder="student@university.edu or your personal email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              {/* Campus Residence / Dorm */}
              <div>
                <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                  Hostel / Dorm / Residence
                </label>
                <select
                  value={form.hostel}
                  onChange={e => setForm(prev => ({ ...prev, hostel: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  {(selectedCollege.residences || ['Day Scholar / Off-Campus']).map(r => (
                    <option key={r} value={r} className="bg-[#0A0C10]">{r}</option>
                  ))}
                </select>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Password</label>
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
                  <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Confirm</label>
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
                Create Collegiate Athlete Card (+100 🪙)
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
