'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Clock, Zap } from 'lucide-react';

type Op = '+' | '-' | '×';

function genProblem(level: number): { q: string; answer: number } {
  const ops: Op[] = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * (level > 5 ? 3 : 2))];
  const max = Math.min(10 + level * 5, 99);
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * Math.min(max, 20)) + 1;
  if (op === '-' && a < b) [a, b] = [b, a];
  if (op === '×') { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; }
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { q: `${a} ${op} ${b}`, answer };
}

export default function QuickMathGame() {
  const [problem, setProblem] = useState({ q: '', answer: 0 });
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'idle'|'playing'|'done'>('idle');
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [best, setBest] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => { const s = localStorage.getItem('vit-ghub-math-best'); if(s) setBest(parseInt(s)); }, []);

  const next = useCallback((lvl: number) => { setProblem(genProblem(lvl)); setInput(''); setFeedback(null); }, []);

  const startGame = () => { setScore(0); setStreak(0); setTimeLeft(30); setLevel(1); setGameState('playing'); next(1); };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => setTimeLeft(t => { if (t <= 1) { setGameState('done'); return 0; } return t - 1; }), 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'done' && score > best) { setBest(score); localStorage.setItem('vit-ghub-math-best', score.toString()); }
  }, [gameState, score, best]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    const val = parseInt(input);
    if (val === problem.answer) {
      const pts = 10 + streak * 2;
      setScore(s => s + pts);
      setStreak(s => s + 1);
      setFeedback('correct');
      const newLevel = Math.floor((score + pts) / 50) + 1;
      setLevel(newLevel);
      setTimeLeft(t => Math.min(t + 2, 30));
      setTimeout(() => next(newLevel), 200);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(() => next(level), 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4"><ArrowLeft className="h-4 w-4" /> Back to Arcade</Link>
        <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">🧮 <span className="gradient-text">Quick Math</span></h1>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80]">Score</div><div className="text-xl font-bold text-[#00f5d4]">{score}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80] flex items-center gap-1"><Clock className="h-3 w-3" /></div><div className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-[#a0a0b8]'}`}>{timeLeft}s</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80] flex items-center gap-1"><Zap className="h-3 w-3" /></div><div className="text-xl font-bold text-[#f59e0b]">{streak}🔥</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80] flex items-center gap-1"><Trophy className="h-3 w-3 text-[#ffd60a]" /></div><div className="text-xl font-bold text-[#ffd60a]">{best || '-'}</div></div>
      </div>

      <div className="w-full max-w-sm glass rounded-2xl p-6">
        {gameState === 'idle' && (
          <div className="text-center py-10">
            <span className="text-5xl block mb-4">🧮</span>
            <p className="text-[#a0a0b8] mb-6">Solve math problems as fast as you can! +2s for correct answers.</p>
            <button onClick={startGame} className="rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-8 py-3 text-sm font-bold hover:scale-105 transition-transform">Start!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center">
            <div className="text-xs text-[#6b6b80] mb-2">Level {level}</div>
            <motion.div key={problem.q} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl font-bold font-[family-name:var(--font-outfit)] mb-6 py-6 rounded-xl ${feedback === 'correct' ? 'bg-emerald-500/10 text-emerald-400' : feedback === 'wrong' ? 'bg-red-500/10 text-red-400' : 'text-white'}`}>
              {problem.q} = ?
            </motion.div>
            <form onSubmit={submit}>
              <input type="number" value={input} onChange={e => setInput(e.target.value)} autoFocus
                className="w-full text-center text-2xl font-bold rounded-xl bg-[#0a0a0f] border border-white/10 px-4 py-3 focus:border-[#7b2ff7] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="?" />
            </form>
          </div>
        )}

        {gameState === 'done' && (
          <div className="text-center py-6">
            <span className="text-5xl">{score >= 100 ? '🏆' : score >= 50 ? '⚡' : '💪'}</span>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mt-3 gradient-text">{score} pts</h2>
            <p className="text-sm text-[#a0a0b8] mt-1">Level {level} reached</p>
            <button onClick={startGame} className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform mx-auto">
              <RotateCcw className="h-4 w-4" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
