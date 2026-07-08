'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Users, Zap, ChevronRight, MapPin, Clock, Star, Shield, Target, ArrowRight } from 'lucide-react';

const SPORTS = [
  { emoji: '🏏', name: 'Cricket', players: '11v11', color: '#10b981' },
  { emoji: '⚽', name: 'Football', players: '7v7 / 11v11', color: '#3b82f6' },
  { emoji: '🏸', name: 'Badminton', players: '1v1 / 2v2', color: '#f59e0b' },
  { emoji: '🏀', name: 'Basketball', players: '5v5', color: '#ef4444' },
  { emoji: '🏓', name: 'Table Tennis', players: '1v1 / 2v2', color: '#8b5cf6' },
  { emoji: '🏐', name: 'Volleyball', players: '6v6', color: '#ec4899' },
  { emoji: '🎾', name: 'Tennis', players: '1v1 / 2v2', color: '#14b8a6' },
  { emoji: '♟️', name: 'Chess', players: '1v1', color: '#64748b' },
];

const STEPS = [
  { step: '01', title: 'Register', desc: 'Sign up with your VIT email. Takes 30 seconds.', icon: Shield },
  { step: '02', title: 'Post or Join a Match', desc: 'Find active matches or create your own at any campus ground.', icon: Target },
  { step: '03', title: 'Play & Earn ELO', desc: 'Your Glicko-2 rating updates after every match. Rise through the ranks.', icon: Star },
];

// VIT Campus photos from Wikimedia Commons (public domain / free licensing)
const VIT_PHOTOS = [
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/VIT_University_Vellore.jpg/1280px-VIT_University_Vellore.jpg',
    alt: 'VIT University Main Campus',
    caption: 'Main Campus',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/VIT_University_Main_Block.jpg/1280px-VIT_University_Main_Block.jpg',
    alt: 'VIT University Main Block',
    caption: 'Tech Tower',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/VIT_Library.jpg/1280px-VIT_Library.jpg',
    alt: 'VIT Library',
    caption: 'Central Library',
  },
];

interface Stats {
  totalUsers: number;
  activeMatches: number;
  totalTournaments: number;
}

