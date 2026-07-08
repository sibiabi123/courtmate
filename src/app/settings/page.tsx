'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, User, Shield, Eye, Volume2, Trash2, Save, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({ posts: true, tournaments: true, groups: true, messages: true, achievements: true });
  const [privacy, setPrivacy] = useState({ showOnline: true, showProfile: true, showStats: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#7b2ff7]' : 'bg-[#25253d]'}`}>
      <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-[#050508]/50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">⚙️ <span className="gradient-text">Settings</span></h1>
          <p className="text-[#6b6b80] mt-1">Customize your VIT-G-Hub experience</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Section */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2"><User className="h-4 w-4 text-[#7b2ff7]" /> Profile</h2>
          <div className="space-y-4">
            <div><label className="block text-xs text-[#a0a0b8] mb-1.5">Display Name</label><input defaultValue="Arjun Sharma" className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-sm focus:border-[#7b2ff7] focus:outline-none" /></div>
            <div><label className="block text-xs text-[#a0a0b8] mb-1.5">Bio</label><textarea defaultValue="Cricket captain 🏏 | Always looking for a game" rows={2} className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-sm focus:border-[#7b2ff7] focus:outline-none resize-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-[#a0a0b8] mb-1.5">Hostel</label>
                <select className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-sm focus:border-[#7b2ff7] focus:outline-none">
                  <option>Hostel A (Men&apos;s)</option><option>Hostel B (Men&apos;s)</option><option>Hostel C (Men&apos;s)</option><option>Ladies Hostel A</option><option>Day Scholar</option>
                </select>
              </div>
              <div><label className="block text-xs text-[#a0a0b8] mb-1.5">Skill Level</label>
                <select className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-sm focus:border-[#7b2ff7] focus:outline-none">
                  <option>Beginner</option><option>Intermediate</option><option selected>Pro</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2">{darkMode ? <Moon className="h-4 w-4 text-[#7b2ff7]" /> : <Sun className="h-4 w-4 text-[#ffd60a]" />} Appearance</h2>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">Dark Mode</p><p className="text-xs text-[#6b6b80]">Toggle between dark and light theme</p></div>
            <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-[#00f5d4]" /> Notifications</h2>
          <div className="space-y-4">
            {[
              { key: 'posts' as const, label: 'Post Replies', desc: 'When someone RSVPs to your post' },
              { key: 'tournaments' as const, label: 'Tournament Updates', desc: 'Registration, match reminders' },
              { key: 'groups' as const, label: 'Group Activity', desc: 'New members, group messages' },
              { key: 'messages' as const, label: 'Direct Messages', desc: 'When you receive a new message' },
              { key: 'achievements' as const, label: 'Achievements', desc: 'When you unlock a new achievement' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div><p className="text-sm">{item.label}</p><p className="text-xs text-[#6b6b80]">{item.desc}</p></div>
                <Toggle checked={notifications[item.key]} onChange={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2"><Eye className="h-4 w-4 text-[#ff006e]" /> Privacy</h2>
          <div className="space-y-4">
            {[
              { key: 'showOnline' as const, label: 'Show Online Status', desc: 'Let others see when you\'re online' },
              { key: 'showProfile' as const, label: 'Public Profile', desc: 'Allow anyone to view your profile' },
              { key: 'showStats' as const, label: 'Show Stats', desc: 'Display your game stats publicly' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div><p className="text-sm">{item.label}</p><p className="text-xs text-[#6b6b80]">{item.desc}</p></div>
                <Toggle checked={privacy[item.key]} onChange={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass rounded-2xl p-5 border border-red-500/10">
          <h2 className="font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2 text-red-400"><Trash2 className="h-4 w-4" /> Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">Delete Account</p><p className="text-xs text-[#6b6b80]">Permanently remove your account and data</p></div>
            <button className="text-xs text-red-400 border border-red-400/30 rounded-lg px-3 py-1.5 hover:bg-red-400/10">Delete</button>
          </div>
        </div>

        {/* Save Button */}
        <motion.button onClick={handleSave} whileTap={{ scale: 0.95 }}
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] text-white hover:shadow-lg hover:shadow-[#7b2ff7]/25'}`}>
          {saved ? <><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </motion.button>
      </div>
    </div>
  );
}
