import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
// S1 RED-first guards: schema strictness, void-bait removal, disable triage, catch→logger.
const EMPTY_CATCH = /catch\s*(\([^)]*\))?\s*\{\s*\}/;

function srcFiles(): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
    }
  };
  walk(path.join(ROOT, 'src'));
  return out;
}
function voidBaits(c: string): string[] {
  return c.split('\n').filter((l) => {
    const t = l.trim();
    return t.startsWith('void ') && !t.startsWith('//') && !t.startsWith('*');
  });
}

describe('t-s1 cultura body strictness (fixtures-first)', () => {
  it('rejects string/number/array/null bodies with a field-level error', async () => {
    const mod = await import('@/lib/validations/cultura');
    const base = { slug: 'mi-post', title: 'Titulo valido', locale: 'es-AR', status: 'draft' };
    for (const body of ['plain string', 42, ['doc'], null]) {
      const r = mod.culturaSchema.safeParse({ ...base, body });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.flatten().fieldErrors.body).toBeDefined();
    }
  });
  it('accepts TipTap docs, legacy empty objects, and omitted bodies', async () => {
    const mod = await import('@/lib/validations/cultura');
    const base = { slug: 'mi-post', title: 'Titulo valido', locale: 'es-AR', status: 'draft' };
    expect(mod.culturaSchema.safeParse(base).success).toBe(true);
    const bodies = [{}, { type: 'doc', content: [] }, { type: 'doc', content: [{ type: 'p' }] }];
    for (const body of bodies) {
      expect(mod.culturaSchema.safeParse({ ...base, body }).success).toBe(true);
    }
  });
  it('contains no z.any', () => {
    expect(read('src/lib/validations/cultura.ts')).not.toMatch(/z\.any\(\)/);
  });
});

describe('t-s1 void-bait removal (proxy.ts excluded, S3-owned)', () => {
  it('leaves zero void-bait expression lines outside src/proxy.ts', () => {
    const hits: string[] = [];
    for (const f of srcFiles()) {
      const rel = path.relative(ROOT, f);
      if (rel.replace(/\\/g, '/') === 'src/proxy.ts') continue;
      for (const b of voidBaits(read(rel))) hits.push(`${rel}: ${b.trim()}`);
    }
    expect(hits).toEqual([]);
  });
});

describe('t-s1 eslint-disable triage', () => {
  it('every disable carries justification plus ticket', () => {
    const bad: string[] = [];
    for (const f of srcFiles()) {
      const rel = path.relative(ROOT, f);
      read(rel)
        .split('\n')
        .forEach((l, i) => {
          if (/eslint-disable/.test(l) && !/--\s+\S.*ticket:/.test(l)) bad.push(`${rel}:${i + 1}`);
        });
    }
    expect(bad).toEqual([]);
  });
});

describe('t-s1 empty catches emit structured logs', () => {
  it('clipboard failure warns with route and error string (logger spy)', async () => {
    const { logger } = await import('@/lib/logger');
    const warn = vi.spyOn(logger, 'warn');
    const g = globalThis as unknown as Record<string, unknown>;
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      writable: true,
      value: { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } },
    });
    try {
      const { copyLink } = await import('@/lib/share');
      await expect(copyLink('https://example.com/x')).resolves.toBe(false);
      expect(warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ route: expect.stringContaining('share') })
      );
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'navigator', descriptor);
      else delete g.navigator;
      warn.mockRestore();
    }
  });
  it('converted catch sites log with route and keep no empty catch', () => {
    const sites: Array<[string, string]> = [
      ['src/app/api/cron/fx/route.ts', 'cron/fx'],
      ['src/app/api/checkout/route.ts', 'api/checkout'],
      ['src/app/api/webhooks/mercadopago/route.ts', 'webhooks/mercadopago'],
      ['src/lib/shipping/cache.ts', 'shipping/cache'],
      ['src/lib/shipping/index.ts', 'shipping/rates'],
      ['src/lib/money/fx.ts', 'money/fx'],
      ['src/lib/share.ts', 'share/copy-link'],
      ['src/app/sitemap.ts', 'sitemap'],
      ['src/app/[locale]/(legal)/garantia/page.tsx', 'legal/garantia'],
      ['src/app/[locale]/(legal)/envios/page.tsx', 'legal/envios'],
      ['src/app/[locale]/(legal)/cambios-devoluciones/page.tsx', 'legal/cambios'],
      ['src/components/shared/analytics-consent.tsx', 'consent/analytics'],
      ['src/components/shared/share-sheet.tsx', 'share/sheet'],
    ];
    for (const [f, route] of sites) {
      const c = read(f);
      expect(c, `${f} calls logger`).toMatch(/logger\.(error|warn)/);
      expect(c, `${f} carries route`).toContain(route);
      expect(c.replace(/\/\/.*$/gm, ''), `${f} has no empty catch`).not.toMatch(EMPTY_CATCH);
    }
  });
});
