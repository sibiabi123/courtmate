'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, Zap, ChevronRight, MapPin, Clock, Star, Shield, Target,
  ArrowRight, Flame, Sparkles, Activity, Swords, Compass, CheckCircle2,
  TrendingUp, Award, Play
} from 'lucide-react';
import { sound } from '@/lib/sound';

const SPORTS = [
  { emoji: '🏏', name: 'Cricket', players: '11v11', color: '#10b981', tag: 'High Intensity' },
  { emoji: '⚽', name: 'Football', players: '7v7 / 11v11', color: '#3b82f6', tag: 'Fast Paced' },
  { emoji: '🏸', name: 'Badminton', players: '1v1 / 2v2', color: '#f59e0b', tag: 'Reflex & Agility' },
  { emoji: '🏀', name: 'Basketball', players: '5v5 / 3v3', color: '#ef4444', tag: 'Full Court' },
  { emoji: '🏓', name: 'Table Tennis', players: '1v1 / 2v2', color: '#8b5cf6', tag: 'Rapid Spin' },
  { emoji: '🏐', name: 'Volleyball', players: '6v6', color: '#ec4899', tag: 'Team Power' },
  { emoji: '🎾', name: 'Tennis', players: '1v1 / 2v2', color: '#14b8a6', tag: 'Precision' },
  { emoji: '♟️', name: 'Chess', players: '1v1', color: '#64748b', tag: 'Grandmaster ELO' },
];

const VENUE_RADAR = [
  { name: 'Main Sports Arena', sport: 'Football / Cricket', status: 'Active • 18/22 Players', state: 'live', color: '#10b981' },
  { name: 'Indoor Badminton Complex', sport: 'Badminton', status: '3 Courts Open', state: 'open', color: '#00f5d4' },
  { name: 'Basketball Center Court', sport: 'Basketball 5v5', status: 'Ranked Duel in Progress', state: 'live', color: '#f59e0b' },
  { name: 'Center Tennis Court', sport: 'Tennis Singles', status: 'Ready for Challenge', state: 'open', color: '#7b2ff7' },
];

