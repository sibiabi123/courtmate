'use client';

import { useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
  intensity?: number;
}

export function TiltCard({ children, className = '', glareColor = '#7b2ff7', intensity = 15 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * intensity,
      y: (x - 0.5) * -intensity,
    });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={`relative overflow-hidden ${className}`}
      data-cursor-hover
    >
      {children}
      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${glareColor}40 0%, transparent 60%)`,
          opacity: glare.opacity,
        }}
      />
    </motion.div>
  );
}
