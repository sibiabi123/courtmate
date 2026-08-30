'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, HelpCircle, ChevronDown, ChevronUp,
  Mail, Clock, Bug, Shield, CreditCard, Users, Zap
} from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General Question', icon: HelpCircle },
  { value: 'bug', label: 'Report a Bug', icon: Bug },
  { value: 'account', label: 'Account Issue', icon: Shield },
  { value: 'billing', label: 'Billing & Coins', icon: CreditCard },
  { value: 'tournament', label: 'Tournament Issue', icon: Users },
  { value: 'feature', label: 'Feature Request', icon: Zap },
];

const QUICK_FAQ = [
  {
    q: 'How do I change my profile information?',
    a: 'Go to Settings from the top navigation bar. You can update your name, avatar, bio, preferred games, and more.',
  },
  {
    q: 'How do I earn coins?',
    a: 'Coins are earned through daily login streaks, winning challenges, completing your profile, sharing matches, and placing in tournaments.',
  },
  {
    q: 'How do challenges work?',
    a: 'You can issue a 1v1 challenge to any player from the Rankings page or their profile. Both players stake coins. The winner takes all.',
  },
  {
    q: 'How is ELO rating calculated?',
    a: 'Your ELO starts at 1200. Wins against higher-rated players give more points. The exact formula is based on the standard Elo rating system used in chess.',
  },
  {
    q: 'Can I report another player?',
    a: 'Yes. Visit their profile, click the menu icon, and select "Report Player." Our moderation team reviews all reports within 24 hours.',
  },
];

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', category: 'general', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #7b2ff7, transparent 60%)' }} />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-[#7b2ff7]/20"
              style={{ background: 'rgba(123, 47, 247, 0.1)' }}>
              <MessageSquare className="w-7 h-7 text-[#7b2ff7]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-white mb-3">
              Support & Contact
            </h1>
            <p className="text-[#a0a0b8] text-lg max-w-xl mx-auto">
              Have a question, found a bug, or need help? We typically respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Contact Form */}
          <div className="lg:col-span-3">
            {!sent ? (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5 p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
              >
                <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-white mb-1">
                  Send Us a Message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b8] mb-2 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b8] mb-2 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b8] mb-2 uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.value })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                          form.category === cat.value
                            ? 'border-[#7b2ff7]/40 bg-[#7b2ff7]/10 text-white'
                            : 'border-white/5 bg-white/[0.02] text-[#6b6b80] hover:border-white/10 hover:text-[#a0a0b8]'
                        }`}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b8] mb-2 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief summary of your issue"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b8] mb-2 uppercase tracking-wider">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all resize-none"
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
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 text-center"
              >
                <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-emerald-500/20"
                  style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <Mail className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white mb-2">
                  Message Sent!
                </h2>
                <p className="text-[#a0a0b8] mb-4">
                  Thank you for reaching out. We'll respond to your email within 24 hours.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a0a0b8]">
                  <Clock className="w-3.5 h-3.5" />
                  Average response time: 6 hours
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Quick FAQ */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-white mb-5 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00f5d4]" />
                Quick Answers
              </h3>
              <div className="space-y-2">
                {QUICK_FAQ.map((item, i) => (
                  <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left text-sm text-white hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="pr-4">{item.q}</span>
                      {openFaq === i ? <ChevronUp className="w-4 h-4 text-[#6b6b80] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6b6b80] shrink-0" />}
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-4 pb-4 text-sm text-[#a0a0b8] leading-relaxed border-t border-white/5"
                      >
                        <div className="pt-3">{item.a}</div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 text-center">
                <Link href="/help" className="text-sm text-[#00f5d4] hover:underline font-medium">
                  View Full Help Center →
                </Link>
              </div>
            </div>

            {/* Contact info card */}
            <div className="mt-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
              <h4 className="text-sm font-semibold text-[#a0a0b8] uppercase tracking-wider">Other Ways to Reach Us</h4>
              <div className="flex items-center gap-3 text-sm text-[#6b6b80]">
                <Mail className="w-4 h-4 text-[#7b2ff7]" />
                support@courtmate.com
              </div>
              <div className="flex items-center gap-3 text-sm text-[#6b6b80]">
                <Clock className="w-4 h-4 text-[#7b2ff7]" />
                Mon-Fri, 9 AM — 6 PM IST
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
