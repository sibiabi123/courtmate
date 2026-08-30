import Link from 'next/link';
import { Zap, Shield } from 'lucide-react';

const quickLinks = [
  { href: '/feed', label: 'Feed' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/matchmaking', label: 'Matchmaker' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/leaderboard', label: 'Rankings' },
];

const supportLinks = [
  { href: '/support', label: 'Contact Support' },
  { href: '/help', label: 'Help Center' },
  { href: '/community-guidelines', label: 'Community Guidelines' },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/security', label: 'Security' },
];

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-white/5 bg-[#050508]">
      {/* Gradient top line */}
      <div className="h-px bg-gradient-to-r from-[#7b2ff7] via-[#00f5d4] to-[#ff006e]" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-1.5 mb-4">
              <Zap className="h-5 w-5 text-[#00f5d4]" />
              <span className="font-[family-name:var(--font-outfit)] text-lg font-bold">
                <span className="text-white">Court</span><span className="text-[#00f5d4]">Mate</span>
              </span>
            </Link>
            <p className="text-sm text-[#6b6b80] max-w-xs leading-relaxed">
              Find your game. Dominate the court. Sports matchmaking for serious athletes.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02]">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-[#6b6b80]">GDPR Compliant</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6b6b80] hover:text-[#00f5d4] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6b6b80] hover:text-[#00f5d4] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6b6b80] hover:text-[#00f5d4] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#6b6b80]">
            © 2026 CourtMate. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-[#6b6b80] hover:text-[#00f5d4] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-[#6b6b80] hover:text-[#00f5d4] transition-colors">Terms</Link>
            <Link href="/cookies" className="text-xs text-[#6b6b80] hover:text-[#00f5d4] transition-colors">Cookies</Link>
            <Link href="/support" className="text-xs text-[#6b6b80] hover:text-[#00f5d4] transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
