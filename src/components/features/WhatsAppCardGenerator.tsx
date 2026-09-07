'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Share2, Copy, Check, X, MessageSquare, ExternalLink, Sparkles
} from 'lucide-react';
import { playClick, playSuccess } from '@/lib/sound';

interface WhatsAppCardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

export function WhatsAppCardGenerator({
  isOpen,
  onClose,
  post,
}: WhatsAppCardGeneratorProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://courtmate-vit-2026.vercel.app';
  const postUrl = `${origin}/feed?post=${post.id}`;
  const scheduledTime = post.scheduledStart ? new Date(post.scheduledStart) : null;
  const spotsLeft = Math.max(0, post.maxPlayers - post.currentPlayers);
  const timeString = scheduledTime
    ? `${scheduledTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} @ ${scheduledTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Today (Match Starting Soon)';

  const formattedText = `🏅 *[${post.sport.toUpperCase()} MATCH LOBBY]*
📍 *Venue:* ${post.ground}
⏰ *Time:* ${timeString}
⚡ *Skill Level:* ${post.skillLevel || 'All Skill Levels'}
━━━━━━━━━━━━━━━━━━━━━━━
👥 *Squad Status (${post.currentPlayers}/${post.maxPlayers} Locked):*
${post.user?.name ? `1. ${post.user.name} (Host) · ${post.user.hostel || 'Main Campus'}` : '1. Host Athlete'}
${Array.from({ length: Math.min(spotsLeft, 3) }).map((_, i) => `${post.currentPlayers + i + 1}. [ ⚡ OPEN SLOT — TAP TO CLAIM ]`).join('\n')}
${spotsLeft > 3 ? `... and ${spotsLeft - 3} more open spots!` : ''}
━━━━━━━━━━━━━━━━━━━━━━━
👉 *Claim your spot instantly on CourtMate:*
${postUrl}
${post.whatsappGroupUrl ? `\n💬 *Official Match Squad Group:* ${post.whatsappGroupUrl}` : ''}`;

  const handleCopy = () => {
    playClick();
    navigator.clipboard.writeText(formattedText).then(() => {
      playSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleLaunchWhatsApp = () => {
    playClick();
    window.open(`https://wa.me/?text=${encodeURIComponent(formattedText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0C10] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg">
              📲
            </div>
            <div>
              <h3 className="font-outfit font-black text-base text-white flex items-center gap-2">
                WhatsApp Lineup Card
              </h3>
              <p className="text-[11px] text-[#6b6b80]">Viral high-contrast squad card with instant join links</p>
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

        {/* Live Preview Box */}
        <div className="mt-4">
          <span className="text-[10px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-2 block font-mono">
            Message Preview (How it looks in WhatsApp)
          </span>
          <div className="p-4 rounded-2xl bg-[#081812] border border-emerald-500/20 text-xs font-mono text-emerald-100 whitespace-pre-wrap leading-relaxed shadow-inner max-h-60 overflow-y-auto selection:bg-emerald-500 selection:text-black">
            {formattedText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="py-3 px-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span className="text-[#CCFF00]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleLaunchWhatsApp}
              className="py-3 px-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Share to Group</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-[#6b6b80] leading-snug">
            Paste directly into your hostel or sport group. When friends tap the link, they claim open spots in 1 click.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
