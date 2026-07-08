'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, Trophy, Pause } from 'lucide-react';
import { useAppStore } from '@/store';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 120;

export default function SnakeGame() {
  // Store actions
  const { addArcadeScore, currentUser, getHighScore } = useAppStore();

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const dirRef = useRef<Direction>('RIGHT');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const storeHighScore = getHighScore('snake');
    setHighScore(storeHighScore);
  }, [getHighScore]);

  const spawnFood = useCallback((snakeBody: Point[]): Point => {
    let pos: Point;
    do {
      pos = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (snakeBody.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const triggerGameOver = useCallback((finalScore: number) => {
    setGameState('gameover');
    if (currentUser && finalScore > 0) {
      addArcadeScore({
        id: `score-${Date.now()}`,
        userId: currentUser.id,
        gameSlug: 'snake',
        score: finalScore,
        timestamp: new Date().toISOString(),
      });
      // Recalculate local high score
      const storeHighScore = getHighScore('snake');
      setHighScore(Math.max(storeHighScore, finalScore));
    }
  }, [currentUser, addArcadeScore, getHighScore]);

  const resetGame = () => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setFood(spawnFood(initial));
    setDirection('RIGHT');
    dirRef.current = 'RIGHT';
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameState('playing');
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { ...prev[0] };
        const dir = dirRef.current;

        switch (dir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          clearInterval(interval);
          triggerGameOver(score);
          return prev;
        }

        // Self collision
        if (prev.some(s => s.x === head.x && s.y === head.y)) {
          clearInterval(interval);
          triggerGameOver(score);
          return prev;
        }

        const newSnake = [head, ...prev];

        // Check food
        if (head.x === food.x && head.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            return newScore;
          });
          setFood(spawnFood(newSnake));
          setSpeed(s => Math.max(60, s - 2));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, food, speed, score, spawnFood, triggerGameOver]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = GRID_SIZE * CELL_SIZE;
    ctx.clearRect(0, 0, size, size);

    // Grid
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(size, i * CELL_SIZE);
      ctx.stroke();
    }

    // Snake
    snake.forEach((s, i) => {
      const hue = i === 0 ? '#00f5d4' : `hsl(${160 + i * 3}, 80%, ${60 - i}%)`;
      ctx.fillStyle = hue;
      ctx.shadowColor = i === 0 ? '#00f5d4' : 'transparent';
      ctx.shadowBlur = i === 0 ? 10 : 0;
      ctx.beginPath();
      ctx.roundRect(s.x * CELL_SIZE + 1, s.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Food
    ctx.fillStyle = '#ff006e';
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState === 'idle' || gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') { resetGame(); return; }
      }
      if (gameState === 'playing') {
        const map: Record<string, Direction> = {
          ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
          w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
          W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
        };
        const newDir = map[e.key];
        if (!newDir) {
          if (e.key === ' ') setGameState('paused');
          return;
        }
        const opposites: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (newDir !== opposites[dirRef.current]) {
          dirRef.current = newDir;
          setDirection(newDir);
        }
      }
      if (gameState === 'paused' && e.key === ' ') setGameState('playing');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-[420px] mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4" data-cursor-hover>
          <ArrowLeft className="h-4 w-4" /> Back to Arcade
        </Link>
        <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white">
          🐍 <span className="gradient-text">Snake</span>
        </h1>
      </div>

      {/* Score bar */}
      <div className="w-full max-w-[420px] flex items-center justify-between mb-4">
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-[#6b6b80]">Score</span>
          <span className="text-lg font-bold text-[#00f5d4] font-[family-name:var(--font-outfit)]">{score}</span>
        </div>
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#ffd60a]" />
          <span className="text-xs text-[#6b6b80]">Best</span>
          <span className="text-lg font-bold text-[#ffd60a] font-[family-name:var(--font-outfit)]">{highScore}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative glass rounded-2xl p-3">
        <canvas ref={canvasRef} width={GRID_SIZE * CELL_SIZE} height={GRID_SIZE * CELL_SIZE} className="rounded-xl" />

        {/* Overlays */}
        {gameState === 'idle' && (
          <div className="absolute inset-3 rounded-xl bg-black/70 flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">🐍</span>
            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-2 text-white">Ready to Play?</h2>
            <p className="text-xs text-[#6b6b80] mb-6">Use WASD or Arrow Keys</p>
            <button onClick={resetGame} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform text-white cursor-pointer" data-cursor-hover>
              <Play className="h-4 w-4 fill-white" /> Start Game
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-3 rounded-xl bg-black/70 flex flex-col items-center justify-center">
            <Pause className="h-12 w-12 text-[#a0a0b8] mb-3" />
            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-4 text-white">Paused</h2>
            <button onClick={() => setGameState('playing')} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform text-white cursor-pointer" data-cursor-hover>
              <Play className="h-4 w-4 fill-white" /> Resume
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-3 rounded-xl bg-black/80 flex flex-col items-center justify-center">
            <span className="text-5xl mb-3">💀</span>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-1 text-white">Game Over</h2>
            <p className="text-3xl font-bold gradient-text-purple-cyan mb-1">{score}</p>
            <p className="text-xs text-[#6b6b80] mb-5">points scored</p>
            <button onClick={resetGame} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform text-white cursor-pointer" data-cursor-hover>
              <RotateCcw className="h-4 w-4" /> Play Again
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 w-[180px] md:hidden">
        <div />
        <button onTouchStart={() => { if (dirRef.current !== 'DOWN') { dirRef.current = 'UP'; setDirection('UP'); }}} className="glass rounded-xl p-3 flex items-center justify-center active:bg-white/10 text-white select-none">▲</button>
        <div />
        <button onTouchStart={() => { if (dirRef.current !== 'RIGHT') { dirRef.current = 'LEFT'; setDirection('LEFT'); }}} className="glass rounded-xl p-3 flex items-center justify-center active:bg-white/10 text-white select-none">◀</button>
        <button onTouchStart={() => { if (dirRef.current !== 'UP') { dirRef.current = 'DOWN'; setDirection('DOWN'); }}} className="glass rounded-xl p-3 flex items-center justify-center active:bg-white/10 text-white select-none">▼</button>
        <button onTouchStart={() => { if (dirRef.current !== 'LEFT') { dirRef.current = 'RIGHT'; setDirection('RIGHT'); }}} className="glass rounded-xl p-3 flex items-center justify-center active:bg-white/10 text-white select-none">▶</button>
      </div>
    </div>
  );
}
