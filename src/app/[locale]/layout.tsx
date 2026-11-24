import '../globals.css';
import { Fredoka, Plus_Jakarta_Sans, Rubik } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${fredoka.variable} ${jakarta.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
