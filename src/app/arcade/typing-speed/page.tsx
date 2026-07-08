'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Clock, Keyboard } from 'lucide-react';

const sentences = [
  "The quick brown fox jumps over the lazy dog near the campus ground",
  "Cricket is the most popular sport played at VIT every evening",
  "Students gather at the basketball court for exciting pickup games",
  "Practice makes perfect when you play badminton every morning",
  "The football match at main ground starts at five in the evening",
  "Table tennis room is always packed during the lunch break hours",
  "VIT gaming hub helps students find teammates for every sport",
  "Volleyball tournaments bring together players from all hostels",
  "The swimming pool opens early morning for fitness enthusiasts",
  "Chess players meet at the common room for timed practice games",
];

export default function TypingSpeedGame() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [gameState, setGameState] = useState<'idle'|'playing'|'done'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(30);
  const [best, setBest] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const s = localStorage.getItem('vit-ghub-typing-best'); if(s) setBest(parseInt(s)); }, []);

  const startGame = () => {
    const t = sentences[Math.floor(Math.random() * sentences.length)];
    setText(t);
    setInput('');
    setGameState('playing');
    setStartTime(Date.now());
    setTimeLeft(30);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { finishGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const finishGame = useCallback(() => {
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const words = input.trim().split(/\s+/).filter(Boolean).length;
    const finalWpm = Math.round(words / elapsed) || 0;
    let correct = 0;
    for (let i = 0; i < input.length; i++) { if (input[i] === text[i]) correct++; }
    const acc = input.length > 0 ? Math.round((correct / input.length) * 100) : 0;
    setWpm(finalWpm);
    setAccuracy(acc);
    setGameState('done');
    if (finalWpm > best) { setBest(finalWpm); localStorage.setItem('vit-ghub-typing-best', finalWpm.toString()); }
  }, [input, text, startTime, best]);

  const handleInput = (val: string) => {
    setInput(val);
    if (val.length >= text.length) finishGame();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4"><ArrowLeft className="h-4 w-4" /> Back to Arcade</Link>
        <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">⌨️ <span className="gradient-text">Typing Speed</span></h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80] flex items-center gap-1"><Clock className="h-3 w-3" /></div><div className="text-xl font-bold text-[#00f5d4]">{timeLeft}s</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80]">WPM</div><div className="text-xl font-bold text-[#7b2ff7]">{gameState === 'done' ? wpm : '-'}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80]">Accuracy</div><div className="text-xl font-bold text-[#a0a0b8]">{gameState === 'done' ? `${accuracy}%` : '-'}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><div className="text-xs text-[#6b6b80] flex items-center gap-1"><Trophy className="h-3 w-3 text-[#ffd60a]" /></div><div className="text-xl font-bold text-[#ffd60a]">{best || '-'}</div></div>
      </div>

      <div className="w-full max-w-lg glass rounded-2xl p-6">
        {gameState === 'idle' && (
          <div className="text-center py-10">
            <Keyboard className="h-12 w-12 text-[#7b2ff7] mx-auto mb-4" />
            <p className="text-[#a0a0b8] mb-6">Type as fast as you can! 30 seconds on the clock.</p>
            <button onClick={startGame} className="rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-8 py-3 text-sm font-bold hover:scale-105 transition-transform">Start Typing</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <div className="rounded-xl bg-[#1a1a2e] p-4 mb-4 text-lg leading-relaxed font-mono">
              {text.split('').map((char, i) => (
                <span key={i} className={i < input.length ? (input[i] === char ? 'text-emerald-400' : 'text-red-400 bg-red-400/10') : i === input.length ? 'bg-[#7b2ff7]/30 text-white' : 'text-[#6b6b80]'}>{char}</span>
              ))}
            </div>
            <input ref={inputRef} value={input} onChange={e => handleInput(e.target.value)} className="w-full rounded-xl bg-[#0a0a0f] border border-white/10 px-4 py-3 text-lg font-mono focus:border-[#7b2ff7] focus:outline-none" placeholder="Start typing..." autoFocus />
          </div>
        )}

        {gameState === 'done' && (
          <div className="text-center py-6">
            <span className="text-5xl">{wpm >= 60 ? '🔥' : wpm >= 40 ? '⚡' : '💪'}</span>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mt-3 gradient-text">{wpm} WPM</h2>
            <p className="text-sm text-[#a0a0b8] mt-1">{accuracy}% accuracy</p>
            <button onClick={startGame} className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform mx-auto">
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
