'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Calendar, Users, Coins, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

const SPORT_EMOJIS: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Basketball: '🏀',
  'Table Tennis': '🏓', Volleyball: '🏐', Chess: '♟️', Kabaddi: '🤼', Tennis: '🎾', default: '🏆',
};

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useUIStore();
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/admin/table?table=tournaments');
        const data = await res.json();
        const t = (data.rows || []).find((r: any) => r.id === id);
        setTournament(t || null);

        if (t) {
          const pRes = await fetch('/api/admin/table?table=tournament_participants');
          const pData = await pRes.json();
          const myParticipants = (pData.rows || []).filter((p: any) => p.tournament_id === id);
          setParticipants(myParticipants);
          if (currentUser) setJoined(myParticipants.some((p: any) => p.user_id === currentUser.id));
        }
      } catch { }
      setLoading(false);
    };
    fetch_();
  }, [id, currentUser]);

  const handleJoin = async () => {
    if (!currentUser || !tournament) return;
    setJoining(true); setError('');
    try {
      const res = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: id }),
      });
      const data = await res.json();
      if (data.success) { setJoined(true); setParticipants(p => [...p, { user_id: currentUser.id }]); }
      else setError(data.error || 'Failed to join');
    } catch { setError('Network error'); }
    setJoining(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#00f5d4] animate-spin" />
    </div>
  );

  if (!tournament) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center">
      <div>
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-white mb-2 font-outfit">Tournament Not Found</h2>
        <Link href="/tournaments" className="text-[#00f5d4] text-sm hover:underline font-body">← Back to Tournaments</Link>
      </div>
    </div>
  );

  const statusColor = tournament.status === 'ongoing' ? '#10b981' : tournament.status === 'upcoming' ? '#3b82f6' : '#6b6b80';
  const currentCount = participants.length || 0;
  const maxCount = tournament.max_participants || tournament.maxParticipants || 16;
  const progressPct = Math.min(100, (currentCount / maxCount) * 100);
  const isOrganizer = currentUser?.id === tournament.organizer_id;

  return (
    <main className="min-h-screen bg-[#0a0a0f] pt-20 pb-24">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(123,47,247,0.3), rgba(0,245,212,0.15))' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
          {SPORT_EMOJIS[tournament.sport] || SPORT_EMOJIS.default}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-xs text-[#6b6b80] hover:text-white transition-colors mb-4 font-body">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Tournaments
        </Link>

        {/* Main Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 p-6 mb-5" style={{ background: 'rgba(17,17,24,0.95)' }}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-3xl">{SPORT_EMOJIS[tournament.sport] || SPORT_EMOJIS.default}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase" style={{ background: `${statusColor}20`, color: statusColor }}>
                  {tournament.status}
                </span>
                {isOrganizer && <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#7b2ff7]/20 text-[#7b2ff7]">Your Tournament</span>}
              </div>
              <h1 className="text-2xl font-black font-outfit text-white mb-2">{tournament.name}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-[#6b6b80] font-body">
                {tournament.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#00f5d4]" />{tournament.venue}</span>}
                {tournament.scheduled_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#7b2ff7]" />{new Date(tournament.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{currentCount}/{maxCount} registered</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-[#ffd60a] font-black text-2xl font-outfit">
                <Coins className="w-5 h-5" />{tournament.prize || 0}
              </div>
              <div className="text-[10px] text-[#6b6b80] mt-0.5 font-body">Prize Pool</div>
            </div>
          </div>

          {/* Registration Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#6b6b80] font-body">Registration Progress</span>
              <span className="text-white font-bold font-outfit">{currentCount}/{maxCount}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8 }}
                className="h-full rounded-full" style={{ background: progressPct >= 100 ? '#ef4444' : 'linear-gradient(90deg, #7b2ff7, #00f5d4)' }} />
            </div>
            {progressPct >= 100 && <p className="text-xs text-red-400 mt-1 font-body">Tournament is full</p>}
          </div>

          {/* Description */}
          {tournament.description && (
            <p className="text-sm text-[#a0a0b8] mb-5 font-body leading-relaxed">{tournament.description}</p>
          )}

          {/* Join / Joined Button */}
          {error && <p className="text-red-400 text-sm mb-3 font-body">{error}</p>}
          {currentUser ? (
            joined || isOrganizer ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm w-fit">
                <CheckCircle className="w-4 h-4" />
                {isOrganizer ? "You're the organizer" : "You're registered!"}
              </div>
            ) : (
              <button onClick={handleJoin} disabled={joining || progressPct >= 100}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
                {joining ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Trophy className="w-4 h-4" />}
                {joining ? 'Registering...' : progressPct >= 100 ? 'Tournament Full' : 'Register for Tournament'}
              </button>
            )
          ) : (
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}>
              Sign In to Register
            </Link>
          )}
        </motion.div>

        {/* Tournament Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Sport', value: tournament.sport, icon: SPORT_EMOJIS[tournament.sport] || '🏆' },
            { label: 'Format', value: 'Single Elimination', icon: '🗂️' },
            { label: 'Venue', value: tournament.venue || 'TBD', icon: '📍' },
            { label: 'Prize', value: `🪙 ${tournament.prize || 0} coins`, icon: '🏆' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-white/6 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs text-[#6b6b80] font-body">{item.label}</div>
              <div className="text-sm font-bold text-white font-outfit mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
