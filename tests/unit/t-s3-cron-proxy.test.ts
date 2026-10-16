import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { readFileSync } from 'node:fs';

function reqWithAuth(auth?: string): NextRequest {
  const headers = new Headers();
  if (auth !== undefined) headers.set('authorization', auth);
  return new NextRequest('http://localhost/api/cron/fx', { headers });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('t-s3 cron fail-closed + proxy void guards', () => {
  it('cron auth module exists and exports isCronAuthorized', async () => {
    const mod = await import('@/lib/cron/auth');
    expect(typeof mod.isCronAuthorized).toBe('function');
  });

  it('prod without secret denies regardless of dev flag', async () => {
    const { isCronAuthorized } = await import('@/lib/cron/auth');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('CRON_ALLOW_UNSET_SECRET', 'true');
    expect(isCronAuthorized(reqWithAuth())).toBe(false);
  });

  it('prod without secret and without flag denies', async () => {
    const { isCronAuthorized } = await import('@/lib/cron/auth');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('CRON_ALLOW_UNSET_SECRET', '');
    expect(isCronAuthorized(reqWithAuth())).toBe(false);
  });

  it('wrong bearer is denied when secret is set', async () => {
    const { isCronAuthorized } = await import('@/lib/cron/auth');
    vi.stubEnv('CRON_SECRET', 's3-test-secret');
    expect(isCronAuthorized(reqWithAuth('Bearer wrong'))).toBe(false);
    expect(isCronAuthorized(reqWithAuth())).toBe(false);
  });

  it('correct bearer passes when secret is set', async () => {
    const { isCronAuthorized } = await import('@/lib/cron/auth');
    vi.stubEnv('CRON_SECRET', 's3-test-secret');
    expect(isCronAuthorized(reqWithAuth('Bearer s3-test-secret'))).toBe(true);
  });

  it('dev with flag allows unset secret; dev without flag denies', async () => {
    const { isCronAuthorized } = await import('@/lib/cron/auth');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('CRON_ALLOW_UNSET_SECRET', 'true');
    expect(isCronAuthorized(reqWithAuth())).toBe(true);
    vi.stubEnv('CRON_ALLOW_UNSET_SECRET', '');
    expect(isCronAuthorized(reqWithAuth())).toBe(false);
  });

  it('all 3 cron routes delegate to isCronAuthorized (no local fail-open)', () => {
    for (const route of [
      'src/app/api/cron/keepalive/route.ts',
      'src/app/api/cron/fx/route.ts',
      'src/app/api/cron/cultura-sync/route.ts',
    ]) {
      const src = readFileSync(route, 'utf8');
      expect(src).toContain('isCronAuthorized');
      expect(src).not.toContain('if (!secret) return true');
    }
  });

  it('proxy.ts void baits are remediated (no dead voids, audit wired)', () => {
    const src = readFileSync('src/proxy.ts', 'utf8');
    expect(src).not.toContain('void (isAdminCookie');
    expect(src).not.toContain('void best');
    expect(src).not.toContain('void "security_logs');
    expect(src).toContain('enqueueSecurityAudit');
  });

  it('proxy.ts slice-B security logic is preserved', () => {
    const src = readFileSync('src/proxy.ts', 'utf8');
    expect(src).toContain('isAuthTierPath');
    // A-02: turnstile verification moved INSIDE the Server Actions (auth +
    // reviews); the proxy header gate was dead code that 403-blocked real
    // submissions — it must not come back.
    expect(src).not.toContain('verifyTurnstile');
    expect(src).toContain('applyNonceCsp');
    expect(src).toContain('checkRateLimit');
    expect(src).toContain('logRbacDeny');
    expect(src).toContain('bestRole');
  });
});
