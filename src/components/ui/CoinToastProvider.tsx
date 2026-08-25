'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeCoinEarn, type CoinEarnEvent } from '@/hooks/useCoinEarn';

interface Toast extends CoinEarnEvent {
  id: string;
}

export function CoinToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = subscribeCoinEarn((event) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: Toast = { ...event, id };
      setToasts(prev => [...prev.slice(-4), toast]); // max 5 visible
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 2800);
    });
    return unsub;
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#ffd60a]/40 shadow-2xl backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(17,17,24,0.97), rgba(30,25,50,0.97))',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(255,214,10,0.15)',
            }}
          >
            {/* Coin icon burst */}
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-base shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ffd60a, #ff006e)' }}
            >
              {toast.icon || '🪙'}
            </div>

            <div>
              <p className="text-xs font-black text-white leading-none mb-0.5">
                +{toast.amount}{' '}
                <span style={{ color: '#ffd60a' }}>Coins Earned!</span>
              </p>
              <p className="text-[10px] text-[#a0a0b8] leading-none">{toast.reason}</p>
            </div>

            {/* Animated shimmer bar */}
            <div className="h-8 w-0.5 rounded-full mx-1 overflow-hidden bg-white/10 relative">
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, #ffd60a, transparent)' }}
                initial={{ y: '100%' }}
                animate={{ y: '-100%' }}
                transition={{ duration: 2.5, ease: 'linear' }}
              />
            </div>

            <div className="text-right">
              <p
                className="font-outfit font-black text-xl leading-none"
                style={{ color: '#ffd60a', textShadow: '0 0 12px rgba(255,214,10,0.5)' }}
              >
                +{toast.amount}
              </p>
              <p className="text-[9px] text-[#6b6b80] font-bold uppercase tracking-wide">COINS</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
