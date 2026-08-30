'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Users, Zap, Check, AlertCircle, Sparkles,
  Sun, Moon, RefreshCw
} from 'lucide-react';
import { playClick, playCoin, playSuccess } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface CourtStatus {
  id: string;
  name: string;
  sport: string;
  status: 'free' | 'busy' | 'packed';
  queueTime: string;
  lightsOn: boolean;
  lastUpdated: string;
}

const INITIAL_COURTS: CourtStatus[] = [
  { id: 'c1', name: 'Indoor Badminton Hall (Courts 1-4)', sport: 'Badminton', status: 'packed', queueTime: '30m wait (3 squads)', lightsOn: true, lastUpdated: '5m ago' },
  { id: 'c2', name: 'Basketball Center Court (Floodlit)', sport: 'Basketball', status: 'free', queueTime: 'Open Slot Available', lightsOn: true, lastUpdated: '12m ago' },
  { id: 'c3', name: 'Main Football & Athletics Stadium', sport: 'Football', status: 'busy', queueTime: '7v7 Match in-progress (15m left)', lightsOn: true, lastUpdated: '8m ago' },
  { id: 'c4', name: 'Cricket Practice Nets (Pitch 1 & 2)', sport: 'Cricket', status: 'free', queueTime: 'Free Pitch', lightsOn: false, lastUpdated: '20m ago' },
  { id: 'c5', name: 'Table Tennis Activity Center', sport: 'Table Tennis', status: 'packed', queueTime: 'All 4 Tables In Use', lightsOn: true, lastUpdated: '2m ago' },
];

export function CourtCrowdRadar() {
  const { currentUser, addCoins } = useUIStore();
  const [courts, setCourts] = useState<CourtStatus[]>(INITIAL_COURTS);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleUpdateStatus = (courtId: string, newStatus: 'free' | 'busy' | 'packed') => {
    if (!currentUser) return;
    playClick();
    setUpdatingId(courtId);

    setTimeout(() => {
      setCourts(prev =>
        prev.map(c =>
          c.id === courtId
            ? {
                ...c,
                status: newStatus,
                queueTime: newStatus === 'free' ? 'Open Slot Available' : newStatus === 'busy' ? 'Short 10m queue' : 'Packed (30m+ wait)',
                lastUpdated: 'Just now',
              }
            : c
        )
      );

      playSuccess();
      playCoin();
      addCoins(5, 'Campus Court Radar Verification');

      try {
        import('@/hooks/useCoinEarn').then(({ emitCoinEarn }) => {
          emitCoinEarn({
            amount: 5,
            reason: 'Court Radar Status Verified! (+5 🪙)',
            icon: '📍',
          });
        });
      } catch {}

      setToastMsg('Verified! +5 🪙 awarded to wallet.');
      setTimeout(() => setToastMsg(null), 2500);
      setUpdatingId(null);
    }, 600);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-5 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-outfit font-black text-sm text-white flex items-center gap-2">
              Campus Court Crowd Radar
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] font-bold border border-[#00F0FF]/20">
                ● LIVE
              </span>
            </h3>
            <p className="text-[10px] text-[#6b6b80]">Real-time ground occupancy & floodlight tracker</p>
          </div>
        </div>

        {toastMsg && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            {toastMsg}
          </span>
        )}
      </div>

      {/* Courts List */}
      <div className="space-y-2.5">
        {courts.map(c => {
          const isFree = c.status === 'free';
          const isBusy = c.status === 'busy';
          const isPacked = c.status === 'packed';

          return (
            <div
              key={c.id}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:border-white/15 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white truncate">{c.name}</span>
                  {c.lightsOn && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold flex items-center gap-0.5">
                      💡 Lights ON
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#a0a0b8] mt-0.5 font-mono">
                  <span
                    className={`font-black ${
                      isFree ? 'text-[#CCFF00]' : isBusy ? 'text-amber-400' : 'text-[#FF2A55]'
                    }`}
                  >
                    ● {c.queueTime}
                  </span>
                  <span className="text-[#6b6b80]">· updated {c.lastUpdated}</span>
                </div>
              </div>

              {/* Quick Update Chips (Crowdsourced +5 coins) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleUpdateStatus(c.id, 'free')}
                  disabled={updatingId === c.id}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                    isFree
                      ? 'bg-[#CCFF00] text-[#040507] font-black shadow-sm'
                      : 'bg-white/5 text-[#a0a0b8] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🟢 Free
                </button>
                <button
                  onClick={() => handleUpdateStatus(c.id, 'packed')}
                  disabled={updatingId === c.id}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                    isPacked
                      ? 'bg-[#FF2A55] text-white font-black shadow-sm'
                      : 'bg-white/5 text-[#a0a0b8] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🔴 Packed
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
