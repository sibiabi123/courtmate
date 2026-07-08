'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import {
  ShieldAlert, Shield, Users, Trophy, Flag, History, Activity, AlertTriangle,
  Ban, CheckCircle, Trash2, Edit, Save, X, Lock, Unlock, Mail, Settings,
  MessageSquare, LayoutGrid, Gamepad2, ChevronRight, Zap, RefreshCw, Send,
  Terminal, Monitor, Radio
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area
} from 'recharts';
import type { User, Tournament, Post, Group } from '@/types';
import { getInitials } from '@/lib/utils';
import { verifyAdminPassword } from '@/actions/admin';
import Link from 'next/link';

export default function SuperAdminPage() {
  const {
    adminSession, setAdminSession, users, tournaments, posts, groups, reports, adminActions,
    deleteUser, updateUser, addXpToUser, deletePost, deleteTournament, updateTournament,
    generateBracket, updateMatchScore, deleteGroup, resolveReport, broadcastNotification
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Editing states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', icon: '📢' });
  const [matchUpdateForm, setMatchUpdateForm] = useState({ tId: '', mId: '', p1: 0, p2: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyAdminPassword(loginForm.password);
    if (res.success) {
      setAdminSession(true);
    } else {
      setLoginError(res.error || 'ACCESS DENIED. INVALID CREDENTIALS.');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/20" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="glass-strong border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Terminal className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-mono text-center text-red-500 mb-2 font-bold tracking-widest">SYSTEM OVERRIDE</h1>
            <p className="text-center text-red-400/60 text-xs font-mono mb-8">SUPER_ADMIN_AUTH_REQUIRED</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500/50" />
                  <input 
                    type="email"
                    required
                    placeholder="Admin Email"
                    className="w-full bg-black/50 border border-red-500/30 rounded-lg py-3 pl-10 pr-4 text-red-100 placeholder-red-500/30 focus:outline-none focus:border-red-500 font-mono text-sm"
                    value={loginForm.email}
                    onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500/50" />
                  <input 
                    type="password"
                    required
                    placeholder="Auth Key"
                    className="w-full bg-black/50 border border-red-500/30 rounded-lg py-3 pl-10 pr-4 text-red-100 placeholder-red-500/30 focus:outline-none focus:border-red-500 font-mono text-sm"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
              </div>

              {loginError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-mono p-3 rounded text-center">
                  {loginError}
                </motion.div>
              )}

              <button type="submit" className="w-full bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-500 font-mono font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Unlock className="h-4 w-4" /> INITIATE OVERRIDE
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Dashboard Data ---
  const usersByDay = users.reduce((acc, user) => {
    const date = new Date(user.joinedAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const userChartData = Object.entries(usersByDay).map(([date, count]) => ({ date, Users: count }));

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'tournaments', label: 'Tournament Ops', icon: Trophy },
    { id: 'content', label: 'Content Control', icon: LayoutGrid },
    { id: 'reports', label: 'Active Reports', icon: Flag, badge: reports.filter(r => r.status === 'pending').length },
    { id: 'broadcast', label: 'Broadcast System', icon: Radio },
    { id: 'audit', label: 'Audit Log', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#050508] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] flex items-center gap-3">
              <Shield className="h-8 w-8 text-[#ff006e]" />
              Super Admin Override
            </h1>
            <p className="text-[#a0a0b8] text-sm mt-1">Full database manipulation and moderation capabilities unlocked.</p>
          </div>
          <button 
            onClick={() => setAdminSession(false)}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 text-sm font-medium transition-colors"
          >
            <Lock className="h-4 w-4" /> Terminate Session
          </button>
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' 
                      : 'text-[#a0a0b8] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#00f5d4]' : ''}`} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-[#ff006e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="glass rounded-2xl p-6 min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* --- DASHBOARD TAB --- */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Command Center</h2>
                      
                      {/* Database Seeder Control Panel */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const seedUsers = [
                              {
                                id: 'u1',
                                name: 'Arjun Kumar',
                                email: 'arjun.kumar2026@vitstudent.ac.in',
                                vitId: '26BCE0120',
                                hostel: 'MH-A Block',
                                avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=arjun',
                                bio: 'Cricket enthusiast and FIFA pro. Always down for a match at Main Ground!',
                                preferredGames: ['g-cricket', 'g-fifa'],
                                skillLevel: 'pro' as const,
                                role: 'student' as const,
                                isBanned: false,
                                xp: 450,
                                level: 3,
                                joinedAt: new Date().toISOString(),
                                isOnline: true,
                                stats: { gamesPlayed: 15, wins: 10, losses: 5, tournamentsWon: 1, tournamentsPlayed: 3, groupsJoined: 2, postsCreated: 4, winRate: 66.7 }
                              },
                              {
                                id: 'u2',
                                name: 'Priya Sharma',
                                email: 'priya.sharma2026@vitstudent.ac.in',
                                vitId: '26BEE0452',
                                hostel: 'LH-D Block',
                                avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=priya',
                                bio: 'Badminton singles player. Hit me up for Gymkhana matchups!',
                                preferredGames: ['g-badminton', 'g-tabletennis'],
                                skillLevel: 'intermediate' as const,
                                role: 'student' as const,
                                isBanned: false,
                                xp: 220,
                                level: 2,
                                joinedAt: new Date().toISOString(),
                                isOnline: false,
                                stats: { gamesPlayed: 8, wins: 5, losses: 3, tournamentsWon: 0, tournamentsPlayed: 1, groupsJoined: 1, postsCreated: 2, winRate: 62.5 }
                              },
                              {
                                id: 'u3',
                                name: 'Rahul Verma',
                                email: 'rahul.verma2026@vitstudent.ac.in',
                                vitId: '26BME0981',
                                hostel: 'MH-Q Block',
                                avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=rahul',
                                bio: 'Basketball player. Love half-court pickup games.',
                                preferredGames: ['g-basketball', 'g-volleyball'],
                                skillLevel: 'pro' as const,
                                role: 'student' as const,
                                isBanned: false,
                                xp: 610,
                                level: 4,
                                joinedAt: new Date().toISOString(),
                                isOnline: true,
                                stats: { gamesPlayed: 24, wins: 17, losses: 7, tournamentsWon: 2, tournamentsPlayed: 4, groupsJoined: 3, postsCreated: 6, winRate: 70.8 }
                              }
                            ];

                            const seedPosts = [
                              {
                                id: 'post-1',
                                userId: 'u1',
                                gameId: 'g-cricket',
                                message: 'Need 4 players for a casual T20 tennis ball cricket game at Main Ground. Starting at 5 PM today!',
                                location: 'Main Ground (Football/Cricket)',
                                time: '17:00',
                                date: '2026-07-02',
                                slotsTotal: 11,
                                slotsFilled: 2,
                                responses: [
                                  { id: 'r-1', postId: 'post-1', userId: 'u1', status: 'joined' as const, createdAt: new Date().toISOString() },
                                  { id: 'r-2', postId: 'post-1', userId: 'u3', status: 'joined' as const, createdAt: new Date().toISOString() }
                                ],
                                createdAt: new Date().toISOString(),
                                isPinned: false,
                                status: 'active' as const,
                                contactMethod: 'WhatsApp',
                                contactInfo: '+91 9876543210'
                              },
                              {
                                id: 'post-2',
                                userId: 'u2',
                                gameId: 'g-badminton',
                                message: 'Badminton doubles at Gymkhana. Booking Court 3 at 3 PM. Need 1 player to fill the slot!',
                                location: 'Badminton Court (Indoor)',
                                time: '15:00',
                                date: '2026-07-02',
                                slotsTotal: 4,
                                slotsFilled: 1,
                                responses: [
                                  { id: 'r-3', postId: 'post-2', userId: 'u2', status: 'joined' as const, createdAt: new Date().toISOString() }
                                ],
                                createdAt: new Date().toISOString(),
                                isPinned: true,
                                status: 'active' as const,
                                contactMethod: 'Telegram',
                                contactInfo: '@priyabadminton'
                              }
                            ];

                            const seedTournaments = [
                              {
                                id: 'tour-1',
                                name: 'VIT Monsoon Cricket Blitz',
                                gameId: 'g-cricket',
                                createdBy: 'u1',
                                description: 'The ultimate T10 box cricket tournament. 16 teams battle for the golden trophy.',
                                rules: 'T10 format. 6 players per team. Tournament is knockout format.',
                                venue: 'Main Ground (Football/Cricket)',
                                dateTime: '2026-07-15T10:00:00.000Z',
                                prize: '₹10,000 Cash Prize + Trophy',
                                maxParticipants: 16,
                                currentParticipants: 8,
                                format: 'knockout' as const,
                                status: 'upcoming' as const,
                                registrations: [],
                                matches: [],
                                banner: '🏏',
                                entryFee: '₹200 per team'
                              },
                              {
                                id: 'tour-2',
                                name: 'Gymkhana Indoor Table Tennis Clash',
                                gameId: 'g-tabletennis',
                                createdBy: 'admin',
                                description: 'Official single-elimination TT tournament for hostel boys and girls.',
                                rules: 'Best of 3 sets. 11 points per set.',
                                venue: 'Table Tennis Room',
                                dateTime: '2026-07-10T14:30:00.000Z',
                                prize: 'VIT Champion T-shirt + Medals',
                                maxParticipants: 32,
                                currentParticipants: 14,
                                format: 'knockout' as const,
                                status: 'upcoming' as const,
                                registrations: [],
                                matches: [],
                                banner: '🏓',
                                entryFee: 'Free'
                              }
                            ];

                            const seedGroups = [
                              {
                                id: 'group-1',
                                name: 'VIT Cricket Club',
                                gameId: 'g-cricket',
                                ownerId: 'u1',
                                description: 'Official group for cricket coordination at VIT. Daily matches and box cricket nets practice.',
                                logo: '🏏',
                                requirements: 'Bring your own bat if possible!',
                                memberCount: 25,
                                maxMembers: 100,
                                members: [],
                                isOpen: true,
                                createdAt: new Date().toISOString(),
                                tags: ['Cricket', 'Main Ground', 'Daily Play']
                              },
                              {
                                id: 'group-2',
                                name: 'Shuttle Squad',
                                gameId: 'g-badminton',
                                ownerId: 'u2',
                                description: 'Badminton group for indoor Gymkhana court games. Singles, doubles, and tournaments.',
                                logo: '🏸',
                                requirements: 'Must have non-marking shoes.',
                                memberCount: 18,
                                maxMembers: 50,
                                members: [],
                                isOpen: true,
                                createdAt: new Date().toISOString(),
                                tags: ['Badminton', 'Gymkhana', 'Doubles']
                              }
                            ];

                            // Load current active user as Arjun
                            useAppStore.setState({
                              users: seedUsers,
                              posts: seedPosts,
                              tournaments: seedTournaments,
                              groups: seedGroups,
                              currentUser: seedUsers[0],
                              isAuthenticated: true,
                              isAdmin: false,
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f5d4]/10 hover:bg-[#00f5d4]/20 border border-[#00f5d4]/30 text-xs font-semibold text-[#00f5d4] transition-colors cursor-pointer"
                        >
                          <Zap className="h-3.5 w-3.5" /> Seed Campus Data
                        </button>
                        <button
                          onClick={() => {
                            useAppStore.setState({
                              users: [],
                              posts: [],
                              tournaments: [],
                              groups: [],
                              currentUser: null,
                              isAuthenticated: false,
                              isAdmin: false,
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Wipe Database
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Users', val: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Active Tourneys', val: tournaments.length, icon: Trophy, color: 'text-[#ffd60a]', bg: 'bg-[#ffd60a]/10' },
                        { label: 'Open Posts', val: posts.length, icon: MessageSquare, color: 'text-[#00f5d4]', bg: 'bg-[#00f5d4]/10' },
                        { label: 'Pending Reports', val: reports.filter(r=>r.status==='pending').length, icon: ShieldAlert, color: 'text-[#ff006e]', bg: 'bg-[#ff006e]/10' }
                      ].map(stat => (
                        <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                          <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                          <div className="text-2xl font-bold">{stat.val}</div>
                          <div className="text-xs text-[#a0a0b8]">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="h-72 w-full mt-8 bg-black/20 rounded-xl border border-white/5 p-4">
                      <h3 className="text-sm text-[#a0a0b8] mb-4">User Growth Tracking</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userChartData}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7b2ff7" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#7b2ff7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" stroke="#6b6b80" fontSize={10} />
                          <YAxis stroke="#6b6b80" fontSize={10} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          />
                          <Area type="monotone" dataKey="Users" stroke="#7b2ff7" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] border-b border-white/10 pb-4">User Directory & CRUD</h2>
                    
                    {editingUser && (
                      <div className="bg-[#1a1a2e] border border-[#7b2ff7]/30 rounded-xl p-5 mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-[#00f5d4]">Editing: {editingUser.name}</h3>
                          <button onClick={() => setEditingUser(null)} className="text-[#a0a0b8] hover:text-white"><X className="h-4 w-4"/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-[#6b6b80] block mb-1">Name</label>
                            <input className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs text-[#6b6b80] block mb-1">Hostel</label>
                            <input className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm" value={editingUser.hostel} onChange={e => setEditingUser({...editingUser, hostel: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs text-[#6b6b80] block mb-1">XP Points</label>
                            <input type="number" className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm" value={editingUser.xp} onChange={e => setEditingUser({...editingUser, xp: parseInt(e.target.value) || 0})} />
                          </div>
                          <div>
                            <label className="text-xs text-[#6b6b80] block mb-1">Role</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}>
                              <option value="student">Student</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </div>
                        </div>
                        <button 
                          onClick={() => { updateUser(editingUser.id, editingUser); setEditingUser(null); }}
                          className="bg-[#7b2ff7] hover:bg-[#6120cc] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                        >
                          <Save className="h-4 w-4"/> Save Changes
                        </button>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-[#a0a0b8]">
                          <tr>
                            <th className="p-3 font-medium rounded-tl-lg">User</th>
                            <th className="p-3 font-medium">Hostel</th>
                            <th className="p-3 font-medium">Level / XP</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium text-right rounded-tr-lg">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.02]">
                              <td className="p-3 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7b2ff7] to-[#00f5d4] flex flex-shrink-0 items-center justify-center text-xs font-bold">{u.name.substring(0,2).toUpperCase()}</div>
                                <div>
                                  <div className="font-medium">{u.name}</div>
                                  <div className="text-[10px] text-[#6b6b80]">{u.email}</div>
                                </div>
                              </td>
                              <td className="p-3 text-[#a0a0b8]">{u.hostel}</td>
                              <td className="p-3 text-[#a0a0b8]">Lvl {u.level} <span className="text-[10px]">({u.xp} XP)</span></td>
                              <td className="p-3">
                                {u.isBanned 
                                  ? <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Banned</span>
                                  : <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Active</span>
                                }
                              </td>
                              <td className="p-3">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingUser(u)} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"><Edit className="h-3 w-3"/></button>
                                  <button onClick={() => updateUser(u.id, { isBanned: !u.isBanned })} className={`p-1.5 rounded ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}>
                                    {u.isBanned ? <CheckCircle className="h-3 w-3"/> : <Ban className="h-3 w-3"/>}
                                  </button>
                                  <button onClick={() => deleteUser(u.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 className="h-3 w-3"/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- TOURNAMENTS TAB --- */}
                {activeTab === 'tournaments' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] border-b border-white/10 pb-4">Tournament Operations</h2>
                    
                    <div className="grid gap-4">
                      {tournaments.map(t => (
                        <div key={t.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {t.name}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : t.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                  {t.status.toUpperCase()}
                                </span>
                              </h3>
                              <p className="text-xs text-[#a0a0b8] mt-1">{t.registrations.length}/{t.maxParticipants} Registered</p>
                            </div>
                            <div className="flex gap-2">
                              {t.status === 'upcoming' && (
                                <button onClick={() => generateBracket(t.id)} className="px-3 py-1.5 bg-[#7b2ff7]/20 text-[#7b2ff7] hover:bg-[#7b2ff7]/40 text-xs font-bold rounded flex items-center gap-1 border border-[#7b2ff7]/30">
                                  <Zap className="h-3 w-3" /> Generate Brackets
                                </button>
                              )}
                              <button onClick={() => deleteTournament(t.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 border border-red-500/20"><Trash2 className="h-4 w-4"/></button>
                            </div>
                          </div>

                          {t.status === 'ongoing' && t.matches.length > 0 && (
                            <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/5">
                              <h4 className="text-sm font-bold text-[#00f5d4] mb-3">Live Match Control Panel</h4>
                              <div className="grid md:grid-cols-2 gap-3">
                                {t.matches.filter(m => m.status === 'scheduled').map(m => {
                                  const p1 = users.find(u => u.id === m.player1Id);
                                  const p2 = users.find(u => u.id === m.player2Id);
                                  const isUpdating = matchUpdateForm.mId === m.id;
                                  
                                  return (
                                    <div key={m.id} className="bg-white/5 rounded p-3 flex flex-col justify-between">
                                      <div className="flex justify-between text-xs mb-2">
                                        <span className="truncate w-[40%] text-right font-medium">{p1?.name || 'TBD'}</span>
                                        <span className="text-[#6b6b80]">vs</span>
                                        <span className="truncate w-[40%] text-left font-medium">{p2?.name || 'TBD'}</span>
                                      </div>
                                      
                                      {isUpdating ? (
                                        <div className="flex items-center gap-2 mt-2">
                                          <input type="number" className="w-12 bg-black border border-white/10 rounded px-1 text-center text-xs" value={matchUpdateForm.p1} onChange={e=>setMatchUpdateForm({...matchUpdateForm, p1: parseInt(e.target.value) || 0})} />
                                          <span className="text-[10px] text-[#6b6b80]">-</span>
                                          <input type="number" className="w-12 bg-black border border-white/10 rounded px-1 text-center text-xs" value={matchUpdateForm.p2} onChange={e=>setMatchUpdateForm({...matchUpdateForm, p2: parseInt(e.target.value) || 0})} />
                                          <button 
                                            onClick={() => {
                                              updateMatchScore(t.id, m.id, matchUpdateForm.p1, matchUpdateForm.p2);
                                              setMatchUpdateForm({tId:'', mId:'', p1:0, p2:0});
                                            }}
                                            className="ml-auto bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold"
                                          >
                                            Save
                                          </button>
                                          <button onClick={() => setMatchUpdateForm({tId:'', mId:'', p1:0, p2:0})} className="text-[#6b6b80]"><X className="h-3 w-3"/></button>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setMatchUpdateForm({ tId: t.id, mId: m.id, p1: 0, p2: 0 })}
                                          className="mt-2 w-full py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] text-[#a0a0b8]"
                                        >
                                          Record Score
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                                {t.matches.filter(m => m.status === 'scheduled').length === 0 && (
                                  <div className="text-xs text-[#6b6b80] col-span-2 text-center py-4">All matches completed for this round.</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- CONTENT TAB --- */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] border-b border-white/10 pb-4">Content Moderation</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-sm font-bold text-[#a0a0b8] mb-3">Live Feed Posts</h3>
                        <div className="space-y-3">
                          {posts.map(p => {
                            const u = users.find(x => x.id === p.userId);
                            return (
                              <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex justify-between items-start">
                                <div>
                                  <div className="text-xs font-bold text-white mb-1">{u?.name}</div>
                                  <div className="text-[11px] text-[#6b6b80] mb-2">{p.message}</div>
                                  <div className="text-[10px] bg-[#00f5d4]/10 text-[#00f5d4] px-2 py-0.5 rounded inline-block">{p.slotsFilled}/{p.slotsTotal} Slots</div>
                                </div>
                                <button onClick={() => deletePost(p.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="h-3 w-3"/></button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#a0a0b8] mb-3">Registered Groups</h3>
                        <div className="space-y-3">
                          {groups.map(g => (
                            <div key={g.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{g.logo}</span>
                                <div>
                                  <div className="text-xs font-bold">{g.name}</div>
                                  <div className="text-[10px] text-[#6b6b80]">{g.memberCount} members</div>
                                </div>
                              </div>
                              <button onClick={() => deleteGroup(g.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="h-3 w-3"/></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- REPORTS TAB --- */}
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] border-b border-white/10 pb-4">Abuse Reports</h2>
                    <div className="space-y-4">
                      {reports.map(r => {
                        const reporter = users.find(u => u.id === r.reporterId);
                        const reported = users.find(u => u.id === r.reportedId);
                        return (
                          <div key={r.id} className={`border rounded-xl p-4 ${r.status === 'pending' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${r.status === 'pending' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                  {r.status}
                                </span>
                                <div className="mt-2 text-sm">
                                  <span className="font-medium text-[#a0a0b8]">{reporter?.name || r.reporterId}</span> reported <span className="font-bold text-white">{reported?.name || r.reportedId}</span>
                                </div>
                                <div className="text-xs text-[#ff006e] mt-1 font-medium">Reason: {r.reason}</div>
                                <p className="text-xs text-[#6b6b80] mt-2 italic">"{r.description}"</p>
                              </div>
                              {r.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button onClick={() => resolveReport(r.id, 'admin-0', 'dismiss')} className="px-3 py-1.5 bg-gray-500/20 text-gray-300 hover:bg-gray-500/40 rounded text-xs font-medium">Dismiss</button>
                                  <button onClick={() => resolveReport(r.id, 'admin-0', 'ban')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/30 rounded text-xs font-medium flex items-center gap-1">
                                    <Ban className="h-3 w-3"/> Ban User
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {reports.length === 0 && <div className="text-sm text-[#6b6b80] text-center py-10">No reports submitted.</div>}
                    </div>
                  </div>
                )}

                {/* --- BROADCAST TAB --- */}
                {activeTab === 'broadcast' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] border-b border-white/10 pb-4">Global Broadcast System</h2>
                    <div className="max-w-xl mx-auto bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                      <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-[#00f5d4]/10 flex items-center justify-center">
                          <Radio className="h-8 w-8 text-[#00f5d4]" />
                        </div>
                      </div>
                      <p className="text-center text-sm text-[#a0a0b8] mb-6">Send a global notification to all registered campus users instantly.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-[#6b6b80] block mb-1">Alert Icon (Emoji)</label>
                          <input className="w-full bg-black/50 border border-white/10 rounded px-3 py-2" value={broadcastForm.icon} onChange={e=>setBroadcastForm({...broadcastForm, icon: e.target.value})} maxLength={2} />
                        </div>
                        <div>
                          <label className="text-xs text-[#6b6b80] block mb-1">Broadcast Title</label>
                          <input className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 font-bold" placeholder="e.g. Server Maintenance" value={broadcastForm.title} onChange={e=>setBroadcastForm({...broadcastForm, title: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-[#6b6b80] block mb-1">Message Body</label>
                          <textarea className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 min-h-[100px] text-sm" placeholder="Message content..." value={broadcastForm.message} onChange={e=>setBroadcastForm({...broadcastForm, message: e.target.value})} />
                        </div>
                        <button 
                          disabled={!broadcastForm.title || !broadcastForm.message}
                          onClick={() => {
                            broadcastNotification(broadcastForm.title, broadcastForm.message, broadcastForm.icon);
                            setBroadcastForm({ title: '', message: '', icon: '📢' });
                            alert('Broadcast sent to all users!');
                          }}
                          className="w-full bg-gradient-to-r from-[#00f5d4]/20 to-[#7b2ff7]/20 border border-[#00f5d4]/30 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" /> Deploy Broadcast
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- AUDIT TAB --- */}
                {activeTab === 'audit' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] border-b border-white/10 pb-4">System Audit Log</h2>
                    <div className="space-y-2">
                      {adminActions.map(action => (
                        <div key={action.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-[#7b2ff7]/10 flex items-center justify-center">
                              <Terminal className="h-4 w-4 text-[#7b2ff7]" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{action.action}</div>
                              <div className="text-xs text-[#6b6b80]">{action.details}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-[#a0a0b8]">{new Date(action.timestamp).toLocaleString()}</div>
                            <div className="text-[10px] text-[#6b6b80]">Target: {action.targetTable}</div>
                          </div>
                        </div>
                      ))}
                      {adminActions.length === 0 && <div className="text-sm text-[#6b6b80] text-center py-10">No actions recorded.</div>}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
