'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, MapPin, CheckCircle, AlertTriangle, Shield, X,
  Navigation, UserCheck, AlertOctagon, Sparkles, Loader2
} from 'lucide-react';
import { playClick, playSuccess } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';

interface ParticipantCheckin {
  userId: string;
  name: string;
  avatar?: string;
  hostel?: string;
  checkinStatus?: 'heading_out' | 'arrived' | 'cant_make_it' | null;
  checkinTime?: string;
  reliabilityScore?: number;
  attendedMatches?: number;
  flakedMatches?: number;
}

interface CommitmentHandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onStatusUpdated?: () => void;
}

export function CommitmentHandshakeModal({
  isOpen,
  onClose,
  post,
  onStatusUpdated,
}: CommitmentHandshakeModalProps) {
  const { currentUser } = useUIStore();
  const [checkins, setCheckins] = useState<ParticipantCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchCheckins = async () => {
    if (!post?.id) return;
    try {
      const res = await fetch(`/api/posts/checkin?postId=${post.id}`);
      const data = await res.json();
      if (data.success) {
        setCheckins(data.checkins || []);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && post?.id) {
      setLoading(true);
      fetchCheckins();
    }
  }, [isOpen, post?.id]);

  const handleCheckin = async (status: 'heading_out' | 'arrived' | 'cant_make_it') => {
    if (!currentUser || !post?.id) return;
    playClick();
    setSubmitting(true);
    setToastMsg(null);

    try {
      const res = await fetch('/api/posts/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSuccess();
        setToastMsg(data.message);
        await fetchCheckins();
        if (onStatusUpdated) onStatusUpdated();
        if (status === 'cant_make_it') {
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } else {
        setToastMsg(data.error || 'Failed to update check-in');
      }
    } catch {
      setToastMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmCancel(false);
    }
  };

  if (!isOpen || !post) return null;

  const myCheckin = checkins.find(c => c.userId === currentUser?.id);
  const scheduledTime = post.scheduledStart ? new Date(post.scheduledStart) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-base text-white flex items-center gap-2">
                Commitment Handshake
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-bold border border-[#CCFF00]/20">
                  ZERO-FLAKE
                </span>
              </h3>
              <p className="text-[11px] text-[#6b6b80]">Verify departure and court arrival with your squad</p>
            </div>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:text-white hover:bg-white/5 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Match Quick Specs */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white font-outfit">{post.sport} Match</span>
            <span className="text-xs font-mono text-[#00F0FF] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" /> {post.ground}
            </span>
          </div>
          {scheduledTime && (
            <div className="text-[11px] text-[#a0a0b8] font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
              {scheduledTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
              {scheduledTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {toastMsg && (
          <div className="mt-3 p-3 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold text-center font-mono">
            {toastMsg}
          </div>
        )}

        {/* Squad Check-In Status Roster */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">
              Squad Readiness Status
            </span>
            <span className="text-[11px] text-[#6b6b80] font-mono">
              {checkins.filter(c => c.checkinStatus === 'heading_out' || c.checkinStatus === 'arrived').length}/{checkins.length} Ready
            </span>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-[#6b6b80]">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-[#CCFF00]" />
              Loading squad status...
            </div>
          ) : (
            <div className="space-y-2">
              {checkins.map(player => {
                const isMe = player.userId === currentUser?.id;
                const status = player.checkinStatus;

                let statusBadge = (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#6b6b80] border border-white/5">
                    ● Pending Check-in
                  </span>
                );

                if (status === 'heading_out') {
                  statusBadge = (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] font-bold border border-[#CCFF00]/30 flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> Heading Out
                    </span>
                  );
                } else if (status === 'arrived') {
                  statusBadge = (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> On Court
                    </span>
                  );
                }

                return (
                  <div
                    key={player.userId}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      isMe ? 'bg-[#CCFF00]/5 border-[#CCFF00]/20' : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0 font-mono">
                        {player.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white truncate">{player.name}</span>
                          {isMe && <span className="text-[9px] text-[#CCFF00] font-bold font-mono">(You)</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#6b6b80] font-mono">
                          <span>{player.hostel || 'Campus'}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-bold">
                            {player.reliabilityScore ?? 100}% Reliability
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">{statusBadge}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Check-In Action Section */}
        {currentUser && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
            <span className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider">
              Your Commitment Status
            </span>

            {showConfirmCancel ? (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2 text-center">
                <AlertOctagon className="w-6 h-6 text-[#FF2A55] mx-auto" />
                <h4 className="font-bold text-xs text-white">Release your slot to standby players?</h4>
                <p className="text-[10px] text-[#a0a0b8] leading-relaxed">
                  Releasing early allows an emergency standby flare so the match isn&apos;t cancelled.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowConfirmCancel(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/5 text-white hover:bg-white/10"
                  >
                    Keep My Slot
                  </button>
                  <button
                    onClick={() => handleCheckin('cant_make_it')}
                    disabled={submitting}
                    className="flex-1 py-2 rounded-xl text-xs font-black bg-[#FF2A55] text-white hover:bg-red-600 transition-all"
                  >
                    {submitting ? 'Releasing...' : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCheckin('heading_out')}
                    disabled={submitting || myCheckin?.checkinStatus === 'heading_out'}
                    className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      myCheckin?.checkinStatus === 'heading_out'
                        ? 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40'
                        : 'btn-volt'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Heading Out</span>
                  </button>

                  <button
                    onClick={() => handleCheckin('arrived')}
                    disabled={submitting || myCheckin?.checkinStatus === 'arrived'}
                    className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      myCheckin?.checkinStatus === 'arrived'
                        ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40'
                        : 'bg-[#00F0FF] text-[#040507] hover:bg-[#00d0dd] shadow-md shadow-[#00F0FF]/20'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>On Court</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowConfirmCancel(true)}
                  className="w-full py-2 text-[11px] font-bold text-[#a0a0b8] hover:text-[#FF2A55] transition-colors flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-[#FF2A55]" />
                  <span>Can&apos;t make it? Release slot for emergency flare</span>
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
