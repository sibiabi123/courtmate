'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, MapPin, Shield, Edit3, CheckCircle, Loader2 } from 'lucide-react';
import { playClick } from '@/lib/sound';
import { MobileRefereeScoreboard } from '@/components/tournaments/MobileRefereeScoreboard';

interface BracketMatch {
  id: string;
  tournament_id: string;
  round_name: string;
  match_number: number;
  team1_name: string;
  team2_name: string;
  score1: number;
  score2: number;
  winner_name?: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'disputed';
  captain1_verified: number;
  captain2_verified: number;
  court_venue?: string;
  scheduled_time?: string;
}

interface LiveBracketTreeProps {
  tournamentId?: string;
}

export function LiveBracketTree({ tournamentId = 'tourn-default-1' }: LiveBracketTreeProps) {
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScoringMatch, setActiveScoringMatch] = useState<BracketMatch | null>(null);

  const fetchBracket = async () => {
    try {
      const res = await fetch(`/api/tournaments/bracket?tournamentId=${tournamentId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracket();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[#6b6b80]">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#CCFF00]" />
        Loading dynamic tournament bracket...
      </div>
    );
  }

  // Group matches by round name
  const rounds = ['Quarterfinals', 'Semifinals', 'Championship Final'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="font-outfit font-black text-lg text-white flex items-center gap-2">
            Dynamic Tournament Bracket
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-bold border border-[#CCFF00]/20">
              DUAL-CAPTAIN VERIFIED
            </span>
          </h3>
          <p className="text-xs text-[#6b6b80]">
            Tap on any match to view live score or enter Mobile Referee Mode
          </p>
        </div>
      </div>

      {/* Bracket Tree Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {rounds.map((roundName, roundIdx) => {
          const roundMatches = matches.filter(m => m.round_name === roundName);
          return (
            <div key={roundName} className="space-y-4">
              {/* Round Header */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
                <span className="font-outfit font-black text-xs text-white uppercase tracking-wider block">
                  {roundName}
                </span>
                <span className="text-[10px] text-[#6b6b80] font-mono">
                  {roundMatches.length} {roundMatches.length === 1 ? 'Championship Duel' : 'Matches'}
                </span>
              </div>

              {/* Matches list for this round */}
              <div className="space-y-3.5">
                {roundMatches.map(m => {
                  const isLive = m.status === 'live';
                  const isCompleted = m.status === 'completed';
                  const isW1 = m.winner_name && m.winner_name === m.team1_name;
                  const isW2 = m.winner_name && m.winner_name === m.team2_name;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        playClick();
                        setActiveScoringMatch(m);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
                        isLive
                          ? 'bg-[#0A0C10] border-[#00F0FF]/40 shadow-lg shadow-[#00F0FF]/10'
                          : isCompleted
                          ? 'bg-[#0A0C10] border-white/10 hover:border-[#CCFF00]/30'
                          : 'bg-[#0A0C10] border-white/5 opacity-85'
                      }`}
                    >
                      {/* Match Meta Header */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#6b6b80] mb-2 pb-1.5 border-b border-white/5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#CCFF00]" /> {m.court_venue}
                        </span>
                        {isLive ? (
                          <span className="text-[#00F0FF] font-black animate-pulse flex items-center gap-1">
                            ● LIVE NOW
                          </span>
                        ) : isCompleted ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            ✓ FINAL
                          </span>
                        ) : (
                          <span className="text-[#a0a0b8]">{m.scheduled_time}</span>
                        )}
                      </div>

                      {/* Team 1 */}
                      <div className="flex items-center justify-between py-1">
                        <span
                          className={`text-xs font-bold truncate max-w-[150px] ${
                            isW1 ? 'text-[#CCFF00] font-black' : 'text-white'
                          }`}
                        >
                          {isW1 && '🏆 '}
                          {m.team1_name}
                        </span>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded ${
                            isW1
                              ? 'bg-[#CCFF00] text-black font-black'
                              : 'bg-white/5 text-white'
                          }`}
                        >
                          {m.score1}
                        </span>
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-between py-1">
                        <span
                          className={`text-xs font-bold truncate max-w-[150px] ${
                            isW2 ? 'text-[#00F0FF] font-black' : 'text-white'
                          }`}
                        >
                          {isW2 && '🏆 '}
                          {m.team2_name}
                        </span>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded ${
                            isW2
                              ? 'bg-[#00F0FF] text-black font-black'
                              : 'bg-white/5 text-white'
                          }`}
                        >
                          {m.score2}
                        </span>
                      </div>

                      {/* Tap to Score / Verify Prompt */}
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-[#6b6b80] group-hover:text-white transition-colors">
                        <span>Referee &amp; Captains</span>
                        <span className="text-[#CCFF00] font-bold flex items-center gap-1">
                          <Edit3 className="w-3 h-3" /> Tap to Score
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Referee Scoreboard Modal */}
      <AnimatePresence>
        {activeScoringMatch && (
          <MobileRefereeScoreboard
            isOpen={Boolean(activeScoringMatch)}
            match={activeScoringMatch}
            onClose={() => setActiveScoringMatch(null)}
            onMatchUpdated={() => {
              fetchBracket();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
