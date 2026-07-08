'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Trophy, Star } from 'lucide-react';
import { mockGames } from '@/data/mock-data';

const arcadeGames = mockGames.filter(g => g.category === 'arcade');

const slugMap: Record<string, string> = {
  'Snake': 'snake',
  'Tic-Tac-Toe': 'tic-tac-toe',
  'Memory Game': 'memory-game',
  '2048': '2048',
  'Typing Speed': 'typing-speed',
  'Quick Math': 'quick-math',
  'Brick Breaker': 'brick-breaker',
  'Wordle': 'wordle',
  'Sports Trivia': 'trivia',
};

const gameDetails: Record<string, { desc: string; color: string; gradient: string }> = {
  'Snake': { desc: 'Classic snake game with neon graphics. Eat, grow, survive!', color: '#10b981', gradient: 'from-emerald-600/20 to-emerald-900/20' },
  'Tic-Tac-Toe': { desc: 'Quick strategy game. Play vs AI or a friend!', color: '#7b2ff7', gradient: 'from-purple-600/20 to-purple-900/20' },
  'Memory Game': { desc: 'Flip cards and match pairs. Test your memory!', color: '#ec4899', gradient: 'from-pink-600/20 to-pink-900/20' },
  '2048': { desc: 'Merge tiles to reach 2048. Addictively simple!', color: '#f59e0b', gradient: 'from-amber-600/20 to-amber-900/20' },
  'Typing Speed': { desc: 'How fast can you type? Race against the clock!', color: '#06b6d4', gradient: 'from-cyan-600/20 to-cyan-900/20' },
  'Quick Math': { desc: 'Speed math challenge. Calculate under pressure!', color: '#8b5cf6', gradient: 'from-violet-600/20 to-violet-900/20' },
  'Brick Breaker': { desc: 'Classic breakout game. Smash bricks with your paddle!', color: '#ef4444', gradient: 'from-red-600/20 to-red-900/20' },
  'Wordle': { desc: 'Guess the 5-letter sports word in 6 tries!', color: '#22c55e', gradient: 'from-green-600/20 to-green-900/20' },
  'Sports Trivia': { desc: 'Test your sports IQ with fun trivia questions!', color: '#3b82f6', gradient: 'from-blue-600/20 to-blue-900/20' },
};

export default function ArcadePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#050508]/50">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-[family-name:var(--font-outfit)] font-bold mb-3">
              👾 <span className="gradient-text">Arcade</span>
            </h1>
            <p className="text-[#6b6b80] max-w-md mx-auto">
              Play browser games, climb the leaderboard, and compete with other VIT students
            </p>
          </motion.div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {arcadeGames.map((game, i) => {
            const details = gameDetails[game.name] || { desc: game.description, color: '#7b2ff7', gradient: 'from-purple-600/20 to-purple-900/20' };
            const slug = slugMap[game.name] || game.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/arcade/${slug}`} className="block group">
                  <div className="glass rounded-2xl overflow-hidden card-hover">
                    {/* Game Preview */}
                    <div className={`h-44 bg-gradient-to-br ${details.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                        {game.icon}
                      </span>
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-7 w-7 text-white fill-white" />
                        </div>
                      </div>
                      {/* Category badge */}
                      <span className="absolute top-3 left-3 text-xs glass rounded-full px-2.5 py-0.5 font-medium text-[#a0a0b8]">
                        {game.category === 'arcade' ? '🕹️ Arcade' : '♟️ Board'}
                      </span>
                    </div>

                    {/* Game Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-1 group-hover:text-[#00f5d4] transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-xs text-[#6b6b80] mb-4 leading-relaxed">
                        {details.desc}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-[#a0a0b8]">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-[#ffd60a]" />
                            #1: 999
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-[#f59e0b]" />
                            {Math.floor(Math.random() * 500 + 100)} plays
                          </span>
                        </div>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: details.color + '20',
                            color: details.color,
                          }}
                        >
                          Play Now
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
