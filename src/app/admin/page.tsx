'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, Users, FileText, Trophy, CreditCard, Flag, BookOpen, RefreshCw, Download, Trash2, Edit2, Check, X, LogOut, Eye, EyeOff, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const ADMIN_PASSWORD = 'Admin@123';

type TableName = 'users' | 'posts' | 'tournaments' | 'matches' | 'transactions' | 'reports' | 'audit_logs';

const TABLES: { key: TableName; label: string; icon: React.ComponentType<{className?: string}> }[] = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'posts', label: 'Match Posts', icon: FileText },
  { key: 'tournaments', label: 'Tournaments', icon: Trophy },
  { key: 'matches', label: 'Matches', icon: Database },
  { key: 'transactions', label: 'Transactions', icon: CreditCard },
  { key: 'reports', label: 'Reports', icon: Flag },
  { key: 'audit_logs', label: 'Audit Logs', icon: BookOpen },
];

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [activeTable, setActiveTable] = useState<TableName>('users');
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const PAGE_SIZE = 15;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchTable = useCallback(async (table: TableName) => {
    setLoading(true);
    setSearch('');
    setPage(1);
    try {
      const res = await fetch(`/api/admin/table?table=${table}`);
      const data = await res.json();
      setTableData(data.rows || []);
    } catch { setTableData([]); }
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
    if (authed) { fetchTable(activeTable); fetchCounts(); }
  }, [authed, activeTable, fetchTable, fetchCounts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) { setAuthed(true); setPwdError(''); }
    else { setPwdError('Incorrect password.'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/delete?table=${activeTable}&id=${id}`, { method: 'DELETE' });
      if (res.ok) { setTableData(prev => prev.filter((r: any) => r.id !== id)); showToast('Row deleted.'); }
    } catch { showToast('Delete failed.'); }
    setDeleteId(null);
  };

  const handleSave = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: activeTable, row: editRow }),
      });
      if (res.ok) {
        setTableData(prev => prev.map((r: any) => r.id === (editRow as any).id ? editRow : r));
        showToast('Row updated.');
        setEditRow(null);
      }
    } catch { showToast('Update failed.'); }
    setSaving(false);
  };

  const filtered = tableData.filter(row =>
    search === '' || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const columns = tableData.length > 0 ? Object.keys(tableData[0]).filter(k => k !== 'hash') : [];

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black font-outfit text-white">Admin Access</h1>
            <p className="text-[#6b6b80] mt-2 font-body">Enter the master admin password to view database</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 p-8 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)}
                placeholder="Admin password" required autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all font-body text-sm" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80]">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwdError && <p className="text-red-400 text-sm font-body">{pwdError}</p>}
            <button type="submit" className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              Enter Admin Panel
            </button>
          </form>
          <p className="text-center text-xs text-[#4a4a5a] mt-4 font-body">Access restricted to authorized administrators only.</p>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-emerald-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/8 pt-20 pb-6 flex flex-col" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#7b2ff7]" />
            <span className="font-black text-white font-outfit">Admin Panel</span>
          </div>
          <p className="text-xs text-[#6b6b80] mt-1 font-body">CourtMate Live Database</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {TABLES.map(t => {
            const Icon = t.icon;
            const active = activeTable === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTable(t.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-[#7b2ff7]/20 text-[#00f5d4]' : 'text-[#6b6b80] hover:text-white hover:bg-white/5'
                }`}>
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />{t.label}
                </div>
                {tableCounts[t.key] !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white font-mono">{tableCounts[t.key]}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-5 mt-4">
          <button onClick={() => setAuthed(false)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all font-bold">
            <LogOut className="w-4 h-4" /> Lock Panel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-10 px-6 overflow-auto">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black font-outfit text-white">{TABLES.find(t => t.key === activeTable)?.label}</h2>
              <p className="text-sm text-[#6b6b80] font-body">{filtered.length} records</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchTable(activeTable)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[#a0a0b8] border border-white/10 hover:bg-white/5 transition-all font-semibold">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={() => downloadCSV(tableData, `${activeTable}.csv`)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[#00f5d4] border border-[#00f5d4]/20 hover:bg-[#00f5d4]/10 transition-all font-semibold">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search all columns..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#4a4a5a] focus:outline-none focus:border-[#7b2ff7] transition-all font-body" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-[#6b6b80] font-body">Loading...</div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6b6b80] font-body">
              <Database className="w-10 h-10 mb-3 opacity-30 text-white" />
              <p>No records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {columns.map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-[#6b6b80] uppercase tracking-wider whitespace-nowrap">{col}</th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b6b80] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginated.map((row: any, ri) => (
                    <motion.tr key={row.id || ri} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: ri * 0.02 }}
                      className="hover:bg-white/3 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="px-4 py-3 text-[#a0a0b8] whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis font-mono text-xs">
                          {col === 'is_banned' ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ row[col] ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400' }`}>{row[col] ? 'Banned' : 'Active'}</span>
                          ) : col === 'role' ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ row[col] === 'super_admin' ? 'bg-[#7b2ff7]/20 text-[#7b2ff7]' : row[col] === 'admin' ? 'bg-[#ffd60a]/20 text-[#ffd60a]' : 'bg-white/8 text-white' }`}>{row[col]}</span>
                          ) : col === 'status' ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ row[col] === 'open' ? 'bg-emerald-500/15 text-emerald-400' : row[col] === 'full' ? 'bg-red-500/15 text-red-400' : row[col] === 'upcoming' ? 'bg-blue-500/15 text-blue-400' : 'bg-white/8 text-white' }`}>{row[col]}</span>
                          ) : String(row[col] ?? '-')}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditRow({ ...row })} className="p-1.5 rounded-lg text-[#6b6b80] hover:text-[#00f5d4] hover:bg-[#00f5d4]/10 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-lg text-[#6b6b80] hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[#6b6b80] font-body">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-white/10 text-[#6b6b80] hover:text-white disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-white/10 text-[#6b6b80] hover:text-white disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editRow && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60" onClick={() => setEditRow(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
              style={{ background: 'rgba(17,17,24,0.98)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white font-outfit">Edit Row</h3>
                <button onClick={() => setEditRow(null)} className="text-[#6b6b80] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 font-body">
                {Object.entries(editRow).filter(([k]) => !['id', 'hash', 'created_at'].includes(k)).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-xs text-[#6b6b80] mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                    <input type="text" value={String(val ?? '')} onChange={e => setEditRow(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7b2ff7]" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditRow(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-[#6b6b80] hover:text-white font-semibold">Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 rounded-2xl border border-white/10 p-6 shadow-2xl" style={{ background: 'rgba(17,17,24,0.98)' }}>
              <h3 className="font-bold text-white mb-2 font-outfit">Delete Row?</h3>
              <p className="text-sm text-[#6b6b80] mb-5 font-body">This action cannot be undone.</p>
              <div className="flex gap-3 font-semibold text-sm">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all">Delete</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#6b6b80] hover:text-white">Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
