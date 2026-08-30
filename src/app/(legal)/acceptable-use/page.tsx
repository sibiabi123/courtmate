import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy — CourtMate',
  description: 'What users can and cannot do on the CourtMate platform.',
};

export default function AcceptableUsePage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Acceptable Use Policy
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <p>
            This Acceptable Use Policy governs your use of the CourtMate platform. By using CourtMate, you agree to comply with this policy. Violations may result in warnings, suspension, or permanent removal from the platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">✅ Permitted Uses</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Finding and coordinating sports matches with other players</li>
            <li>Issuing and accepting 1v1 challenges with staked coins</li>
            <li>Creating and joining tournaments</li>
            <li>Participating in sports groups and discussions</li>
            <li>Tracking your ELO rating and viewing leaderboards</li>
            <li>Sharing match results and achievements</li>
            <li>Providing constructive feedback and sportsmanship</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">🚫 Prohibited Uses</h2>

          <h3 className="text-sm font-bold text-white mt-4 mb-2">Account Abuse</h3>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Creating multiple accounts (multi-accounting)</li>
            <li>Sharing account credentials with others</li>
            <li>Using automated scripts or bots to interact with the platform</li>
            <li>Selling, trading, or transferring your account</li>
          </ul>

          <h3 className="text-sm font-bold text-white mt-4 mb-2">Rating Manipulation</h3>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Match-fixing or colluding to inflate/deflate ELO ratings</li>
            <li>Intentionally losing to transfer coins to another account</li>
            <li>Submitting false match results</li>
            <li>Exploiting bugs or glitches to gain unfair advantages</li>
          </ul>

          <h3 className="text-sm font-bold text-white mt-4 mb-2">Harmful Content</h3>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Posting offensive, discriminatory, or explicit content</li>
            <li>Sharing personal information of other users without consent</li>
            <li>Distributing malware, phishing links, or harmful files</li>
            <li>Advertising or promoting unrelated products or services</li>
          </ul>

          <h3 className="text-sm font-bold text-white mt-4 mb-2">Technical Abuse</h3>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Attempting to access other users' accounts or data</li>
            <li>Performing security scans without authorization (see <a href="/security" className="text-[#00f5d4] hover:underline">Responsible Disclosure</a>)</li>
            <li>Intentionally overloading servers or performing denial-of-service attacks</li>
            <li>Scraping platform data for commercial purposes</li>
            <li>Reverse-engineering or decompiling the platform</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Consequences</h2>
          <p className="mb-3">Violations are addressed based on severity:</p>
          <div className="overflow-x-auto rounded-xl border border-white/10 my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-[#a0a0b8] font-semibold">Severity</th>
                  <th className="text-left px-4 py-3 text-[#a0a0b8] font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs">Minor</span></td>
                  <td className="px-4 py-3">Warning notification + content removal</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-xs">Moderate</span></td>
                  <td className="px-4 py-3">Temporary restriction (7–30 days)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs">Severe</span></td>
                  <td className="px-4 py-3">Permanent ban + forfeiture of coins and ratings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Reporting Violations</h2>
          <p>
            If you witness a violation of this policy, report it through the in-app reporting system or email <span className="text-[#00f5d4]">moderation@courtmate.com</span>. All reports are reviewed within 24 hours.
          </p>
        </div>
      </section>
    </article>
  );
}
