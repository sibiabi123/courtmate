'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Users, CreditCard, Shield, Check,
  X, Sparkles, ChevronRight, Loader2
} from 'lucide-react';
import { playClick, playCoin, playSuccess } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface TurfBookingWidgetProps {
  collegeName?: string;
  sport: string;
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_TURFS = [
  {
    id: 't1',
    name: 'Champions AstroTurf Arena',
    distance: '0.8 km from Campus Gate',
    pricePerHour: '₹800/hr ($10)',
    splitCost: '₹80/player (10 players)',
    slots: ['05:00 PM - 06:00 PM', '06:00 PM - 07:00 PM', '07:00 PM - 08:00 PM', '08:00 PM - 09:00 PM'],
    rating: 4.9,
    facilities: ['Floodlights', 'Dugouts', 'Changing Rooms', 'Drinking Water'],
  },
  {
    id: 't2',
    name: 'Velocity Indoor Badminton & Futsal Hub',
    distance: '1.2 km from Campus',
    pricePerHour: '₹600/hr ($7.5)',
    splitCost: '₹150/player (4 players)',
    slots: ['04:30 PM - 05:30 PM', '05:30 PM - 06:30 PM', '07:00 PM - 08:00 PM'],
    rating: 4.8,
    facilities: ['BWF Synthetic Mats', 'Air Conditioned', 'Pro Shop Rental'],
  },
  {
    id: 't3',
    name: 'Grand Slam Box Cricket Complex',
    distance: '1.5 km from Campus',
    pricePerHour: '₹1,000/hr ($12)',
    splitCost: '₹100/player (10 players)',
    slots: ['06:00 PM - 07:00 PM', '08:00 PM - 09:00 PM', '09:00 PM - 10:00 PM'],
    rating: 4.95,
    facilities: ['High Netting', 'Leather/Tennis Balls Available', 'Live Stream Recording'],
  },
];

export function TurfBookingWidget({
  collegeName = 'Campus',
  sport,
  isOpen,
  onClose,
}: TurfBookingWidgetProps) {
  const { currentUser, addCoins } = useUIStore();
  const [selectedTurf, setSelectedTurf] = useState(LOCAL_TURFS[0]);
  const [selectedSlot, setSelectedSlot] = useState(LOCAL_TURFS[0].slots[0]);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    playClick();
    setBooking(true);

    setTimeout(() => {
      playSuccess();
      playCoin();
      addCoins(25); // Cashback coins for booking turf
      setBooking(false);
      setBooked(true);

      setTimeout(() => {
        setBooked(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className="w-full max-w-xl rounded-3xl border border-[#00F0FF]/30 bg-[#0A0C10] p-6 sm:p-8 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-xl text-white">Book Nearby Turf & Arena</h3>
                  <p className="text-xs text-[#a0a0b8]">Partnered private arenas around {collegeName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[#a0a0b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {booked ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00] text-[#CCFF00] flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h4 className="text-xl font-black text-white font-outfit">Turf Slot Reserved!</h4>
                <p className="text-xs text-[#a0a0b8]">
                  Booking code sent to match lobby. +25 🪙 cashback awarded to your wallet!
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Turf Picker */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">
                    Select Commercial Arena
                  </label>
                  {LOCAL_TURFS.map(turf => (
                    <div
                      key={turf.id}
                      onClick={() => {
                        playClick();
                        setSelectedTurf(turf);
                        setSelectedSlot(turf.slots[0]);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedTurf.id === turf.id
                          ? 'bg-[#00F0FF]/10 border-[#00F0FF] shadow-lg shadow-[#00F0FF]/10'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="font-bold text-sm text-white">{turf.name}</h4>
                          <p className="text-[11px] text-[#6b6b80] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#00F0FF]" /> {turf.distance}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#CCFF00] font-mono block">
                            {turf.pricePerHour}
                          </span>
                          <span className="text-[10px] text-[#a0a0b8] font-mono">{turf.splitCost}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {turf.facilities.map(f => (
                          <span key={f} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[#a0a0b8] border border-white/5">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slot Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                    Available Match Slots Today
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTurf.slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => {
                          playClick();
                          setSelectedSlot(slot);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
                          selectedSlot === slot
                            ? 'bg-[#CCFF00] text-[#040507] font-black'
                            : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split Bill Summary */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#a0a0b8] block">Split-Pay Match Rate</span>
                    <span className="font-bold text-white">Automated split among squad</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#CCFF00] font-mono">{selectedTurf.splitCost}</span>
                    <span className="text-[10px] text-emerald-400 block">+25 🪙 Cashback</span>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="btn-volt w-full py-3.5 flex items-center justify-center gap-2 text-xs font-black shadow-xl"
                >
                  {booking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Reserve Slot & Post to Squad Lobby</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
