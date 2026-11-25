import './globals.css';
import '@/styles/tokens.css';
import { Fredoka, Plus_Jakarta_Sans, Rubik } from 'next/font/google';
import { NONCE_HEADER, nonceProp } from '@/lib/security/csp';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { SITE_URL } from '@/lib/seo/site';
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
  metadataBase: new URL(SITE_URL),
  title: 'trino. beauty',
  description:
    'Cosmética multimarca seleccionada. Descubrí drops, explorá marcas y elegí tus favoritos en trino. beauty.',
  applicationName: 'trino. beauty',
  openGraph: {
    type: 'website',
    siteName: 'trino. beauty',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'trino. beauty',
  },
  robots: { index: true, follow: true },
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
