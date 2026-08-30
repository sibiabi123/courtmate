import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — CourtMate',
  description: 'Learn how CourtMate collects, uses, and protects your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">1. Introduction</h2>
          <p>
            CourtMate ("we," "our," or "us") operates the courtmate.com platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our sports matchmaking platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">2. Information We Collect</h2>
          <p className="mb-3"><strong className="text-white">Personal Information:</strong> When you register, we collect your name, email address, and password. Optionally, you may provide your bio, avatar, preferred sports, and location.</p>
          <p className="mb-3"><strong className="text-white">Usage Data:</strong> We automatically collect information about how you interact with the platform, including pages visited, features used, match history, challenge records, tournament participation, and ELO rating changes.</p>
          <p><strong className="text-white">Device Data:</strong> We collect browser type, operating system, device type, IP address, and cookies for analytics and security purposes.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>To create and manage your account</li>
            <li>To facilitate matchmaking, challenges, and tournament participation</li>
            <li>To calculate and display ELO ratings and leaderboard rankings</li>
            <li>To send you notifications about matches, challenges, and platform updates</li>
            <li>To improve and personalize the platform experience</li>
            <li>To detect and prevent fraud, abuse, and security incidents</li>
            <li>To comply with legal obligations</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">4. Data Sharing</h2>
          <p className="mb-3">We do not sell your personal information. We may share your data with:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-white">Other Users:</strong> Your public profile (name, avatar, sport preferences, ELO rating, match history) is visible to other CourtMate users.</li>
            <li><strong className="text-white">Service Providers:</strong> Third-party services that help us operate the platform (hosting, analytics, email delivery).</li>
            <li><strong className="text-white">Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">5. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where retention is required by law. Anonymized match and rating data may be retained for platform analytics.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">6. Your Rights</h2>
          <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict the processing of your data</li>
            <li>Data portability — receive your data in a structured, machine-readable format</li>
            <li>Withdraw consent at any time where processing is based on consent</li>
          </ul>
          <p className="mt-3">To exercise these rights, contact us at <span className="text-[#00f5d4]">privacy@courtmate.com</span>.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">7. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. Analytics cookies help us understand usage patterns. You can manage your cookie preferences through our cookie settings. For more details, see our <a href="/cookies" className="text-[#00f5d4] hover:underline">Cookie Policy</a>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">8. Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit (TLS), hashed passwords (bcrypt), and regular security audits. However, no method of transmission over the Internet is 100% secure. See our <a href="/security" className="text-[#00f5d4] hover:underline">Security Policy</a> for details.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">9. Children's Privacy</h2>
          <p>
            CourtMate is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. Continued use of CourtMate after changes constitutes acceptance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at:<br />
            <span className="text-[#00f5d4]">privacy@courtmate.com</span>
          </p>
        </div>
      </section>
    </article>
  );
}
