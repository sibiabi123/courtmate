'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        // We use clientX/clientY for fixed positioning
        const x = e.clientX;
        const y = e.clientY;
        
        // Add a subtle magnetic snap if hovering over interactive elements
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, input, select, [data-cursor-hover]');
        
        spotlightRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        
        if (isInteractive) {
          spotlightRef.current.style.width = '300px';
          spotlightRef.current.style.height = '300px';
          spotlightRef.current.style.opacity = '0.15';
          spotlightRef.current.style.background = 'radial-gradient(circle, rgba(0, 245, 212, 1) 0%, rgba(0, 245, 212, 0) 70%)';
        } else {
          spotlightRef.current.style.width = '600px';
          spotlightRef.current.style.height = '600px';
          spotlightRef.current.style.opacity = '0.08';
          spotlightRef.current.style.background = 'radial-gradient(circle, rgba(123, 47, 247, 1) 0%, rgba(123, 47, 247, 0) 60%)';
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Don't show the glowing cursor on the terminal screen
  if (pathname === '/super-admin') return null;

  return (
    <div 
      ref={spotlightRef}
      className="pointer-events-none fixed top-0 left-0 z-0 rounded-full transition-all duration-300 ease-out mix-blend-screen"
      style={{
        transform: 'translate3d(-50%, -50%, 0)',
        marginTop: '-300px',
        marginLeft: '-300px',
        width: '600px',
        height: '600px',
        opacity: 0,
        background: 'radial-gradient(circle, rgba(123, 47, 247, 1) 0%, rgba(123, 47, 247, 0) 60%)',
      }}
    />
  );
}
