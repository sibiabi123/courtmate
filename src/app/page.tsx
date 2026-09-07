'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy, Users, Zap, ChevronRight, MapPin, Star, Shield, Target,
  ArrowRight, Flame, Activity, Swords, Crown
} from 'lucide-react';
import { AthleteCard } from '@/components/ui/AthleteCard';
import { SplitDuelModal } from '@/components/ui/SplitDuelModal';
import { playClick, playDuel, playSuccess } from '@/lib/sound';

const SPORTS = [
  { emoji: '🏸', name: 'Badminton', players: '1v1 / 2v2' },
  { emoji: '⚽', name: 'Football',  players: '7v7 / 11v11' },
  { emoji: '🏏', name: 'Cricket',   players: '11v11' },
  { emoji: '🏀', name: 'Basketball',players: '5v5 / 3v3' },
  { emoji: '🏓', name: 'Table Tennis',players: '1v1 / 2v2' },
  { emoji: '🎾', name: 'Tennis',    players: '1v1 / 2v2' },
  { emoji: '🏐', name: 'Volleyball',players: '6v6' },
  { emoji: '♟️', name: 'Chess',     players: '1v1' },
];

const VENUE_RADAR = [
  { name: 'Main Sports Arena',         sport: 'Football / Cricket', status: '18 / 22 players',          state: 'live' },
  { name: 'Indoor Badminton Complex',  sport: 'Badminton',           status: '3 courts open',            state: 'open' },
  { name: 'Basketball Center Court',   sport: 'Basketball 5v5',      status: 'Ranked match in progress', state: 'live' },
  { name: 'Center Tennis Court',       sport: 'Tennis Singles',      status: 'Ready for challenge',      state: 'open' },
];

const FEATURED_CHAMPIONS = [
  { id: 1, name: 'Arjun Sharma',    sport: 'Badminton', rating: 2140, tier: 'Champion', winRate: 78, streak: 7, wins: 42, district: 'North Campus' },
  { id: 2, name: 'Priya Sundaram',  sport: 'Badminton', rating: 1980, tier: 'Diamond',  winRate: 74, streak: 5, wins: 36, district: 'South Arena' },
  { id: 3, name: 'Vikram Raghavan', sport: 'Football',  rating: 1890, tier: 'Diamond',  winRate: 69, streak: 4, wins: 29, district: 'East Grounds' },
];

