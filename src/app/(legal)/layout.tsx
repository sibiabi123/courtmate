import Link from 'next/link';
import { Scale } from 'lucide-react';

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/community-guidelines', label: 'Community Guidelines' },
  { href: '/acceptable-use', label: 'Acceptable Use' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/security', label: 'Security' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-[#7b2ff7]" />
                <h3 className="text-sm font-bold font-[family-name:var(--font-outfit)] text-white uppercase tracking-wider">
                  Legal
                </h3>
              </div>
              <nav className="space-y-1">
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 rounded-lg text-sm text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
