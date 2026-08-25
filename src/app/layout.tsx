import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import { SessionBootstrap } from '@/components/providers/SessionBootstrap';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { AICoachModal } from '@/components/ui/AICoachModal';
import { CoinToastProvider } from '@/components/ui/CoinToastProvider';
import { OnboardingFlow } from '@/components/ui/OnboardingFlow';
import { DailyClaimBanner } from '@/components/ui/DailyClaimBanner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'CourtMate | Sports Matchmaking & Tournament Platform',
  description: 'Find players, join matches, track ELO rankings & win coins. Cricket, Football, Badminton, Basketball, Tennis, Chess & more. Join free.',
  keywords: 'sports matchmaking, pick-up games, tournaments, ELO ratings, sports community, cricket, football, badminton, basketball, tennis, chess, coins',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className="min-h-screen bg-[#0a0a0f] text-white flex flex-col antialiased"
        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
      >
        <TRPCProvider>
          <SessionBootstrap>
            {/* Global UI Layer */}
            <CoinToastProvider />
            <OnboardingFlow />

            <Navbar />

            {/* Daily claim banner just below Navbar */}
            <DailyClaimBanner />

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
