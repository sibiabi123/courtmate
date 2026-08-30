'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Swords, Zap, Globe, Flame, Shield, ArrowUpRight,
  TrendingUp, Users, Award, Star, Share2, Check, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { GLOBAL_COLLEGES } from '@/data/colleges';
import { playClick, playDuel } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface UniversityRanking {
  id: string;
  rank: number;
  name: string;
  shortName: string;
  country: string;
  emblem: string;
  powerScore: number;
  activeAthletes: number;
  matchesWon: number;
  topSport: string;
  topChampion: string;
}

const UNIVERSITY_RANKINGS: UniversityRanking[] = [
  {
    id: 'stanford',
    rank: 1,
    name: 'Stanford University',
    shortName: 'Stanford',
    country: 'United States',
    emblem: '🌲',
    powerScore: 9840,
    activeAthletes: 412,
    matchesWon: 1240,
    topSport: 'Basketball',
    topChampion: 'Marcus Hayes (2140 ELO)',
  },
  {
    id: 'iit-madras',
    rank: 2,
    name: 'Indian Institute of Technology Madras',
    shortName: 'IIT Madras',
    country: 'India',
    emblem: '⚡',
    powerScore: 9650,
    activeAthletes: 580,
    matchesWon: 1195,
    topSport: 'Badminton',
    topChampion: 'Karthik Raman (2080 ELO)',
  },
  {
    id: 'oxford',
    rank: 3,
    name: 'University of Oxford',
    shortName: 'Oxford',
    country: 'United Kingdom',
    emblem: '👑',
    powerScore: 9420,
    activeAthletes: 340,
    matchesWon: 980,
    topSport: 'Football',
    topChampion: 'Arthur Pendelton (2050 ELO)',
  },
  {
    id: 'mit',
    rank: 4,
    name: 'Massachusetts Institute of Technology',
    shortName: 'MIT',
    country: 'United States',
    emblem: '🤖',
    powerScore: 9310,
    activeAthletes: 390,
    matchesWon: 945,
    topSport: 'Table Tennis',
    topChampion: 'David Zhao (2020 ELO)',
  },
  {
    id: 'vit-vellore',
    rank: 5,
    name: 'Vellore Institute of Technology',
    shortName: 'VIT Vellore',
    country: 'India',
    emblem: '🏛️',
    powerScore: 9280,
    activeAthletes: 720,
    matchesWon: 1350,
    topSport: 'Cricket',
    topChampion: 'Arjun Verma (1990 ELO)',
  },
  {
    id: 'cambridge',
    rank: 6,
    name: 'University of Cambridge',
    shortName: 'Cambridge',
    country: 'United Kingdom',
    emblem: '🎓',
    powerScore: 9140,
    activeAthletes: 310,
    matchesWon: 890,
    topSport: 'Athletics',
    topChampion: 'Oliver Smith (1960 ELO)',
  },
  {
    id: 'nus',
    rank: 7,
    name: 'National University of Singapore',
    shortName: 'NUS Singapore',
    country: 'Singapore',
    emblem: '🦁',
    powerScore: 9020,
    activeAthletes: 420,
    matchesWon: 870,
    topSport: 'Badminton',
    topChampion: 'Wei Chen (1940 ELO)',
  },
  {
    id: 'iit-bombay',
    rank: 8,
    name: 'IIT Bombay',
    shortName: 'IIT Bombay',
    country: 'India',
    emblem: '🔥',
    powerScore: 8950,
    activeAthletes: 510,
    matchesWon: 910,
    topSport: 'Football',
    topChampion: 'Rohan Deshmukh (1910 ELO)',
  },
];

const DERBIES = [
  {
    id: 'd1',
    name: 'The Bay Area Classic',
    teamA: { name: 'Stanford Cardinal', emblem: '🌲', score: 48, color: '#FF2A55' },
    teamB: { name: 'UC Berkeley Bears', emblem: '🐻', score: 42, color: '#003262' },
    sport: 'Basketball 5v5 Showdown',
    scheduled: 'This Saturday, 6:00 PM',
  },
  {
    id: 'd2',
    name: 'The Tech Rivalry Derby',
    teamA: { name: 'IIT Madras', emblem: '⚡', score: 35, color: '#00F0FF' },
    teamB: { name: 'IIT Bombay', emblem: '🔥', score: 33, color: '#FF2A55' },
    sport: 'Badminton & Football Clash',
    scheduled: 'Live In-Progress',
  },
  {
    id: 'd3',
    name: 'The Varsity Boat & Pitch Cup',
    teamA: { name: 'Oxford University', emblem: '👑', score: 28, color: '#002147' },
    teamB: { name: 'Cambridge University', emblem: '🎓', score: 29, color: '#A3C1AD' },
    sport: 'Athletics & Tennis Dual',
    scheduled: 'Tomorrow, 4:00 PM',
  },
];

