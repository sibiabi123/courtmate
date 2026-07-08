'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, CheckCircle, XCircle } from 'lucide-react';

const triviaQuestions = [
  { q: 'How many players are on a cricket team?', options: ['9', '10', '11', '12'], answer: 2 },
  { q: 'Which sport uses a shuttlecock?', options: ['Tennis', 'Badminton', 'Table Tennis', 'Squash'], answer: 1 },
  { q: 'What is the standard size of a football team?', options: ['9', '10', '11', '12'], answer: 2 },
  { q: 'In basketball, how many points is a shot beyond the arc?', options: ['1', '2', '3', '4'], answer: 2 },
  { q: 'What is a "love" score in tennis?', options: ['15', '30', '0', '40'], answer: 2 },
  { q: 'How many squares are on a chess board?', options: ['32', '48', '64', '100'], answer: 2 },
  { q: 'Which game uses the term "raider"?', options: ['Kho Kho', 'Kabaddi', 'Football', 'Cricket'], answer: 1 },
  { q: 'How many overs in a T20 cricket match per team?', options: ['10', '15', '20', '50'], answer: 2 },
  { q: 'In volleyball, how many touches per side?', options: ['2', '3', '4', '5'], answer: 1 },
  { q: 'What does TT stand for in sports?', options: ['Team Tennis', 'Table Tennis', 'Track & Trail', 'Total Time'], answer: 1 },
  { q: 'Standard width of a carrom board in inches?', options: ['26', '29', '32', '36'], answer: 1 },
  { q: 'Which Indian sport is also known as "Tag Game"?', options: ['Kabaddi', 'Kho Kho', 'Langdi', 'Gilli Danda'], answer: 1 },
  { q: 'How many lanes in a standard swimming pool?', options: ['6', '8', '10', '12'], answer: 1 },
  { q: 'What sport uses the term "smash"?', options: ['Cricket', 'Badminton', 'Football', 'Hockey'], answer: 1 },
  { q: 'In which game do you "castle"?', options: ['Carrom', 'Chess', 'Checkers', 'Ludo'], answer: 1 },
];

export default function TriviaGame() {
  const [questions] = useState(() => [...triviaQuestions].sort(() => Math.random() - 0.5).slice(0, 10));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => { if (typeof window !== 'undefined') { const s = localStorage.getItem('vit-ghub-trivia-best'); return s ? parseInt(s) : 0; } return 0; });

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[current].answer) setScore(s => s + 10);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setGameOver(true);
      const finalScore = score;
      if (finalScore > best) { setBest(finalScore); localStorage.setItem('vit-ghub-trivia-best', finalScore.toString()); }
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const reset = () => { window.location.reload(); };

  const q = questions[current];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg mb-6">
        <Link href="/arcade" className="flex items-center gap-1 text-sm text-[#a0a0b8] hover:text-white mb-4"><ArrowLeft className="h-4 w-4" /> Back to Arcade</Link>
        <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">🧩 <span className="gradient-text">Sports Trivia</span></h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="glass rounded-xl px-4 py-2 text-center"><span className="text-xs text-[#6b6b80]">Score</span><div className="text-xl font-bold text-[#00f5d4]">{score}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><span className="text-xs text-[#6b6b80]">Question</span><div className="text-xl font-bold text-[#a0a0b8]">{current + 1}/{questions.length}</div></div>
        <div className="glass rounded-xl px-4 py-2 text-center"><span className="text-xs text-[#6b6b80] flex items-center gap-1"><Trophy className="h-3 w-3 text-[#ffd60a]" /></span><div className="text-xl font-bold text-[#ffd60a]">{best || '-'}</div></div>
      </div>

      {!gameOver ? (
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg glass rounded-2xl p-6">
          {/* Progress */}
          <div className="h-1.5 rounded-full bg-white/5 mb-6 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>

          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-6">{q.q}</h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let classes = 'glass hover:bg-white/5';
              if (answered) {
                if (i === q.answer) classes = 'bg-emerald-500/20 border-emerald-500/50 border';
                else if (i === selected) classes = 'bg-red-500/20 border-red-500/50 border';
                else classes = 'glass opacity-50';
              }
              return (
                <button key={i} onClick={() => handleSelect(i)}
                  className={`w-full rounded-xl px-5 py-3.5 text-left text-sm font-medium transition-all flex items-center justify-between ${classes}`}>
                  <span>{opt}</span>
                  {answered && i === q.answer && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                  {answered && i === selected && i !== q.answer && <XCircle className="h-5 w-5 text-red-400" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={nextQuestion}
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] py-3 text-sm font-bold hover:scale-[1.02] transition-transform">
              {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg glass rounded-2xl p-8 text-center">
          <span className="text-5xl">{score >= 80 ? '🏆' : score >= 50 ? '⭐' : '💪'}</span>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mt-3 gradient-text">{score}/{questions.length * 10}</h2>
          <p className="text-sm text-[#a0a0b8] mt-1">{score >= 80 ? 'Sports genius!' : score >= 50 ? 'Good knowledge!' : 'Keep learning!'}</p>
          <button onClick={reset} className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform mx-auto">
            <RotateCcw className="h-4 w-4" /> Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
