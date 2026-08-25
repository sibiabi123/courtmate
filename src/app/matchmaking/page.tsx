'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Users, Target, Clock, CheckCircle, RefreshCw, Star, MapPin,
  Sparkles, Award, Swords, ArrowRight
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';
import { sound } from '@/lib/sound';
import { InteractiveCourtMap } from '@/components/ui/InteractiveCourtMap';

const SPORTS = ['Badminton', 'Football', 'Cricket', 'Basketball', 'Table Tennis', 'Volleyball', 'Tennis', 'Chess'];
const SKILL_LEVELS = ['Any', 'Beginner (1000–1399)', 'Intermediate (1400–1699)', 'Advanced Champion (1700+)'];
const SPORT_EMOJIS: Record<string, string> = {
  Badminton: '🏸', Football: '⚽', Cricket: '🏏', Basketball: '🏀',
  'Table Tennis': '🏓', Volleyball: '🏐', Tennis: '🎾', Chess: '♟️',
};

interface MatchCandidate {
  id: string;
  name: string;
  hostel: string;
  rating: number;
  avatar?: string;
  sport: string;
  ground: string;
  scheduledAt: string;
  currentPlayers: number;
  maxPlayers: number;
  spotsLeft: number;
  matchScore: number;
}

export default function MatchmakingPage() {
  const { currentUser, isAuthenticated } = useUIStore();
  const [sport, setSport] = useState('Badminton');
  const [skillLevel, setSkillLevel] = useState('Any');
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [searchDone, setSearchDone] = useState(false);

  const handleSearch = async () => {
    sound.playBattle();
    setSearching(true);
    setSearchDone(false);
    setCandidates([]);

    // High-tech AI Matchmaking Algorithm Simulation
    await new Promise(r => setTimeout(r, 1200));

    sound.playVictory();
    setCandidates([
      {
        id: 'c-1',
        name: 'Arjun Kumar & Squad',
        hostel: 'Main Campus',
        rating: 1820,
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=arjun',
        sport,
        ground: 'Indoor Badminton Complex',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        currentPlayers: 3,
        maxPlayers: 4,
        spotsLeft: 1,
        matchScore: 98,
      },
      {
        id: 'c-2',
        name: 'Priya Sharma & Club',
        hostel: 'North District',
        rating: 1740,
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=priya',
        sport,
        ground: 'Center Court Complex',
        scheduledAt: new Date(Date.now() + 7200000).toISOString(),
        currentPlayers: 2,
        maxPlayers: 4,
        spotsLeft: 2,
        matchScore: 94,
      },
      {
        id: 'c-3',
        name: 'Vikram Reddy Pro Match',
        hostel: 'Sports Complex',
        rating: 1690,
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=vikram',
        sport,
        ground: 'Main Sports Arena',
        scheduledAt: new Date(Date.now() + 10800000).toISOString(),
        currentPlayers: 1,
        maxPlayers: 2,
        spotsLeft: 1,
        matchScore: 91,
      },
    ]);

    setSearching(false);
    setSearchDone(true);
  };

  const handleJoin = (id: string) => {
    sound.playCoin();
    setJoined(prev => [...prev, id]);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4 text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 bg-[#7b2ff7]/15 text-[#00f5d4] border border-[#7b2ff7]/30 shadow-lg shadow-[#00f5d4]/5">
            <Zap className="w-3.5 h-3.5" /> Glicko-2 AI Precision Matchmaker
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-outfit text-white mb-3">
            Find Your <span style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Perfect Squad</span>
          </h1>
          <p className="text-[#a0a0b8] text-sm leading-relaxed">
            Smart matchmaking pairs you with nearby players at your exact rating tier for balanced, competitive matches.
          </p>
        </motion.div>

        {/* ── SEARCH CARD ── */}
        <div className="rounded-3xl border border-white/10 bg-[#111118] p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Sport Selection */}
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-3">Choose Sport</label>
              <div className="grid grid-cols-4 gap-2">
                {SPORTS.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      sound.playClick();
                      setSport(s);
                    }}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl text-xs font-bold transition-all ${
                      sport === s
                        ? 'bg-[#7b2ff7] text-white border border-[#7b2ff7] shadow-lg shadow-[#7b2ff7]/25'
                        : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/5'
                    }`}
                  >
                    <span className="text-xl mb-1">{SPORT_EMOJIS[s]}</span>
                    <span className="truncate max-w-[60px] text-[10px]">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Level Selection */}
            <div>
              <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-3">Target Skill Tier</label>
              <div className="space-y-2">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      sound.playClick();
                      setSkillLevel(level);
                    }}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                      skillLevel === level
                        ? 'bg-[#00f5d4]/15 text-[#00f5d4] border border-[#00f5d4]/40'
                        : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{level}</span>
                    {skillLevel === level && <Sparkles className="w-4 h-4 text-[#00f5d4]" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
          >
            {searching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning Campus & City Courts...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Run AI Matchmaking Scan
              </>
            )}
          </button>
        </div>

        {/* ── MATCHMAKING RESULTS ── */}
        {searchDone && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="font-outfit font-black text-2xl text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#ffd60a]" /> Top Matched Lobbies (90%+ Compatibility)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl flex flex-col justify-between hover:border-white/25 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <img src={c.avatar} alt={c.name} className="h-12 w-12 rounded-2xl bg-white/5 p-1 border border-white/10" />
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {c.matchScore}% Match
                      </span>
                    </div>

                    <h4 className="font-outfit font-black text-white text-base mb-1">{c.name}</h4>
                    <p className="text-xs text-[#00f5d4] flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5" /> {c.ground}
                    </p>

                    <div className="space-y-1.5 py-2.5 px-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-[#a0a0b8] mb-5">
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-bold text-white">{c.rating} ELO</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slots:</span>
                        <span className="font-bold text-[#ffd60a]">{c.spotsLeft} Slot Open</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoin(c.id)}
                    disabled={joined.includes(c.id)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs text-white transition-all shadow-lg ${
                      joined.includes(c.id)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'hover:scale-[1.02]'
                    }`}
                    style={!joined.includes(c.id) ? { background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' } : {}}
                  >
                    {joined.includes(c.id) ? '✅ Slot Confirmed' : 'Join Match Lobby'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── LIVE INTERACTIVE COURT MAP ── */}
        <InteractiveCourtMap />

      </div>
    </main>
  );
}
