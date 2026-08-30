import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement — CourtMate',
  description: 'CourtMate\'s commitment to digital accessibility.',
};

export default function AccessibilityPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Accessibility Statement
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Our Commitment</h2>
          <p>
            CourtMate is committed to ensuring digital accessibility for people of all abilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Standards</h2>
          <p>
            We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible to people with disabilities, including visual, auditory, motor, and cognitive impairments.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">What We Do</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Semantic HTML structure for screen reader compatibility</li>
            <li>Keyboard navigation support across all interactive elements</li>
            <li>Sufficient color contrast ratios for text and interactive elements</li>
            <li>Alt text for meaningful images</li>
            <li>Focus indicators for all interactive components</li>
            <li>Responsive design that works across devices and zoom levels</li>
            <li>ARIA labels and roles where appropriate</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Known Limitations</h2>
          <p className="mb-3">We are aware of the following accessibility limitations and are working to address them:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Some animated components may not respect reduced-motion preferences on all browsers.</li>
            <li>Certain complex data visualizations (leaderboard charts) may not be fully accessible to screen readers.</li>
            <li>Third-party embedded content may have its own accessibility limitations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Feedback & Assistance</h2>
          <p>
            If you encounter any accessibility barriers or need content in an alternative format, please contact us:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 mt-3">
            <li>Email: <span className="text-[#00f5d4]">accessibility@courtmate.com</span></li>
            <li>Support page: <a href="/support" className="text-[#00f5d4] hover:underline">/support</a></li>
          </ul>
          <p className="mt-3">We aim to respond to accessibility feedback within 3 business days.</p>
        </div>
      </section>
    </article>
  );
}