interface LivePost {
  id: string;
  sport: string;
  ground: string;
  scheduledAt: string;
  currentPlayers: number;
  maxPlayers: number;
  status: string;
  userName?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeMatches: 0, totalTournaments: 0 });
  const [livePosts, setLivePosts] = useState<LivePost[]>([]);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    
    // Fetch live posts from tRPC JSON endpoint (supports standard fetch format)
    fetch('/api/trpc/post.feed?batch=1&input={"0":{"json":{"limit":4}}}')
      .then(r => r.json())
      .then(data => {
        try {
          const posts = data?.[0]?.result?.data?.json?.posts || [];
          setLivePosts(posts);
        } catch {
          setLivePosts([]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* HERO SECTION */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #7b2ff7, transparent)' }} />
        <div className="absolute top-40 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #00f5d4, transparent)' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-[#a0a0b8] mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {stats.totalUsers > 0 ? `${stats.totalUsers} registered students` : 'Campus Sports Matchmaking'}
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black font-outfit leading-tight mb-6">
              <span className="text-white">Your Court.</span><br />
              <span style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Your Game.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-[#a0a0b8] max-w-2xl mx-auto mb-10 leading-relaxed font-body">
              CourtMate connects VIT students for campus sports — cricket, football, badminton, basketball, and more.
              Post a match lobby, coordinate with your batchmates, and track your ELO ranking.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/feed" className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base transition-all hover:scale-105 hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', boxShadow: '0 0 30px rgba(123,47,247,0.3)' }}>
                <Zap className="w-5 h-5" /> Find a Match
              </Link>
              <Link href="/register" className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base border border-white/15 bg-white/5 hover:bg-white/10 transition-all">
                <Users className="w-5 h-5" /> Join CourtMate
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-10 border-y border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Registered Players', value: stats.totalUsers, icon: Users, color: '#7b2ff7' },
              { label: 'Active Matches', value: stats.activeMatches, icon: Zap, color: '#00f5d4' },
              { label: 'Tournaments', value: stats.totalTournaments, icon: Trophy, color: '#ffd60a' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="text-center">
                <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: s.color }} />
                <div className="text-3xl font-black font-outfit" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-sm text-[#6b6b80] mt-1 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIT CAMPUS GALLERY */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-black font-outfit text-white">Your Campus. Your Arena.</h2>
            <p className="text-[#6b6b80] mt-2 font-body">Every court, ground, and hall at VIT Vellore is your playground.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VIT_PHOTOS.map((photo, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative group overflow-hidden rounded-2xl border border-white/8" style={{ height: '240px' }}>
                {!imgError[i] ? (
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgError(prev => ({ ...prev, [i]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e, #25253d)' }}>
                    <span className="text-5xl">{['🏛️', '🏆', '🏢'][i]}</span>
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                <div className="absolute bottom-4 left-4">
                  <span className="text-white font-black text-sm font-outfit uppercase tracking-wider">{photo.caption}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE MATCHES PREVIEW */}
      {livePosts.length > 0 && (
        <section className="py-16 px-4" style={{ background: 'rgba(123,47,247,0.03)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black font-outfit text-white">Active Match Lobbies</h2>
                <p className="text-[#6b6b80] mt-1">Join an upcoming game right now</p>
              </div>
              <Link href="/feed" className="flex items-center gap-1 text-sm text-[#00f5d4] hover:underline font-semibold transition-all">
                View All Matches <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {livePosts.slice(0, 4).map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <Link href="/feed" className="block p-5 rounded-2xl border border-white/8 hover:border-white/20 transition-all hover:bg-white/3 group" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-white text-base font-outfit">{post.sport}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                            post.status === 'open' ? 'bg-emerald-500/15 text-emerald-400' :
                            post.status === 'full' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                          }`}>{post.status}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-[#a0a0b8] mb-1">
                          <MapPin className="w-3.5 h-3.5 text-[#00f5d4]" /> {post.ground}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-[#6b6b80]">
                          <Clock className="w-3.5 h-3.5" /> {new Date(post.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-[#00f5d4]">{post.currentPlayers}/{post.maxPlayers}</div>
                        <div className="text-xs text-[#6b6b80]">slots filled</div>
                        <ArrowRight className="w-4 h-4 text-[#6b6b80] mt-3 ml-auto group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SPORTS GRID */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-black font-outfit text-white">Supported Sports</h2>
            <p className="text-[#6b6b80] mt-2">Find matches, host brackets and log scores across these physical sports.</p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SPORTS.map((sport) => (
              <motion.div key={sport.name} variants={fadeUp}>
                <Link href="/feed" className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/8 hover:border-white/20 transition-all hover:scale-105 group" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sport.emoji}</span>
                  <div className="text-center">
                    <div className="font-bold text-white text-sm font-outfit">{sport.name}</div>
                    <div className="text-xs text-[#6b6b80] mt-0.5 font-medium">{sport.players}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 border-t border-white/5" style={{ background: 'rgba(0,245,212,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black font-outfit text-white">How It Works</h2>
            <p className="text-[#6b6b80] mt-2">Get ready to play on campus in three simple steps</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative p-6 rounded-2xl border border-white/8 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-xs font-bold text-[#7b2ff7] mb-3 tracking-widest uppercase">{step.step}</div>
                <step.icon className="w-8 h-8 text-[#00f5d4] mx-auto mb-3" />
                <h3 className="font-bold text-white text-lg mb-2 font-outfit">{step.title}</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed font-body">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-10 rounded-3xl border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(123,47,247,0.15), rgba(0,245,212,0.08))' }}>
            <h2 className="text-4xl font-black font-outfit text-white mb-4">Step Onto the Court.</h2>
            <p className="text-[#a0a0b8] mb-8 text-lg font-body">Create your CourtMate profile, pick your favorite sports, and team up with fellow students.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                Create Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-[#a0a0b8] text-base border border-white/15 hover:text-white hover:border-white/30 transition-all">
                Sign In to Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
