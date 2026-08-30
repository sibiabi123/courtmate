'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { playClick } from '@/lib/sound';

interface GearItem {
  id: string;
  name: string;
  category: string;
  price: string;
  mrp: string;
  discount: string;
  emblem: string;
  rating: number;
  link: string;
}

const GEAR_ITEMS: GearItem[] = [
  {
    id: 'g1',
    name: 'Yonex Nanoray Carbon Badminton Racket',
    category: 'Badminton',
    price: '₹1,899 ($22)',
    mrp: '₹2,990',
    discount: '36% OFF',
    emblem: '🏸',
    rating: 4.8,
    link: 'https://www.amazon.com/dp/B07X99YONX?tag=courtmate-20',
  },
  {
    id: 'g2',
    name: 'Nivia Storm Rubber Football (Size 5)',
    category: 'Football',
    price: '₹449 ($5.5)',
    mrp: '₹720',
    discount: '38% OFF',
    emblem: '⚽',
    rating: 4.6,
    link: 'https://www.amazon.com/dp/B00K6G1E4Q?tag=courtmate-20',
  },
  {
    id: 'g3',
    name: 'Nike Phantom Turf Ground Football Shoes',
    category: 'Footwear',
    price: '₹3,495 ($42)',
    mrp: '₹4,995',
    discount: '30% OFF',
    emblem: '👟',
    rating: 4.9,
    link: 'https://www.nike.com',
  },
  {
    id: 'g4',
    name: 'Fast&Up Reload Instant Hydration Tabs (Pack of 20)',
    category: 'Nutrition',
    price: '₹290 ($3.5)',
    mrp: '₹390',
    discount: '25% OFF',
    emblem: '💧',
    rating: 4.7,
    link: 'https://www.fastandup.com',
  },
];

export function AffiliateGearWidget() {
  const [selectedSport, setSelectedSport] = useState('All');

  const filteredGear = selectedSport === 'All'
    ? GEAR_ITEMS
    : GEAR_ITEMS.filter(g => g.category.toLowerCase().includes(selectedSport.toLowerCase()));

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-outfit font-black text-sm text-white">Campus Athlete Gear Deals</h3>
            <p className="text-[10px] text-[#6b6b80]">Student discounted verified sports equipment</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
          UP TO 40% OFF
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredGear.map(item => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClick()}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#CCFF00]/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">{item.emblem}</span>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-[#CCFF00] transition-colors truncate max-w-[170px]">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-[#CCFF00] font-mono">{item.price}</span>
                  <span className="text-[10px] text-[#6b6b80] line-through font-mono">{item.mrp}</span>
                  <span className="text-[9px] font-bold text-emerald-400 font-mono">{item.discount}</span>
                </div>
              </div>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-[#6b6b80] group-hover:text-[#CCFF00] shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
