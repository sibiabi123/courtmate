'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy, Users, Zap, ChevronRight, MapPin, Star, Shield, Target,
  ArrowRight, Flame, Sparkles, Activity, Swords, Play, Crown
} from 'lucide-react';
import { AthleteCard } from '@/components/ui/AthleteCard';
import { SplitDuelModal } from '@/components/ui/SplitDuelModal';
import { playClick, playDuel, playSuccess } from '@/lib/sound';

const SPORTS = [
  { emoji: '🏸', name: 'Badminton', players: '1v1 / 2v2', color: '#CCFF00', tag: 'Fast Reflex' },
  { emoji: '⚽', name: 'Football', players: '7v7 / 11v11', color: '#00F0FF', tag: 'Team Turf' },
  { emoji: '🏏', name: 'Cricket', players: '11v11', color: '#FFD700', tag: 'High Intensity' },
  { emoji: '🏀', name: 'Basketball', players: '5v5 / 3v3', color: '#FF2A55', tag: 'Full Court' },
  { emoji: '🏓', name: 'Table Tennis', players: '1v1 / 2v2', color: '#CCFF00', tag: 'Rapid Spin' },
  { emoji: '🎾', name: 'Tennis', players: '1v1 / 2v2', color: '#00F0FF', tag: 'Precision' },
  { emoji: '🏐', name: 'Volleyball', players: '6v6', color: '#FFD700', tag: 'Power Spike' },
  { emoji: '♟️', name: 'Chess', players: '1v1', color: '#a0a0b8', tag: 'Grandmaster' },
];

const VENUE_RADAR = [
  { name: 'Main Sports Arena', sport: 'Football / Cricket', status: 'Active • 18/22 Players', state: 'live', color: '#CCFF00' },
  { name: 'Indoor Badminton Complex', sport: 'Badminton', status: '3 Courts Open', state: 'open', color: '#00F0FF' },
  { name: 'Basketball Center Court', sport: 'Basketball 5v5', status: 'Ranked Duel in Progress', state: 'live', color: '#FFD700' },
  { name: 'Center Tennis Court', sport: 'Tennis Singles', status: 'Ready for Challenge', state: 'open', color: '#FF2A55' },
];

const FEATURED_CHAMPIONS = [
  { id: 1, name: 'Arjun Sharma', sport: 'Badminton', rating: 2140, tier: 'Champion', winRate: 78, streak: 7, wins: 42, district: 'North Campus' },
  { id: 2, name: 'Priya Sundaram', sport: 'Badminton', rating: 1980, tier: 'Diamond', winRate: 74, streak: 5, wins: 36, district: 'South Arena' },
  { id: 3, name: 'Vikram Raghavan', sport: 'Football', rating: 1890, tier: 'Diamond', winRate: 69, streak: 4, wins: 29, district: 'East Grounds' },
];

const STEPS = [
  { step: '01', title: 'Create Athlete ID', desc: 'Sign up in seconds. Claim 100 welcome coins to enter the ranking circuit.', icon: Shield },
  { step: '02', title: 'Join or Issue Duels', desc: 'Match with players at your skill tier. Stake coins on 1v1 duels or open lobbies.', icon: Target },
  { step: '03', title: 'Climb Pro Tiers', desc: 'Rise from Bronze to Grand Champion with verified Elo rating calculations.', icon: Star },
];

