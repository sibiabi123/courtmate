'use client';

import { useUIStore } from '@/store/uiStore';
import { useCoinEarn } from '@/hooks/useCoinEarn';
import { motion } from 'framer-motion';
import { sound } from '@/lib/sound';
import Link from 'next/link';
import { Gift, CheckCircle2, Zap } from 'lucide-react';

export function DailyClaimBanner() {
  const { isAuthenticated, canClaimDaily, claimDailyBonus, currentUser, coinHistory } = useUIStore();

  if (!isAuthenticated || !canClaimDaily()) return null;

  // Count streak
  const streak = coinHistory.filter(tx => {
    const d = new Date(tx.createdAt);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000 && tx.reason === 'Daily Login Bonus';
  }).length;

  const handleClaim = () => {
    const earned = claimDailyBonus();
    if (earned > 0) {
      sound.playVictory();
      // Emit toast via the store (it will be picked up by CoinToastProvider)
      import('@/hooks/useCoinEarn').then(({ emitCoinEarn }) => {
        emitCoinEarn({ amount: earned, reason: `Day ${streak + 1} Login Streak Bonus!`, icon: '🎁' });
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-2 rounded-2xl border border-[#ffd60a]/30 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, rgba(255,214,10,0.08), rgba(123,47,247,0.12))' }}
    >
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#ffd60a]/15 border border-[#ffd60a]/30 flex items-center justify-center text-lg shrink-0">
            🎁
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-none">Daily Login Bonus Available!</p>
            <p className="text-[11px] text-[#a0a0b8] mt-0.5">
              {streak > 0 ? `🔥 ${streak}-day streak! Earn extra coins` : 'Claim your free coins every day'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClaim}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs text-black shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ffd60a, #ff9500)' }}
        >
          <Gift className="w-3.5 h-3.5" />
          Claim +{Math.min(50 + streak * 10, 150)} 🪙
        </button>
      </div>
      {/* Progress bar */}
      {streak > 0 && (
        <div className="h-0.5 w-full bg-white/5">
          <div
            className="h-full bg-[#ffd60a] transition-all"
            style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
