'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Users, Zap, CheckCircle2, Shield, Sun, Wind, Activity,
  Clock, ArrowRight, Sparkles
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface CourtSector {
  id: string;
  name: string;
  sport: string;
  icon: string;
  status: 'active' | 'open' | 'reserved';
  activePlayers: number;
  maxPlayers: number;
  surface: string;
  lighting: string;
  currentMatch: string;
  players: string[];
}

const SECTORS: CourtSector[] = [
  {
    id: 's1',
    name: 'Championship Football Turf',
    sport: 'Football',
    icon: '⚽',
    status: 'active',
    activePlayers: 14,
    maxPlayers: 22,
    surface: 'FIFA Quality Synthetic Turf',
    lighting: '100% LED Floodlit',
    currentMatch: '7v7 Ranked Battle (Apex vs Shadow)',
    players: ['Arjun K.', 'Vikram R.', 'Dev P.', 'Karthik R.', 'Siddharth M.'],
  },
  {
    id: 's2',
    name: 'Indoor Badminton Pavilion',
    sport: 'Badminton',
    icon: '🏸',
    status: 'open',
    activePlayers: 4,
    maxPlayers: 12,
    surface: 'Yonex Pro Wooden Hardwood',
    lighting: 'Glance-Free Direct Overhead',
    currentMatch: 'Singles Ladder Training (Court #2 Open)',
    players: ['Priya S.', 'Ananya I.'],
  },
  {
    id: 's3',
    name: 'Center Basketball Hardwood',
    sport: 'Basketball',
    icon: '🏀',
    status: 'active',
    activePlayers: 10,
    maxPlayers: 15,
    surface: 'High-Grip Maple Hardwood',
    lighting: 'Championship Arena Lighting',
    currentMatch: '5v5 Pickup Game (Q3 48 - 44)',
    players: ['Rahul V.', 'Akash S.', 'Harsh B.'],
  },
  {
    id: 's4',
    name: 'Grand Slam Tennis Arena',
    sport: 'Tennis',
    icon: '🎾',
    status: 'open',
    activePlayers: 2,
    maxPlayers: 4,
    surface: 'Hard Acrylic Pro Court',
    lighting: 'Full Floodlights Active',
    currentMatch: 'Ranked Singles Duel Starting Soon',
    players: ['Deepika N.'],
  },
  {
    id: 's5',
    name: 'Cricket Box & Practice Nets',
    sport: 'Cricket',
    icon: '🏏',
    status: 'active',
    activePlayers: 12,
    maxPlayers: 16,
    surface: 'Astro-Turf Pitch',
    lighting: 'Floodlit Batting Enclosures',
    currentMatch: 'T20 Net Practice & Speed Bowling',
    players: ['Rohan G.', 'Suresh K.', 'Aman T.'],
  },
  {
    id: 's6',
    name: 'Olympic Table Tennis Hall',
    sport: 'Table Tennis',
    icon: '🏓',
    status: 'open',
    activePlayers: 6,
    maxPlayers: 12,
    surface: 'Taraflex Sports Vinyl',
    lighting: 'Anti-Glare High Lumen',
    currentMatch: 'Fast Spin Matchups (Table 1-3 Open)',
    players: ['Meera P.', 'Raj M.'],
  },
];

export function InteractiveCourtMap() {
  const [selectedSector, setSelectedSector] = useState<CourtSector>(SECTORS[0]);
  const [checkedIn, setCheckedIn] = useState<string[]>([]);

  const handleCheckIn = (sectorId: string) => {
    sound.playVictory();
    setCheckedIn(prev => [...prev, sectorId]);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111118] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00f5d4] uppercase tracking-wider mb-1">
            <Activity className="h-3.5 w-3.5" /> Interactive Venue Radar
          </div>
          <h3 className="font-outfit font-black text-2xl text-white">Live Stadium & Court Map</h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Live Matches
          </span>
          <span className="flex items-center gap-1.5 text-[#00f5d4]">
            <span className="h-2 w-2 rounded-full bg-[#00f5d4]" /> Open Slots
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── INTERACTIVE TOP-DOWN STADIUM RADAR ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SECTORS.map((sec) => {
              const isSelected = selectedSector.id === sec.id;
              const isLive = sec.status === 'active';

              return (
                <motion.button
                  key={sec.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSector(sec);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#7b2ff7]/30 to-[#00f5d4]/20 border-[#00f5d4] shadow-lg shadow-[#00f5d4]/10'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{sec.icon}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-[#00f5d4]'}`} />
                  </div>

                  <div>
                    <h4 className="font-outfit font-black text-white text-xs sm:text-sm line-clamp-1 mb-0.5">{sec.name}</h4>
                    <p className="text-[10px] text-[#a0a0b8]">{sec.activePlayers}/{sec.maxPlayers} Players Active</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── SECTOR DETAILS PANEL ── */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSector.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 rounded-3xl border border-white/15 bg-white/[0.03] shadow-xl relative overflow-hidden"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-2.5 rounded-2xl bg-white/5 border border-white/10">{selectedSector.icon}</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  selectedSector.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#00f5d4]/15 text-[#00f5d4] border border-[#00f5d4]/30'
                }`}>
                  {selectedSector.status === 'active' ? '⚡ Live Match' : '🟢 Court Available'}
                </span>
              </div>

              <h3 className="font-outfit font-black text-xl text-white mb-1">{selectedSector.name}</h3>
              <p className="text-xs text-[#ffd60a] font-semibold mb-4">{selectedSector.currentMatch}</p>

              {/* Court Specs */}
              <div className="space-y-2 py-3 px-4 rounded-2xl bg-[#0a0a0f] border border-white/10 text-xs text-[#a0a0b8] mb-5">
                <div className="flex justify-between">
                  <span>Surface:</span>
                  <span className="font-bold text-white">{selectedSector.surface}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lighting:</span>
                  <span className="font-bold text-white">{selectedSector.lighting}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Capacity:</span>
                  <span className="font-bold text-[#00f5d4]">{selectedSector.activePlayers} / {selectedSector.maxPlayers} Slots</span>
                </div>
              </div>

              {/* Checked In Athletes */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2">Checked-In Athletes</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSector.players.map((p, idx) => (
                    <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Check In / Reserve Action */}
              <button
                onClick={() => handleCheckIn(selectedSector.id)}
                disabled={checkedIn.includes(selectedSector.id)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs text-white transition-all shadow-xl ${
                  checkedIn.includes(selectedSector.id)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'hover:scale-[1.02]'
                }`}
                style={!checkedIn.includes(selectedSector.id) ? { background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' } : {}}
              >
                {checkedIn.includes(selectedSector.id) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Checked In at {selectedSector.name}!
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Check In / Claim Court Slot
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
