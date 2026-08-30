import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer — CourtMate',
  description: 'Important disclaimers regarding use of the CourtMate sports platform.',
};

export default function DisclaimerPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Disclaimer
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Physical Activity Disclaimer</h2>
          <p>
            CourtMate is a coordination platform that connects players for physical sports activities. By using the platform to arrange or participate in any physical activity — including but not limited to cricket, football, badminton, basketball, tennis, and other sports — you acknowledge and accept the following:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 mt-3">
            <li>Physical sports carry inherent risks of injury, including muscle strains, fractures, concussions, and other physical harm.</li>
            <li>You participate in all physical activities entirely at your own risk and discretion.</li>
            <li>You confirm that you are physically fit to participate in the activities you join.</li>
            <li>CourtMate does not supervise, organize, or control any in-person sports activities.</li>
            <li>CourtMate is not liable for any injuries, property damage, or losses incurred during physical activities arranged through the platform.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Platform Disclaimer</h2>
          <p>
            The platform is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the accuracy, reliability, or availability of the platform. ELO ratings and rankings are algorithmically generated estimates of skill and are provided for entertainment and competitive context only.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">User Interactions</h2>
          <p>
            CourtMate does not verify the identity, background, or sportsmanship of its users. You are responsible for exercising your own judgment when interacting with other users, both online and in person. We recommend meeting in public, well-lit venues and informing someone of your plans when attending matches with unfamiliar players.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Venue Disclaimer</h2>
          <p>
            Venues listed or mentioned on CourtMate are user-submitted and not verified by us. Availability, condition, and suitability of venues are beyond our control. Always confirm venue access and conditions before traveling.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Contact</h2>
          <p>
            Questions about this disclaimer? Contact us at <span className="text-[#00f5d4]">legal@courtmate.com</span>.
          </p>
        </div>
      </section>
    </article>
  );
}
