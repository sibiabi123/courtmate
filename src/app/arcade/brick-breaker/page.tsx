'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Trophy, Pause } from 'lucide-react';

const CANVAS_W = 400;
const CANVAS_H = 500;
const PADDLE_W = 80;
const PADDLE_H = 12;
const BALL_R = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_W = CANVAS_W / BRICK_COLS - 4;
const BRICK_H = 18;
const BRICK_PAD = 4;

const COLORS = ['#ff006e', '#7b2ff7', '#00f5d4', '#ffd60a', '#f59e0b'];

export default function BrickBreakerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'won' | 'lost'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(0);
  const stateRef = useRef({ paddle: CANVAS_W / 2 - PADDLE_W / 2, ball: { x: CANVAS_W / 2, y: CANVAS_H - 40, dx: 3, dy: -3 }, bricks: [] as { x: number; y: number; alive: boolean; color: string }[], score: 0, lives: 3 });

  useEffect(() => { const s = localStorage.getItem('vit-ghub-brick-best'); if (s) setBest(parseInt(s)); }, []);

  const initBricks = () => {
    const bricks: { x: number; y: number; alive: boolean; color: string }[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) for (let c = 0; c < BRICK_COLS; c++) bricks.push({ x: c * (BRICK_W + BRICK_PAD) + BRICK_PAD, y: r * (BRICK_H + BRICK_PAD) + 40, alive: true, color: COLORS[r] });
    return bricks;
  };

  const resetGame = () => {
    stateRef.current = { paddle: CANVAS_W / 2 - PADDLE_W / 2, ball: { x: CANVAS_W / 2, y: CANVAS_H - 40, dx: 3 * (Math.random() > 0.5 ? 1 : -1), dy: -3 }, bricks: initBricks(), score: 0, lives: 3 };
    setScore(0); setLives(3); setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.paddle = Math.max(0, Math.min(CANVAS_W - PADDLE_W, e.clientX - rect.left - PADDLE_W / 2));
    };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.paddle = Math.max(0, Math.min(CANVAS_W - PADDLE_W, e.touches[0].clientX - rect.left - PADDLE_W / 2));
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch);

    const loop = () => {
      const s = stateRef.current;
      const b = s.ball;
      b.x += b.dx; b.y += b.dy;

      // Walls
      if (b.x <= BALL_R || b.x >= CANVAS_W - BALL_R) b.dx *= -1;
      if (b.y <= BALL_R) b.dy *= -1;

      // Paddle
      if (b.y >= CANVAS_H - 30 - BALL_R && b.y <= CANVAS_H - 30 && b.x >= s.paddle && b.x <= s.paddle + PADDLE_W) {
        b.dy = -Math.abs(b.dy);
        const hit = (b.x - s.paddle) / PADDLE_W;
        b.dx = 6 * (hit - 0.5);
      }

      // Bottom
      if (b.y > CANVAS_H) {
        s.lives--;
        setLives(s.lives);
        if (s.lives <= 0) { setGameState('lost'); if (s.score > best) { setBest(s.score); localStorage.setItem('vit-ghub-brick-best', s.score.toString()); } return; }
        b.x = CANVAS_W / 2; b.y = CANVAS_H - 40; b.dx = 3 * (Math.random() > 0.5 ? 1 : -1); b.dy = -3;
      }

      // Bricks
      let allDead = true;
      s.bricks.forEach(brick => {
        if (!brick.alive) return;
        allDead = false;
        if (b.x >= brick.x && b.x <= brick.x + BRICK_W && b.y >= brick.y && b.y <= brick.y + BRICK_H) {
          brick.alive = false; b.dy *= -1; s.score += 10; setScore(s.score);
        }
      });
      if (allDead) { setGameState('won'); if (s.score > best) { setBest(s.score); localStorage.setItem('vit-ghub-brick-best', s.score.toString()); } return; }

      // Draw
      ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      // Bricks
      s.bricks.forEach(brick => {
        if (!brick.alive) return;
        ctx.fillStyle = brick.color; ctx.shadowColor = brick.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.roundRect(brick.x, brick.y, BRICK_W, BRICK_H, 3); ctx.fill();
      });
      ctx.shadowBlur = 0;
      // Paddle
      const grad = ctx.createLinearGradient(s.paddle, 0, s.paddle + PADDLE_W, 0);
      grad.addColorStop(0, '#7b2ff7'); grad.addColorStop(1, '#00f5d4');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(s.paddle, CANVAS_H - 30, PADDLE_W, PADDLE_H, 6); ctx.fill();
      // Ball
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#00f5d4'; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('mousemove', handleMouse); canvas.removeEventListener('touchmove', handleTouch); };
  }, [gameState, best]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4"><ArrowLeft className="h-4 w-4" /> Back to Arcade</Link>
        <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">🧱 <span className="gradient-text">Brick Breaker</span></h1>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="glass rounded-xl px-4 py-2 text-center"><span className="text-xs text-[#6b6b80]">Score</span><div className="text-xl font-bold text-[#00f5d4]">{score}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><span className="text-xs text-[#6b6b80]">Lives</span><div className="text-xl font-bold text-[#ff006e]">{'❤️'.repeat(lives)}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><span className="text-xs text-[#6b6b80] flex items-center gap-1"><Trophy className="h-3 w-3 text-[#ffd60a]" /></span><div className="text-xl font-bold text-[#ffd60a]">{best}</div></div>
      </div>
      <div className="relative glass rounded-2xl p-3">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="rounded-xl cursor-none" />
        {(gameState === 'idle' || gameState === 'won' || gameState === 'lost') && (
          <div className="absolute inset-3 rounded-xl bg-black/75 flex flex-col items-center justify-center">
            <span className="text-5xl mb-3">{gameState === 'won' ? '🎉' : gameState === 'lost' ? '💀' : '🧱'}</span>
            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-1">{gameState === 'won' ? 'You Win!' : gameState === 'lost' ? 'Game Over' : 'Brick Breaker'}</h2>
            {gameState !== 'idle' && <p className="text-2xl font-bold gradient-text mb-1">{score}</p>}
            <p className="text-xs text-[#6b6b80] mb-5">{gameState === 'idle' ? 'Move mouse to control paddle' : 'points scored'}</p>
            <button onClick={resetGame} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform">
              <Play className="h-4 w-4 fill-white" /> {gameState === 'idle' ? 'Start Game' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
