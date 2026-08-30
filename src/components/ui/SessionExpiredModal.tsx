'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export function SessionExpiredModal() {
  const [show, setShow] = useState(false);
  const { currentUser, logout } = useUIStore();

  const handleSessionExpired = useCallback(() => {
    if (currentUser) {
      setShow(true);
    }
  }, [currentUser]);

  useEffect(() => {
    // Intercept 401 responses globally
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        handleSessionExpired();
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [handleSessionExpired]);

  const handleReLogin = () => {
    logout();
    setShow(false);
    window.location.href = '/login';
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 p-8 text-center"
            style={{ background: 'rgba(17,17,24,0.95)' }}
          >
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/20"
              style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <ShieldAlert className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-white mb-2">
              Session Expired
            </h2>
            <p className="text-sm text-[#a0a0b8] mb-6 leading-relaxed">
              Your session has ended for security purposes. Please sign in again to continue.
            </p>

            <button
              onClick={handleReLogin}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
            >
              <LogIn className="w-4 h-4" />
              Sign In Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
