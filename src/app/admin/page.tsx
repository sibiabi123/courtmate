'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Database, Users, FileText, Trophy, Flag,
  RefreshCw, Download, Trash2, Check, X, LogOut, Eye, EyeOff,
  Search, Plus, MapPin, Building2, CheckCircle2
} from 'lucide-react';
import { playClick, playSuccess } from '@/lib/sound';
import { getActiveCampusConfig, updateActiveCampusConfig } from '@/lib/campus-config';

const ADMIN_PASSWORD = 'Admin@123';

type AdminTab = 'campus' | 'tournaments' | 'users' | 'tables';

type TableName = 'users' | 'posts' | 'challenges' | 'tournaments' | 'matches' | 'reports' | 'notifications';

const TABLES: { key: TableName; label: string; icon: any }[] = [
  { key: 'users', label: 'Athletes & Users', icon: Users },
  { key: 'posts', label: 'Match Posts', icon: FileText },
  { key: 'challenges', label: '1v1 Duels', icon: Shield },
  { key: 'tournaments', label: 'Tournaments', icon: Trophy },
  { key: 'reports', label: 'Disputes & Reports', icon: Flag },
];

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  
  const [activeTab, setActiveTab] = useState<AdminTab>('campus');
  const [activeTable, setActiveTable] = useState<TableName>('users');
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Campus Config State
  const [campusState, setCampusState] = useState(getActiveCampusConfig());
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueSport, setNewVenueSport] = useState('Badminton');
  const [newHostelName, setNewHostelName] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchTable = useCallback(async (table: TableName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/table?table=${table}`);
      const data = await res.json();
      setTableData(data.rows || []);
    } catch {
      setTableData([]);
    }
    setLoading(false);
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/counts');
      const data = await res.json();
      setTableCounts(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (authed) {
      if (activeTab === 'tables') fetchTable(activeTable);
      fetchCounts();
    }
  }, [authed, activeTab, activeTable, fetchTable, fetchCounts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwdError('');
      playSuccess();
    } else {
      setPwdError('Incorrect password.');
    }
  };

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName) return;
    playClick();

    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_venue',
        data: { name: newVenueName, sport: newVenueSport, type: 'outdoor', hasLighting: true },
      }),
    });
    const data = await res.json();
    if (data.success) {
      setCampusState(data.config);
      setNewVenueName('');
      playSuccess();
      showToast('✓ Ground added successfully!');
    }
  };

  const handleDeleteVenue = async (id: string) => {
    playClick();
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_venue', data: { id } }),
    });
    const data = await res.json();
    if (data.success) {
      setCampusState(data.config);
      showToast('Ground removed.');
    }
  };

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostelName) return;
    playClick();

    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_hostel',
        data: { name: newHostelName, gender: 'mens' },
      }),
    });
    const data = await res.json();
    if (data.success) {
      setCampusState(data.config);
      setNewHostelName('');
      playSuccess();
      showToast('✓ Hostel block added!');
    }
  };

  const handleDeleteHostel = async (id: string) => {
    playClick();
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_hostel', data: { id } }),
    });
    const data = await res.json();
    if (data.success) {
      setCampusState(data.config);
      showToast('Hostel removed.');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#040507] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0A0C10] p-8 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="font-outfit font-black text-xl text-white">CourtMate Admin</h2>
          </div>
          <p className="text-xs text-[#6b6b80] mb-6">Master management suite for campus sports</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="Enter Master Admin Password..."
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b80] hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwdError && <p className="text-xs text-[#FF2A55]">{pwdError}</p>}
            <button type="submit" className="btn-volt w-full py-3 text-xs font-black">
              Unlock Master Suite
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040507] pt-20 pb-20 px-4 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 mb-2 font-mono">
              <Shield className="w-3.5 h-3.5" /> Campus Operations Suite
            </div>
            <h1 className="text-3xl font-black font-outfit text-white">
              Campus Sports & Community <span className="text-[#CCFF00]">Director</span>
            </h1>
            <p className="text-xs text-[#a0a0b8] mt-1">
              Manage grounds, hostel blocks, disputes, and athletic records
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthed(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-[#FF2A55]/20 text-[#FF2A55] border border-white/10 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {[
            { id: 'campus', label: '🏛️ Campus Grounds & Hostels', icon: MapPin },
            { id: 'tournaments', label: '🏆 Tournament Director', icon: Trophy },
            { id: 'users', label: '👥 Athlete Manager', icon: Users },
            { id: 'tables', label: '💾 Database & Records', icon: Database },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  playClick();
                  setActiveTab(t.id as AdminTab);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-[#CCFF00] text-[#040507] shadow-lg shadow-[#CCFF00]/20'
                    : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {toast && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
            {toast}
          </div>
        )}

        {/* ── TAB 1: CAMPUS GROUNDS & HOSTELS ── */}
        {activeTab === 'campus' && (
          <div className="space-y-8">
            {/* Sports Grounds Config */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-outfit font-black text-xl text-white">Campus Sports Grounds & Courts</h3>
                  <p className="text-xs text-[#a0a0b8]">Add or delete courts anytime. Changes update match feed instantly.</p>
                </div>

                <form onSubmit={handleAddVenue} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tennis Court #3"
                    value={newVenueName}
                    onChange={e => setNewVenueName(e.target.value)}
                    className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                  />
                  <button type="submit" className="btn-volt px-4 py-2 text-xs font-black shrink-0 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Ground
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {campusState.venues.map(v => (
                  <div key={v.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{v.name}</h4>
                      <span className="text-[10px] text-[#6b6b80]">{v.sport} · {v.type}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteVenue(v.id)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#FF2A55]/20 text-[#6b6b80] hover:text-[#FF2A55] flex items-center justify-center transition-all"
                      aria-label={`Delete ${v.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hostel Residence Blocks Config */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-outfit font-black text-xl text-white">Hostel Residence Blocks</h3>
                  <p className="text-xs text-[#a0a0b8]">Dorms appear in the registration dropdown and Olympic leaderboard.</p>
                </div>

                <form onSubmit={handleAddHostel} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-S Block"
                    value={newHostelName}
                    onChange={e => setNewHostelName(e.target.value)}
                    className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                  />
                  <button type="submit" className="btn-volt px-4 py-2 text-xs font-black shrink-0 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Block
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {campusState.hostels.map(h => (
                  <div key={h.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{h.name}</span>
                    <button
                      onClick={() => handleDeleteHostel(h.id)}
                      className="text-[#6b6b80] hover:text-[#FF2A55]"
                      aria-label={`Delete ${h.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: TOURNAMENTS ── */}
        {activeTab === 'tournaments' && (
          <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 sm:p-8 shadow-xl">
            <h3 className="font-outfit font-black text-xl text-white mb-2">Campus Tournament Director</h3>
            <p className="text-xs text-[#a0a0b8] mb-6">
              Create and manage collegiate cups, single-elimination brackets, and inter-hostel leagues.
            </p>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <Trophy className="w-10 h-10 text-[#CCFF00] mx-auto mb-2 opacity-80" />
              <h4 className="font-bold text-sm text-white">Tournaments Synced with Database</h4>
              <p className="text-xs text-[#6b6b80] max-w-md mx-auto mt-1">
                View tournaments and registrations in the &quot;Database &amp; Records&quot; tab or create new brackets in the main tournaments portal.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 3: ATHLETE MANAGER ── */}
        {activeTab === 'users' && (
          <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 sm:p-8 shadow-xl">
            <h3 className="font-outfit font-black text-xl text-white mb-2">Campus Athlete Community</h3>
            <p className="text-xs text-[#a0a0b8] mb-6">
              Manage registered students, attendance karma, fair-play disputes, and suspensions.
            </p>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <Users className="w-10 h-10 text-[#00F0FF] mx-auto mb-2 opacity-80" />
              <h4 className="font-bold text-sm text-white">Athlete Roster</h4>
              <p className="text-xs text-[#6b6b80] max-w-md mx-auto mt-1">
                {tableCounts['users'] || 0} registered athletes across campus hostels. Switch to Database tab to export full roster CSV.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 4: DATABASE & CSV EXPORT ── */}
        {activeTab === 'tables' && (
          <div className="rounded-3xl border border-white/10 bg-[#0A0C10] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div className="flex gap-2 overflow-x-auto">
                {TABLES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setActiveTable(t.key);
                      fetchTable(t.key);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTable === t.key
                        ? 'bg-[#CCFF00] text-[#040507] font-black'
                        : 'bg-white/5 text-[#a0a0b8] hover:text-white'
                    }`}
                  >
                    {t.label} ({tableCounts[t.key] || 0})
                  </button>
                ))}
              </div>

              <button
                onClick={() => downloadCSV(tableData, `${activeTable}.csv`)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#6b6b80] font-mono">LOADING DATABASE ROWS...</div>
            ) : tableData.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6b6b80]">No records in this table yet.</div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 pb-2 text-[#6b6b80]">
                      {Object.keys(tableData[0]).slice(0, 6).map(k => (
                        <th key={k} className="pb-2 pr-4">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        {Object.keys(tableData[0]).slice(0, 6).map(k => (
                          <td key={k} className="py-2.5 pr-4 truncate max-w-[150px]">
                            {String(row[k] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
