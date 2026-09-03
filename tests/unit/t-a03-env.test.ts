import { describe, it, expect } from 'vitest';
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
    } as unknown as Record<string, string>);
    expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
  });

  it('throws descriptive error listing every missing variable', async () => {
    const mod = await import('@/config/env');
    expect(() =>
      mod.validateEnv({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      } as unknown as Record<string, string>)
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY.*NEXT_PUBLIC_SUPABASE_URL/s);
  });
});
