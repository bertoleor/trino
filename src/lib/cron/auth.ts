import type { NextRequest } from 'next/server';

/**
 * Cron authentication gate — fail-closed by design.
 *
 * Production behavior: when `CRON_SECRET` is unset the request is DENIED
 * (401 downstream). There is no silent allow.
 *
 * Local development fallback: an unset secret is honored ONLY when BOTH
 * `NODE_ENV === 'development'` AND `CRON_ALLOW_UNSET_SECRET === 'true'`.
 * In any other environment an unset secret denies regardless of the flag.
 * Set `CRON_ALLOW_UNSET_SECRET=true` in `.env.local` (never in production)
 * to exercise cron routes locally without a shared secret.
 */
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV === 'development' && process.env.CRON_ALLOW_UNSET_SECRET === 'true';
  }
  return req.headers.get('authorization') === `Bearer ${secret}`;
}
