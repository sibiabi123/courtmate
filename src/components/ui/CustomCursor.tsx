'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 25, stiffness: 300 });
  const springY = useSpring(cursorY, { damping: 25, stiffness: 300 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice) return;
    setHidden(false);

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    const down = () => setClicked(true);
    const up = () => setClicked(false);

    const handleHoverStart = () => setHovered(true);
    const handleHoverEnd = () => setHovered(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    // Detect hovers on interactive elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Initial pass
    document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  if (hidden) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: springX, y: springY }}
      >
        <motion.div
          className="rounded-full border border-white/40"
          animate={{
            width: hovered ? 50 : clicked ? 20 : 32,
            height: hovered ? 50 : clicked ? 20 : 32,
            x: hovered ? -25 : clicked ? -10 : -16,
            y: hovered ? -25 : clicked ? -10 : -16,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      </motion.div>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: cursorX, y: cursorY }}
      >
        <motion.div
          className="rounded-full bg-[#00f5d4]"
          animate={{
            width: hovered ? 8 : 5,
            height: hovered ? 8 : 5,
            x: hovered ? -4 : -2.5,
            y: hovered ? -4 : -2.5,
            opacity: clicked ? 0.5 : 1,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      </motion.div>
      <style jsx global>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
