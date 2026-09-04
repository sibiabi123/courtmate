'use client';

import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { playClick, playSuccess, playCoin } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface CourtStatus {
  id: string;
  name: string;
  sport: string;
  status: 'free' | 'busy' | 'packed' | 'unknown';
  queueTime: string;
  lightsOn: boolean;
  lastUpdated: string;
  lastUpdatedBy?: string;
}

function statusColor(status: CourtStatus['status']): string {
  if (status === 'free') return '#CCFF00';
  if (status === 'busy') return '#f59e0b';
  if (status === 'packed') return '#FF2A55';
  return '#6b6b80';
}

function statusLabel(status: CourtStatus['status'], queueTime: string): string {
  if (status === 'free') return queueTime || 'Open Slot Available';
  if (status === 'busy') return queueTime || 'Match in progress';
  if (status === 'packed') return queueTime || 'Fully occupied';
  return 'No recent update';
}

export function CourtCrowdRadar() {
  const { currentUser, addCoins } = useUIStore();
  const [courts, setCourts] = useState<CourtStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Derive default courts from campus config
  const DEFAULT_COURTS: CourtStatus[] = [
    { id: 'c1', name: 'Indoor Badminton Hall (Courts 1-4)', sport: 'Badminton', status: 'unknown', queueTime: '', lightsOn: true, lastUpdated: '' },
    { id: 'c2', name: 'Basketball Center Court (Floodlit)', sport: 'Basketball', status: 'unknown', queueTime: '', lightsOn: true, lastUpdated: '' },
    { id: 'c3', name: 'Main Football & Athletics Stadium', sport: 'Football', status: 'unknown', queueTime: '', lightsOn: true, lastUpdated: '' },
    { id: 'c4', name: 'Cricket Practice Nets (Pitch 1 & 2)', sport: 'Cricket', status: 'unknown', queueTime: '', lightsOn: false, lastUpdated: '' },
    { id: 'c5', name: 'Table Tennis Activity Center', sport: 'Table Tennis', status: 'unknown', queueTime: '', lightsOn: true, lastUpdated: '' },
  ];

  useEffect(() => {
    setLoading(true);
    fetch('/api/radar')
      .then(r => r.json())
      .then(data => {
        const updates = data.updates || {};
        // Merge API updates with default courts
        const merged = DEFAULT_COURTS.map(court => {
          const update = updates[court.id];
          if (update) {
            return {
              ...court,
              status: update.status as CourtStatus['status'],
              lastUpdated: formatRelativeTime(update.timestamp),
              lastUpdatedBy: update.updatedBy || 'Verified Athlete',
            };
          }
          return court;
        });
        setCourts(merged);
      })
      .catch(() => setCourts(DEFAULT_COURTS))
      .finally(() => setLoading(false));
  }, []);

  function formatRelativeTime(isoString: string): string {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    return `${hrs}h ago`;
  }

  const handleUpdateStatus = async (courtId: string, newStatus: 'free' | 'packed') => {
    if (!currentUser) {
      setToastMsg('Sign in to update court status and earn points.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    playClick();
    setUpdatingId(courtId);

    try {
      await fetch('/api/radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId,
          status: newStatus,
          updatedBy: currentUser.name,
        }),
      });

      setCourts(prev =>
        prev.map(c =>
          c.id === courtId
            ? {
                ...c,
                status: newStatus,
                queueTime: newStatus === 'free' ? 'Open Slot Available' : 'Fully occupied',
                lastUpdated: 'Just now',
                lastUpdatedBy: currentUser.name,
              }
            : c
        )
      );

      playSuccess();
      // Award points for real community contribution
      addCoins(5, 'Court Status Verified');
      setToastMsg('✓ Status updated. +5 points for helping your campus!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setToastMsg('Failed to update. Please try again.');
      setTimeout(() => setToastMsg(null), 2500);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A0C10] p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-sm text-white">Campus Court Status</h3>
            <p className="text-[10px] text-[#6b6b80]">
              Community-reported. Tap to update and help fellow students.
            </p>
          </div>
        </div>

        {toastMsg && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            {toastMsg}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-xs text-[#6b6b80]">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading court status...
        </div>
      ) : (
        <div className="space-y-2">
          {courts.map(c => {
            const color = statusColor(c.status);
            const label = statusLabel(c.status, c.queueTime);
            const isUnknown = c.status === 'unknown';

            return (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:border-white/10 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-xs text-white truncate">{c.name}</span>
                    {c.lightsOn && (
                      <span className="text-[9px] font-mono px-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        💡 Lights
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isUnknown ? (
                      <span className="text-[10px] text-[#6b6b80] font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        No recent update — be the first to report
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono" style={{ color }}>
                        ● {label}
                        {c.lastUpdated && (
                          <span className="text-[#6b6b80] ml-2">
                            · {c.lastUpdatedBy} · {c.lastUpdated}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'free')}
                    disabled={updatingId === c.id}
                    aria-label={`Mark ${c.name} as free`}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                      c.status === 'free'
                        ? 'bg-[#CCFF00] text-[#040507] border-[#CCFF00] font-bold'
                        : 'bg-transparent text-[#a0a0b8] border-white/10 hover:border-[#CCFF00]/40 hover:text-white'
                    }`}
                  >
                    🟢 Free
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'packed')}
                    disabled={updatingId === c.id}
                    aria-label={`Mark ${c.name} as packed`}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                      c.status === 'packed'
                        ? 'bg-[#FF2A55] text-white border-[#FF2A55] font-bold'
                        : 'bg-transparent text-[#a0a0b8] border-white/10 hover:border-[#FF2A55]/40 hover:text-white'
                    }`}
                  >
                    🔴 Packed
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[10px] text-[#6b6b80] text-center">
        Help your campus by reporting court availability. Updates expire after 2 hours.
      </p>
    </div>
  );
}
