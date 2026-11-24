import './globals.css';
import { Fredoka, Plus_Jakarta_Sans, Rubik } from 'next/font/google';
import { NONCE_HEADER, nonceProp } from '@/lib/security/csp';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { headers } from 'next/headers';

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  display: 'swap',
});

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Santísima Trinidad',
  description: 'E-commerce de artículos religiosos',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = nonceProp((await headers()).get(NONCE_HEADER));
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${jakarta.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
