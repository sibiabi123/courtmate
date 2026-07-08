'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, User, Cpu } from 'lucide-react';

type Cell = 'X' | 'O' | null;

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] | null } {
  for (const combo of winCombos) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}

function minimax(board: Cell[], isMax: boolean): number {
  const { winner } = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (board.every(c => c !== null)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getAiMove(board: Cell[]): number {
  let bestScore = -Infinity;
  let bestMove = 0;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
  }
  return bestMove;
}

export default function TicTacToePage() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<string>('');
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });

  const handleClick = (idx: number) => {
    if (board[idx] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[idx] = 'X';

    const { winner, line } = checkWinner(newBoard);
    if (winner) {
      setBoard(newBoard);
      setGameOver(true);
      setWinLine(line);
      setResult('You Win! 🎉');
      setScores(s => ({ ...s, player: s.player + 1 }));
      return;
    }
    if (newBoard.every(c => c !== null)) {
      setBoard(newBoard);
      setGameOver(true);
      setResult("It's a Draw! 🤝");
      setScores(s => ({ ...s, draws: s.draws + 1 }));
      return;
    }

    setBoard(newBoard);
    setIsPlayerTurn(false);

    // AI move
    setTimeout(() => {
      const aiIdx = getAiMove([...newBoard]);
      newBoard[aiIdx] = 'O';
      const { winner: w2, line: l2 } = checkWinner(newBoard);
      setBoard([...newBoard]);
      if (w2) {
        setGameOver(true);
        setWinLine(l2);
        setResult('AI Wins! 🤖');
        setScores(s => ({ ...s, ai: s.ai + 1 }));
      } else if (newBoard.every(c => c !== null)) {
        setGameOver(true);
        setResult("It's a Draw! 🤝");
        setScores(s => ({ ...s, draws: s.draws + 1 }));
      } else {
        setIsPlayerTurn(true);
      }
    }, 300);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult('');
    setWinLine(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Arcade
        </Link>
        <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">
          ❌ <span className="gradient-text">Tic-Tac-Toe</span>
        </h1>
      </div>

      {/* Scoreboard */}
      <div className="flex gap-6 mb-6">
        <div className="glass rounded-xl px-4 py-2 text-center">
          <div className="flex items-center gap-1 text-xs text-[#6b6b80] mb-0.5"><User className="h-3 w-3" /> You</div>
          <div className="text-xl font-bold text-[#00f5d4]">{scores.player}</div>
        </div>
        <div className="glass rounded-xl px-4 py-2 text-center">
          <div className="text-xs text-[#6b6b80] mb-0.5">Draws</div>
          <div className="text-xl font-bold text-[#a0a0b8]">{scores.draws}</div>
        </div>
        <div className="glass rounded-xl px-4 py-2 text-center">
          <div className="flex items-center gap-1 text-xs text-[#6b6b80] mb-0.5"><Cpu className="h-3 w-3" /> AI</div>
          <div className="text-xl font-bold text-[#ff006e]">{scores.ai}</div>
        </div>
      </div>

      {/* Board */}
      <div className="glass rounded-2xl p-4">
        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(i)}
              className={`h-24 w-24 rounded-xl text-4xl font-bold flex items-center justify-center transition-all ${
                winLine?.includes(i) ? 'bg-[#7b2ff7]/30 neon-border-purple border' : 'bg-[#1a1a2e] hover:bg-[#25253d]'
              } ${!cell && !gameOver ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={cell === 'X' ? 'text-[#00f5d4] neon-text-cyan' : 'text-[#ff006e] neon-text-pink'}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mt-6 text-center">
        {gameOver ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-4">{result}</p>
            <button onClick={reset} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform mx-auto">
              <RotateCcw className="h-4 w-4" /> Play Again
            </button>
          </motion.div>
        ) : (
          <p className="text-sm text-[#a0a0b8]">
            {isPlayerTurn ? 'Your turn (X)' : 'AI thinking...'}
          </p>
        )}
      </div>
    </div>
  );
}
