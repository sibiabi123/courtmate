'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Lock, Unlock, Calendar, UserPlus, CheckCircle2 } from 'lucide-react';
import { mockGames } from '@/data/mock-data';
import { getInitials } from '@/lib/utils';
import { useAppStore } from '@/store';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Retrieve reactive store state
  const { groups, users, currentUser, joinGroup } = useAppStore();

  const fallbackGroup = {
    id: 'empty',
    name: 'Temporary Group',
    gameId: 'g-cricket',
    ownerId: 'u1',
    description: 'No group details found.',
    logo: '👥',
    requirements: '',
    memberCount: 0,
    maxMembers: 10,
    members: [],
    isOpen: true,
    createdAt: new Date().toISOString(),
    tags: []
  };

  const group = groups.find(g => g.id === id) || fallbackGroup;
  const game = mockGames.find(g => g.id === group.gameId);

  // Resolve members from dynamic users array
  const memberIds = group.members.map(m => m.userId);
  const members = users.filter(u => memberIds.includes(u.id));

  const hasJoined = !!(currentUser && group.members.some(m => m.userId === currentUser.id));

  const handleJoin = () => {
    if (!currentUser) return;
    joinGroup(group.id, currentUser.id);
  };

  return (
    <div className="min-h-screen">
      <div className="h-44 bg-gradient-to-br from-[#7b2ff7]/20 via-[#0a0a0f] to-[#00f5d4]/15 flex items-center justify-center relative">
        <span className="text-7xl">{group.logo}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6">
          <Link href="/groups" className="flex items-center gap-1 text-xs text-[#a0a0b8] hover:text-white mb-3" data-cursor-hover>
            <ArrowLeft className="h-3 w-3" /> All Groups
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold mb-2">{group.name}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-[#a0a0b8] mb-3">
                <span>{game?.icon} {game?.name}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {group.memberCount}/{group.maxMembers} members</span>
                <span className={`flex items-center gap-1 ${group.isOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {group.isOpen ? <><Unlock className="h-3 w-3" /> Open</> : <><Lock className="h-3 w-3" /> Invite Only</>}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Since {new Date(group.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleJoin}
                disabled={hasJoined}
                className={`rounded-xl px-5 py-2 text-sm font-bold transition-transform flex items-center gap-1.5 cursor-pointer ${
                  hasJoined
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default'
                    : 'bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] text-white hover:scale-105'
                }`}
                data-cursor-hover={!hasJoined ? true : undefined}
              >
                {hasJoined ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Joined
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Join Group
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-[#a0a0b8] mb-3">{group.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {group.tags.map(tag => (
              <span key={tag} className="text-xs bg-white/5 text-[#a0a0b8] rounded-full px-2.5 py-0.5">#{tag}</span>
            ))}
          </div>
          {group.requirements && (
            <div className="rounded-xl bg-[#ffd60a]/5 border border-[#ffd60a]/20 p-3 text-xs text-[#ffd60a]">
              <strong>Requirements:</strong> {group.requirements}
            </div>
          )}
        </motion.div>

        {/* Members */}
        <div className="glass rounded-2xl p-5 mb-10">
          <h2 className="font-semibold font-[family-name:var(--font-outfit)] mb-4">👥 Members ({members.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {members.map((u, i) => {
              const isOwner = u.id === group.ownerId;
              return (
                <Link key={u.id} href={`/profile/${u.id}`} className="rounded-xl bg-white/[0.03] p-3 text-center hover:bg-white/[0.06] transition-colors" data-cursor-hover>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7b2ff7] to-[#00f5d4] flex items-center justify-center text-xs font-bold mx-auto mb-2 text-white">
                    {getInitials(u.name)}
                  </div>
                  <p className="text-xs font-medium truncate text-white">{u.name}</p>
                  <p className="text-[10px] text-[#6b6b80]">{isOwner ? '👑 Leader' : 'Member'}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
