import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — CourtMate',
  description: 'How CourtMate uses cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Cookie Policy
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">2. Cookies We Use</h2>

          {/* Cookie table */}
          <div className="overflow-x-auto rounded-xl border border-white/10 my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-[#a0a0b8] font-semibold">Cookie</th>
                  <th className="text-left px-4 py-3 text-[#a0a0b8] font-semibold">Type</th>
                  <th className="text-left px-4 py-3 text-[#a0a0b8] font-semibold">Purpose</th>
                  <th className="text-left px-4 py-3 text-[#a0a0b8] font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-4 py-3 text-white font-mono text-xs">session_token</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">Essential</span></td>
                  <td className="px-4 py-3">Authenticates your login session</td>
                  <td className="px-4 py-3">7 days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white font-mono text-xs">ui_store</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">Essential</span></td>
                  <td className="px-4 py-3">Stores your UI preferences (theme, settings)</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white font-mono text-xs">cookie_consent</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">Essential</span></td>
                  <td className="px-4 py-3">Records your cookie consent preference</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white font-mono text-xs">_ga / _gid</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs">Analytics</span></td>
                  <td className="px-4 py-3">Google Analytics — tracks page views and usage patterns</td>
                  <td className="px-4 py-3">2 years / 24h</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white font-mono text-xs">onboarding_seen</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs">Functional</span></td>
                  <td className="px-4 py-3">Prevents re-showing the onboarding modal</td>
                  <td className="px-4 py-3">Permanent</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white font-mono text-xs">daily_claim</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs">Functional</span></td>
                  <td className="px-4 py-3">Tracks daily login streak claims</td>
                  <td className="px-4 py-3">24 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">3. Managing Cookies</h2>
          <p className="mb-3">
            You can manage your cookie preferences at any time:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-white">Browser Settings:</strong> Most browsers allow you to block or delete cookies through their settings menu.</li>
            <li><strong className="text-white">Our Cookie Banner:</strong> Use the cookie consent banner that appears on your first visit to accept or reject non-essential cookies.</li>
          </ul>
          <p className="mt-3 text-xs text-[#6b6b80]">
            Note: Blocking essential cookies will prevent you from logging in and using the platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">4. Third-Party Cookies</h2>
          <p>
            We use Google Analytics to understand how the platform is used. Google may set its own cookies. For more information, see <a href="https://policies.google.com/privacy" className="text-[#00f5d4] hover:underline" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">5. Contact</h2>
          <p>
            Questions about our use of cookies? Contact us at <span className="text-[#00f5d4]">privacy@courtmate.com</span>.
          </p>
        </div>
      </section>
    </article>
  );
}
