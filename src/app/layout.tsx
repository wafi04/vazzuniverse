import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { URL_LOGO } from '@/constants';
import TRPCProvider from '@/components/layouts/trpcProvider';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vazzuniverse - Top up terpercaya se-universe',
  description: ' %s | Vazzuniverse - Top up terpercaya se-universe',
  icons: {
    icon: URL_LOGO,
  },
  twitter: {
    site: 'Top Up Terpecaya se-Universe',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <TRPCProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </TRPCProvider>
    </html>
  );
}
