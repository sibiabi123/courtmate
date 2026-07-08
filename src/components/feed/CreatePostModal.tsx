'use client';

import { useState } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sport: string;
    ground: string;
    maxPlayers: number;
    scheduledStart: Date;
    geoLocked: boolean;
  }) => void;
}

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Table Tennis', 'Volleyball', 'Kabaddi', 'Tennis', 'Squash', 'Chess'];
const GROUNDS = [
  'Main Ground (Football/Cricket)',
  'MH Cricket Net',
  'Basketball Court',
  'Indoor Badminton Hall',
  'Table Tennis Room',
  'Volleyball Court',
  'Swimming Pool',
  'Gymkhana Hall',
  'Outdoor Multi-Courts',
];

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [sport, setSport] = useState(SPORTS[0]);
  const [ground, setGround] = useState(GROUNDS[0]);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [geoLocked, setGeoLocked] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledStart = dateStr && timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date();
    onSubmit({
      sport,
      ground,
      maxPlayers,
      scheduledStart,
      geoLocked,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'rgba(26,26,46,0.95)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-outfit text-white">Create Match Post</h3>
          <button onClick={onClose} className="text-[#6b6b80] hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">
              Select Sport
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-[#a0a0b8] focus:outline-none focus:border-[#7b2ff7] cursor-pointer"
              style={{ background: '#111118' }}
            >
              {SPORTS.map((s) => (
                <option key={s} value={s} className="bg-[#111118] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">
              Select Ground
            </label>
            <select
              value={ground}
              onChange={(e) => setGround(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-[#a0a0b8] focus:outline-none focus:border-[#7b2ff7] cursor-pointer"
              style={{ background: '#111118' }}
            >
              {GROUNDS.map((g) => (
                <option key={g} value={g} className="bg-[#111118] text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">
                Max Players
              </label>
              <input
                type="number"
                min="2"
                max="50"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7]"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#a0a0b8] mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={geoLocked}
                  onChange={(e) => setGeoLocked(e.target.checked)}
                  className="accent-[#7b2ff7] h-4 w-4"
                />
                Geo-Locked Check-In
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">
                Match Date
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1.5 uppercase tracking-wider">
                Start Time
              </label>
              <input
                type="time"
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7b2ff7]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl py-3.5 font-bold text-white transition-all hover:scale-[1.02] mt-4"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
          >
            Create Post 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