export default function RivalryPage() {
  const { currentUser } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'India' | 'United States' | 'United Kingdom' | 'Singapore'>('All');

  const filteredRankings = selectedFilter === 'All'
    ? UNIVERSITY_RANKINGS
    : UNIVERSITY_RANKINGS.filter(u => u.country === selectedFilter);

  const handleShare = () => {
    playClick();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `🏛️ Check out the Global Collegiate Athletic Power Index on CourtMate! Represent your university in inter-varsity derbies: ${url}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#040507] pt-24 pb-24 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 mb-3">
              <Globe className="w-3.5 h-3.5" /> Inter-Varsity Global Power Index
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-outfit text-white">
              Collegiate <span className="text-[#CCFF00]">Rivalry</span> Arena
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-2 max-w-xl">
              Universities around the globe ranked by total athletic victories, active duel win-rates, and campus power scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-5 py-3 rounded-2xl text-xs font-bold bg-white/5 border border-white/15 text-white hover:bg-white/10 flex items-center gap-2 transition-all active:scale-95"
            >
              {copied ? <><Check className="w-4 h-4 text-[#CCFF00]" /> Copied Link!</> : <><Share2 className="w-4 h-4" /> Share Campus Standings</>}
            </button>
            <Link
              href="/challenges"
              onClick={() => playDuel()}
              className="btn-volt flex items-center gap-2"
            >
              <Swords className="w-4 h-4" /> Issue Inter-College Duel
            </Link>
          </div>
        </div>

        {/* ── ACTIVE INTER-COLLEGIATE DERBIES CAROUSEL ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-outfit font-black text-xl text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF2A55]" /> Marquee Campus Derbies
            </h3>
            <span className="text-xs text-[#CCFF00] font-mono font-bold">● LIVE RADAR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DERBIES.map((d, idx) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-xl relative overflow-hidden group hover:border-[#CCFF00]/40 transition-all"
              >
                <div className="flex items-center justify-between text-[11px] text-[#6b6b80] mb-4 font-mono">
                  <span>{d.sport}</span>
                  <span className="text-[#CCFF00] font-bold">{d.scheduled}</span>
                </div>

                {/* Score Clash */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4">
                  <div className="flex-1 text-center">
                    <div className="text-3xl mb-1">{d.teamA.emblem}</div>
                    <div className="font-bold text-xs text-white truncate">{d.teamA.name}</div>
                    <div className="text-2xl font-black font-outfit mt-1" style={{ color: d.teamA.color }}>
                      {d.teamA.score}
                    </div>
                  </div>

                  <div className="text-xs font-black text-[#6b6b80] px-2 py-1 rounded-lg bg-white/5">
                    VS
                  </div>

                  <div className="flex-1 text-center">
                    <div className="text-3xl mb-1">{d.teamB.emblem}</div>
                    <div className="font-bold text-xs text-white truncate">{d.teamB.name}</div>
                    <div className="text-2xl font-black font-outfit mt-1" style={{ color: d.teamB.color }}>
                      {d.teamB.score}
                    </div>
                  </div>
                </div>

                <Link
                  href="/challenges"
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-white/10 hover:bg-[#CCFF00] hover:text-[#040507] text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5" /> Stake Duel For Campus
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── GLOBAL UNIVERSITY LEADERBOARD TABLE ── */}
        <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <h3 className="font-outfit font-black text-2xl text-white">Global University Rankings</h3>
              <p className="text-xs text-[#a0a0b8]">Updated in real-time from verified campus match results</p>
            </div>

            {/* Country filter chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'United States', 'India', 'United Kingdom', 'Singapore'].map(c => (
                <button
                  key={c}
                  onClick={() => {
                    playClick();
                    setSelectedFilter(c as any);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedFilter === c
                      ? 'bg-[#CCFF00] text-[#040507]'
                      : 'bg-white/5 text-[#a0a0b8] hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-[#6b6b80] tracking-wider border-b border-white/5 pb-3">
                  <th className="pb-3 pl-3">Rank</th>
                  <th className="pb-3">University</th>
                  <th className="pb-3">Power Index</th>
                  <th className="pb-3">Active Athletes</th>
                  <th className="pb-3">Matches Won</th>
                  <th className="pb-3">Campus MVP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRankings.map(u => (
                  <tr
                    key={u.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 pl-3">
                      <span className={`h-8 w-8 rounded-xl font-outfit font-black text-xs flex items-center justify-center ${
                        u.rank === 1
                          ? 'bg-[#FFD700] text-[#040507] shadow-lg shadow-[#FFD700]/30'
                          : u.rank === 2
                          ? 'bg-[#00F0FF] text-[#040507]'
                          : u.rank === 3
                          ? 'bg-[#CCFF00] text-[#040507]'
                          : 'bg-white/5 text-white/80'
                      }`}>
                        #{u.rank}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{u.emblem}</span>
                        <div>
                          <div className="font-bold text-sm text-white group-hover:text-[#CCFF00] transition-colors">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-[#6b6b80]">{u.country}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-mono font-black text-base text-[#CCFF00]">
                      {u.powerScore.toLocaleString()} pts
                    </td>

                    <td className="py-4 text-xs font-mono text-white">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#00F0FF]" /> {u.activeAthletes}
                      </span>
                    </td>

                    <td className="py-4 text-xs font-mono text-emerald-400">
                      {u.matchesWon} Wins
                    </td>

                    <td className="py-4 text-xs font-semibold text-[#a0a0b8]">
                      {u.topChampion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
