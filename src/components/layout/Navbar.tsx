'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { Home, Rss, Trophy, BarChart3, User, LogOut, LogIn, Menu, X, Gamepad2, Shield, Swords, Bell, Settings } from 'lucide-react';



const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/matchmaking', label: 'Matchmaking', icon: Swords },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/leaderboard', label: 'Rankings', icon: BarChart3 },
  { href: '/arcade', label: 'Arcade', icon: Gamepad2 },
];


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout, setCurrentUser } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setOnlineCount(d.totalUsers || 0)).catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/stats').then(r => r.json()).then(d => setOnlineCount(d.totalUsers || 0)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync fresh user data (coins, etc.) from server on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.success && d.user) setCurrentUser(d.user); })
      .catch(() => {});
  }, [isAuthenticated]);

  // Fetch notifications for logged-in user
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = () => {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(d => {
          const notifs = Array.isArray(d.notifications) ? d.notifications : [];
          setNotifications(notifs.slice(0, 6));
          setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications(n => n.map(x => ({ ...x, is_read: 1 })));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/');
    setProfileOpen(false);
  };


  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'GU';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/8' : 'border-b border-transparent'}`}
        style={{ background: scrolled ? 'rgba(10,10,15,0.95)' : 'rgba(10,10,15,0.7)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              <span className="text-white font-black text-sm">CM</span>
            </div>
            <span className="font-black font-outfit text-lg hidden sm:block">
              <span className="text-white">Court</span><span className="text-[#00f5d4]">Mate</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? 'text-[#00f5d4] bg-[#00f5d4]/10' : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Online Count */}
            {onlineCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {onlineCount} members
              </div>
            )}

            {isAuthenticated && currentUser ? (
              <>
                {/* Coins - live from server sync */}
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#ffd60a] border border-[#ffd60a]/20 bg-[#ffd60a]/10 rounded-full px-3 py-1">
                  🪙 {Number(currentUser.coins) || 0}
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button onClick={() => { setBellOpen(!bellOpen); setProfileOpen(false); if (unreadCount > 0) markAllRead(); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#a0a0b8] hover:text-white hover:bg-white/8 transition-all relative"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {bellOpen && (
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                        style={{ background: 'rgba(17,17,24,0.98)', backdropFilter: 'blur(20px)' }}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                          <span className="font-bold text-white text-sm font-outfit">Notifications</span>
                          {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] text-[#00f5d4] hover:underline">Mark all read</button>}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="text-center py-8 text-[#6b6b80] text-sm font-body">No notifications yet</div>
                          ) : notifications.map((n: any) => (
                            <div key={n.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-all" style={{ background: n.is_read ? 'transparent' : 'rgba(123,47,247,0.05)' }}>
                              <p className="text-sm font-semibold text-white">{n.title}</p>
                              <p className="text-xs text-[#6b6b80] mt-0.5 font-body">{n.message}</p>
                              <p className="text-[10px] text-[#4b4b5a] mt-1">{new Date(n.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
                  >
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : initials}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-12 w-56 rounded-2xl border border-white/10 shadow-2xl py-2 z-50"
                        style={{ background: 'rgba(17,17,24,0.98)', backdropFilter: 'blur(20px)' }}
                      >
                        <div className="px-4 py-3 border-b border-white/8">
                          <p className="font-semibold text-white text-sm">{currentUser.name}</p>
                          <p className="text-[#6b6b80] text-xs mt-0.5 truncate">{currentUser.email}</p>
                          <p className="text-[#a0a0b8] text-xs mt-1">{currentUser.hostel}</p>
                        </div>
                          <div className="py-1">
                            <Link href={`/profile/${currentUser.id}`} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-all">
                              <User className="w-4 h-4" /> My Profile
                            </Link>
                            <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-all">
                              <Settings className="w-4 h-4" /> Profile Settings
                            </Link>
                            {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
                              <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#ffd60a] hover:bg-white/5 transition-all">
                                <Shield className="w-4 h-4" /> Admin Panel
                              </Link>
                            )}
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-all">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 w-72 z-40 shadow-2xl pt-20 px-4"
            style={{ background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          >
            <nav className="space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? 'text-[#00f5d4] bg-[#00f5d4]/10' : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            {!isAuthenticated && (
              <div className="mt-6">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full rounded-xl py-3 font-bold text-white" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
