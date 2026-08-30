'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Radio, X, Users, MapPin, Clock, Zap, Check, AlertTriangle, Loader2
} from 'lucide-react';
import { playClick, playSuccess, playDuel } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';
import { getActiveCampusConfig } from '@/lib/campus-config';

interface SOSFlareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (flareData: any) => void;
}

export function SOSFlareModal({ isOpen, onClose, onBroadcast }: SOSFlareModalProps) {
  const { currentUser } = useUIStore();
  const campusConfig = getActiveCampusConfig();
  
  const [sport, setSport] = useState('Badminton');
  const [venue, setVenue] = useState(campusConfig.venues[0]?.name || 'Main Sports Arena');
  const [urgencyMinutes, setUrgencyMinutes] = useState(15);
  const [spotsNeeded, setSpotsNeeded] = useState(1);
  const [note, setNote] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const handleLaunchFlare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    playClick();
    setBroadcasting(true);

    try {
      const flare = {
        id: `flare-${Date.now()}`,
        sport,
        venue,
        hostName: currentUser.name,
        hostHostel: currentUser.hostel,
        spotsNeeded,
        expiresIn: `${urgencyMinutes} mins`,
        note: note || `Urgent ${spotsNeeded} player needed for match starting now!`,
        createdAt: new Date().toISOString(),
      };

      await fetch('/api/flare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flare),
      });

      playDuel();
      onBroadcast(flare);
      setTimeout(() => {
        setBroadcasting(false);
        onClose();
      }, 1000);
    } catch {
      setBroadcasting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="w-full max-w-md rounded-3xl border border-[#FF2A55]/50 bg-[#0A0C10] p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Red/Volt Flare Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF2A55]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FF2A55]/20 border border-[#FF2A55]/40 text-[#FF2A55] flex items-center justify-center text-xl animate-pulse">
                  🚨
                </div>
                <div>
                  <h3 className="font-outfit font-black text-lg text-white flex items-center gap-1.5">
                    Launch SOS Player Flare
                  </h3>
                  <p className="text-[11px] text-[#FF2A55] font-mono font-bold">
                    ● BROADCASTS RADAR PING TO ALL HOSTELS
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#a0a0b8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchFlare} className="space-y-4">
              
              {/* Sport Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                  Select Sport
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Badminton', 'Cricket', 'Football', 'Basketball', 'Table Tennis', 'Volleyball'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        playClick();
                        setSport(s);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-all text-center ${
                        sport === s
                          ? 'bg-[#FF2A55] text-white font-black shadow-lg shadow-[#FF2A55]/20'
                          : 'bg-white/5 text-[#a0a0b8] border border-white/10 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campus Venue */}
              <div>
                <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                  Ground / Court Location
                </label>
                <select
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF2A55]"
                >
                  {campusConfig.venues.map(v => (
                    <option key={v.id} value={v.name} className="bg-[#0A0C10]">{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Slots Needed & Urgency Timer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                    Players Needed
                  </label>
                  <select
                    value={spotsNeeded}
                    onChange={e => setSpotsNeeded(Number(e.target.value))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n} className="bg-[#0A0C10]">{n} Player{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                    Match Starts In
                  </label>
                  <select
                    value={urgencyMinutes}
                    onChange={e => setUrgencyMinutes(Number(e.target.value))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  >
                    {[5, 10, 15, 20, 30].map(m => (
                      <option key={m} value={m} className="bg-[#0A0C10]">{m} Minutes</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Urgent Note */}
              <div>
                <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">
                  Urgent Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 doubles player needed right now, racket available!"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#FF2A55]"
                />
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-3.5 rounded-xl font-black text-xs text-white transition-all bg-gradient-to-r from-[#FF2A55] to-[#DB0A40] hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#FF2A55]/30 flex items-center justify-center gap-2"
              >
                {broadcasting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Flame className="w-4 h-4 fill-current" /> Fire SOS Flare to Hostels (+15 🪙)</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
