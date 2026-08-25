'use client';

import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Zap, Users, Star, CheckCircle2, ArrowRight } from 'lucide-react';

const PROFILE_TASKS = [
  { id: 'registered', label: 'Created Account', coins: 0, auto: true },
  { id: 'joined_match', label: 'Joined a Match', coins: 10, storeKey: 'totalMatchesJoined' },
  { id: 'posted_match', label: 'Posted a Match Lobby', coins: 15, storeKey: 'totalMatchesPosted' },
  { id: 'issued_challenge', label: 'Issued a 1v1 Challenge', coins: 25, storeKey: 'totalChallengesIssued' },
  { id: 'claimed_daily', label: 'Claimed Daily Bonus', coins: 50, storeKey: 'lastDailyClaim' },
];

export function ProfileProgressWidget() {
  const { isAuthenticated, totalMatchesJoined, totalMatchesPosted, totalChallengesIssued, lastDailyClaim } = useUIStore();

  if (!isAuthenticated) return null;

  const completedCount = [
    true, // registered
    totalMatchesJoined > 0,
    totalMatchesPosted > 0,
    totalChallengesIssued > 0,
    !!lastDailyClaim,
  ].filter(Boolean).length;

  const pct = Math.round((completedCount / PROFILE_TASKS.length) * 100);

  const completed = [
    true,
    totalMatchesJoined > 0,
    totalMatchesPosted > 0,
    totalChallengesIssued > 0,
    !!lastDailyClaim,
  ];

  if (pct === 100) return null; // Done — hide widget

  return (
    <div className="rounded-2xl border border-[#7b2ff7]/30 bg-[#111118]/80 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-outfit font-black text-sm text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-[#ffd60a]" />
            Platform Unlock Progress
          </h3>
          <p className="text-[11px] text-[#6b6b80] mt-0.5">Complete actions to earn coins & unlock tiers</p>
        </div>
        <div className="text-right">
          <span className="font-outfit font-black text-xl text-[#00f5d4]">{pct}%</span>
          <p className="text-[10px] text-[#6b6b80]">Complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #7b2ff7, #00f5d4)' }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {PROFILE_TASKS.map((task, idx) => {
          const done = completed[idx];
          return (
            <div key={task.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${done ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-white/[0.02] border border-white/5'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : 'border-2 border-white/20'}`}>
                  {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-xs font-semibold ${done ? 'text-[#a0a0b8] line-through' : 'text-white'}`}>
                  {task.label}
                </span>
              </div>
              {task.coins > 0 && (
                <span className={`text-[10px] font-black ${done ? 'text-emerald-400' : 'text-[#ffd60a]'}`}>
                  {done ? '✅ Earned' : `+${task.coins} 🪙`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
