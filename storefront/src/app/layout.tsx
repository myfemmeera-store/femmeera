import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { VisitorTracker } from '@/components/layout/VisitorTracker';
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
  title: 'Femmeera | Women\'s Ethnic & Contemporary Fashion',
  description: 'Femmeera is an online fashion store offering a curated collection of women\'s clothing, including traditional sarees, kurtis, ethnic sets, and modern western dresses with free delivery across India.',
  metadataBase: new URL('https://femmeera.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Femmeera | Women\'s Ethnic & Contemporary Fashion',
    description: 'Discover handcrafted traditional sarees, kurtis, suits, and chic western trends at Femmeera.',
    type: 'website',
    url: 'https://femmeera.com',
    siteName: 'Femmeera',
    locale: 'en_IN',
    images: [
      {
        url: 'https://femmeera.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'Femmeera - Women\'s Traditional & Western Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Femmeera | Women\'s Ethnic & Contemporary Fashion',
    description: 'Discover handcrafted traditional sarees, kurtis, suits, and chic western trends at Femmeera.',
    images: ['https://femmeera.com/logo.png'],
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
        <VisitorTracker />
        <JsonLd type="Organization" />
        <JsonLd type="WebSite" />
        <Header />
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
