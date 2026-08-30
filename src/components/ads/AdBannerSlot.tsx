'use client';

import { useEffect, useState } from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';

interface AdBannerSlotProps {
  format?: 'horizontal' | 'rectangle' | 'sticky-bottom';
  className?: string;
}

export function AdBannerSlot({ format = 'horizontal', className = '' }: AdBannerSlotProps) {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch {}
  }, []);

  if (format === 'sticky-bottom') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-[#08090C]/95 border-t border-white/10 p-2 flex items-center justify-between text-xs max-w-lg mx-auto ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">👟</span>
          <div>
            <span className="font-bold text-white text-[11px] block">Nike Pegasus Turf Running Shoes</span>
            <span className="text-[10px] text-[#CCFF00]">Student Athlete 25% Discount Live</span>
          </div>
        </div>
        <a
          href="https://www.nike.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-volt px-3 py-1 text-[11px] font-black shrink-0"
        >
          View Deal
        </a>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center overflow-hidden relative group hover:border-[#CCFF00]/30 transition-all ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] text-[#6b6b80] mb-2 font-mono">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#CCFF00]" /> SPONSORED PARTNER
        </span>
        <span>Ad Placement</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.015] border border-white/5">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center text-xl shrink-0">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Red Bull Campus Cricket Qualifiers 2026</h4>
            <p className="text-[11px] text-[#a0a0b8]">Register your college team for the national tournament.</p>
          </div>
        </div>

        <a
          href="https://www.redbull.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-volt px-4 py-2 text-xs font-black shrink-0 flex items-center gap-1"
        >
          Sign Up Free <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
