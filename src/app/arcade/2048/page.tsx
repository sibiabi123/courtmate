'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

type Board = (number | null)[][];

const SIZE = 4;

function createBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function addRandom(board: Board): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) => row.forEach((cell, c) => { if (!cell) empty.push([r, c]); }));
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slide(row: (number | null)[]): { result: (number | null)[]; score: number } {
  let score = 0;
  const filtered = row.filter(x => x !== null) as number[];
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { result: merged.map(x => x || null), score };
}

function moveLeft(board: Board): { board: Board; score: number } {
  let totalScore = 0;
  const newBoard = board.map(row => {
    const { result, score } = slide(row);
    totalScore += score;
    return result;
  });
  return { board: newBoard, score: totalScore };
}

function rotateRight(board: Board): Board {
  return board[0].map((_, c) => board.map(row => row[c]).reverse());
}

function move(board: Board, dir: 'left' | 'right' | 'up' | 'down'): { board: Board; score: number } {
  let b = board.map(r => [...r]);
  let rotations = { left: 0, down: 1, right: 2, up: 3 }[dir];
  for (let i = 0; i < rotations; i++) b = rotateRight(b);
  const { board: moved, score } = moveLeft(b);
  b = moved;
  for (let i = 0; i < (4 - rotations) % 4; i++) b = rotateRight(b);
  return { board: b, score };
}

function hasValidMove(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return true;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function boardsEqual(a: Board, b: Board): boolean {
  return a.every((row, r) => row.every((cell, c) => cell === b[r][c]));
}

const tileColors: Record<number, { bg: string; text: string; shadow?: string }> = {
  2: { bg: 'bg-slate-700', text: 'text-slate-200' },
  4: { bg: 'bg-slate-600', text: 'text-slate-100' },
  8: { bg: 'bg-orange-600', text: 'text-white' },
  16: { bg: 'bg-orange-500', text: 'text-white' },
  32: { bg: 'bg-red-500', text: 'text-white' },
  64: { bg: 'bg-red-600', text: 'text-white' },
  128: { bg: 'bg-yellow-500', text: 'text-white', shadow: 'shadow-yellow-500/30' },
  256: { bg: 'bg-yellow-400', text: 'text-gray-900', shadow: 'shadow-yellow-400/30' },
  512: { bg: 'bg-purple-500', text: 'text-white', shadow: 'shadow-purple-500/30' },
  1024: { bg: 'bg-purple-600', text: 'text-white', shadow: 'shadow-purple-600/40' },
  2048: { bg: 'bg-cyan-400', text: 'text-gray-900', shadow: 'shadow-cyan-400/50' },
};

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() => addRandom(addRandom(createBoard())));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vit-ghub-2048-best');
    if (saved) setBestScore(parseInt(saved));
  }, []);

  const handleMove = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    setBoard(prev => {
      const { board: moved, score: gained } = move(prev, dir);
      if (boardsEqual(prev, moved)) return prev;

      const withNew = addRandom(moved);
      setScore(s => {
        const newS = s + gained;
        if (newS > bestScore) {
          setBestScore(newS);
          localStorage.setItem('vit-ghub-2048-best', newS.toString());
        }
        return newS;
      });

      // Check for 2048
      if (withNew.some(row => row.some(c => c === 2048)) && !won) {
        setWon(true);
      }

      if (!hasValidMove(withNew)) {
        setGameOver(true);
      }

      return withNew;
    });
  }, [gameOver, bestScore, won]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); handleMove(dir); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  // Touch/swipe support
  useEffect(() => {
    let startX = 0, startY = 0;
    const handleTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const absDx = Math.abs(dx), absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < 30) return;
      if (absDx > absDy) handleMove(dx > 0 ? 'right' : 'left');
      else handleMove(dy > 0 ? 'down' : 'up');
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => { window.removeEventListener('touchstart', handleTouchStart); window.removeEventListener('touchend', handleTouchEnd); };
  }, [handleMove]);

  const resetGame = () => { setBoard(addRandom(addRandom(createBoard()))); setScore(0); setGameOver(false); setWon(false); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Arcade
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">
            🔢 <span className="gradient-text">2048</span>
          </h1>
          <button onClick={resetGame} className="glass rounded-lg p-2 hover:bg-white/10 transition-colors">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="flex gap-4 mb-6">
        <div className="glass rounded-xl px-5 py-2 text-center">
          <div className="text-xs text-[#6b6b80]">Score</div>
          <div className="text-xl font-bold text-[#00f5d4] font-[family-name:var(--font-outfit)]">{score}</div>
        </div>
        <div className="glass rounded-xl px-5 py-2 text-center">
          <div className="text-xs text-[#6b6b80] flex items-center gap-1"><Trophy className="h-3 w-3 text-[#ffd60a]" /> Best</div>
          <div className="text-xl font-bold text-[#ffd60a] font-[family-name:var(--font-outfit)]">{bestScore}</div>
        </div>
      </div>

      {/* Board */}
      <div className="glass rounded-2xl p-3 relative">
        <div className="grid grid-cols-4 gap-2">
          {board.flat().map((cell, i) => {
            const style = cell ? tileColors[cell] || { bg: 'bg-emerald-400', text: 'text-white', shadow: 'shadow-emerald-400/50' } : { bg: '', text: '', shadow: '' };
            return (
              <div key={i} className={`h-[72px] w-[72px] rounded-xl flex items-center justify-center font-bold font-[family-name:var(--font-outfit)] transition-all ${cell ? `${style.bg} ${style.text} ${style.shadow || ''} shadow-lg` : 'bg-[#1a1a2e]'} ${cell && cell >= 1024 ? 'text-lg' : cell && cell >= 128 ? 'text-xl' : 'text-2xl'}`}>
                <AnimatePresence mode="popLayout">
                  {cell && (
                    <motion.span key={cell + '-' + i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-3 rounded-xl bg-black/80 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2">💀</span>
            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-1">Game Over</h2>
            <p className="text-2xl font-bold gradient-text mb-4">{score}</p>
            <button onClick={resetGame} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform">
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </motion.div>
        )}
      </div>

      <p className="mt-4 text-xs text-[#6b6b80]">Use arrow keys, WASD, or swipe to play</p>
    </div>
  );
}
