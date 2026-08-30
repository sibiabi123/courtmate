'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Zap, Sparkles, X, Check, Shield, Star, Award,
  ArrowRight, Flame, CreditCard, Loader2
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { playClick, playCoin, playSuccess } from '@/lib/sound';

interface CoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRO_FEATURES = [
  { icon: '👑', title: 'AI Match Performance Coach', desc: 'Real-time tactical recommendations & personalized gameplans' },
  { icon: '✨', title: 'Holographic Card Customizer', desc: 'Unlock animated tier card foils, sound fanfares & custom borders' },
  { icon: '📈', title: 'Deep ELO Win Probability Graphs', desc: 'Advanced opponent matchup scouting & rating trends' },
  { icon: '⭐', title: 'Verified PRO Athlete Badge', desc: 'Distinguished profile star badge across leaderboards & feed' },
  { icon: '🪙', title: '2x Daily Claim Bonus', desc: 'Collect 100 🪙 daily instead of 50 🪙 every 24 hours' },
  { icon: '🛡️', title: 'Priority Matchmaking Queue', desc: 'Host pins appear at the top of the campus match feed' },
];

const COIN_PACKS = [
  { id: 'starter_coins', name: 'Starter Stash', coins: 250, price: '$0.99', inr: '₹49', tag: 'STARTER', color: '#00F0FF' },
  { id: 'challenger_coins', name: 'Challenger Stash', coins: 1000, price: '$2.99', inr: '₹199', tag: 'MOST POPULAR', bonus: '+20% Bonus', color: '#CCFF00' },
  { id: 'godmode_coins', name: 'Godmode Vault', coins: 5000, price: '$9.99', inr: '₹699', tag: 'BEST VALUE', bonus: '+50% Bonus', color: '#FFD700' },
];

export function CoinStoreModal({ isOpen, onClose }: CoinStoreModalProps) {
  const { currentUser, addCoins } = useUIStore();
  const [activeTab, setActiveTab] = useState<'pro' | 'coins'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePurchase = async (packageId: string, coinsAmount: number) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    playClick();
    setPurchasing(packageId);

    try {
      const res = await fetch('/api/checkout/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();
      if (data.success) {
        playSuccess();
        playCoin();
        addCoins(coinsAmount);

        try {
          const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
          emitCoinEarn({
            amount: coinsAmount,
            reason: `Purchased ${packageId.includes('pro') ? 'CourtMate PRO' : 'Coins'}!`,
            icon: '👑',
          });
        } catch {}

        setSuccessMsg(data.message);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 2000);
      }
    } catch {
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className="w-full max-w-2xl rounded-3xl border border-[#CCFF00]/30 bg-[#0A0C10] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 mb-1.5">
                  <Sparkles className="w-3 h-3" /> Athletic Store & Pass
                </div>
                <h2 className="font-outfit font-black text-2xl text-white">
                  Upgrade Your <span className="text-[#CCFF00]">Game</span>
                </h2>
              </div>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-[#a0a0b8] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-6 relative z-10">
              <button
                onClick={() => {
                  playClick();
                  setActiveTab('pro');
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'pro'
                    ? 'bg-[#CCFF00] text-[#040507] shadow-lg shadow-[#CCFF00]/20'
                    : 'text-[#a0a0b8] hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4" /> CourtMate PRO
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActiveTab('coins');
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'coins'
                    ? 'bg-[#CCFF00] text-[#040507] shadow-lg shadow-[#CCFF00]/20'
                    : 'text-[#a0a0b8] hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" /> Coin Packs 🪙
              </button>
            </div>

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> {successMsg}
              </motion.div>
            )}

            {/* TAB 1: COURTMATE PRO */}
            {activeTab === 'pro' && (
              <div className="space-y-6 relative z-10">
                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-[#6b6b80]'}`}>
                    Monthly
                  </span>
                  <button
                    onClick={() => {
                      playClick();
                      setBillingCycle(prev => (prev === 'monthly' ? 'annual' : 'monthly'));
                    }}
                    className="w-12 h-6 rounded-full bg-white/10 p-1 flex items-center border border-white/20 transition-all"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#CCFF00] transition-transform ${
                        billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-white' : 'text-[#6b6b80]'}`}>
                    Annual <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-black">SAVE 38%</span>
                  </span>
                </div>

                {/* PRO Plan Hero Banner */}
                <div className="p-6 rounded-3xl border border-[#CCFF00]/40 bg-gradient-to-br from-[#CCFF00]/10 via-transparent to-[#00F0FF]/10 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-[#CCFF00]" />
                        <h3 className="font-outfit font-black text-xl text-white">CourtMate PRO Athlete Pass</h3>
                      </div>
                      <p className="text-xs text-[#a0a0b8] mt-1">Unlock godmode analytics, AI coaching & priority queue</p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black font-outfit text-[#CCFF00]">
                        {billingCycle === 'monthly' ? '$3.99' : '$29.99'}
                        <span className="text-xs text-[#a0a0b8] font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      <div className="text-[11px] text-[#6b6b80] font-mono">
                        {billingCycle === 'monthly' ? 'or ₹99/month' : 'or ₹799/year'}
                      </div>
                    </div>
                  </div>

                  {/* Feature Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {PRO_FEATURES.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-base shrink-0">{f.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{f.title}</p>
                          <p className="text-[10px] text-[#6b6b80] leading-tight mt-0.5">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePurchase(billingCycle === 'monthly' ? 'pro_monthly' : 'pro_annual', billingCycle === 'monthly' ? 500 : 2500)}
                    disabled={Boolean(purchasing)}
                    className="btn-volt w-full py-3.5 flex items-center justify-center gap-2 text-sm shadow-xl font-black"
                  >
                    {purchasing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Crown className="w-4 h-4" /> Unlock CourtMate PRO Now (+{billingCycle === 'monthly' ? '500' : '2,500'} Bonus 🪙)</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COIN PACKS */}
            {activeTab === 'coins' && (
              <div className="space-y-4 relative z-10">
                <p className="text-xs text-[#a0a0b8] text-center mb-2">
                  Use coins to stake ranked 1v1 duels, enter tournaments, and claim custom trading card foil upgrades.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {COIN_PACKS.map(pack => (
                    <div
                      key={pack.id}
                      className="p-5 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#CCFF00]/40 transition-all flex flex-col justify-between relative group"
                    >
                      {pack.tag && (
                        <span className="absolute -top-2.5 right-4 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#CCFF00] text-[#040507] shadow-sm">
                          {pack.tag}
                        </span>
                      )}

                      <div>
                        <div className="text-3xl mb-2">🪙</div>
                        <h4 className="font-outfit font-black text-lg text-white">{pack.name}</h4>
                        <div className="text-2xl font-black text-[#CCFF00] font-mono mt-1">
                          +{pack.coins} 🪙
                        </div>
                        {pack.bonus && (
                          <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                            {pack.bonus}
                          </span>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-black text-white font-mono">{pack.price}</span>
                          <span className="text-xs text-[#6b6b80] font-mono">{pack.inr}</span>
                        </div>

                        <button
                          onClick={() => handlePurchase(pack.id, pack.coins)}
                          disabled={purchasing === pack.id}
                          className="w-full py-2.5 rounded-xl text-xs font-black bg-white/10 hover:bg-[#CCFF00] hover:text-[#040507] text-white border border-white/15 transition-all flex items-center justify-center gap-1 active:scale-95"
                        >
                          {purchasing === pack.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Claim Coins'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
