import { routing } from '@/i18n/routing';

const ALLOWED_PREFIXES = ['/admin', '/account'] as const;

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/**
 * Resolves a post-login destination. Only internal admin/account paths are
 * accepted: this prevents open redirects and discards the locale prefix that
 * next-intl adds to URLs outside the [locale] segment.
 */
export function safeRedirect(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return null;
  }
  const pathname = value.split(/[?#]/, 1)[0] ?? '';
  const normalized = stripLocalePrefix(pathname);
  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
  return allowed ? normalized : null;
}

/** Admins may follow a validated admin destination; everyone else lands on their account. */
export function destinationAfterLogin(requested: string | null, role: string | undefined): string {
  if (requested && !(requested.startsWith('/admin') && role !== 'admin')) return requested;
  return role === 'admin' ? '/admin' : '/account';
}
