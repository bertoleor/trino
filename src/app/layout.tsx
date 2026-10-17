import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { NONCE_HEADER, nonceProp } from '@/lib/security/csp';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { headers } from 'next/headers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Santísima Trinidad',
  description: 'E-commerce de artículos religiosos',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = nonceProp((await headers()).get(NONCE_HEADER));
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
