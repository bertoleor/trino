import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A04 next.config CSP HSTS Brotli', () => {
  it('next.config.ts exists with security headers', async () => {
    const content = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(content).toMatch(/Content-Security-Policy/i);
    expect(content).toMatch(/Strict-Transport-Security/i);
    expect(content).toMatch(/X-Frame-Options/i);
    expect(content).toMatch(/X-Content-Type-Options/i);
    expect(content).toMatch(/63072000/);
  });

  it('imports nextConfig and verifies headers array', async () => {
    const mod = await import('@/..\\next.config.ts'.replace(/\\/g, '/'));
    const cfg = (mod.default ?? mod) as unknown as {
      headers?: () => Promise<{ headers: { key: string; value: string }[] }[]>;
      compress?: boolean;
    };
    if (typeof cfg.headers === 'function') {
      const headers = await cfg.headers();
      const all = headers.flatMap((h) => h.headers.map((x) => x.key));
      expect(all).toContain('Content-Security-Policy');
      expect(all).toContain('Strict-Transport-Security');
    } else {
      const content = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
      expect(content).toMatch(/headers/);
    }
    expect(cfg.compress).not.toBe(false);
  });

  it('configures Brotli/gzip compression and cache tiers', () => {
    const content = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(content).toMatch(/compress|brotli|gzip/i);
    expect(content).toMatch(/Cache-Control|immutable|s-maxage/i);
  });
});
