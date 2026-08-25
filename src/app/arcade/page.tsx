'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Trophy, Star, Gift, Sparkles, Zap, Flame, Award,
  CheckCircle2, ShoppingBag, Lock, Crown
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { sound } from '@/lib/sound';

const ARCADE_GAMES = [
  { id: 'g-2048', name: '2048 Number Crunch', slug: '2048', icon: '🔢', color: '#f59e0b', desc: 'Merge matching numeric tiles to reach the legendary 2048 score!', plays: '1.2k plays', reward: '+15 🪙' },
  { id: 'g-snake', name: 'Cyber Neon Snake', slug: 'snake', icon: '🐍', color: '#10b981', desc: 'Classic arcade snake with high-speed neon cyber fruit pickups.', plays: '2.4k plays', reward: '+20 🪙' },
  { id: 'g-typing', name: 'Speed Type Grand Prix', slug: 'typing-speed', icon: '⌨️', color: '#06b6d4', desc: 'Test your words-per-minute reflex speed on sports quotes.', plays: '890 plays', reward: '+25 🪙' },
  { id: 'g-math', name: 'Quick Math Blitz', slug: 'quick-math', icon: '⚡', color: '#8b5cf6', desc: 'High-pressure mental arithmetic challenge under clock pressure.', plays: '640 plays', reward: '+20 🪙' },
  { id: 'g-brick', name: 'Retro Brick Breaker', slug: 'brick-breaker', icon: '🧱', color: '#ef4444', desc: 'Smash glowing neon barriers with high-velocity paddle bounces.', plays: '1.5k plays', reward: '+30 🪙' },
  { id: 'g-memory', name: 'Memory Grid Pairs', slug: 'memory-game', icon: '🧠', color: '#ec4899', desc: 'Flip and match hidden athletic symbols in minimum moves.', plays: '980 plays', reward: '+15 🪙' },
  { id: 'g-tictac', name: 'Cyber Tic-Tac-Toe', slug: 'tic-tac-toe', icon: '❌', color: '#7b2ff7', desc: 'Unbeatable AI or head-to-head tactical grid warfare.', plays: '1.8k plays', reward: '+10 🪙' },
  { id: 'g-wordle', name: 'Sports Wordle Guesser', slug: 'wordle', icon: '🟩', color: '#22c55e', desc: 'Guess the 5-letter sports term in 6 tactical guesses.', plays: '730 plays', reward: '+25 🪙' },
  { id: 'g-trivia', name: 'Grand Sports Trivia', slug: 'trivia', icon: '🎯', color: '#3b82f6', desc: 'Test your world athletic IQ across football, cricket & tennis.', plays: '1.1k plays', reward: '+30 🪙' },
];

const COSMETIC_ITEMS = [
  { id: 'c1', name: '⚡ Neon Cyber Glow Title', price: 150, type: 'Title', icon: '⚡', owned: false },
  { id: 'c2', name: '👑 Gold Champion Card Frame', price: 300, type: 'Avatar Frame', icon: '👑', owned: false },
  { id: 'c3', name: '🔥 Flame Duelist Badge', price: 200, type: 'Profile Badge', icon: '🔥', owned: false },
  { id: 'c4', name: '💎 Diamond Hologram Aura', price: 500, type: 'Card Aura', icon: '💎', owned: false },
];

export default function ArcadePage() {
  const { currentUser, updateCoins } = useUIStore();
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);
  const [showShop, setShowShop] = useState(false);

  const handleClaimDaily = () => {
    if (claimedDaily) return;
    sound.playCoin();
    sound.playVictory();
    updateCoins(50);
    setClaimedDaily(true);
  };

  const handleBuyItem = (item: typeof COSMETIC_ITEMS[0]) => {
    if (!currentUser || currentUser.coins < item.price || inventory.includes(item.id)) return;
    sound.playCoin();
    updateCoins(-item.price);
    setInventory(prev => [...prev, item.id]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-24 px-4 text-white">
      <div className="max-w-6xl mx-auto">

        {/* ── ARCADE HERO BANNER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#ec4899]/15 text-[#ec4899] border border-[#ec4899]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Cybernetic Mini-Games & Daily Rewards
            </div>
            <h1 className="text-4xl font-black font-outfit text-white flex items-center gap-3">
              Arcade <span style={{ background: 'linear-gradient(135deg, #ec4899, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pavilion</span>
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-1">Play mini-games, earn CourtMate coins, and unlock VIP profile cosmetics.</p>
          </div>

          {/* Daily Quest Claim Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 rounded-3xl border border-white/10 bg-[#111118] flex items-center gap-4 shadow-xl"
          >
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#ffd60a]/20 border border-[#ffd60a]/40 text-[#ffd60a] shrink-0">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                Daily Bonus <span className="text-[#ffd60a] font-mono">+50 🪙</span>
              </div>
              <p className="text-[11px] text-[#6b6b80] mb-2">Claim free coins every 24 hours</p>
              <button
                onClick={handleClaimDaily}
                disabled={claimedDaily}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  claimedDaily
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-white shadow-lg'
                }`}
                style={!claimedDaily ? { background: 'linear-gradient(135deg, #ffd60a, #ff006e)' } : {}}
              >
                {claimedDaily ? '✅ Claimed for Today' : 'Claim +50 Coins'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── ARCADE GAMES GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {ARCADE_GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-white/25 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-3 rounded-2xl bg-white/5 border border-white/10">{game.icon}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ffd60a]/10 text-[#ffd60a] border border-[#ffd60a]/20">
                    {game.reward}
                  </span>
                </div>

                <h3 className="font-outfit font-black text-white text-lg mb-1 group-hover:text-[#00f5d4] transition-colors">
                  {game.name}
                </h3>
                <p className="text-xs text-[#a0a0b8] line-clamp-2 mb-4 leading-relaxed font-body">
                  {game.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-[#6b6b80] font-medium">{game.plays}</span>
                <Link
                  href={`/arcade/${game.slug}`}
                  onClick={() => sound.playClick()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${game.color}, #7b2ff7)` }}
                >
                  <Play className="w-3.5 h-3.5" /> Play Game
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── VIP COSMETICS & TITLES STORE ── */}
        <div className="rounded-3xl border border-white/10 bg-[#111118]/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-[#7b2ff7]/20 border border-[#7b2ff7]/40 text-[#00f5d4]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-outfit font-black text-xl text-white">VIP Coin Cosmetics Store</h3>
                <p className="text-xs text-[#a0a0b8]">Redeem your earned coins for exclusive chat glows and card titles</p>
              </div>
            </div>

            <div className="text-right flex items-center gap-2">
              <span className="text-xs text-[#6b6b80]">Your Balance:</span>
              <span className="text-base font-black text-[#ffd60a]">🪙 {currentUser?.coins || 100} Coins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COSMETIC_ITEMS.map(item => {
              const isOwned = inventory.includes(item.id);
              const canAfford = currentUser && currentUser.coins >= item.price;

              return (
                <div key={item.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h4 className="font-outfit font-bold text-sm text-white mb-1">{item.name}</h4>
                    <span className="text-[10px] font-semibold text-[#a0a0b8] uppercase tracking-wider block mb-4">{item.type}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs font-black text-[#ffd60a]">🪙 {item.price}</span>
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={isOwned || !canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isOwned
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : canAfford
                          ? 'bg-[#7b2ff7] hover:bg-[#6c28d9] text-white shadow-md'
                          : 'bg-white/5 text-[#6b6b80] cursor-not-allowed'
                      }`}
                    >
                      {isOwned ? 'Unlocked' : canAfford ? 'Purchase' : 'Need Coins'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
