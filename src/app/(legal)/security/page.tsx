import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy — CourtMate',
  description: 'How CourtMate protects your data and how to report vulnerabilities.',
};

export default function SecurityPolicyPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-black font-[family-name:var(--font-outfit)] text-white mb-2">
        Security Policy
      </h1>
      <p className="text-sm text-[#6b6b80] mb-8">Last updated: August 30, 2026</p>

      <section className="space-y-6 text-[#a0a0b8] text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Our Security Practices</h2>
          <p className="mb-3">CourtMate implements industry-standard security measures to protect your data:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-white">Encryption in Transit:</strong> All data between your browser and our servers is encrypted using TLS 1.3.</li>
            <li><strong className="text-white">Password Security:</strong> Passwords are hashed using bcrypt with per-user salts. We never store plaintext passwords.</li>
            <li><strong className="text-white">Session Management:</strong> Sessions use secure, HttpOnly cookies with automatic expiration.</li>
            <li><strong className="text-white">Input Validation:</strong> All user inputs are validated and sanitized server-side to prevent injection attacks.</li>
            <li><strong className="text-white">Rate Limiting:</strong> API endpoints are rate-limited to prevent brute-force attacks.</li>
            <li><strong className="text-white">Regular Updates:</strong> Dependencies are monitored and updated to patch known vulnerabilities.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Data Protection</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Database access is restricted to authorized application services only.</li>
            <li>Administrative access requires multi-factor authentication.</li>
            <li>Sensitive operations are logged for audit purposes.</li>
            <li>Backups are encrypted and stored securely.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Account Security Tips</h2>
          <p className="mb-3">Help us keep your account secure:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Use a strong, unique password that you don't reuse across other sites.</li>
            <li>Never share your login credentials with anyone.</li>
            <li>Log out from shared or public devices.</li>
            <li>Report suspicious activity on your account immediately.</li>
          </ul>
        </div>

        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">🔒 Responsible Disclosure</h2>
          <p className="mb-3">
            We value the security research community. If you discover a vulnerability in CourtMate, we ask that you:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Report the issue privately to <span className="text-[#00f5d4]">security@courtmate.com</span></li>
            <li>Include a detailed description and steps to reproduce the issue</li>
            <li>Give us reasonable time (90 days) to address the vulnerability before public disclosure</li>
            <li>Do not access, modify, or delete other users' data during your research</li>
            <li>Do not perform denial-of-service testing</li>
          </ul>
          <p className="mt-3">
            We commit to acknowledging your report within 48 hours and providing regular updates on our progress. We will not pursue legal action against researchers who follow these guidelines.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Incident Response</h2>
          <p>
            In the event of a security breach that affects user data, we will notify affected users within 72 hours via email, disclose the nature and scope of the breach, describe the steps we are taking, and provide guidance on protecting your account.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-outfit)]">Contact</h2>
          <p>
            For security concerns, contact: <span className="text-[#00f5d4]">security@courtmate.com</span>
          </p>
        </div>
      </section>
    </article>
  );
}
