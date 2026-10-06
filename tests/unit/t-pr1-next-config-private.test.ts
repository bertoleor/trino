import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('PR1 next.config private vs public cache split W-03', () => {
  it('file contains private no-cache no-store for /admin|/account|/api', async () => {
    const c = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(c).toMatch(/private/);
    expect(c).toMatch(/no-cache/);
    expect(c).toMatch(/no-store/);
    expect(c).toMatch(/\/admin/);
    expect(c).toMatch(/\/account/);
    expect(c).toMatch(/\/api/);
  });

  it('keeps public s-maxage 60 for catalog /tienda', async () => {
    const c = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(c).toMatch(/s-maxage=60/);
    expect(c).toMatch(/stale-while-revalidate=300/);
    expect(c).toMatch(/\/tienda/);
  });

  it('headers() returns private for /admin vs public for /tienda', async () => {
    const mod = await import('@/..\\next.config.ts'.replace(/\\/g, '/'));
    const cfg = (mod.default ?? mod) as unknown as {
      headers: () => Promise<{ source: string; headers: { key: string; value: string }[] }[]>;
    };
    const headers = await cfg.headers();
    const find = (source: string) => headers.find((h) => h.source.includes(source));
    const admin = find('/admin');
    const account = find('/account');
    const api = find('/api');
    const tienda = find('/tienda');
    expect(admin).toBeDefined();
    expect(admin?.headers.find((h) => h.key === 'Cache-Control')?.value).toMatch(
      /private.*no-cache.*no-store/i
    );
    expect(account?.headers.find((h) => h.key === 'Cache-Control')?.value).toMatch(/private/);
    expect(api?.headers.find((h) => h.key === 'Cache-Control')?.value).toMatch(/private/);
    expect(tienda).toBeDefined();
    expect(tienda?.headers.find((h) => h.key === 'Cache-Control')?.value).toMatch(/s-maxage=60/);
  });

  it('does not cache private routes via CDN — private no-store required', async () => {
    const mod = await import('@/..\\next.config.ts'.replace(/\\/g, '/'));
    const cfg = (mod.default ?? mod) as unknown as {
      headers: () => Promise<{ source: string; headers: { key: string; value: string }[] }[]>;
    };
    const headers = await cfg.headers();
    const admin = headers.find((h) => h.source.includes('/admin'));
    const val = admin?.headers.find((h) => h.key === 'Cache-Control')?.value ?? '';
    expect(val).not.toMatch(/public/);
    expect(val).toMatch(/no-store/);
  });
});
