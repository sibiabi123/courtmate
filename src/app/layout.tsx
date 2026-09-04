import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import { SessionBootstrap } from '@/components/providers/SessionBootstrap';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { AICoachModal } from '@/components/ui/AICoachModal';
import { OnboardingFlow } from '@/components/ui/OnboardingFlow';
import { CookieConsentBanner } from '@/components/ui/CookieConsentBanner';
import { SessionExpiredModal } from '@/components/ui/SessionExpiredModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CourtMate | Campus Sports Matchmaking & Tournament Platform',
  description: 'Find campus players, organize pickup matches, check live court availability, and track rankings. Cricket, Football, Badminton, Basketball, Tennis, Chess & more.',
  keywords: 'sports matchmaking, campus sports, pick-up games, tournaments, court tracker, sports community, cricket, football, badminton, basketball, tennis, chess',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body
        className="min-h-screen bg-[#0a0a0f] text-white flex flex-col antialiased"
        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
      >
        <TRPCProvider>
          <SessionBootstrap>
            {/* Global UI Layer */}
            <OnboardingFlow />
            <CookieConsentBanner />
            <SessionExpiredModal />

            <Navbar />

            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
            <AICoachModal />
          </SessionBootstrap>
        </TRPCProvider>
      </body>
    </html>
  );
}
