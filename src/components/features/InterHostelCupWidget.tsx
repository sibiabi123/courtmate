'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Flame, Users, Shield, ArrowUpRight, Loader2 } from 'lucide-react';
import { playClick } from '@/lib/sound';

interface HostelStanding {
  rank: number;
  hostel: string;
  category: "Men's" | "Ladies'" | 'Campus';
  points: number;
  matchesWon: number;
  activeAthletes: number;
  topSport: string;
}

export function InterHostelCupWidget() {
  const [standings, setStandings] = useState<HostelStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | "Men's" | "Ladies'">('All');

  useEffect(() => {
    fetch('/api/hostel-standings')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.standings)) {
          setStandings(data.standings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All'
    ? standings
    : standings.filter(h => h.category === filter);

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
                LIVE OLYMPIC RADAR
              </span>
            </h3>
            <p className="text-[10px] text-[#6b6b80]">Hostel supremacy points calculated from active participation &amp; wins</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {['All', "Men's", "Ladies'"].map(f => (
            <button
              key={f}
              onClick={() => {
                playClick();
                setFilter(f as any);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-[#FFD700] text-[#040507] font-black'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#6b6b80]">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#FFD700]" />
          Calculating live hostel points...
        </div>
      ) : (
        /* Standings Table */
        <div className="space-y-2">
          {filtered.slice(0, 8).map((h) => {
            const isTop3 = h.rank <= 3;
            const rankBg =
              h.rank === 1 ? 'bg-[#FFD700] text-black font-black' :
              h.rank === 2 ? 'bg-slate-300 text-black font-black' :
              h.rank === 3 ? 'bg-amber-700 text-white font-black' :
              'bg-white/5 text-[#a0a0b8]';

            return (
              <motion.div
                key={h.hostel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isTop3
                    ? 'bg-white/[0.03] border-white/15 shadow-sm'
                    : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                }`}
              >
                {/* Rank & Block Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-mono ${rankBg}`}>
                    {h.rank === 1 ? '🥇' : h.rank === 2 ? '🥈' : h.rank === 3 ? '🥉' : `#${h.rank}`}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate font-outfit">{h.hostel}</span>
                      <span className="text-[9px] font-mono text-[#6b6b80] px-1.5 py-0.2 rounded bg-white/5">
                        {h.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#a0a0b8] truncate font-mono">
                      {h.activeAthletes} athletes · {h.topSport}
                    </p>
                  </div>
                </div>

                {/* Score & Points */}
                <div className="text-right shrink-0">
                  <span className="font-black text-xs text-[#FFD700] font-mono block">
                    {h.points.toLocaleString()} PTS
                  </span>
                  <span className="text-[10px] text-[#6b6b80] font-mono">
                    {h.matchesWon} wins
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-[#6b6b80]">
        <span>Points update continuously with every confirmed match.</span>
        <span className="font-bold text-white font-mono">Weekly Shield Award: Sunday 9:00 PM</span>
      </div>
    </div>
  );
}