const FEATURED_CHAMPIONS = [
  { name: 'Arjun K.', sport: 'Cricket', rating: 2140, tier: 'Champion', winRate: '78%', streak: 7, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=arjun' },
  { name: 'Priya S.', sport: 'Badminton', rating: 1980, tier: 'Diamond', winRate: '74%', streak: 5, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=priya' },
  { name: 'Vikram R.', sport: 'Football', rating: 1890, tier: 'Diamond', winRate: '69%', streak: 4, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=vikram' },
];

const STEPS = [
  { step: '01', title: 'Create Athlete Profile', desc: 'Sign up in seconds with any email. Claim your 100 welcome coins.', icon: Shield },
  { step: '02', title: 'Join or Issue Challenges', desc: 'Find active matches or challenge ranked players for ELO stakes.', icon: Target },
  { step: '03', title: 'Climb Global Tiers', desc: 'Rise from Bronze to Champion with automated Glicko-2 calculations.', icon: Star },
];

const ARENA_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1280&q=80',
    alt: 'Championship Stadium',
    caption: 'Championship Stadium',
  },
  {
    src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1280&q=80',
    alt: 'Indoor Sports Arena',
    caption: 'Indoor Sports Arena',
  },
  {
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1280&q=80',
    alt: 'Center Court Complex',
    caption: 'Center Court Complex',
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
  const [stats, setStats] = useState<Stats>({ totalUsers: 342, activeMatches: 14, totalTournaments: 6 });
  const [livePosts, setLivePosts] = useState<LivePost[]>([]);
  const [selectedSport, setSelectedSport] = useState('Badminton');
  const [selectedMode, setSelectedMode] = useState<'ranked' | 'casual'>('ranked');
  const [isSearching, setIsSearching] = useState(false);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const [champions, setChampions] = useState<any[]>(FEATURED_CHAMPIONS);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => {
        if (d && (d.totalUsers > 0 || d.activeMatches > 0)) {
          setStats(d);
        }
      })
      .catch(() => {});
    
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setLivePosts(data.posts);
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
              name: u.name,
              sport: ['Badminton', 'Football', 'Cricket'][idx % 3],
              rating,
              tier,
              winRate: `${70 + (idx * 4)}%`,
              streak: 7 - idx,
              avatar: u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(u.name)}`,
            };
          });
          setChampions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickMatch = () => {
    sound.playBattle();
    setIsSearching(true);
    setTimeout(() => {
      window.location.href = `/feed?sport=${encodeURIComponent(selectedSport)}`;
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── LIVE MATCHMAKING TICKER ── */}
      <div className="pt-16 bg-[#111118]/80 border-b border-white/5 overflow-hidden">
        <div className="flex items-center gap-6 py-2 px-4 animate-marquee whitespace-nowrap text-xs font-semibold">
          <div className="flex items-center gap-2 text-emerald-400 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE RADAR:
          </div>
          <span className="text-[#a0a0b8]">⚡ Main Sports Arena • 7v7 Football starting at 5:30 PM</span>
          <span className="text-[#6b6b80]">•</span>
          <span className="text-[#00f5d4]">🏸 Indoor Badminton • 2 slots open for Doubles</span>
          <span className="text-[#6b6b80]">•</span>
          <span className="text-[#ffd60a]">👑 Champion Duel: Arjun K. (2140) challenged Dev P. (2090)</span>
          <span className="text-[#6b6b80]">•</span>
          <span className="text-[#ec4899]">🏆 Weekend Cricket Blitz Registration Closes in 3 Hours</span>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #7b2ff7, transparent)' }} />
        <div className="absolute top-32 right-1/4 w-[450px] h-[450px] rounded-full opacity-20 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #00f5d4, transparent)' }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div initial="hidden" animate="show" variants={stagger} className="lg:col-span-7 text-center lg:text-left">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-[#00f5d4] mb-6 backdrop-blur-md shadow-lg shadow-[#00f5d4]/5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Sports Matchmaking & Tournament Hub</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-black font-outfit leading-[1.08] mb-6 tracking-tight">
                <span className="text-white">Dominate</span><br />
                <span style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Every Court.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-[#a0a0b8] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-body">
                Find nearby players, challenge rivals in 1v1 duels, organize brackets, and track your global Glicko-2 ELO rating across Cricket, Football, Badminton, Basketball, Tennis, and Chess.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/feed"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base transition-all hover:scale-105 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', boxShadow: '0 0 35px rgba(123,47,247,0.4)' }}
                >
                  <Zap className="w-5 h-5" /> Explore Match Lobby
                </Link>
                <Link
                  href="/challenges"
                  onClick={() => sound.playClick()}
                  className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
                >
                  <Swords className="w-5 h-5 text-[#ffd60a]" /> Challenge Arena
                </Link>
              </motion.div>

              {/* Quick stats pills */}
              <motion.div variants={fadeUp} className="flex items-center justify-center lg:justify-start gap-6 mt-10 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">{stats.totalUsers}+ Active Players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#ffd60a]" />
                  <span className="text-sm font-bold text-white">6-Tier ELO Ranking</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right 1-Click Matchmaker Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-5"
            >
              <div className="rounded-3xl border border-white/15 bg-[#111118]/90 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(123,47,247,0.15)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-[#7b2ff7]/20 border border-[#7b2ff7]/40 text-[#00f5d4]">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-outfit font-black text-white text-base">⚡ Quick Match Finder</h3>
                      <p className="text-[11px] text-[#6b6b80]">Instant Squad & Rival Matchmaking</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </div>

                {/* Sport Selector Chips */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Select Sport</label>
                  <div className="grid grid-cols-4 gap-2">
                    {SPORTS.slice(0, 8).map(s => (
                      <button
                        key={s.name}
                        onClick={() => {
                          sound.playClick();
                          setSelectedSport(s.name);
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                          selectedSport === s.name
                            ? 'bg-[#7b2ff7] text-white shadow-lg shadow-[#7b2ff7]/30 border border-[#7b2ff7]'
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
                        sound.playClick();
                        setSelectedMode('ranked');
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedMode === 'ranked'
                          ? 'bg-[#ffd60a]/20 text-[#ffd60a] border border-[#ffd60a]/40'
                          : 'bg-white/5 text-[#6b6b80] border border-white/5'
                      }`}
                    >
                      <Trophy className="h-3.5 w-3.5" /> Ranked (Stake RP)
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setSelectedMode('casual');
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedMode === 'casual'
                          ? 'bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/40'
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
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                >
                  {isSearching ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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

      {/* ── STATS BAR ── */}
      <section className="py-10 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Ranked Athletes', value: stats.totalUsers || 342, icon: Users, color: '#7b2ff7' },
              { label: 'Active Match Lobbies', value: stats.activeMatches || 14, icon: Zap, color: '#00f5d4' },
              { label: 'Championship Tournaments', value: stats.totalTournaments || 8, icon: Trophy, color: '#ffd60a' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: s.color }} />
                <div className="text-3xl sm:text-4xl font-black font-outfit" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-[#6b6b80] mt-1 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ARENA RADAR & COURT STATUS ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00f5d4] uppercase tracking-wider mb-2">
                <Activity className="h-3.5 w-3.5" /> Live Availability
              </div>
              <h2 className="text-3xl font-black font-outfit text-white">Court Radar & Venue Status</h2>
            </div>
            <Link
              href="/feed"
              onClick={() => sound.playClick()}
              className="flex items-center gap-1 text-sm font-bold text-[#00f5d4] hover:underline"
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
                className="p-5 rounded-2xl border border-white/10 bg-[#111118]/80 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#a0a0b8]">
                    {v.sport}
                  </span>
                  <span className={`h-2.5 w-2.5 rounded-full ${v.state === 'live' ? 'bg-emerald-400 animate-ping' : 'bg-[#00f5d4]'}`} />
                </div>
                <h3 className="font-outfit font-black text-white text-base mb-1 group-hover:text-[#00f5d4] transition-colors">{v.name}</h3>
                <p className="text-xs text-[#a0a0b8] flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-[#7b2ff7]" /> {v.status}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DAILY CHAMPIONS SPOTLIGHT ── */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-[#7b2ff7]/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffd60a] uppercase tracking-wider mb-2">
              <Crown className="h-4 w-4" /> Hall of Fame
            </div>
            <h2 className="text-3xl font-black font-outfit text-white">Daily Featured Champions</h2>
            <p className="text-sm text-[#a0a0b8] mt-2">Top ranked players on active win streaks across physical & digital games.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {champions.map((champ, i) => (
              <motion.div
                key={champ.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-white/10 bg-[#111118] hover:border-[#ffd60a]/40 transition-all relative overflow-hidden shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={champ.avatar} alt={champ.name} className="h-12 w-12 rounded-2xl bg-white/5 p-1 border border-white/10" />
                    <div>
                      <h4 className="font-outfit font-black text-white text-base">{champ.name}</h4>
                      <p className="text-xs text-[#a0a0b8]">{champ.sport} Specialist</p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30">
                    {champ.tier}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 text-center">
                  <div>
                    <div className="text-base font-black text-white">{champ.rating}</div>
                    <div className="text-[10px] text-[#6b6b80]">ELO Rating</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-[#00f5d4]">{champ.winRate}</div>
                    <div className="text-[10px] text-[#6b6b80]">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-[#ff006e] flex items-center justify-center gap-0.5">
                      <Flame className="h-3.5 w-3.5" /> {champ.streak}
                    </div>
                    <div className="text-[10px] text-[#6b6b80]">Streak</div>
                  </div>
                </div>

                <Link
                  href="/challenges"
                  onClick={() => sound.playBattle()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-[#7b2ff7] border border-white/10 hover:border-[#7b2ff7] transition-all"
                >
                  <Swords className="h-3.5 w-3.5 text-[#ffd60a]" /> Issue 1v1 Challenge
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPORTS GRID ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-black font-outfit text-white">Supported Sports & Categories</h2>
            <p className="text-[#6b6b80] mt-2">Find matches, host brackets, and log scores across multiple athletic disciplines.</p>
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
                  onClick={() => sound.playClick()}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/8 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:scale-105 group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sport.emoji}</span>
                  <div className="text-center">
                    <div className="font-bold text-white text-sm font-outfit">{sport.name}</div>
                    <div className="text-xs text-[#6b6b80] mt-0.5">{sport.players}</div>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-[#00f5d4] bg-[#00f5d4]/10 px-2 py-0.5 rounded-full">
                      {sport.tag}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARENA GALLERY ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-black font-outfit text-white">World-Class Arenas & Courts</h2>
            <p className="text-[#6b6b80] mt-2 font-body">From floodlit outdoor turfs to indoor wooden sports halls, find games at every venue.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ARENA_PHOTOS.map((photo, i) => (
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
                    <span className="text-5xl">{['🏟️', '🏸', '🏀'][i]}</span>
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

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black font-outfit text-white">How CourtMate Works</h2>
            <p className="text-[#6b6b80] mt-2">Get ready to compete on the court in three simple steps</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative p-6 rounded-2xl border border-white/8 text-center bg-white/[0.02]">
                <div className="text-xs font-bold text-[#7b2ff7] mb-3 tracking-widest uppercase">{step.step}</div>
                <step.icon className="w-8 h-8 text-[#00f5d4] mx-auto mb-3" />
                <h3 className="font-bold text-white text-lg mb-2 font-outfit">{step.title}</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed font-body">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-10 rounded-3xl border border-white/10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(123,47,247,0.2), rgba(0,245,212,0.1))' }}>
            <h2 className="text-4xl sm:text-5xl font-black font-outfit text-white mb-4">Step Onto the Court Today.</h2>
            <p className="text-[#a0a0b8] mb-8 text-lg max-w-xl mx-auto font-body">Create your CourtMate profile, pick your sports, and compete with athletes in your area.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                onClick={() => sound.playClick()}
                className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base transition-all hover:scale-105 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
              >
                Create Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                onClick={() => sound.playClick()}
                className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold text-[#a0a0b8] text-base border border-white/15 hover:text-white hover:border-white/30 transition-all backdrop-blur-sm"
              >
                Sign In to Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function Crown(props: any) {
  return <Award {...props} />;
}
