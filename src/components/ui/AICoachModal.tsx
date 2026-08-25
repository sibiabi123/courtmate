'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Zap, Trophy, Shield, Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/sound';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  actionLabel?: string;
  actionHref?: string;
}

const AI_KNOWLEDGE: Record<string, string> = {
  cricket: "🏏 Cricket Strategy: For power-play overs on fast turf, focus on straight-bat lofted drives. Maintain length bowling between 5-6m on the off-stump channel!",
  football: "⚽ Football Tactics: In a 7v7 match, use a 2-3-1 formation with high pressing wingers to dominate the midfield transitions and create cut-backs.",
  badminton: "🏸 Badminton Tip: Keep your base at the center T. Use disguised drop shots followed by steep jump smashes to force defensive lift errors.",
  basketball: "🏀 Basketball Play: Run high pick-and-rolls from the top of the key. Attack the drop coverage with mid-range pullups or kick out to corner snipers.",
  'table tennis': "🏓 Table Tennis Mastery: Vary your heavy topspin loops with short backspin pushes to catch your opponent off guard on third-ball attacks.",
  volleyball: "🏐 Volleyball Form: Keep knees bent at 90°, focus on early shoulder cocking, and aim spikes towards the deep cross-court corners.",
  tennis: "🎾 Tennis Strategy: Target your opponent's backhand on second serve returns, then step inside the baseline for an aggressive forehand winner.",
  chess: "♟️ Chess Mindset: Control the central d4/e4 squares early, develop minor pieces before queen excursions, and safeguard king with early castling."
};

const SUGGESTED_PROMPTS = [
  "Find an active match",
  "How does ELO ranking work?",
  "Recommend badminton drill",
  "How to organize a tournament?",
];

export function AICoachModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(() => sound.isMuted());
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "⚡ Greetings athlete! I'm Coach OMNI, your AI Matchmaker & Strategy Analyst. Ask me for tactical tips, court conditions, ELO calculations, or instant match recommendations!",
    }
  ]);

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;
    sound.playClick();
    const query = userText.trim();
    setInput('');

    const newMsgs: Message[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);

    setTimeout(() => {
      sound.playVictory();
      const lower = query.toLowerCase();
      let reply = "🏆 That's the spirit! Stay active on CourtMate, compete in ranked duels, and rise up the global rankings!";
      let actionLabel: string | undefined;
      let actionHref: string | undefined;

      if (lower.includes('match') || lower.includes('find') || lower.includes('play')) {
        reply = "⚡ Found active match lobbies waiting for players! Head to the Match Feed to join an upcoming session or create your own court lobby in 30 seconds.";
        actionLabel = "Open Match Feed";
        actionHref = "/feed";
      } else if (lower.includes('elo') || lower.includes('rank') || lower.includes('tier') || lower.includes('point')) {
        reply = "📊 ELO System: We use the Glicko-2 dynamic rating algorithm. Winning ranked matches awards +15 to +35 RP based on opponent difficulty! Tiers: Bronze (1000) ➔ Silver (1200) ➔ Gold (1400) ➔ Platinum (1600) ➔ Diamond (1800) ➔ Champion (2000+).";
        actionLabel = "View Leaderboard";
        actionHref = "/leaderboard";
      } else if (lower.includes('challenge') || lower.includes('duel') || lower.includes('1v1')) {
        reply = "⚔️ Ready for high-stakes 1v1 action? You can issue custom ranked challenges, stake ranking points, and settle rivalries on the Challenges Arena!";
        actionLabel = "Enter Challenges Arena";
        actionHref = "/challenges";
      } else if (lower.includes('tournament') || lower.includes('championship') || lower.includes('bracket')) {
        reply = "🏆 Tournaments feature single-elimination and round-robin brackets with prize pools! Anyone can organize a championship or register their squad.";
        actionLabel = "Browse Tournaments";
        actionHref = "/tournaments";
      } else {
        for (const [sport, tip] of Object.entries(AI_KNOWLEDGE)) {
          if (lower.includes(sport)) {
            reply = tip;
            break;
          }
        }
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply, actionLabel, actionHref }]);
    }, 400);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.div
        className="fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <motion.button
          onClick={() => {
            sound.playClick();
            setIsOpen(!isOpen);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)',
            boxShadow: '0 0 25px rgba(0, 245, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          }}
        >
          <Bot className="h-7 w-7 text-white" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f5d4] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00f5d4] text-[9px] font-black text-black items-center justify-center">AI</span>
          </span>
        </motion.button>
      </motion.div>

      {/* AI Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#111118] p-6 shadow-2xl flex flex-col h-[550px] relative overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(123, 47, 247, 0.2)',
              }}
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7b2ff7]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00f5d4]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-black text-lg text-white flex items-center gap-2">
                      Coach OMNI <span className="text-xs px-2 py-0.5 rounded-full bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/30 font-bold">AI Assistant</span>
                    </h3>
                    <p className="text-xs text-[#a0a0b8]">Matchmaker & Strategy Engine</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleToggleSound}
                    title={muted ? 'Unmute Audio' : 'Mute Audio'}
                    className="p-2 rounded-xl text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {muted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-xl text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] text-white font-medium shadow-md'
                          : 'bg-white/5 border border-white/10 text-[#d1d5db]'
                      }`}
                    >
                      {m.text}
                      {m.actionLabel && m.actionHref && (
                        <div className="mt-2.5 pt-2 border-t border-white/10">
                          <a
                            href={m.actionHref}
                            onClick={() => sound.playClick()}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00f5d4] hover:underline"
                          >
                            <Zap className="h-3 w-3" /> {m.actionLabel} →
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none relative z-10">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#a0a0b8] hover:text-white hover:border-[#00f5d4]/50 transition-all font-medium whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2 pt-2 border-t border-white/10 relative z-10"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Coach OMNI anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#00f5d4] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-black font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00f5d4, #7b2ff7)' }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
