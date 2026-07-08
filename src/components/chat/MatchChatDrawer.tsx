'use client';

import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userInitial: string;
  message: string;
  timestamp: string;
}

interface MatchChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

// Simulated match chat messages per post (in-memory)
const chatStore: Record<string, Message[]> = {};

export function MatchChatDrawer({ isOpen, onClose, postId, postTitle }: MatchChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const { currentUser } = useUIStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !postId) return;
    // Load from in-memory store
    setMessages(chatStore[postId] || []);
  }, [isOpen, postId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputVal.trim() || !currentUser) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      userInitial: currentUser.name[0].toUpperCase(),
      message: inputVal.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...(chatStore[postId] || []), msg];
    chatStore[postId] = updated;
    setMessages(updated);
    setInputVal('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col shadow-2xl"
        style={{ background: 'rgba(10,10,15,0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-[#00f5d4]" />
            <div>
              <p className="font-bold text-white text-sm font-outfit">Match Chat</p>
              <p className="text-xs text-[#6b6b80] truncate max-w-[180px] font-body">{postTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6b6b80] hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-10 h-10 text-[#25253d] mb-3" />
              <p className="text-[#6b6b80] text-sm font-body">No messages yet.</p>
              <p className="text-[#4a4a5a] text-xs mt-1 font-body">Be the first to say hi! 👋</p>
            </div>
          ) : messages.map((msg) => {
            const isOwn = msg.userId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isOwn ? 'bg-[#7b2ff7]' : 'bg-[#25253d]'}`}>
                  {msg.userInitial}
                </div>
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isOwn && <span className="text-[10px] text-[#6b6b80] mb-1 font-body">{msg.userName}</span>}
                  <div className={`rounded-2xl px-3 py-2 text-sm font-body ${isOwn ? 'text-white rounded-br-sm' : 'text-[#e0e0f0] rounded-bl-sm'}`}
                    style={{ background: isOwn ? 'linear-gradient(135deg, #7b2ff7, #5b22c7)' : 'rgba(255,255,255,0.07)' }}>
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-[#4a4a5a] mt-1 font-body">
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/8">
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus-within:border-[#7b2ff7] transition-all">
              <input
                type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={handleKey}
                placeholder="Type a message..." maxLength={300}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#4a4a5a] outline-none font-body"
              />
              <button onClick={sendMessage} disabled={!inputVal.trim()}
                className="p-1.5 rounded-lg text-white disabled:opacity-30 transition-all hover:scale-110 disabled:hover:scale-100"
                style={{ background: inputVal.trim() ? 'linear-gradient(135deg, #7b2ff7, #00f5d4)' : 'transparent' }}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-[#6b6b80] text-xs font-body">Sign in to chat with players</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
