'use client';

import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, AlertCircle, Bell, BellRing, Footprints, Shield } from 'lucide-react';
import { playClick, playSuccess } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface CourtStatus {
  id: string;
  name: string;
  sport: string;
  surface: string;
  lightingCutoff: string; // e.g. "21:30"
  status: 'free' | 'busy' | 'packed' | 'unknown';
  queueTime: string;
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
  if (status === 'busy') return queueTime || 'Match in progress (Finishing soon)';
  if (status === 'packed') return queueTime || 'Court Packed (Long queue)';
  return 'No recent update';
}

function getFloodlightStatus(cutoffTime: string): { active: boolean; label: string } {
  if (!cutoffTime) return { active: false, label: 'Daylight Only' };

  const now = new Date();
  const [cutoffH, cutoffM] = cutoffTime.split(':').map(Number);
  const cutoff = new Date();
  cutoff.setHours(cutoffH, cutoffM, 0, 0);

  const startLighting = new Date();
  startLighting.setHours(17, 30, 0, 0); // 5:30 PM floodlights switch on

  if (now >= startLighting && now < cutoff) {
    const diffMins = Math.floor((cutoff.getTime() - now.getTime()) / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const timeStr = hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`;
    return { active: true, label: `💡 Lights Active (${timeStr})` };
  } else if (now < startLighting && now.getHours() >= 6) {
    return { active: false, label: `☀️ Daylight Play (Lights @ 5:30 PM)` };
  } else {
    return { active: false, label: `🌑 Lights OFF (Reopens 6:00 AM)` };
  }
}

export function CourtCrowdRadar() {
  const { currentUser } = useUIStore();
  const [courts, setCourts] = useState<CourtStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [watchedCourts, setWatchedCourts] = useState<Record<string, boolean>>({});

  const DEFAULT_COURTS: CourtStatus[] = [
    {
      id: 'c1',
      name: 'Indoor Badminton Hall (Courts 1-4)',
      sport: 'Badminton',
      surface: 'Wooden Floor · Non-Marking Shoes Required',
      lightingCutoff: '21:30',
      status: 'unknown',
      queueTime: '',
      lastUpdated: '',
    },
    {
      id: 'c2',
      name: 'Basketball Center Court (Floodlit)',
      sport: 'Basketball',
      surface: 'Acrylic Hardcourt · High Grip',
      lightingCutoff: '21:00',
      status: 'unknown',
      queueTime: '',
      lastUpdated: '',
    },
    {
      id: 'c3',
      name: 'Main Football & Athletics Stadium',
      sport: 'Football',
      surface: 'Synthetic Turf · Rubber Studs',
      lightingCutoff: '21:30',
      status: 'unknown',
      queueTime: '',
      lastUpdated: '',
    },
    {
      id: 'c4',
      name: 'Cricket Practice Nets (Pitch 1 & 2)',
      sport: 'Cricket',
      surface: 'Astro Turf Practice Strip',
      lightingCutoff: '20:30',
      status: 'unknown',
      queueTime: '',
      lastUpdated: '',
    },
    {
      id: 'c5',
      name: 'Table Tennis Activity Center',
      sport: 'Table Tennis',
      surface: 'Stiga Pro Indoor Hall',
      lightingCutoff: '21:30',
      status: 'unknown',
      queueTime: '',
      lastUpdated: '',
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetch('/api/radar')
      .then(r => r.json())
      .then(data => {
        const updates = data.updates || {};
        const merged = DEFAULT_COURTS.map(court => {
          const update = updates[court.id];
          if (update) {
            return {
              ...court,
              status: update.status as CourtStatus['status'],
              lastUpdated: formatRelativeTime(update.timestamp),
              lastUpdatedBy: update.updatedBy || 'Campus Athlete',
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
      setToastMsg('Sign in with your campus account to update court status.');
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
      setToastMsg('✓ Status updated. Thank you for helping your campus athletes!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setToastMsg('Failed to update. Please try again.');
      setTimeout(() => setToastMsg(null), 2500);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleWatch = (courtId: string, courtName: string) => {
    playClick();
    const isWatched = !watchedCourts[courtId];
    setWatchedCourts(prev => ({ ...prev, [courtId]: isWatched }));

    if (isWatched) {
      setToastMsg(`🔔 Watching ${courtName} — You'll be alerted when it frees up!`);
    } else {
      setToastMsg(`Unsubscribed from ${courtName}`);
    }
    setTimeout(() => setToastMsg(null), 3000);
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
            <h3 className="font-outfit font-bold text-sm text-white flex items-center gap-2">
              Campus Court Telemetry
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] font-bold border border-[#00F0FF]/20">
                LIVE
              </span>
            </h3>
            <p className="text-[10px] text-[#6b6b80]">
              Real-time court occupancy, surface specs &amp; campus floodlight timers
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
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading campus telemetry...
        </div>
      ) : (
        <div className="space-y-2.5">
          {courts.map(c => {
            const color = statusColor(c.status);
            const label = statusLabel(c.status, c.queueTime);
            const isUnknown = c.status === 'unknown';
            const lighting = getFloodlightStatus(c.lightingCutoff);
            const isWatched = watchedCourts[c.id];

            return (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/10 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-white truncate">{c.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                        lighting.active
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-white/5 text-[#a0a0b8] border-white/10'
                      }`}
                    >
                      {lighting.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[#a0a0b8] mt-1 font-mono">
                    <span className="text-[#6b6b80] flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-[#CCFF00]" />
                      {c.surface}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    {isUnknown ? (
                      <span className="text-[10px] text-[#6b6b80] font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        No report yet today — be the first to update
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold" style={{ color }}>
                        ● {label}
                        {c.lastUpdated && (
                          <span className="text-[#6b6b80] font-normal ml-2">
                            · {c.lastUpdatedBy} ({c.lastUpdated})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Watch Button */}
                  <button
                    onClick={() => toggleWatch(c.id, c.name)}
                    title="Notify me when this court becomes free"
                    className={`p-1.5 rounded-lg text-xs transition-all border ${
                      isWatched
                        ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40'
                        : 'bg-transparent text-[#6b6b80] border-white/10 hover:text-white'
                    }`}
                  >
                    {isWatched ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(c.id, 'free')}
                    disabled={updatingId === c.id}
                    aria-label={`Mark ${c.name} as free`}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                      c.status === 'free'
                        ? 'bg-[#CCFF00] text-[#040507] border-[#CCFF00] font-bold shadow-sm'
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
                        ? 'bg-[#FF2A55] text-white border-[#FF2A55] font-bold shadow-sm'
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
        Campus telemetry is community-reported. Reports expire after 2 hours to maintain data integrity.
      </p>
    </div>
  );
}
