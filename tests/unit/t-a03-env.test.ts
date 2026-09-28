import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A03 env.ts Zod fail-closed ENV-01', () => {
  it('src/config/env.ts exists and uses Zod', () => {
    const p = path.join(ROOT, 'src/config/env.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/zod|z\./i);
    expect(c).toMatch(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('validateEnv throws listing missing vars when required absent', async () => {
    const mod = await import('@/config/env');
    expect(typeof mod.validateEnv).toBe('function');
    expect(() =>
      mod.validateEnv({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
        NEXT_PUBLIC_SITE_URL: undefined,
      } as unknown as Record<string, string>)
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('validateEnv parses successfully when required vars present', async () => {
    const mod = await import('@/config/env');
    const parsed = mod.validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-123',
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
      TURNSTILE_SECRET_KEY: 'turnstile-secret',
      SUPABASE_SERVICE_ROLE: 'service-role-key',
      ALLOW_MEMORY_RATE_LIMIT: 'true',
    } as unknown as Record<string, string>);
    expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
  });

  it('validateEnv requires TURNSTILE_SECRET_KEY and SUPABASE_SERVICE_ROLE at boot', async () => {
    const mod = await import('@/config/env');
    expect(() =>
      mod.validateEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-123',
        NEXT_PUBLIC_SITE_URL: 'https://example.com',
        ALLOW_MEMORY_RATE_LIMIT: 'true',
      } as unknown as Record<string, string>)
    ).toThrow(
      /TURNSTILE_SECRET_KEY.*SUPABASE_SERVICE_ROLE|SUPABASE_SERVICE_ROLE.*TURNSTILE_SECRET_KEY/s
    );
  });

  it('validateEnv requires Upstash pair or the declared ALLOW_MEMORY_RATE_LIMIT fallback', async () => {
    const mod = await import('@/config/env');
    const base = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-123',
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
      TURNSTILE_SECRET_KEY: 'turnstile-secret',
      SUPABASE_SERVICE_ROLE: 'service-role-key',
    } as unknown as Record<string, string>;
    expect(() => mod.validateEnv(base)).toThrow(/UPSTASH|ALLOW_MEMORY_RATE_LIMIT/);
    const withFlag = mod.validateEnv({ ...base, ALLOW_MEMORY_RATE_LIMIT: 'true' });
    expect(withFlag.ALLOW_MEMORY_RATE_LIMIT).toBe('true');
    const withUpstash = mod.validateEnv({
      ...base,
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'upstash-token',
    });
    expect(withUpstash.UPSTASH_REDIS_REST_URL).toBe('https://example.upstash.io');
  });

  it('throws descriptive error listing every missing variable', async () => {
    const mod = await import('@/config/env');
    expect(() =>
      mod.validateEnv({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      } as unknown as Record<string, string>)
    ).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY.*NEXT_PUBLIC_SUPABASE_URL/s
    );
  });
});
