'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import {
  Home, Rss, Trophy, BarChart3, User, LogOut, LogIn, Menu, X, Shield,
  Swords, Bell, Settings, Volume2, VolumeX, Globe, Crown, Sparkles,
  ChevronDown, Search, Check, Building2
} from 'lucide-react';
import { LiveTicker } from '@/components/ui/LiveTicker';
import { CoinStoreModal } from '@/components/ui/CoinStoreModal';
import { playClick, toggleSound, isSoundMuted } from '@/lib/sound';
import { GLOBAL_COLLEGES, College, getCollegeById } from '@/data/colleges';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/feed', label: 'Campus Feed', icon: Rss },
  { href: '/challenges', label: 'Duels', icon: Swords },
  { href: '/rivalry', label: 'Rivalry 🏛️', icon: Globe },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/leaderboard', label: 'Rankings', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout, setCurrentUser } = useUIStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);
  const [coinStoreOpen, setCoinStoreOpen] = useState(false);
  
  const [scrolled, setScrolled] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [activeCollege, setActiveCollege] = useState<College>(GLOBAL_COLLEGES[0]);
  const [campusSearch, setCampusSearch] = useState('');

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
    fetch('/api/stats').then(r => r.json()).then(d => setOnlineCount(d.totalUsers || 0)).catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/stats').then(r => r.json()).then(d => setOnlineCount(d.totalUsers || 0)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync fresh user data from server on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.user) {
          setCurrentUser(d.user);
          if (d.user.collegeId) {
            setActiveCollege(getCollegeById(d.user.collegeId));
          }
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Fetch notifications
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

  const filteredColleges = GLOBAL_COLLEGES.filter(
    c => c.name.toLowerCase().includes(campusSearch.toLowerCase()) ||
         c.shortName.toLowerCase().includes(campusSearch.toLowerCase()) ||
         c.country.toLowerCase().includes(campusSearch.toLowerCase())
  );

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'GU';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/8' : 'border-b border-transparent'}`}
        style={{ background: scrolled ? 'rgba(4,5,7,0.96)' : 'rgba(4,5,7,0.85)', backdropFilter: 'blur(24px)' }}
      >
        {/* Top Marquee Ticker */}
        <LiveTicker />

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo & Campus Selector */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={() => playClick()}
              className="flex items-center gap-2 shrink-0 group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #CCFF00, #00F0FF)', boxShadow: '0 0 20px rgba(204,255,0,0.3)' }}
              >
                <span className="text-[#040507] font-black text-sm font-[family-name:var(--font-outfit)]">CM</span>
              </div>
              <span className="font-black font-[family-name:var(--font-outfit)] text-lg hidden sm:block tracking-tight">
                <span className="text-white">Court</span><span className="text-[#CCFF00]">Mate</span>
              </span>
            </Link>

            {/* Global Campus Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  playClick();
                  setCampusOpen(!campusOpen);
                  setProfileOpen(false);
                  setBellOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
              >
                <span>{activeCollege.emblem}</span>
                <span className="text-white hidden md:inline truncate max-w-[110px]">{activeCollege.shortName}</span>
                <ChevronDown className="w-3 h-3 text-[#CCFF00]" />
              </button>

              <AnimatePresence>
                {campusOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute left-0 top-12 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden bg-[#0A0C10] p-3"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                      <span className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#CCFF00]" /> Switch Campus Hub
                      </span>
                      <button onClick={() => setCampusOpen(false)} className="text-[#6b6b80] hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-[#6b6b80] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search universities..."
                        value={campusSearch}
                        onChange={e => setCampusSearch(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredColleges.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            playClick();
                            setActiveCollege(c);
                            setCampusOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                            activeCollege.id === c.id
                              ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30'
                              : 'text-white/80 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{c.emblem}</span>
                            <span className="truncate">{c.name}</span>
                          </div>
                          {activeCollege.id === c.id && <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => playClick()}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all tactile-press ${
                    active
                      ? 'text-[#040507] bg-[#CCFF00] shadow-md shadow-[#CCFF00]/20'
                      : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Section */}
          <div className="flex items-center gap-2">
            
            {/* Audio FX Toggle Button */}
            <button
              onClick={handleSoundToggle}
              title={soundEnabled ? 'Tactile Sound: ON' : 'Tactile Sound: OFF'}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#a0a0b8] hover:text-[#CCFF00] hover:bg-white/5 transition-all border border-white/5 tactile-press"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#CCFF00]" /> : <VolumeX className="w-3.5 h-3.5 text-[#6b6b80]" />}
            </button>

            {/* Online Live Badge */}
            {onlineCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/10 rounded-full px-2.5 py-1 stat-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                {onlineCount} LIVE
              </div>
            )}

            {/* ── COIN STORE & PRO TRIGGER BUTTON ── */}
            <button
              onClick={() => {
                playClick();
                setCoinStoreOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CCFF00]/40 text-xs font-black transition-all hover:bg-[#CCFF00]/15 active:scale-95 bg-[#CCFF00]/10"
            >
              <Crown className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="text-[#CCFF00] font-mono">{currentUser ? `${currentUser.coins} 🪙` : 'Store / PRO'}</span>
            </button>

            {isAuthenticated && currentUser ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => { playClick(); setBellOpen(!bellOpen); setProfileOpen(false); setCampusOpen(false); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#a0a0b8] hover:text-white transition-all relative border border-white/5 tactile-press"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF2A55] text-white text-[9px] font-black flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {bellOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden bg-[#0A0C10]"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                          <span className="font-bold text-white text-xs font-[family-name:var(--font-outfit)]">Notifications</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] text-[#CCFF00] hover:underline font-bold">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="text-center py-8 text-[#6b6b80] text-xs">No notifications yet</div>
                          ) : notifications.map((n: any) => (
                            <div key={n.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all">
                              <p className="text-xs font-semibold text-white">{n.title}</p>
                              <p className="text-[11px] text-[#6b6b80] mt-0.5">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Avatar */}
                <div className="relative">
                  <button
                    onClick={() => { playClick(); setProfileOpen(!profileOpen); setBellOpen(false); setCampusOpen(false); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-[#040507] transition-all hover:scale-105 overflow-hidden tactile-press"
                    style={{ background: 'linear-gradient(135deg, #CCFF00, #00F0FF)' }}
                  >
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : initials}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden bg-[#0A0C10] p-2"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="font-bold text-xs text-white truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-[#6b6b80] truncate">{currentUser.email}</p>
                        </div>

                        <div className="p-1 space-y-1">
                          <Link
                            href={`/profile/${currentUser.id}`}
                            onClick={() => { playClick(); setProfileOpen(false); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-all"
                          >
                            <User className="w-3.5 h-3.5 text-[#00F0FF]" /> View Athlete Profile
                          </Link>
                          <button
                            onClick={() => { playClick(); setProfileOpen(false); setCoinStoreOpen(true); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all text-left"
                          >
                            <Crown className="w-3.5 h-3.5 text-[#CCFF00]" /> Upgrade to PRO Pass
                          </button>
                          <Link
                            href="/settings"
                            onClick={() => { playClick(); setProfileOpen(false); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-all"
                          >
                            <Settings className="w-3.5 h-3.5 text-[#a0a0b8]" /> Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#FF2A55] hover:bg-[#FF2A55]/10 transition-all text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:bg-white/10 border border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => playClick()}
                  className="btn-volt px-3 py-1.5 text-xs font-black"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => { playClick(); setMobileOpen(!mobileOpen); }}
              className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center text-white bg-white/5 border border-white/10"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/10 bg-[#040507] px-4 py-4 space-y-2 overflow-hidden"
            >
              {NAV_LINKS.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => { playClick(); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/5"
                  >
                    <Icon className="w-4 h-4 text-[#CCFF00]" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  playClick();
                  setMobileOpen(false);
                  setCoinStoreOpen(true);
                }}
                className="w-full btn-volt py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" /> CourtMate PRO Store
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Coin Store Modal */}
      <CoinStoreModal
        isOpen={coinStoreOpen}
        onClose={() => setCoinStoreOpen(false)}
      />
    </>
  );
}
