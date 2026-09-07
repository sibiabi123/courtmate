'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import {
  Home, Rss, Trophy, BarChart3, User, LogOut, Menu, X, Shield,
  Swords, Bell, Settings, Volume2, VolumeX, Plus, Globe
} from 'lucide-react';
import { LiveTicker } from '@/components/ui/LiveTicker';
import { playClick, toggleSound, isSoundMuted } from '@/lib/sound';
import { getActiveCampusConfig } from '@/lib/campus-config';

const NAV_LINKS = [
  { href: '/feed',         label: 'Match Feed',   icon: Rss },
  { href: '/challenges',   label: '1v1 Duels',    icon: Swords },
  { href: '/tournaments',  label: 'Tournaments',  icon: Trophy },
  { href: '/leaderboard',  label: 'Rankings',     icon: BarChart3 },
  { href: '/rivalry',      label: 'Campus',       icon: Globe },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout, setCurrentUser } = useUIStore();
  const campusConfig = getActiveCampusConfig();

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [soundEnabled, setSoundEnabled]   = useState(true);

  useEffect(() => {
    setSoundEnabled(!isSoundMuted());
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSoundToggle = () => {
    const isNowOn = toggleSound();
    setSoundEnabled(isNowOn);
    if (isNowOn) playClick();
  };

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setOnlineCount(d.totalUsers || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/stats')
        .then(r => r.json())
        .then(d => setOnlineCount(d.totalUsers || 0))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.success && d.user) setCurrentUser(d.user); })
      .catch(() => {});
  }, [isAuthenticated, setCurrentUser]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = () => {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(d => {
          const notifs = Array.isArray(d.notifications) ? d.notifications : [];
          setNotifications(notifs.slice(0, 6));
          setUnreadCount(notifs.filter((n: any) => !Number(n.is_read)).length);
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const markAllRead = async () => {
    playClick();
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications(n => n.map(x => ({ ...x, is_read: 1 })));
  };

  const handleLogout = async () => {
    playClick();
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/');
    setProfileOpen(false);
    setBellOpen(false);
  };

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'GU';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-[--border]' : 'border-b border-transparent'
      }`}
      style={{
        background: scrolled ? 'rgba(3,5,8,0.97)' : 'rgba(3,5,8,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Announcement Ticker */}
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => playClick()}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--volt)', boxShadow: '0 0 14px rgba(200,255,0,0.25)' }}
          >
            <span className="text-[var(--ink)] font-black text-[11px] font-[family-name:var(--font-display)]">CM</span>
          </div>
          <span className="font-black font-[family-name:var(--font-display)] text-base hidden sm:block tracking-tight">
            <span style={{ color: 'var(--text-primary)' }}>Court</span>
            <span style={{ color: 'var(--volt)' }}>Mate</span>
          </span>
        </Link>

        {/* Campus badge */}
        <Link
          href="/rivalry"
          title="Campus Athletic Standings"
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-semibold transition-colors shrink-0 hover:border-[--border-hi] hover:text-[--text-primary]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <span>{campusConfig.emblem}</span>
          <span className="font-mono">{campusConfig.shortName}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => playClick()}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? 'text-[var(--volt)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/4'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {link.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: 'var(--volt)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-1.5">

          {/* Sound toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors btn-ghost"
            style={{ border: '1px solid var(--border)' }}
          >
            {soundEnabled
              ? <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--volt)' }} />
              : <VolumeX className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
          </button>

          {/* Online count — subtle */}
          {onlineCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] stat-mono px-2.5 py-1 rounded-full"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
              {onlineCount}
            </div>
          )}

          {/* Host match CTA */}
          {isAuthenticated && (
            <Link
              href="/feed"
              onClick={() => playClick()}
              className="btn-primary hidden sm:inline-flex px-3 py-1.5 text-[13px] font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Host Match</span>
            </Link>
          )}

          {isAuthenticated && currentUser ? (
            <>
              {/* Bell */}
              <div className="relative">
                <button
                  onClick={() => { playClick(); setBellOpen(!bellOpen); setProfileOpen(false); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-colors btn-ghost"
                  style={{ border: '1px solid var(--border)' }}
                  aria-label="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                      style={{ background: 'var(--danger)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {bellOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 w-80 rounded-[var(--r-xl)] shadow-2xl z-50 overflow-hidden"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[11px] font-semibold hover:underline"
                            style={{ color: 'var(--volt)' }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                            No notifications yet
                          </div>
                        ) : notifications.map((n: any) => (
                          <div key={n.id} className="px-4 py-3 hover:bg-white/3 transition-colors"
                            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <div className="relative">
                <button
                  onClick={() => { playClick(); setProfileOpen(!profileOpen); setBellOpen(false); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black transition-all hover:opacity-85 overflow-hidden tactile-press"
                  style={{ background: 'var(--volt)', color: 'var(--ink)' }}
                  aria-label="Account menu"
                >
                  {currentUser.avatar
                    ? <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    : initials}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 w-60 rounded-[var(--r-xl)] shadow-2xl z-50 overflow-hidden p-1.5"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p className="font-semibold text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {currentUser.email}
                        </p>
                        {currentUser.hostel && (
                          <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: 'var(--signal-dim)', color: 'var(--signal)', border: '1px solid var(--signal-border)' }}>
                            {currentUser.hostel}
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          href={`/profile/${currentUser.id}`}
                          onClick={() => { playClick(); setProfileOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-white/5 transition-colors w-full"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <User className="w-3.5 h-3.5" style={{ color: 'var(--signal)' }} />
                          Athlete Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => { playClick(); setProfileOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-white/5 transition-colors w-full"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Settings className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-red-500/8 transition-colors w-full text-left"
                          style={{ color: 'var(--danger)' }}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => playClick()}
                className="btn-ghost px-3 py-1.5 text-[13px]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => playClick()}
                className="btn-primary px-3 py-1.5 text-[13px] font-bold"
              >
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => { playClick(); setMobileOpen(!mobileOpen); }}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors btn-ghost"
            style={{ border: '1px solid var(--border)' }}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden px-4 py-3 space-y-1"
            style={{ borderTop: '1px solid var(--border)', background: 'rgba(3,5,8,0.98)' }}
          >
            {NAV_LINKS.map(link => {
              const Icon = link.icon;
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => { playClick(); setMobileOpen(false); }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-lg)] text-[13px] font-medium transition-colors ${
                    active ? 'bg-[rgba(200,255,0,0.08)]' : 'hover:bg-white/4'
                  }`}
                  style={{ color: active ? 'var(--volt)' : 'var(--text-secondary)' }}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/feed"
              onClick={() => { playClick(); setMobileOpen(false); }}
              className="btn-primary w-full py-2.5 text-[13px] font-bold mt-2"
            >
              <Plus className="w-4 h-4" />
              Find & Host Matches
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
