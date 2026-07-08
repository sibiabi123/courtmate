'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Check, CheckCheck } from 'lucide-react';
import { mockConversations, mockUsers } from '@/data/mock-data';
import { getInitials } from '@/lib/utils';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    conv1: [
      { id: '1', senderId: 'u3', content: 'Hey! Are we still on for football tomorrow evening?', timestamp: '2026-06-30T16:00:00Z' },
      { id: '2', senderId: 'u1', content: 'Yes! I\'ve booked the ground for 5 PM. Bring your boots!', timestamp: '2026-06-30T16:05:00Z' },
      { id: '3', senderId: 'u3', content: 'Perfect. I\'ll bring 2 more players from my hostel', timestamp: '2026-06-30T16:10:00Z' },
    ],
    conv2: [
      { id: '1', senderId: 'u2', content: 'Ready for badminton practice? Court is free at 6', timestamp: '2026-06-30T15:30:00Z' },
      { id: '2', senderId: 'u1', content: 'Give me 15 mins, finishing lunch', timestamp: '2026-06-30T15:35:00Z' },
    ],
    conv3: [
      { id: '1', senderId: 'u5', content: 'Cricket practice at 6 AM tomorrow. Don\'t be late!', timestamp: '2026-06-30T14:00:00Z' },
    ]
  });
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = mockConversations.find(c => c.id === activeConv);
  const currentChatMessages = activeConv ? messages[activeConv] || [] : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeConv) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'u1', // Current user Arjun
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), newMessage]
    }));
    setInputValue('');

    // Simulate reply
    setTimeout(() => {
      let replyContent = "Awesome! See you on the field.";
      if (activeConv === 'conv1') {
        replyContent = "Got it! See you at the Main Ground.";
      } else if (activeConv === 'conv2') {
        replyContent = "I'm heading to the Badminton courts now.";
      } else if (activeConv === 'conv3') {
        replyContent = "Roger that, set your alarm!";
      }

      const replyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeConversation?.isGroup ? 'u5' : activeConversation?.participants.find((p: any) => p.id !== 'u1')?.id || 'u3',
        content: replyContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => ({
        ...prev,
        [activeConv]: [...(prev[activeConv] || []), replyMessage]
      }));
    }, 1500);
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] shadow-lg shadow-[#7b2ff7]/30 text-white cursor-pointer"
        data-cursor-hover
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] rounded-2xl glass-strong border border-white/10 overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              {activeConv ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveConv(null)} className="text-xs text-[#a0a0b8] hover:text-white mr-1">
                    ← Back
                  </button>
                  <div className="h-8 w-8 rounded-full bg-[#7b2ff7]/20 flex items-center justify-center text-xs font-bold border border-[#7b2ff7]/30 text-[#00f5d4]">
                    {activeConversation?.isGroup ? activeConversation.groupAvatar : getInitials(activeConversation?.participants.find((p: any) => p.id !== 'u1')?.name || '')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold truncate max-w-[180px]">
                      {activeConversation?.isGroup ? activeConversation.groupName : activeConversation?.participants.find((p: any) => p.id !== 'u1')?.name}
                    </h3>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active now
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-[family-name:var(--font-outfit)] font-bold text-lg text-white">Campus Chats</h3>
                  <p className="text-[10px] text-[#6b6b80]">Coordinate sports meetups with other VIT students</p>
                </div>
              )}
              <button onClick={() => setIsOpen(false)} className="text-[#a0a0b8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0f]/40">
              {activeConv ? (
                /* Chat Messages */
                <>
                  {currentChatMessages.map((msg, i) => {
                    const isOwn = msg.senderId === 'u1';
                    const sender = mockUsers.find(u => u.id === msg.senderId);
                    return (
                      <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && activeConversation?.isGroup && (
                          <span className="text-[10px] text-[#6b6b80] mb-0.5 ml-1">{sender?.name}</span>
                        )}
                        <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs ${isOwn ? 'bg-gradient-to-r from-[#7b2ff7] to-[#6d28d9] text-white rounded-br-none' : 'bg-[#1a1a2e] text-[#e0e0e8] rounded-bl-none border border-white/5'}`}>
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-[#6b6b80] mt-1 flex items-center gap-1 ml-1">
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {isOwn && <CheckCheck className="h-3 w-3 text-[#00f5d4]" />}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                /* Conversation List */
                <div className="space-y-2">
                  {mockConversations.length === 0 ? (
                    <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
                      <MessageSquare className="h-10 w-10 text-[#6b6b80] mb-3 opacity-40 animate-pulse" />
                      <h4 className="text-sm font-semibold text-white mb-1">Your Inbox is Empty</h4>
                      <p className="text-[10px] text-[#6b6b80] max-w-[200px] mx-auto">Coordinate matches by clicking &quot;Clarify Arrival&quot; on the Game Feed!</p>
                    </div>
                  ) : (
                    mockConversations.map(conv => {
                      const otherUser = conv.participants.find((p: any) => p.id !== 'u1');
                      return (
                        <button
                          key={conv.id}
                          onClick={() => setActiveConv(conv.id)}
                          className="w-full text-left p-3 rounded-xl hover:bg-white/[0.03] transition-all flex items-center gap-3 border border-transparent hover:border-white/5"
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7b2ff7] to-[#00f5d4] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {conv.isGroup ? conv.groupAvatar : getInitials(otherUser?.name || '')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white truncate">
                                {conv.isGroup ? conv.groupName : otherUser?.name}
                              </span>
                              <span className="text-[9px] text-[#6b6b80]">
                                {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#6b6b80] truncate mt-0.5">
                              {conv.lastMessage?.content || ''}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="h-4 w-4 rounded-full bg-[#00f5d4] text-[9px] font-bold text-[#0a0a0f] flex items-center justify-center">
                              {conv.unreadCount}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Input Footer */}
            {activeConv && (
              <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white placeholder-[#6b6b80] focus:border-[#7b2ff7] focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-9 w-9 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] flex items-center justify-center text-white hover:scale-105 transition-transform cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
