import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines — CourtMate',
  description: 'Community standards and conduct rules for CourtMate users.',
};

export default function CommunityGuidelinesPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Community Guidelines
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <p>
            CourtMate exists to help athletes find games, build skills, and compete fairly. These guidelines ensure the platform remains welcoming, competitive, and safe for everyone.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">🤝 Sportsmanship First</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Treat every player with respect — regardless of skill level, ranking, or experience.</li>
            <li>Accept wins and losses gracefully. ELO goes up and down — that's the game.</li>
            <li>Report match results honestly. Falsifying results undermines the entire community.</li>
            <li>Show up when you commit to a match. No-shows waste everyone's time.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">🚫 Zero Tolerance</h2>
          <p className="mb-3">The following will result in immediate action, up to permanent ban:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-white">Harassment or Threats:</strong> No bullying, intimidation, hate speech, or personal attacks.</li>
            <li><strong className="text-white">Match Fixing:</strong> Colluding with another player to manipulate ELO ratings or coin stakes.</li>
            <li><strong className="text-white">Multi-Accounting:</strong> Creating multiple accounts to exploit challenges or boost rankings.</li>
            <li><strong className="text-white">Impersonation:</strong> Pretending to be another user, athlete, or administrator.</li>
            <li><strong className="text-white">Spam:</strong> Flooding the feed, groups, or messages with repetitive or irrelevant content.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">⚔️ Challenges & Duels</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Only issue challenges you intend to follow through on.</li>
            <li>Respect the agreed-upon stakes. Coin wagers are binding once both sides accept.</li>
            <li>If a dispute arises, use the in-app dispute system. Do not escalate outside the platform.</li>
            <li>Admins will review disputed matches and their decision is final.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">🏟️ Tournaments</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Register only for tournaments you can attend.</li>
            <li>Follow the specific rules posted by the tournament organizer.</li>
            <li>Unsportsmanlike conduct during tournaments (rage-quitting, stalling) may result in disqualification and ranking penalties.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">👥 Groups</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Respect group rules set by the group owner.</li>
            <li>Stay on topic. Sports groups are for sports coordination, not unrelated promotion.</li>
            <li>Group owners may remove members who violate group-specific rules.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">📝 Content Standards</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Keep match posts, bios, and messages appropriate for all ages.</li>
            <li>No explicit, violent, or discriminatory content.</li>
            <li>Do not share personal contact information of other users publicly.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">🔔 Enforcement</h2>
          <p className="mb-3">Violations are handled on a case-by-case basis:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-white">First offense:</strong> Warning notification</li>
            <li><strong className="text-white">Second offense:</strong> 7-day platform restriction</li>
            <li><strong className="text-white">Third offense:</strong> 30-day suspension</li>
            <li><strong className="text-white">Severe violations:</strong> Immediate permanent ban</li>
          </ul>
          <p className="mt-3">
            All enforcement decisions can be appealed by contacting <span className="text-[#00f5d4]">moderation@courtmate.com</span>.
          </p>
        </div>
      </section>
    </article>
  );
}
