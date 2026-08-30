'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Flame, Users, Shield, ArrowUpRight } from 'lucide-react';
import { playClick } from '@/lib/sound';

interface HostelStanding {
  rank: number;
  hostel: string;
  category: 'Men\'s' | 'Ladies\'' | 'Off-Campus';
  points: number;
  matchesWon: number;
  topSport: string;
  mvp: string;
}

const HOSTEL_STANDINGS: HostelStanding[] = [
  { rank: 1, hostel: 'MH-Q Block', category: 'Men\'s', points: 3420, matchesWon: 148, topSport: 'Cricket & Football', mvp: 'Arjun Verma (1990 RP)' },
  { rank: 2, hostel: 'MH-A Block', category: 'Men\'s', points: 3180, matchesWon: 135, topSport: 'Badminton', mvp: 'Karthik Raman (1940 RP)' },
  { rank: 3, hostel: 'LH-B Block', category: 'Ladies\'', points: 2950, matchesWon: 122, topSport: 'Basketball & TT', mvp: 'Sneha Patel (1910 RP)' },
  { rank: 4, hostel: 'MH-D Block', category: 'Men\'s', points: 2840, matchesWon: 118, topSport: 'Football 7v7', mvp: 'Rohan Sharma (1880 RP)' },
  { rank: 5, hostel: 'LH-A Block', category: 'Ladies\'', points: 2710, matchesWon: 110, topSport: 'Badminton', mvp: 'Priya Iyer (1850 RP)' },
  { rank: 6, hostel: 'MH-K Block', category: 'Men\'s', points: 2590, matchesWon: 104, topSport: 'Volleyball', mvp: 'Vikram Das (1820 RP)' },
];

export function InterHostelCupWidget() {
  const [filter, setFilter] = useState<'All' | 'Men\'s' | 'Ladies\''>('All');

  const filtered = filter === 'All'
    ? HOSTEL_STANDINGS
    : HOSTEL_STANDINGS.filter(h => h.category === filter);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] flex items-center justify-center text-lg">
            🏆
          </div>
          <div>
            <h3 className="font-outfit font-black text-base text-white flex items-center gap-2">
              Inter-Hostel Athletic Cup
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] font-bold border border-[#FFD700]/20">
                2026 STANDINGS
              </span>
            </h3>
            <p className="text-[10px] text-[#6b6b80]">Hostel supremacy points from verified match & duel wins</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {['All', 'Men\'s', 'Ladies\''].map(f => (
            <button
              key={f}
              onClick={() => {
                playClick();
                setFilter(f as any);
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filter === f
                  ? 'bg-[#CCFF00] text-[#040507] font-black'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] font-black uppercase text-[#6b6b80] tracking-wider border-b border-white/5 pb-2">
              <th className="pb-2 pl-2">Rank</th>
              <th className="pb-2">Hostel Residence</th>
              <th className="pb-2">Olympic Points</th>
              <th className="pb-2">Matches Won</th>
              <th className="pb-2">Hostel MVP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(h => (
              <tr key={h.hostel} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pl-2">
                  <span
                    className={`w-6 h-6 rounded-lg font-outfit font-black text-xs flex items-center justify-center ${
                      h.rank === 1
                        ? 'bg-[#FFD700] text-[#040507]'
                        : h.rank === 2
                        ? 'bg-[#00F0FF] text-[#040507]'
                        : h.rank === 3
                        ? 'bg-[#CCFF00] text-[#040507]'
                        : 'bg-white/5 text-[#a0a0b8]'
                    }`}
                  >
                    #{h.rank}
                  </span>
                </td>
                <td className="py-3 font-bold text-white">
                  <div>{h.hostel}</div>
                  <div className="text-[10px] text-[#6b6b80] font-normal">{h.topSport}</div>
                </td>
                <td className="py-3 font-mono font-black text-[#CCFF00]">
                  {h.points.toLocaleString()} pts
                </td>
                <td className="py-3 font-mono text-emerald-400">
                  {h.matchesWon} Wins
                </td>
                <td className="py-3 text-[11px] text-[#a0a0b8]">
                  {h.mvp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