interface Stats {
  totalUsers: number;
  activeMatches: number;
  totalTournaments: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 342, activeMatches: 14, totalTournaments: 6 });
  const [selectedSport, setSelectedSport] = useState('Badminton');
  const [selectedMode, setSelectedMode] = useState<'ranked' | 'casual'>('ranked');
  const [isSearching, setIsSearching] = useState(false);
  const [champions, setChampions] = useState<any[]>(FEATURED_CHAMPIONS);

  // Split Duel Modal State
  const [duelModalOpen, setDuelModalOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(FEATURED_CHAMPIONS[0]);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => {
        if (d && (d.totalUsers > 0 || d.activeMatches > 0)) {
          setStats(d);
        }
      })
      .catch(() => {});

    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.users) && data.users.length >= 3) {
          const mapped = data.users.slice(0, 3).map((u: any, idx: number) => {
            const rating = u.glickoRating?.rating || u.glicko_rating || 1500;
            const tier = rating >= 2000 ? 'Champion' : rating >= 1800 ? 'Diamond' : rating >= 1600 ? 'Platinum' : 'Gold';
            return {
              id: u.id || idx + 1,
              name: u.name,
              sport: ['Badminton', 'Football', 'Cricket'][idx % 3],
              rating,
              tier,
              winRate: 70 + (idx * 4),
              streak: 7 - idx,
              wins: 30 + (idx * 5),
              district: u.hostel || 'Main Campus',
            };
          });
          setChampions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickMatch = () => {
    playDuel();
    setIsSearching(true);
    setTimeout(() => {
      window.location.href = `/feed?sport=${encodeURIComponent(selectedSport)}`;
    }, 600);
  };

  const openDuel = (opponentAthlete: any) => {
    setSelectedOpponent(opponentAthlete);
    setDuelModalOpen(true);
  };

  const challengerAthlete = {
    id: 999,
    name: 'You (Athlete)',
    rating: 1540,
    tier: 'Platinum',
    sport: selectedSport,
    winRate: 64,
    streak: 3,
  };

  return (
    <div className="min-h-screen bg-[#040507] text-white">
      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Acid Volt and Cyan ambient glow backdrops */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-[150px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #CCFF00, transparent)' }} />
        <div className="absolute top-32 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[140px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00F0FF, transparent)' }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div initial="hidden" animate="show" variants={stagger} className="lg:col-span-7 text-center lg:text-left">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/10 px-4 py-1.5 text-xs font-bold text-[#CCFF00] mb-6 backdrop-blur-md shadow-lg shadow-[#CCFF00]/10 stat-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>KINETIC SPORTS MATCHMAKING & LEAGUES</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-black font-[family-name:var(--font-outfit)] leading-[1.05] mb-6 tracking-tight">
                <span className="text-white">DOMINATE</span><br />
                <span style={{ background: 'linear-gradient(90deg, #CCFF00, #00F0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  EVERY COURT.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-[#a0a0b8] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Connect with athletes in your area, challenge rivals in high-stakes 1v1 duels, organize tournament brackets, and climb global verified Elo tiers.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/feed"
                  onClick={() => playClick()}
                  className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-black text-[#040507] text-base transition-all hover:scale-105 shadow-xl btn-volt"
                >
                  <Zap className="w-5 h-5" /> Explore Match Radar
                </Link>
                <Link
                  href="/challenges"
                  onClick={() => playClick()}
                  className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-bold text-white text-base border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#CCFF00]/40 transition-all backdrop-blur-sm tactile-press"
                >
                  <Swords className="w-5 h-5 text-[#CCFF00]" /> Duel Arena
                </Link>
              </motion.div>

              {/* Quick stats pills */}
              <motion.div variants={fadeUp} className="flex items-center justify-center lg:justify-start gap-6 mt-10 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span className="text-sm font-bold text-white stat-mono">{stats.totalUsers}+ ATHLETES</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#FFD700]" />
                  <span className="text-sm font-bold text-white stat-mono">6 PRO TIERS</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right 1-Click Tactical Matchmaker Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-5"
            >
              <div className="rounded-3xl border border-white/15 bg-[#0A0C10]/95 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(204,255,0,0.08)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-[#CCFF00]">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-outfit)] font-black text-white text-base">Tactical Matchfinder</h3>
                      <p className="text-[11px] text-[#6b6b80]">Instant Court & Opponent Matching</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 stat-mono">
                    ONLINE
                  </span>
                </div>

                {/* Sport Selector Chips */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Select Sport</label>
                  <div className="grid grid-cols-4 gap-2">
                    {SPORTS.map(s => (
                      <button
                        key={s.name}
                        onClick={() => {
                          playClick();
                          setSelectedSport(s.name);
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all tactile-press ${
                          selectedSport === s.name
                            ? 'bg-[#CCFF00] text-[#040507] shadow-lg shadow-[#CCFF00]/25 border border-[#CCFF00]'
                            : 'bg-white/5 text-[#a0a0b8] hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        <span className="text-base mb-0.5">{s.emoji}</span>
                        <span className="truncate max-w-[55px] text-[10px]">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Match Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        playClick();
                        setSelectedMode('ranked');
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all tactile-press ${
                        selectedMode === 'ranked'
                          ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40'
                          : 'bg-white/5 text-[#6b6b80] border border-white/5'
                      }`}
                    >
                      <Trophy className="h-3.5 w-3.5" /> Ranked (Stake RP)
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        setSelectedMode('casual');
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all tactile-press ${
                        selectedMode === 'casual'
                          ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40'
                          : 'bg-white/5 text-[#6b6b80] border border-white/5'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5" /> Casual Pickup
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  onClick={handleQuickMatch}
                  disabled={isSearching}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-[#040507] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 btn-volt"
                >
                  {isSearching ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-[#040507] border-t-transparent animate-spin" />
                      Scanning Active Courts...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Find {selectedSport} Match Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS TELEMETRY BAR ── */}
      <section className="py-10 border-y border-white/5 bg-[#0A0C10]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Registered Athletes', value: stats.totalUsers || 342, icon: Users, color: '#CCFF00' },
              { label: 'Active Match Lobbies', value: stats.activeMatches || 14, icon: Zap, color: '#00F0FF' },
              { label: 'Championship Cups', value: stats.totalTournaments || 8, icon: Trophy, color: '#FFD700' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: s.color }} />
                <div className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] stat-mono" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-[#6b6b80] mt-1 font-bold uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3D HOLOGRAPHIC CHAMPIONS SPOTLIGHT ── */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-2 stat-mono">
              <Crown className="h-4 w-4" /> HALL OF FAME
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-white">Daily Pro Champions</h2>
            <p className="text-sm text-[#a0a0b8] mt-2">Tilt cursor over athlete cards to inspect telemetry ratings & skill graphs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {champions.map((champ, i) => (
              <AthleteCard
                key={champ.id || i}
                athlete={champ}
                rank={i + 1}
                onChallenge={() => openDuel(champ)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ARENA RADAR & COURT STATUS ── */}
      <section className="py-16 px-4 bg-[#0A0C10]/60 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#CCFF00] uppercase tracking-wider mb-2 stat-mono">
                <Activity className="h-3.5 w-3.5" /> LIVE TELEMETRY
              </div>
              <h2 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white">Court Radar & Venue Status</h2>
            </div>
            <Link
              href="/feed"
              onClick={() => playClick()}
              className="flex items-center gap-1 text-sm font-bold text-[#CCFF00] hover:underline"
            >
              View All 10+ Venues <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VENUE_RADAR.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-white/10 bg-[#12151C] hover:border-[#CCFF00]/40 transition-all group kinetic-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#a0a0b8]">
                    {v.sport}
                  </span>
                  <span className={`h-2.5 w-2.5 rounded-full ${v.state === 'live' ? 'bg-[#CCFF00] animate-ping' : 'bg-[#00F0FF]'}`} />
                </div>
                <h3 className="font-[family-name:var(--font-outfit)] font-black text-white text-base mb-1 group-hover:text-[#CCFF00] transition-colors">{v.name}</h3>
                <p className="text-xs text-[#a0a0b8] flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-[#CCFF00]" /> {v.status}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPORTS DISCIPLINES GRID ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white">Supported Athletic Disciplines</h2>
            <p className="text-[#6b6b80] mt-2">Find pickup matches, host cups, and log results across sports.</p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SPORTS.map((sport, i) => (
              <motion.div
                key={sport.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/feed?sport=${encodeURIComponent(sport.name)}`}
                  onClick={() => playClick()}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/8 hover:border-[#CCFF00]/30 bg-white/[0.02] hover:bg-[#CCFF00]/5 transition-all hover:scale-105 group tactile-press"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sport.emoji}</span>
                  <div className="text-center">
                    <div className="font-bold text-white text-sm font-[family-name:var(--font-outfit)]">{sport.name}</div>
                    <div className="text-xs text-[#6b6b80] mt-0.5">{sport.players}</div>
                    <span className="inline-block mt-2 text-[10px] font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-full stat-mono">
                      {sport.tag}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4 border-t border-white/5 bg-[#0A0C10]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white">How CourtMate Works</h2>
            <p className="text-[#6b6b80] mt-2">Get ready to dominate the court in three simple steps</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative p-6 rounded-2xl border border-white/8 text-center bg-white/[0.02]">
                <div className="text-xs font-black text-[#CCFF00] mb-3 tracking-widest uppercase stat-mono">{step.step}</div>
                <step.icon className="w-8 h-8 text-[#00F0FF] mx-auto mb-3" />
                <h3 className="font-bold text-white text-lg mb-2 font-[family-name:var(--font-outfit)]">{step.title}</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-10 rounded-3xl border border-white/10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(204,255,0,0.1), rgba(0,240,255,0.08))' }}>
            <h2 className="text-4xl sm:text-5xl font-black font-[family-name:var(--font-outfit)] text-white mb-4">Step Onto the Court Today.</h2>
            <p className="text-[#a0a0b8] mb-8 text-lg max-w-xl mx-auto">Create your athlete profile, challenge players, and build your legacy on the leaderboards.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                onClick={() => playClick()}
                className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-black text-[#040507] text-base transition-all hover:scale-105 shadow-xl btn-volt"
              >
                Create Athlete Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                onClick={() => playClick()}
                className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-bold text-[#a0a0b8] text-base border border-white/15 hover:text-white hover:border-[#CCFF00]/40 transition-all backdrop-blur-sm tactile-press"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Split Duel Modal */}
      {selectedOpponent && (
        <SplitDuelModal
          isOpen={duelModalOpen}
          challenger={challengerAthlete}
          opponent={selectedOpponent}
          onClose={() => setDuelModalOpen(false)}
          onConfirm={(stake, sport, venue) => {
            playSuccess();
          }}
        />
      )}
    </div>
  );
}
