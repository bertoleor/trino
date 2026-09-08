import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const configSource = () => fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
const proxySource = () => fs.readFileSync(path.join(ROOT, 'src/proxy.ts'), 'utf8');

type HeaderEntry = { source: string; headers: { key: string; value: string }[] };

async function loadHeaderEntries(): Promise<HeaderEntry[]> {
  const mod = (await import('../../next.config')) as unknown as {
    default: { headers: () => Promise<HeaderEntry[]> };
  };
  return mod.default.headers();
}

describe('T-CSP drift guard: single authoritative CSP, no static conflict (slice 1)', () => {
  it('global /(.*) entry emits no CSP — the proxy owns the HTML policy', async () => {
    const entries = await loadHeaderEntries();
    const global = entries.find((h) => h.source === '/(.*)');
    expect(global).toBeDefined();
    const csp = global?.headers.find((h) => h.key === 'Content-Security-Policy');
    expect(csp).toBeUndefined();
  });

  it('public routes keep a static nonce-free CSP with s-maxage caching', async () => {
    const entries = await loadHeaderEntries();
    for (const source of ['/tienda', '/cultura/:path*']) {
      const entry = entries.find((h) => h.source === source);
      expect(entry).toBeDefined();
      const csp = entry?.headers.find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
      expect(csp.length).toBeGreaterThan(0);
      expect(csp).not.toMatch(/nonce-/);
      const cache = entry?.headers.find((h) => h.key === 'Cache-Control')?.value ?? '';
      expect(cache).toMatch(/s-maxage=60/);
    }
  });

  it('no static script-src allows unsafe-inline or strict-dynamic', async () => {
    const entries = await loadHeaderEntries();
    for (const entry of entries) {
      const csp = entry.headers.find((h) => h.key === 'Content-Security-Policy')?.value;
      if (!csp) continue;
      const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
      expect(scriptSrc).not.toMatch(/unsafe-inline/);
      expect(scriptSrc).not.toMatch(/strict-dynamic/);
    }
    expect(configSource()).not.toMatch(/strict-dynamic/);
  });

  it('proxy emits exactly one CSP — no double-CSP enforcement', () => {
    const proxyEmissions = proxySource().match(/applyNonceCsp\(response/g) ?? [];
    expect(proxyEmissions).toHaveLength(1);
    const cspSource = fs.readFileSync(path.join(ROOT, 'src/lib/security/csp.ts'), 'utf8');
    const headerWrites = cspSource.match(/Content-Security-Policy/g) ?? [];
    expect(headerWrites).toHaveLength(1);
  });
});
