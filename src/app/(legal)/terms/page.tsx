import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — CourtMate',
  description: 'CourtMate Terms of Service governing use of the sports matchmaking platform.',
};

export default function TermsPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CourtMate, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">2. Eligibility</h2>
          <p>
            You must be at least 13 years old to use CourtMate. By registering, you represent that you meet this minimum age requirement. If you are under 18, you confirm that a parent or guardian has reviewed and agreed to these terms on your behalf.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">3. User Accounts</h2>
          <p className="mb-2">You are responsible for maintaining the confidentiality of your account credentials. You agree to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Provide accurate and complete registration information</li>
            <li>Keep your password secure and not share it with others</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">4. Platform Usage</h2>
          <p className="mb-2">CourtMate provides sports matchmaking, tournament organization, and player ranking services. You agree to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Use the platform only for its intended purpose of sports coordination</li>
            <li>Report match results honestly and accurately</li>
            <li>Treat all users with respect and sportsmanship</li>
            <li>Comply with our <a href="/community-guidelines" className="text-[#00f5d4] hover:underline">Community Guidelines</a> and <a href="/acceptable-use" className="text-[#00f5d4] hover:underline">Acceptable Use Policy</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">5. Coins & Virtual Currency</h2>
          <p>
            CourtMate coins are a virtual, non-transferable, non-refundable reward token earned through platform activity. Coins have no real-world monetary value and cannot be exchanged for cash or any other form of currency. We reserve the right to modify the coin system at any time.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">6. ELO Ratings & Rankings</h2>
          <p>
            ELO ratings are calculated algorithmically based on match results. While we strive for accuracy, ratings are provided "as is" and may be subject to recalculation. Manipulating ratings through collusion, match-fixing, or fraudulent reporting will result in account suspension.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">7. Challenges & Wagers</h2>
          <p>
            When you issue or accept a challenge with staked coins, you agree to honor the result. Disputes will be reviewed by our moderation team. Repeated disputes or unsportsmanlike conduct may result in restrictions on your ability to issue challenges.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">8. User Content</h2>
          <p>
            You retain ownership of content you post (match descriptions, messages, profile information). By posting, you grant CourtMate a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content as part of the platform's operation.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">9. Prohibited Conduct</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Harassment, bullying, or threatening other users</li>
            <li>Posting false, misleading, or offensive content</li>
            <li>Match-fixing or colluding to manipulate rankings</li>
            <li>Creating multiple accounts to gain unfair advantage</li>
            <li>Attempting to exploit, hack, or reverse-engineer the platform</li>
            <li>Using the platform for any illegal activity</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">10. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for violation of these terms. You may delete your account at any time through Settings. Upon termination, your right to use the platform ceases, and your coin balance will be forfeited.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">11. Limitation of Liability</h2>
          <p>
            CourtMate is a coordination platform. We are not responsible for physical injuries, property damage, or personal disputes arising from in-person sports activities arranged through the platform. Participation in all physical activities is at your own risk.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">12. Disclaimer</h2>
          <p>
            The platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted service, data accuracy, or that the platform will meet your specific requirements.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">13. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Material changes will be communicated via email or an in-app notification. Continued use after changes constitutes acceptance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">14. Contact</h2>
          <p>
            For questions about these terms, contact us at <span className="text-[#00f5d4]">legal@courtmate.com</span>.
          </p>
        </div>
      </section>
    </article>
  );
}
