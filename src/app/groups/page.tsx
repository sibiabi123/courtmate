'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Lock, Unlock, X, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { mockGames } from '@/data/mock-data';
import type { Group } from '@/types';

export default function GroupsPage() {
  const [search, setSearch] = useState('');
  const [filterGame, setFilterGame] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Zustand state
  const { groups, users, currentUser, joinGroup } = useAppStore(); // Let's check how we add groups in Zustand. Oh, in Zustand we don't have an addGroup action directly, let's add one if needed, or we can just append it locally or add to store. Wait! In store we have `groups: mockGroups`. We can add an `addGroup` action or update state directly!
  // Wait, let's check store actions. We have `joinGroup`, but do we have `addGroup`? Let's check `src/store/index.ts` lines 50-70. No `addGroup`. But we can add a local append action in store if we need it. Wait, `set` can modify `groups` directly! Or we can update the store to include `addGroup`. Let's check:
  // Yes, let's write a simple store updater or we can just append it via `useAppStore.setState`. Zustand allows `useAppStore.setState(state => ({ groups: [newGroup, ...state.groups] }))` directly! That's incredibly elegant and requires zero extra actions in the interface!

  const hydratedGroups = groups.map(g => ({
    ...g,
    game: mockGames.find(game => game.id === g.gameId),
  }));

  const filtered = hydratedGroups.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchGame = filterGame === 'all' || g.gameId === filterGame;
    return matchSearch && matchGame;
  });

  // Form states for creating a group
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [logo, setLogo] = useState('🎮');
  const [maxMembers, setMaxMembers] = useState(20);
  const [tagsInput, setTagsInput] = useState('');
  const [formError, setFormError] = useState('');

  const handleCreateGroup = () => {
    if (!name || !gameId || !description || !logo) {
      setFormError('Please fill in all fields.');
      return;
    }

    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      gameId,
      ownerId: currentUser?.id || 'u1',
      description,
      logo,
      requirements,
      memberCount: 1, // Owner is member
      maxMembers,
      members: [
        {
          id: `gmem-${Date.now()}`,
          groupId: `group-${Date.now()}`,
          userId: currentUser?.id || 'u1',
          role: 'leader',
          joinedAt: new Date().toISOString(),
        }
      ],
      isOpen: true,
      createdAt: new Date().toISOString(),
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    };

    // Use setState directly to append the group reactively!
    useAppStore.setState(state => ({
      groups: [newGroup, ...state.groups],
    }));

    setShowCreateModal(false);

    // Reset fields
    setName('');
    setGameId('');
    setDescription('');
    setRequirements('');
    setLogo('🎮');
    setMaxMembers(20);
    setTagsInput('');
    setFormError('');
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-[#050508]/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-[family-name:var(--font-outfit)] font-bold">
                👥 Gaming <span className="gradient-text">Groups</span>
              </h1>
              <p className="text-[#6b6b80] mt-1">Join a squad or create your own team</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#6d28d9] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7b2ff7]/25 hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Group
            </button>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b80]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search groups..."
                className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:border-[#7b2ff7] focus:outline-none"
              />
            </div>
            <select
              value={filterGame}
              onChange={e => setFilterGame(e.target.value)}
              className="rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-sm focus:border-[#7b2ff7] focus:outline-none"
            >
              <option value="all">All Games</option>
              {mockGames.filter(g => g.isPhysical || g.category === 'digital').map(g => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-6 glass rounded-3xl border border-white/5 flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-[#7b2ff7]/10 flex items-center justify-center text-3xl mb-6 neon-border-purple border">
              👥
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Squads Found</h3>
            <p className="text-sm text-[#a0a0b8] max-w-sm mb-8">There are no gaming groups matching your search or active for this game yet. Create the first squad!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#6d28d9] text-xs font-bold text-white shadow-lg hover:shadow-[#7b2ff7]/20 transition-all hover:scale-105"
            >
              Create a Gaming Group
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((group, i) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={`/groups/${group.id}`} className="block glass rounded-2xl overflow-hidden card-hover group" data-cursor-hover>
                <div className="h-28 bg-gradient-to-br from-[#7b2ff7]/15 to-[#00f5d4]/10 flex items-center justify-center relative">
                  <span className="text-5xl">{group.logo}</span>
                  <span className={`absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${group.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {group.isOpen ? <><Unlock className="h-3 w-3" /> Open</> : <><Lock className="h-3 w-3" /> Invite</>}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg font-[family-name:var(--font-outfit)] mb-1 group-hover:text-[#00f5d4] transition-colors">{group.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#a0a0b8] mb-3">
                    <span>{group.game?.icon} {group.game?.name}</span>
                    <span className="text-[#6b6b80]">•</span>
                    <span><Users className="inline h-3 w-3" /> {group.memberCount}/{group.maxMembers}</span>
                  </div>
                  <p className="text-xs text-[#6b6b80] line-clamp-2 mb-4">{group.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-white/5 text-[#a0a0b8] rounded-full px-2 py-0.5">#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowCreateModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-[family-name:var(--font-outfit)] font-bold text-white">
                  👥 Create a Gaming Group
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-white/5 rounded-lg cursor-pointer">
                  <X className="h-5 w-5 text-[#6b6b80]" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#a0a0b8] mb-1.5">Group Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Shuttle Squad"
                      className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-[#7b2ff7] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a0a0b8] mb-1.5">Select Game</label>
                    <select
                      value={gameId}
                      onChange={e => setGameId(e.target.value)}
                      className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-[#7b2ff7] focus:outline-none"
                    >
                      <option value="">Select a game...</option>
                      {mockGames.map(g => (
                        <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#a0a0b8] mb-1.5">Emoji Icon</label>
                    <input
                      type="text"
                      value={logo}
                      onChange={e => setLogo(e.target.value)}
                      placeholder="e.g. 🏸"
                      className="w-full text-center rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-[#7b2ff7] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#a0a0b8] mb-1.5">Max Members</label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={maxMembers}
                      onChange={e => setMaxMembers(parseInt(e.target.value))}
                      className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-[#7b2ff7] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#a0a0b8] mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="e.g. daily, morning, doubles"
                    className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-[#7b2ff7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#a0a0b8] mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is this group about? When do you play?"
                    className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-[#7b2ff7] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#a0a0b8] mb-1.5">Joining Requirements (Optional)</label>
                  <input
                    type="text"
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                    placeholder="e.g. Must bring own racket"
                    className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-[#7b2ff7] focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleCreateGroup}
                  className="w-full rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-[#7b2ff7]/25 transition-all cursor-pointer"
                >
                  Create Group 👥
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
