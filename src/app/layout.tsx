import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import { SessionBootstrap } from '@/components/providers/SessionBootstrap';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'CourtMate | Campus Sports Matchmaking for VIT',
  description: 'Find players, join sports matches, track your ELO ratings and compete in tournaments at VIT University. Cricket, Football, Badminton, Basketball and more.',
  keywords: 'VIT sports, campus matchmaking, cricket, football, badminton, basketball, ELO ratings, VIT Vellore',
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
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
          </SessionBootstrap>
        </TRPCProvider>
      </body>
    </html>
  );
}
