'use client';

import { useState, useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';
import { sound } from '@/lib/sound';

export interface CoinEarnEvent {
  amount: number;
  reason: string;
  icon?: string;
}

// Global toast manager (simple module-level state)
type ToastListener = (event: CoinEarnEvent) => void;
const listeners: ToastListener[] = [];

export function emitCoinEarn(event: CoinEarnEvent) {
  listeners.forEach(fn => fn(event));
}

export function subscribeCoinEarn(fn: ToastListener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

/** Call this hook anywhere to trigger coin earning with toast + sound */
export function useCoinEarn() {
  const { updateCoins, isAuthenticated, incrementMatchesJoined, incrementMatchesPosted, incrementChallengesIssued } = useUIStore();

  const earn = useCallback((amount: number, reason: string, icon = '🪙') => {
    if (!isAuthenticated) return;
    updateCoins(amount, reason);
    sound.playCoin();
    emitCoinEarn({ amount, reason, icon });
  }, [isAuthenticated, updateCoins]);

  const earnForJoiningMatch = useCallback(() => {
    earn(10, 'Joined a Match', '⚡');
    incrementMatchesJoined();
  }, [earn, incrementMatchesJoined]);

  const earnForPostingMatch = useCallback(() => {
    earn(15, 'Posted a Match Lobby', '🏅');
    incrementMatchesPosted();
  }, [earn, incrementMatchesPosted]);

  const earnForChallenge = useCallback(() => {
    earn(25, 'Issued a 1v1 Challenge', '⚔️');
    incrementChallengesIssued();
  }, [earn, incrementChallengesIssued]);

  const earnForArcade = useCallback((gameName: string, score: number) => {
    const coins = Math.min(30, Math.max(10, Math.floor(score / 100)));
    earn(coins, `Played ${gameName}`, '🎮');
  }, [earn]);

  const earnForWinningChallenge = useCallback((stakePoints: number) => {
    earn(stakePoints, 'Won a Ranked Duel! 🏆', '👑');
  }, [earn]);

  return { earn, earnForJoiningMatch, earnForPostingMatch, earnForChallenge, earnForArcade, earnForWinningChallenge };
}
