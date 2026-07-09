'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Phone, MessageCircle, Send, Camera, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { currentUser } = useUIStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', bio: '', phone: '', whatsapp: '', telegram: '', instagram: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) { router.push('/login'); return; }
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setForm({
            name: d.user.name || '',
            bio: d.user.bio || '',
            phone: d.user.phone || '',
            whatsapp: d.user.whatsapp || '',
            telegram: d.user.telegram || '',
            instagram: d.user.instagram || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [currentUser, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(data.error || 'Failed to save');
    } catch { setError('Network error'); }
    setSaving(false);
  };

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-20 pb-24 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 mt-4">
          <Link href="/" className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6b6b80] hover:text-white hover:bg-white/8 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white font-outfit">Profile Settings</h1>
            <p className="text-xs text-[#6b6b80] font-body">Update your contact info so teammates can reach you</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#7b2ff7] animate-spin" /></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">

            {/* Avatar preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {currentUser.avatar?.startsWith('http') ? (
                <img src={currentUser.avatar} alt="" className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-white text-xl" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-white font-outfit">{currentUser.name}</p>
                <p className="text-xs text-[#6b6b80] font-body">{currentUser.email}</p>
                <p className="text-xs text-[#a0a0b8] mt-1">Avatar is generated automatically from your email</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-3 border-b border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider flex items-center gap-2"><User className="w-3 h-3" />Basic Info</p>
              </div>
              <div className="p-4 space-y-4" style={{ background: 'rgba(17,17,24,0.9)' }}>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b8] mb-2">Display Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name" className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-[#7b2ff7] transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b8] mb-2">Bio <span className="text-[#6b6b80] font-normal">(shown to teammates)</span></label>
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder='e.g. "Cricket enthusiast, MH-A Block, available evenings"'
                    rows={2} className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-[#7b2ff7] transition-colors resize-none placeholder:text-[#4b4b5a]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-3 border-b border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider flex items-center gap-2"><Phone className="w-3 h-3" />Contact Info</p>
                <p className="text-[11px] text-[#6b6b80] mt-0.5 font-body">Shown to teammates when they view your post. Only add what you&apos;re comfortable sharing.</p>
              </div>
              <div className="p-4 space-y-3" style={{ background: 'rgba(17,17,24,0.9)' }}>

                {/* WhatsApp */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] mb-2">
                    <span className="text-base">📲</span> WhatsApp Number
                  </label>
                  <input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="+91 9876543210" type="tel"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none transition-colors placeholder:text-[#4b4b5a]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#3b82f6] mb-2">
                    <span className="text-base">📞</span> Phone Number
                  </label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 9876543210" type="tel"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none transition-colors placeholder:text-[#4b4b5a]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Telegram */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0088cc] mb-2">
                    <span className="text-base">✈️</span> Telegram Username
                  </label>
                  <input value={form.telegram} onChange={e => setForm(f => ({ ...f, telegram: e.target.value }))}
                    placeholder="@yourusername"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none transition-colors placeholder:text-[#4b4b5a]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Instagram */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: '#e1306c' }}>
                    <span className="text-base">📷</span> Instagram Username
                  </label>
                  <input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                    placeholder="@yourusername"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none transition-colors placeholder:text-[#4b4b5a]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(0,245,212,0.06)', border: '1px solid rgba(0,245,212,0.15)' }}>
              <p className="text-xs text-[#00f5d4] font-body">💡 <strong>Tip:</strong> Your contact info will appear in the Players modal when someone opens a match you&apos;re part of. This helps teammates coordinate meetups!</p>
            </div>

            {/* Error */}
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">{error}</div>}

            {/* Save Button */}
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-black text-white text-sm transition-all hover:scale-[1.01] disabled:opacity-60"
              style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                : saved ? <>✅ Saved!</>
                : <><Save className="w-4 h-4" />Save Profile</>}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
