import Link from 'next/link';

const platformLinks = [
  { href: '/feed',         label: 'Match Feed' },
  { href: '/challenges',   label: '1v1 Duels' },
  { href: '/tournaments',  label: 'Tournaments' },
  { href: '/leaderboard',  label: 'Rankings' },
  { href: '/groups',       label: 'Groups' },
];

const supportLinks = [
  { href: '/support',              label: 'Contact Support' },
  { href: '/help',                 label: 'Help Center' },
  { href: '/community-guidelines', label: 'Community Guidelines' },
];

const legalLinks = [
  { href: '/privacy',       label: 'Privacy Policy' },
  { href: '/terms',         label: 'Terms of Service' },
  { href: '/cookies',       label: 'Cookies' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/security',      label: 'Security' },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="hidden md:block" style={{ borderTop: '1px solid var(--border)', background: 'var(--void-deep)' }}>
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--volt) 30%, var(--signal) 70%, transparent 100%)', opacity: 0.35 }} />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-4 gap-8">

          <div className="col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--volt)' }}>
                <span className="font-black text-[11px]" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>CM</span>
              </div>
              <span className="font-black text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Court<span style={{ color: 'var(--volt)' }}>Mate</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: 'var(--text-muted)' }}>
              Campus sports matchmaking. Find players, organize matches, track your ranking.
            </p>
            <p className="text-xs mt-4 font-medium" style={{ color: 'var(--text-muted)' }}>
              Made for campus athletes.
            </p>
          </div>

          <div>
            <h3 className="label-cap mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {platformLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm transition-colors hover:text-[--text-primary]"
                    style={{ color: 'var(--text-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="label-cap mb-4">Support</h3>
            <ul className="space-y-2.5">
              {supportLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm transition-colors hover:text-[--text-primary]"
                    style={{ color: 'var(--text-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="label-cap mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm transition-colors hover:text-[--text-primary]"
                    style={{ color: 'var(--text-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; {year} CourtMate. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
