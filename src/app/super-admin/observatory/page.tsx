'use client';

import { useState } from 'react';

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: {
    reason?: string;
    score?: number;
    message?: string;
    userCount?: number;
    postCount?: number;
  };
  createdAt: string;
}

export default function ObservatoryPage() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 'l1',
      adminId: 'u-admin-1',
      action: 'auto_mod_chat_block',
      targetType: 'match_room',
      targetId: 'mr-452',
      metadata: { message: 'toxic swearing message', score: 0.92 },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'l2',
      adminId: 'u-admin-1',
      action: 'db_seed',
      targetType: 'system',
      targetId: 'all',
      metadata: { userCount: 50, postCount: 20 },
      createdAt: new Date(Date.now() - 50000).toISOString(),
    },
    {
      id: 'l3',
      adminId: 'u-admin-1',
      action: 'ban_user',
      targetType: 'user',
      targetId: 'user-78',
      metadata: { reason: 'Cheating/Geo-spoofing in check-in' },
      createdAt: new Date(Date.now() - 120000).toISOString(),
    },
  ]);

  const [geoRadius, setGeoRadius] = useState(100);

  return (
    <main className="min-h-screen pt-24 pb-20" style={{ background: '#0a0a0f' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-outfit text-white">Super-Admin Observatory</h1>
          <p className="text-[#a0a0b8] text-sm mt-1">Real-time audit log streams, Kibana-style tracking, and geo check-in configuration.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Control Board ────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div
              className="rounded-2xl border p-6"
              style={{
                background: 'rgba(26,26,46,0.5)',
                borderColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Geo-Checkin override</h3>
              <p className="text-[#a0a0b8] text-xs mb-6">
                Adjust the geofence check-in radius for tournaments or campus fests (e.g. Riviera).
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-2">
                  Check-in Radius (meters)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={geoRadius}
                    onChange={(e) => setGeoRadius(parseInt(e.target.value))}
                    className="flex-1 accent-[#7b2ff7]"
                  />
                  <span className="text-white font-bold font-outfit text-sm">{geoRadius}m</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border p-6"
              style={{
                background: 'rgba(26,26,46,0.5)',
                borderColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Maintenance Utilities</h3>
              <p className="text-[#a0a0b8] text-xs mb-6">
                Manual trigger tools to wipe records or run a system re-seed.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  className="rounded-xl py-2.5 text-xs font-bold text-white hover:scale-[1.02] transition-all"
                  style={{ background: '#7b2ff7' }}
                >
                  ⚡ Trigger Seed Database
                </button>
                <button
                  className="rounded-xl py-2.5 text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                >
                  🧹 Clear/Wipe Database
                </button>
              </div>
            </div>
          </div>

          {/* ─── Log Stream (Kibana Stream) ────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border p-6 h-[500px] flex flex-col"
              style={{
                background: 'rgba(26,26,46,0.5)',
                borderColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold text-white">Audit Log Stream</h3>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  ● Realtime Monitoring
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-[#6b6b80] mb-1.5">
                      <span>Action: <strong className="text-[#00f5d4]">{log.action}</strong></span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-white mb-1">
                      Target: {log.targetType} ({log.targetId})
                    </div>
                    {log.metadata.message && (
                      <div className="text-red-400 text-[11px] bg-red-500/5 p-2 rounded-lg border border-red-500/10 mt-1">
                        Block: "{log.metadata.message}" (Score: {log.metadata.score})
                      </div>
                    )}
                    {log.metadata.reason && (
                      <div className="text-orange-400 text-[11px] mt-1">
                        Reason: {log.metadata.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
