'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Search, ChevronDown, ChevronUp,
  Rocket, Swords, Trophy, Coins, BarChart3, UserCog, Shield, Gamepad2, MessageSquare
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Rocket,
    items: [
      { q: 'What is CourtMate?', a: 'CourtMate is a sports matchmaking platform where you can find players for pickup games, issue 1v1 challenges, join tournaments, and track your global ELO ranking across multiple sports.' },
      { q: 'How do I create an account?', a: 'Click "Register" from the top navigation. Enter your name, email, and a password. You\'ll receive a verification email — click the link to activate your account.' },
      { q: 'Is CourtMate free to use?', a: 'Yes! CourtMate is completely free. You earn coins through gameplay, daily logins, and completing your profile — no payment required.' },
      { q: 'What sports are available?', a: 'Cricket, Football, Badminton, Basketball, Table Tennis, Tennis, Volleyball, Chess, and more. We support both physical and online matchmaking.' },
    ],
  },
  {
    id: 'matchmaking',
    label: 'Matchmaking & Feed',
    icon: Gamepad2,
    items: [
      { q: 'How do I find a game?', a: 'Go to the Feed page. You\'ll see live match lobbies posted by other players. Click "Join" on any match that fits your schedule and sport.' },
      { q: 'How do I post a match?', a: 'On the Feed page, click "Create Post." Specify your sport, venue, date/time, and available slots. Other players can then join your lobby.' },
      { q: 'What happens after I join a match?', a: 'You\'ll appear in the match participants list. On game day, meet at the specified venue. After the match, the host can update results to affect ELO rankings.' },
    ],
  },
  {
    id: 'challenges',
    label: 'Challenges & Duels',
    icon: Swords,
    items: [
      { q: 'How do 1v1 challenges work?', a: 'You can issue a challenge from the Rankings page or any player\'s profile. Set a sport, venue, time, and stake coins. If they accept, you both compete — winner takes the staked coins.' },
      { q: 'Can I decline a challenge?', a: 'Yes. Pending challenges can be accepted or declined with no penalty. They expire after 48 hours if not responded to.' },
      { q: 'What are stake coins?', a: 'Stake coins are the amount you wager on a challenge. Both players put up the same amount. The winner receives the total pool.' },
    ],
  },
  {
    id: 'tournaments',
    label: 'Tournaments',
    icon: Trophy,
    items: [
      { q: 'How do I join a tournament?', a: 'Go to the Tournaments page, find an upcoming event, and click "Register." Some tournaments may have entry fees in coins.' },
      { q: 'Can I create my own tournament?', a: 'Yes! Click "Create Tournament" on the Tournaments page. Set the sport, format (single elimination, round robin), max players, and prizes.' },
      { q: 'How are tournament winners determined?', a: 'Based on the tournament format. Single elimination uses bracket play. Round robin tallies total points. Rankings are updated after each match.' },
    ],
  },
  {
    id: 'coins',
    label: 'Coins & Rewards',
    icon: Coins,
    items: [
      { q: 'How do I earn coins?', a: 'Daily login streak (up to 50/day), completing your profile (100 coins), winning challenges, tournament placements, posting matches, sharing matches on WhatsApp, and your initial welcome bonus (100 coins).' },
      { q: 'What can I spend coins on?', a: 'Coins can be staked in 1v1 challenges, used for tournament entry fees, and used to unlock premium profile badges and customizations.' },
      { q: 'Do coins expire?', a: 'No. Your coin balance persists indefinitely.' },
    ],
  },
  {
    id: 'rankings',
    label: 'Rankings & ELO',
    icon: BarChart3,
    items: [
      { q: 'What is ELO?', a: 'ELO is a rating system that measures your skill level. Starting at 1200, it goes up when you win and down when you lose. Beating higher-rated players earns more points.' },
      { q: 'What are the ranking tiers?', a: 'Bronze (< 1300), Silver (1300-1499), Gold (1500-1699), Platinum (1700-1899), Diamond (1900-2099), Champion (2100+).' },
      { q: 'How do I improve my ranking?', a: 'Win matches and challenges! Consistently beating players at or above your level is the fastest way to climb.' },
    ],
  },
  {
    id: 'account',
    label: 'Account & Settings',
    icon: UserCog,
    items: [
      { q: 'How do I change my password?', a: 'Go to Settings, scroll to the Security section, and click "Change Password." You\'ll need to enter your current password to confirm.' },
      { q: 'Can I delete my account?', a: 'Yes. Go to Settings > Account > Delete Account. This action is irreversible and removes all your data, rankings, and coin balance.' },
      { q: 'How do I update my profile?', a: 'Go to Settings. You can change your display name, avatar, bio, preferred sports, and notification preferences.' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety & Moderation',
    icon: Shield,
    items: [
      { q: 'How do I report a player?', a: 'Visit their profile, click the three-dot menu, and select "Report." Describe the issue — our team reviews all reports within 24 hours.' },
      { q: 'What happens when someone is reported?', a: 'Our moderation team investigates. If a violation is confirmed, actions range from warnings to temporary or permanent bans depending on severity.' },
      { q: 'How do I block another player?', a: 'From their profile, click the three-dot menu and select "Block." They won\'t be able to challenge you, message you, or see your match posts.' },
    ],
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FAQ_DATA;
    return FAQ_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const displayData = activeCategory
    ? filteredData.filter((c) => c.id === activeCategory)
    : filteredData;

  const totalResults = displayData.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #00f5d4, transparent 60%)' }} />
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-[#00f5d4]/20"
              style={{ background: 'rgba(0, 245, 212, 0.08)' }}>
              <BookOpen className="w-7 h-7 text-[#00f5d4]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-white mb-3">
              Help Center
            </h1>
            <p className="text-[#a0a0b8] text-lg max-w-xl mx-auto mb-8">
              Everything you need to know about using CourtMate.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#00f5d4] transition-all"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              activeCategory === null
                ? 'border-[#00f5d4]/30 bg-[#00f5d4]/10 text-[#00f5d4]'
                : 'border-white/5 bg-white/[0.02] text-[#6b6b80] hover:border-white/10 hover:text-[#a0a0b8]'
            }`}
          >
            All Topics
          </button>
          {FAQ_DATA.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeCategory === cat.id
                  ? 'border-[#00f5d4]/30 bg-[#00f5d4]/10 text-[#00f5d4]'
                  : 'border-white/5 bg-white/[0.02] text-[#6b6b80] hover:border-white/10 hover:text-[#a0a0b8]'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count for search */}
        {searchQuery && (
          <p className="text-sm text-[#6b6b80] mb-6">
            {totalResults === 0 ? 'No results found.' : `${totalResults} result${totalResults !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* No results */}
        {totalResults === 0 && searchQuery && (
          <div className="text-center py-16">
            <p className="text-[#a0a0b8] mb-4">We couldn't find an answer for "{searchQuery}"</p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Support Instead
            </Link>
          </div>
        )}

        {/* FAQ Sections */}
        <div className="space-y-6">
          {displayData.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                <cat.icon className="w-5 h-5 text-[#00f5d4]" />
                <h2 className="text-lg font-bold font-[family-name:var(--font-outfit)] text-white">
                  {cat.label}
                </h2>
                <span className="text-xs text-[#6b6b80] ml-auto">{cat.items.length} articles</span>
              </div>

              <div className="divide-y divide-white/5">
                {cat.items.map((item, idx) => {
                  const key = `${cat.id}-${idx}`;
                  const isOpen = openItems.has(key);
                  return (
                    <div key={key}>
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left text-sm text-white hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="pr-4 font-medium">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#6b6b80] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6b6b80] shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-6 pb-4"
                        >
                          <p className="text-sm text-[#a0a0b8] leading-relaxed pl-0">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-12 p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
          <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-white mb-2">
            Still Need Help?
          </h3>
          <p className="text-sm text-[#a0a0b8] mb-5">
            Can't find what you're looking for? Our support team is ready to assist.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7b2ff7, #00f5d4)' }}
          >
            <MessageSquare className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
