'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Zap, Clock, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { sound, playClick } from '@/lib/sound';

interface LobbyMessage {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  isChip: boolean;
  createdAt: string;
}

interface LobbyChatDrawerProps {
  postId: string;
  sport: string;
  ground?: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any | null;
}

const TACTICAL_CHIPS = [
  '📍 At Court #1',
  '📍 At Court #2',
  '📍 At Main Ground',
  '⏱️ 5 Mins Away',
  '⏱️ Running 10m Late',
  '✅ Ready to Warm Up!',
  '🏸 Have Extra Gear',
  '⚽ On the Field',
  '🏀 Under the Hoop',
  '💧 Brought Extra Water',
];

export function LobbyChatDrawer({
  postId,
  sport,
  ground = 'Sports Complex',
  isOpen,
  onClose,
  currentUser,
}: LobbyChatDrawerProps) {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!postId) return;
    try {
      const res = await fetch(`/api/posts/messages?postId=${encodeURIComponent(postId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
      const interval = setInterval(fetchMessages, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen, postId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string, isChip = false) => {
    if (!textToSend.trim() || !currentUser || sending) return;
    playClick();
    setSending(true);

    try {
      const res = await fetch('/api/posts/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          message: textToSend.trim(),
          isChip,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        if (!isChip) setInputText('');
      }
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleQuickChip = (chip: string) => {
    handleSendMessage(chip, true);
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#040507] border-l border-white/10 shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0C10]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-outfit font-black text-white text-base">{sport} Lobby Board</h3>
                    <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-ping" />
                  </div>
                  <p className="text-[11px] text-[#6b6b80] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#00F0FF]" /> {ground}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#a0a0b8] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick-Tap Tactical Status Chips */}
            <div className="p-4 border-b border-white/5 bg-[#08090C]">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#a0a0b8] mb-2.5">
                <Zap className="w-3 h-3 text-[#CCFF00]" /> 1-Tap Tactical Pings
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {TACTICAL_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleQuickChip(chip)}
                    disabled={!currentUser || sending}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-[#CCFF00]/15 hover:text-[#CCFF00] hover:border-[#CCFF00]/40 border border-white/10 text-white/90 transition-all active:scale-95 disabled:opacity-40 shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-[#6b6b80]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#CCFF00] mb-2" />
                  <p className="text-xs">Connecting to Lobby Ping Radio...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 text-[#6b6b80]">
                  <Sparkles className="w-8 h-8 text-[#CCFF00]/40 mb-3" />
                  <p className="text-xs font-bold text-white mb-1">Squad Lobby is Live</p>
                  <p className="text-[11px] leading-relaxed">
                    Use quick-tap status chips or drop a message to let your teammates know when you arrive!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = currentUser && m.userId === currentUser.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <img
                        src={
                          m.userAvatar ||
                          `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(m.userName)}`
                        }
                        alt={m.userName}
                        className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 shrink-0 self-end"
                      />

                      <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className={`text-[10px] font-bold ${isMe ? 'text-[#CCFF00]' : 'text-[#a0a0b8]'}`}>
                            {m.userName}
                          </span>
                          <span className="text-[9px] text-[#4a4a5a] font-mono">{formatTime(m.createdAt)}</span>
                        </div>

                        <div
                          className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                            m.isChip
                              ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-bold shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                              : isMe
                              ? 'bg-[#CCFF00] text-[#040507] font-semibold rounded-br-none'
                              : 'bg-white/10 text-white rounded-bl-none border border-white/10'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0A0C10]">
              {currentUser ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputText, false);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    maxLength={140}
                    placeholder="Broadcast to lobby..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#CCFF00] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="h-9 px-4 rounded-xl font-bold text-xs bg-[#CCFF00] text-[#040507] hover:bg-[#b8e600] active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1"
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </form>
              ) : (
                <div className="text-center py-2 text-xs text-[#6b6b80]">
                  <a href="/login" className="text-[#CCFF00] font-bold hover:underline">
                    Sign in
                  </a>{' '}
                  to participate in this lobby discussion.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
