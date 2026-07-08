'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react';

const emojis = ['🏏','⚽','🏸','🏀','🏓','🎮','🏐','🎯','♟️','🏊','🤼','🎾'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<{id:number;emoji:string;flipped:boolean;matched:boolean}[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(999);

  const initGame = () => {
    const picked = emojis.slice(0, 8);
    const deck = shuffle([...picked, ...picked]).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setTimer(0);
    setRunning(true);
  };

  useEffect(() => { initGame(); const s = localStorage.getItem('vit-ghub-memory-best'); if(s) setBest(parseInt(s)); }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const handleClick = (id: number) => {
    if (flipped.length === 2 || cards[id].matched || cards[id].flipped) return;
    const newCards = cards.map(c => c.id === id ? {...c, flipped: true} : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a || c.id === b ? {...c, matched: true} : c));
          setMatches(m => {
            const nm = m + 1;
            if (nm === 8) {
              setGameOver(true);
              setRunning(false);
              setMoves(prev => {
                const finalMoves = prev;
                if (finalMoves < best) { setBest(finalMoves); localStorage.setItem('vit-ghub-memory-best', finalMoves.toString()); }
                return prev;
              });
            }
            return nm;
          });
          setFlipped([]);
        }, 300);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a || c.id === b ? {...c, flipped: false} : c));
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4"><ArrowLeft className="h-4 w-4" /> Back to Arcade</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">🧠 <span className="gradient-text">Memory</span></h1>
          <button onClick={initGame} className="glass rounded-lg p-2 hover:bg-white/10"><RotateCcw className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80]">Moves</div><div className="text-xl font-bold text-[#00f5d4]">{moves}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80] flex items-center gap-1"><Clock className="h-3 w-3" /> Time</div><div className="text-xl font-bold text-[#a0a0b8]">{timer}s</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80] flex items-center gap-1"><Trophy className="h-3 w-3 text-[#ffd60a]" /> Best</div><div className="text-xl font-bold text-[#ffd60a]">{best < 999 ? best : '-'}</div></div>
      </div>

      <div className="glass rounded-2xl p-3">
        <div className="grid grid-cols-4 gap-2">
          {cards.map(card => (
            <motion.button key={card.id} whileTap={{ scale: 0.95 }} onClick={() => handleClick(card.id)}
              className={`h-[72px] w-[72px] rounded-xl flex items-center justify-center text-3xl transition-all ${card.matched ? 'bg-emerald-500/20 border border-emerald-500/30' : card.flipped ? 'bg-[#7b2ff7]/20 border border-[#7b2ff7]/30' : 'bg-[#1a1a2e] hover:bg-[#25253d] cursor-pointer'}`}>
              {(card.flipped || card.matched) ? (
                <motion.span initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}>{card.emoji}</motion.span>
              ) : (
                <span className="text-[#6b6b80] text-lg">?</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {gameOver && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-lg font-bold font-[family-name:var(--font-outfit)]">You Win!</p>
          <p className="text-sm text-[#a0a0b8] mb-4">{moves} moves in {timer}s</p>
          <button onClick={initGame} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform mx-auto">
            <RotateCcw className="h-4 w-4" /> Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
