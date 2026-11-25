import { routing } from '@/i18n/routing';

export const SITE_URL = 'https://ritualtrino.vercel.app';

export function siteUrl(path = ''): string {
  return path ? `${SITE_URL}/${path.replace(/^\/+/, '')}` : SITE_URL;
}

export function localizedPath(locale: string, path = ''): string {
  return path ? `/${locale}/${path.replace(/^\/+/, '')}` : `/${locale}`;
}

export function localizedUrl(locale: string, path = ''): string {
  return siteUrl(localizedPath(locale, path).replace(/^\//, ''));
}

export function languageAlternates(path = ''): Record<string, string> {
  return Object.fromEntries(routing.locales.map((locale) => [locale, localizedUrl(locale, path)]));
}
