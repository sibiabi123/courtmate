'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { emitCoinEarn } from '@/hooks/useCoinEarn';
import { sound } from '@/lib/sound';
import {
  Trophy, Zap, Users, Swords, Gamepad2, Gift, CheckCircle2,
  ArrowRight, Star, X, Flame
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    icon: Trophy,
    emoji: '🏆',
    title: 'Welcome to CourtMate!',
    subtitle: 'The world\'s best sports matchmaking platform',
    desc: 'Find players for Cricket, Football, Badminton, Basketball, Tennis and more. Challenge rivals, climb ELO tiers, and win real prize coins.',
    ctaLabel: 'Let\'s Go! →',
    color: '#ffd60a',
    bg: 'from-[#7b2ff7]/30 via-[#111118] to-[#00f5d4]/20',
  },
  {
    id: 'earn',
    icon: Gift,
    emoji: '🪙',
    title: 'Earn CourtMate Coins',
    subtitle: 'Get rewarded for every action',
    desc: 'Earn coins by joining matches (+10🪙), posting lobbies (+15🪙), winning 1v1 duels (+50🪙), and daily login bonuses (+50🪙). Spend them in the Arcade VIP Store!',
    ctaLabel: 'How to Play →',
    color: '#00f5d4',
    bg: 'from-[#ffd60a]/20 via-[#111118] to-[#ff006e]/20',
    rewards: [
      { action: 'Join a Match', coins: '+10 🪙' },
      { action: 'Post a Lobby', coins: '+15 🪙' },
      { action: 'Win a Duel', coins: '+50 🪙' },
      { action: 'Daily Login', coins: '+50 🪙' },
    ],
  },
  {
    id: 'first_action',
    icon: Zap,
    emoji: '⚡',
    title: 'Your First 100 Coins, Free!',
    subtitle: 'Welcome bonus — claim it now',
    desc: 'We\'ve given you 100 starter coins just for joining CourtMate. Post your first match or join an active lobby to earn more!',
    ctaLabel: 'Claim & Explore →',
    color: '#ff006e',
    bg: 'from-[#00f5d4]/20 via-[#111118] to-[#7b2ff7]/30',
  },
];

export function OnboardingFlow() {
  const { isAuthenticated, hasCompletedOnboarding, completeOnboarding, currentUser, updateCoins } = useUIStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show onboarding for authenticated users who haven't completed it
    if (isAuthenticated && !hasCompletedOnboarding) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasCompletedOnboarding]);

  const handleNext = () => {
    sound.playClick();
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    sound.playVictory();
    // Award welcome bonus
    updateCoins(100, 'Welcome Bonus 🎉');
    emitCoinEarn({ amount: 100, reason: 'Welcome Bonus — First Time Setup!', icon: '🎉' });
    completeOnboarding();
    setVisible(false);
  };

  const handleSkip = () => {
    sound.playClick();
    completeOnboarding();
    setVisible(false);
  };

  const current = ONBOARDING_STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-lg"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`w-full max-w-md rounded-[32px] border border-white/15 bg-gradient-to-br ${current.bg} p-8 relative overflow-hidden shadow-2xl`}
              style={{ boxShadow: `0 30px 80px rgba(0,0,0,0.8), 0 0 60px ${current.color}22` }}
            >
              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="absolute top-5 right-5 p-2 rounded-xl text-[#6b6b80] hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Step dots */}
              <div className="flex items-center gap-2 mb-8">
                {ONBOARDING_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: idx === step ? '24px' : '8px',
                      background: idx === step ? current.color : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>

              {/* Emoji hero */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className="text-7xl mb-6 leading-none text-center"
              >
                {current.emoji}
              </motion.div>

              {/* Content */}
              <div className="text-center mb-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: current.color }}>
                  {current.subtitle}
                </p>
                <h2 className="font-outfit font-black text-2xl text-white mb-3">
                  {current.title}
                </h2>
                <p className="text-sm text-[#a0a0b8] leading-relaxed">
                  {current.desc}
                </p>
              </div>

              {/* Reward table for step 2 */}
              {current.rewards && (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {current.rewards.map((r) => (
                    <div key={r.action} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <span className="text-[#a0a0b8]">{r.action}</span>
                      <span className="font-black text-[#ffd60a]">{r.coins}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-outfit font-black text-white text-base shadow-2xl transition-all"
                style={{
                  background: `linear-gradient(135deg, ${current.color}, #7b2ff7)`,
                  boxShadow: `0 0 30px ${current.color}44`,
                }}
              >
                {step === ONBOARDING_STEPS.length - 1 ? (
                  <>🎉 Claim 100 Coins & Explore!</>
                ) : (
                  <>{current.ctaLabel}</>
                )}
              </motion.button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
