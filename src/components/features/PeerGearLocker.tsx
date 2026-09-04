'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, X, MapPin, Check, MessageSquare, AlertCircle
} from 'lucide-react';
import { playClick, playSuccess } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface GearListing {
  id: string;
  item: string;
  hostel: string;
  ownerName: string;
  type: 'borrow' | 'spare_free' | 'sell';
  price: string;
  timeAgo: string;
}

export function PeerGearLocker() {
  const { currentUser } = useUIStore();
  // Clean initial state: no fabricated fake names or fake gear listings
  const [gearList, setGearList] = useState<GearListing[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [item, setItem] = useState('');
  const [type, setType] = useState<'borrow' | 'spare_free' | 'sell'>('borrow');
  const [price, setPrice] = useState('Free to borrow');
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const handlePostGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !item) return;
    playClick();

    const newListing: GearListing = {
      id: `gear-${Date.now()}`,
      item,
      hostel: currentUser.hostel || 'Main Campus',
      ownerName: currentUser.name,
      type,
      price: type === 'borrow' || type === 'spare_free' ? 'Free to borrow' : price,
      timeAgo: 'Just now',
    };

    setGearList(prev => [newListing, ...prev]);
    playSuccess();
    setItem('');
    setShowAddModal(false);
  };

  const handleRequest = (id: string) => {
    playClick();
    setRequestedId(id);
    setTimeout(() => setRequestedId(null), 3000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A0C10] p-5 shadow-lg relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-sm text-white">Campus Peer Gear Locker</h3>
            <p className="text-[10px] text-[#6b6b80]">Borrow pumps, rackets & shuttlecocks in hostels</p>
          </div>
        </div>

        {currentUser ? (
          <button
            onClick={() => {
              playClick();
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#CCFF00] hover:text-[#040507] text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Share Gear
          </button>
        ) : (
          <a
            href="/login"
            className="text-[11px] font-bold text-[#CCFF00] hover:underline"
          >
            Sign in to share gear
          </a>
        )}
      </div>

      {/* Gear List */}
      {gearList.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl bg-white/[0.02] border border-white/5">
          <Package className="w-8 h-8 text-[#6b6b80] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium text-white mb-1">No gear listed right now</p>
          <p className="text-[11px] text-[#6b6b80] max-w-sm mx-auto">
            Have a spare ball pump pin, extra badminton racket, or table tennis paddle? Share it with students on your floor or campus.
          </p>
          {currentUser && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 hover:bg-[#CCFF00]/20 transition-all"
            >
              <Plus className="w-3 h-3" /> List First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gearList.map(g => (
            <div
              key={g.id}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#CCFF00]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-xs text-white leading-snug">{g.item}</h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-bold shrink-0">
                    {g.price}
                  </span>
                </div>
                <p className="text-[11px] text-[#a0a0b8] flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-[#00F0FF]" /> {g.hostel} · <span className="text-white">{g.ownerName}</span>
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-[#6b6b80] font-mono">{g.timeAgo}</span>
                <button
                  onClick={() => handleRequest(g.id)}
                  className="text-[10px] font-bold px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-1"
                >
                  {requestedId === g.id ? (
                    <><Check className="w-3 h-3 text-[#CCFF00]" /> Request Sent!</>
                  ) : (
                    <><MessageSquare className="w-3 h-3 text-[#CCFF00]" /> Contact Owner</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A0C10] p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <h3 className="font-outfit font-bold text-base text-white">Share Gear with Campus</h3>
                <button onClick={() => setShowAddModal(false)} className="text-[#a0a0b8] hover:text-white" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostGear} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase mb-1">Gear Item</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Football Air Pump Pin / Spare TT Paddle"
                    value={item}
                    onChange={e => setItem(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase mb-1">Availability</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="borrow" className="bg-[#0A0C10]">Free to Borrow for Match</option>
                    <option value="sell" className="bg-[#0A0C10]">Spare Gear (Sale or Split Cost)</option>
                  </select>
                </div>

                {type === 'sell' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase mb-1">Price / Split (₹)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹100"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                )}

                <button type="submit" className="btn-volt w-full py-2.5 text-xs font-black mt-2">
                  List Gear for Campus
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
