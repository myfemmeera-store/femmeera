import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { PromotionalPopup } from '@/components/ui/PromotionalPopup';
import { JsonLd } from '@/components/ui/JsonLd';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Femmeera | Premium Women\'s Traditional & Western Wear',
  description: 'Shop elegant sarees, kurtis, ethnic sets, western dresses, and tops online at Femmeera.',
  metadataBase: new URL('https://femmeera.com'),
  openGraph: {
    title: 'Femmeera | Premium Women\'s Clothing Store',
    description: 'Discover handcrafted traditional sarees & chic western trends.',
    type: 'website',
    url: 'https://femmeera.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${playfair.variable} ${jakarta.variable}`}>
      <body className="flex flex-col min-h-screen bg-[#FDFBF7] text-neutral-900 antialiased selection:bg-[#B38548] selection:text-white font-sans">
        <JsonLd type="Organization" />
        <Header />
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <PromotionalPopup />
      </body>
    </html>
  );
}