const STEPS = [
  { step: '01', title: 'Create Athlete Profile', desc: 'Sign up in seconds with your campus ID.', icon: Shield },
  { step: '02', title: 'Find or Host Matches',   desc: 'Browse active lobbies or post your own pickup game.', icon: Target },
  { step: '03', title: 'Play & Build Reputation',desc: 'Track wins, build your ranking, earn community trust.', icon: Star },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

export default function HomePage() {
  const [stats, setStats] = useState({ totalUsers: 342, activeMatches: 14, totalTournaments: 6 });
  const [champions, setChampions] = useState<any[]>(FEATURED_CHAMPIONS);
  const [duelModalOpen, setDuelModalOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(FEATURED_CHAMPIONS[0]);
  const [openLobbies, setOpenLobbies] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => { if (d && d.totalUsers > 0) setStats(d); })
      .catch(() => {});

    fetch('/api/posts?limit=3&status=open')
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.posts)) setOpenLobbies(d.posts.slice(0, 3)); })
      .catch(() => {});

    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.users) && d.users.length >= 3) {
          const mapped = d.users.slice(0, 3).map((u: any, idx: number) => {
            const rating = u.glickoRating?.rating || u.glicko_rating || 1500;
            const tier = rating >= 2000 ? 'Champion' : rating >= 1800 ? 'Diamond' : rating >= 1600 ? 'Platinum' : 'Gold';
            return { id: u.id || idx + 1, name: u.name, sport: ['Badminton','Football','Cricket'][idx % 3], rating, tier, winRate: 70 + idx * 4, streak: 7 - idx, wins: 30 + idx * 5, district: u.hostel || 'Main Campus' };
          });
          setChampions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const challengerAthlete = { id: 999, name: 'You (Athlete)', rating: 1540, tier: 'Platinum', sport: 'Badminton', winRate: 64, streak: 3 };

  return (
    <div className="min-h-screen" style={{ background: 'var(--void)', color: 'var(--text-primary)' }}>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        {/* Single minimal ambient glow — subtle, centered */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(200,255,0,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-6xl mx-auto">
          <motion.div initial="hidden" animate="show" variants={stagger} className="text-center max-w-3xl mx-auto">

            {/* Eyebrow label */}
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[11px] font-semibold label-cap"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--volt)' }} />
              Campus Sports Matchmaking & Tournaments
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl font-black font-[family-name:var(--font-display)] leading-[1.05] tracking-tight mb-5">
              Find Your<br />
              <span style={{ color: 'var(--volt)' }}>Court.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp}
              className="text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}>
              Connect with campus athletes, join pickup matches, and compete in tournaments — badminton, cricket, football, and more.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/feed" onClick={() => playClick()}
                className="btn-primary px-7 py-3.5 text-sm font-bold">
                <Zap className="w-4 h-4" /> Browse Open Matches
              </Link>
              <Link href="/leaderboard" onClick={() => playClick()}
                className="btn-secondary px-7 py-3.5 text-sm">
                View Rankings <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Live Match Preview Strip */}
          {openLobbies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-14 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="label-cap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--volt)' }} />
                  Live Open Lobbies
                </span>
                <Link href="/feed" onClick={() => playClick()}
                  className="text-[11px] font-medium flex items-center gap-1 hover:underline"
                  style={{ color: 'var(--text-muted)' }}>
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {openLobbies.map((post: any) => (
                  <div key={post.id}
                    className="flex items-center justify-between px-4 py-3 rounded-[var(--r-lg)] transition-colors"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{post.game?.icon || '🏃'}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {post.game?.name || post.title || 'Open Match'}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {post.location || 'Campus ground'} · {post.slotsFilled || 0}/{post.slotsTotal || 0} players
                        </p>
                      </div>
                    </div>
                    <Link href="/feed" onClick={() => playClick()}
                      className="btn-primary px-3 py-1.5 text-[11px] font-bold">
                      Join
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-12" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-0 divide-x" style={{ '--tw-divide-opacity': 1 } as any}>
            {[
              { label: 'Athletes',      value: stats.totalUsers,       suffix: '+', color: 'var(--volt)' },
              { label: 'Active Matches',value: stats.activeMatches,    suffix: '',  color: 'var(--signal)' },
              { label: 'Tournaments',   value: stats.totalTournaments, suffix: '',  color: 'var(--gold)' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-6"
                style={{ borderColor: 'var(--border)' }}>
                <div className="text-3xl sm:text-4xl font-black stat-mono" style={{ color: s.color }}>
                  {s.value}{s.suffix}
                </div>
                <div className="text-xs font-medium mt-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPUS LEADERS ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="label-cap flex items-center justify-center gap-1.5 mb-3">
              <Crown className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
              Campus Leaders
            </div>
            <h2 className="text-3xl font-black font-[family-name:var(--font-display)]">
              Top-Ranked Athletes
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Tilt your cursor over a card to inspect their skill stats.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {champions.map((champ, i) => (
              <AthleteCard key={champ.id || i} athlete={champ} rank={i + 1} onChallenge={() => { setSelectedOpponent(champ); setDuelModalOpen(true); }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VENUE RADAR ── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="label-cap flex items-center gap-1.5 mb-2">
                <Activity className="h-3.5 w-3.5" style={{ color: 'var(--volt)' }} />
                Live Telemetry
              </div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
                Court Radar & Venue Status
              </h2>
            </div>
            <Link href="/feed" onClick={() => playClick()}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: 'var(--volt)' }}>
              View all venues <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {VENUE_RADAR.map((v, i) => (
              <motion.div key={v.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-4 rounded-[var(--r-lg)] relative overflow-hidden"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {/* Sport color accent stripe */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
                  style={{ background: v.state === 'live' ? 'var(--volt)' : 'var(--signal)', opacity: v.state === 'live' ? 1 : 0.6 }} />
                <div className="pl-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>
                      {v.sport}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${v.state === 'live' ? 'animate-ping' : ''}`}
                      style={{ background: v.state === 'live' ? 'var(--volt)' : 'var(--signal)' }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {v.name}
                  </h3>
                  <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <MapPin className="h-3 w-3 shrink-0" /> {v.status}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPORTS GRID ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Supported Sports
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Find pickup matches and organize tournaments across disciplines.
            </p>
          </div>
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
            {SPORTS.map((sport, i) => (
              <Link key={sport.name}
                href={`/feed?sport=${encodeURIComponent(sport.name)}`}
                onClick={() => playClick()}
                className="flex flex-col items-center gap-2.5 p-4 rounded-[var(--r-lg)] shrink-0 w-28 sm:w-auto transition-all group hover:border-[--border-hi]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="text-3xl">{sport.emoji}</span>
                <div className="text-center">
                  <div className="font-semibold text-sm">{sport.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sport.players}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">How It Works</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Get on the court in three steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative p-6 rounded-[var(--r-lg)]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {/* Large background step number */}
                <div className="absolute top-4 right-5 text-7xl font-black leading-none select-none pointer-events-none"
                  style={{ color: 'var(--border)', fontFamily: 'var(--font-display)', opacity: 0.6 }}>
                  {step.step}
                </div>
                <step.icon className="w-6 h-6 mb-4" style={{ color: 'var(--volt)' }} />
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-[var(--r-2xl)] text-center relative overflow-hidden"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {/* Subtle volt tint top */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--volt), transparent)', opacity: 0.5 }} />

            <h2 className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-display)] mb-4">
              Step Onto the Court.
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Create your athlete profile, challenge players, and build your legacy on the leaderboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" onClick={() => playClick()}
                className="btn-primary px-7 py-3.5 text-sm font-bold">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" onClick={() => playClick()}
                className="btn-ghost px-7 py-3.5 text-sm">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Duel modal */}
      {selectedOpponent && (
        <SplitDuelModal
          isOpen={duelModalOpen}
          challenger={challengerAthlete}
          opponent={selectedOpponent}
          onClose={() => setDuelModalOpen(false)}
          onConfirm={() => { playSuccess(); }}
        />
      )}
    </div>
  );
}
