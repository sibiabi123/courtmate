'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Play, Check, Shield, Zap, Award,
  Volume2, VolumeX, ExternalLink, Loader2
} from 'lucide-react';
import { playClick, playCoin, playSuccess } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardAmount?: number;
}

const SPONSOR_ADS = [
  {
    id: 'ad1',
    brand: 'Decathlon Campus Pro',
    category: 'Official Sports Equipment Partner',
    headline: 'Upgrade Your Match Gear with 20% Student Discount',
    description: 'BWF-certified rackets, durable turf footballs, and high-grip athletic shoes designed for campus warriors.',
    cta: 'Explore Student Deals (Code: COURTMATE20)',
    link: 'https://www.decathlon.com',
    bgColor: 'linear-gradient(135deg, #0082C3, #001E50)',
    tag: 'SPONSORED',
    badge: '🏸 Decathlon Sports',
  },
  {
    id: 'ad2',
    brand: 'Red Bull Energy & Esports',
    category: 'Official Endurance Sponsor',
    headline: 'Vitalizes Body and Mind for Peak Match Performance',
    description: 'Fuel your next 5v5 football derby or late-night campus tournament with ice-cold energy.',
    cta: 'Claim Campus Ambassador Pack',
    link: 'https://www.redbull.com',
    bgColor: 'linear-gradient(135deg, #DB0A40, #0C2340)',
    tag: 'SPONSORED',
    badge: '⚡ Red Bull Campus',
  },
  {
    id: 'ad3',
    brand: 'Fast&Up Electrolytes & Protein',
    category: 'Hydration & Recovery Partner',
    headline: 'Instant Cramp Relief & Fast Rehydration on Court',
    description: 'Informed-Choice certified effervescent hydration tablets used by national athletes.',
    cta: 'Get Free Hydration Sample',
    link: 'https://www.fastandup.com',
    bgColor: 'linear-gradient(135deg, #FF6B00, #803000)',
    tag: 'SPONSORED',
    badge: '💧 Fast&Up Nutrition',
  },
];

export function RewardedAdModal({
  isOpen,
  onClose,
  rewardAmount = 50,
}: RewardedAdModalProps) {
  const { addCoins, currentUser } = useUIStore();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const ad = SPONSOR_ADS[currentAdIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentAdIndex(Math.floor(Math.random() * SPONSOR_ADS.length));
      setCountdown(10);
      setIsPlaying(true);
      setCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isPlaying && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !completed) {
      setCompleted(true);
      playSuccess();
      playCoin();
      addCoins(rewardAmount, 'Watched Rewarded Sponsor Ad');
      
      try {
        import('@/hooks/useCoinEarn').then(({ emitCoinEarn }) => {
          emitCoinEarn({
            amount: rewardAmount,
            reason: `Watched Sponsor Clip! (+${rewardAmount} 🪙)`,
            icon: '🎁',
          });
        });
      } catch {}
    }
    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, countdown, completed, rewardAmount, addCoins]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0A0C10] overflow-hidden shadow-2xl relative"
          >
            {/* Top Timer Bar */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#08090C]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/80 border border-white/10">
                  {ad.tag}
                </span>
                <span className="text-xs font-bold text-[#CCFF00] flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> +{rewardAmount} 🪙 Reward
                </span>
              </div>

              <div className="flex items-center gap-3">
                {countdown > 0 ? (
                  <span className="text-xs font-mono font-black text-white bg-white/10 px-2.5 py-1 rounded-lg">
                    Reward in {countdown}s
                  </span>
                ) : (
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Claimed!
                  </span>
                )}

                {completed && (
                  <button
                    onClick={() => {
                      playClick();
                      onClose();
                    }}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Video & Sponsor Screen */}
            <div
              className="p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px]"
              style={{ background: ad.bgColor }}
            >
              <div className="relative z-10">
                <span className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                  {ad.category}
                </span>
                <h3 className="font-outfit font-black text-2xl text-white mb-2 leading-tight">
                  {ad.brand}
                </h3>
                <p className="text-sm font-bold text-white/90 mb-3">
                  {ad.headline}
                </p>
                <p className="text-xs text-white/75 leading-relaxed max-w-sm">
                  {ad.description}
                </p>
              </div>

              {/* Progress Line */}
              <div className="relative z-10 pt-6">
                <div className="h-1.5 rounded-full bg-white/20 overflow-hidden mb-3">
                  <div
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                    className="h-full bg-[#CCFF00] transition-all duration-1000 ease-linear"
                  />
                </div>

                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-white text-[#040507] hover:bg-white/90 shadow-lg active:scale-95 transition-all"
                >
                  {ad.cta} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#08090C] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#6b6b80]">
                CourtMate Ad Rewards Network · 100% Free Athletic Coins
              </span>
              {completed && (
                <button
                  onClick={() => {
                    playClick();
                    onClose();
                  }}
                  className="btn-volt px-4 py-1.5 text-xs font-black"
                >
                  Done
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
