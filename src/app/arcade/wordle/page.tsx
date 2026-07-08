'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Delete, Trophy } from 'lucide-react';

const WORDS = ['SPORT','MATCH','SQUAD','FIELD','COURT','SERVE','PITCH','SCORE','TRACK','MEDAL','POINT','BLOCK','SPIKE','CATCH','SWING','THROW','PUNCH','POWER','SPEED','FINAL'];

export default function WordleGame() {
  const [target] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const submitGuess = useCallback(() => {
    if (current.length !== 5) return;
    const newGuesses = [...guesses, current.toUpperCase()];
    setGuesses(newGuesses);
    setCurrent('');
    if (current.toUpperCase() === target) { setWon(true); setGameOver(true); }
    else if (newGuesses.length >= 6) { setGameOver(true); }
  }, [current, guesses, target]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') { submitGuess(); return; }
    if (key === 'BACK') { setCurrent(c => c.slice(0, -1)); return; }
    if (current.length < 5 && /^[A-Z]$/.test(key)) setCurrent(c => c + key);
  }, [current, gameOver, submitGuess]);

  const getColor = (letter: string, idx: number, guess: string): string => {
    if (guess[idx] === target[idx]) return 'bg-emerald-600 border-emerald-500';
    if (target.includes(guess[idx])) return 'bg-amber-600 border-amber-500';
    return 'bg-[#25253d] border-[#25253d]';
  };

  const usedLetters: Record<string, string> = {};
  guesses.forEach(g => g.split('').forEach((l, i) => {
    if (g[i] === target[i]) usedLetters[l] = 'bg-emerald-600';
    else if (target.includes(l) && usedLetters[l] !== 'bg-emerald-600') usedLetters[l] = 'bg-amber-600';
    else if (!usedLetters[l]) usedLetters[l] = 'bg-[#1a1a2e]';
  }));

  const keys = [['Q','W','E','R','T','Y','U','I','O','P'], ['A','S','D','F','G','H','J','K','L'], ['ENTER','Z','X','C','V','B','N','M','BACK']];

  const reset = () => { window.location.reload(); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4"><ArrowLeft className="h-4 w-4" /> Back to Arcade</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">📝 <span className="gradient-text">Wordle</span></h1>
          <button onClick={reset} className="glass rounded-lg p-2 hover:bg-white/10"><RotateCcw className="h-4 w-4" /></button>
        </div>
        <p className="text-xs text-[#6b6b80] mt-1">Guess the 5-letter sports word in 6 tries</p>
      </div>

      {/* Grid */}
      <div className="space-y-1.5 mb-6">
        {Array.from({ length: 6 }).map((_, row) => {
          const guess = guesses[row];
          const isCurrentRow = row === guesses.length && !gameOver;
          return (
            <div key={row} className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, col) => {
                const letter = guess ? guess[col] : (isCurrentRow ? current[col] : '');
                const colorClass = guess ? getColor(letter, col, guess) : 'border-white/10';
                return (
                  <motion.div key={col} animate={guess ? { rotateX: [0, 90, 0] } : {}} transition={{ delay: col * 0.1, duration: 0.4 }}
                    className={`h-14 w-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold font-[family-name:var(--font-outfit)] ${colorClass} ${isCurrentRow && col === current.length ? 'border-[#7b2ff7]' : ''}`}>
                    {letter || ''}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Result */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <p className="text-xl font-bold font-[family-name:var(--font-outfit)]">{won ? '🎉 Brilliant!' : `💀 The word was: ${target}`}</p>
          {won && <p className="text-sm text-[#a0a0b8]">Solved in {guesses.length}/6 tries</p>}
        </motion.div>
      )}

      {/* Keyboard */}
      <div className="space-y-1.5">
        {keys.map((row, r) => (
          <div key={r} className="flex justify-center gap-1">
            {row.map(key => (
              <button key={key} onClick={() => handleKey(key)}
                className={`rounded-lg font-bold transition-all active:scale-95 ${key.length > 1 ? 'px-3 py-3 text-[10px]' : 'w-9 h-11 text-sm'} ${usedLetters[key] || 'bg-[#25253d] hover:bg-[#35354d]'} ${key === 'ENTER' ? 'bg-[#7b2ff7] text-white' : ''}`}>
                {key === 'BACK' ? <Delete className="h-4 w-4 mx-auto" /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
