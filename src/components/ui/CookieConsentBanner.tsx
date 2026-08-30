'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('courtmate_cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on mount
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('courtmate_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('courtmate_cookie_consent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 md:max-w-md"
        >
          <div
            className="rounded-2xl border border-white/10 p-5 shadow-2xl"
            style={{ background: 'rgba(17, 17, 24, 0.95)', backdropFilter: 'blur(20px)' }}
          >
            {/* Close button */}
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 p-1 rounded-lg text-[#6b6b80] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20"
                style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Cookie className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white mb-1 font-[family-name:var(--font-outfit)]">
                  We use cookies
                </h3>
                <p className="text-xs text-[#a0a0b8] leading-relaxed mb-4">
                  We use essential cookies to keep you logged in and optional analytics cookies to improve the platform.{' '}
                  <Link href="/cookies" className="text-[#00f5d4] hover:underline">
                    Learn more
                  </Link>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#a0a0b8] bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Essential Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
