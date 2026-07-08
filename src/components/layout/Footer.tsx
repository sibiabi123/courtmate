import Link from 'next/link';
import { Zap } from 'lucide-react';

const quickLinks = [
  { href: '/feed', label: 'Feed' },
  { href: '/arcade', label: 'Arcade' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/groups', label: 'Groups' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

const aboutLinks = [
  { href: '#', label: 'About Us' },
  { href: '#', label: 'Contact' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
];

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-white/5 bg-[#050508]">
      {/* Gradient top line */}
      <div className="h-px bg-gradient-to-r from-[#7b2ff7] via-[#00f5d4] to-[#ff006e]" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1.5 mb-4">
              <Zap className="h-5 w-5 text-[#00f5d4]" />
              <span className="font-[family-name:var(--font-outfit)] text-lg font-bold">
                <span className="text-white">Court</span><span className="text-[#00f5d4]">Mate</span>
              </span>
            </Link>
            <p className="text-sm text-[#6b6b80] max-w-xs">
              Find your game. Dominate the court.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#a0a0b8] uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
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

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-[#a0a0b8] uppercase tracking-wider mb-4">
              About
            </h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
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

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-[#6b6b80]">
            © 2026 CourtMate. Built for VIT students.
          </p>
        </div>
      </div>
    </footer>
  );
}
