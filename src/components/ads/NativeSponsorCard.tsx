'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink, Tag, Shield, ArrowUpRight } from 'lucide-react';
import { playClick } from '@/lib/sound';

interface NativeSponsorCardProps {
  index?: number;
}

const NATIVE_SPONSORS = [
  {
    brand: 'Decathlon Sports Campus Pass',
    category: 'Featured Sports Partner',
    title: 'Pro Badminton Rackets & Turf Boots — Extra 20% Off',
    description: 'Get match-ready with BWF certified carbon rackets and high-traction football boots. Free campus delivery.',
    promoCode: 'COURTMATE20',
    link: 'https://www.decathlon.com',
    emblem: '🏸',
    accentColor: '#0082C3',
  },
  {
    brand: 'Red Bull Collegiate Series',
    category: 'Official Energy Partner',
    title: 'Red Bull Campus Cricket & Futsal Tournaments 2026',
    description: 'Represent your college in national collegiate qualifiers. Gear up with the official student athlete packs.',
    promoCode: 'REDBULLCAMPUS',
    link: 'https://www.redbull.com',
    emblem: '⚡',
    accentColor: '#DB0A40',
  },
  {
    brand: 'Fast&Up Fast Hydration & Recovery',
    category: 'Hydration & Nutrition',
    title: 'Instant Electrolytes & Muscle Recovery Drink Tabs',
    description: 'Zero added sugar, instant hypotonic rehydration for intense weekend 5v5 soccer & badminton rallies.',
    promoCode: 'FASTPLAY15',
    link: 'https://www.fastandup.com',
    emblem: '💧',
    accentColor: '#FF6B00',
  },
];

export function NativeSponsorCard({ index = 0 }: NativeSponsorCardProps) {
  const sponsor = NATIVE_SPONSORS[index % NATIVE_SPONSORS.length];
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    playClick();
    navigator.clipboard.writeText(sponsor.promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 p-5 relative overflow-hidden transition-all bg-[#0A0C10] hover:border-[#CCFF00]/40 shadow-xl"
    >
      {/* Top Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sponsor.emblem}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white">{sponsor.brand}</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                PROMOTED
              </span>
            </div>
            <span className="text-[10px] text-[#6b6b80]">{sponsor.category}</span>
          </div>
        </div>

        <span className="text-[10px] font-black text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-2 py-0.5 rounded-full font-mono">
          STUDENT PERK
        </span>
      </div>

      {/* Body */}
      <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/5 mb-4">
        <h4 className="font-outfit font-black text-sm text-white mb-1">
          {sponsor.title}
        </h4>
        <p className="text-xs text-[#a0a0b8] leading-relaxed">
          {sponsor.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={handleCopyCode}
          className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/5 border border-white/10 text-[#CCFF00] hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <Tag className="w-3 h-3" />
          {copied ? 'Copied Code!' : `Code: ${sponsor.promoCode}`}
        </button>

        <a
          href={sponsor.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClick()}
          className="btn-volt px-4 py-2 text-xs font-black flex items-center gap-1"
        >
          Claim Deal <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
