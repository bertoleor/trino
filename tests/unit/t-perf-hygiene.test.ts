import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
// Slice-C touched files only (proxy.ts is slice-B: excluded by scope guard).
const TOUCHED = [
  'src/app/[locale]/cultura/page.tsx',
  'src/app/[locale]/cultura/[slug]/page.tsx',
  'src/app/[locale]/producto/[slug]/reviews/page.tsx',
  'src/components/product/reviews-list.tsx',
  'src/app/[locale]/admin/easter/page.tsx',
].map((p) => path.join(ROOT, p));
const read = (p: string) => fs.readFileSync(p, 'utf8');
describe('T-PERF-HYGIENE slice-C zero console dead-code size budget', () => {
  it('P-3 zero console.* calls in touched files (copy mentioning console is allowed)', () => {
    for (const f of TOUCHED) {
      const c = read(f);
      expect(c, f).not.toMatch(/console\.(log|warn|error|info|debug)\s*\(/);
    }
  });
  it('P-3 easter egg behavior preserved without the dev log', () => {
    const c = read(path.join(ROOT, 'src/app/[locale]/admin/easter/page.tsx'));
    expect(c).toMatch(/addEventListener\("keydown"/);
    expect(c).toMatch(/easter_found/);
    expect(c).toMatch(/grid-overlay/);
    expect(c).toMatch(/\/api\/admin\/easter/);
  });
  it('P-3 no void-string dead code in touched slice-C files', () => {
    for (const f of TOUCHED) {
      const c = read(f);
      expect(c, f).not.toMatch(/void\s+["'(]/);
    }
  });
  it('P-4 touched files stay within the 150-line budget', () => {
    for (const f of TOUCHED) {
      const c = read(f);
      // A justified file-level max-lines disable (with ticket) documents the
      // prettier-printWidth conflict; otherwise the 150-line budget holds.
      const waived = /eslint-disable max-lines --.*ticket:/.test(c);
      const lines = c.split('\n').length;
      expect(lines <= 150 || waived, `${f}: ${lines} lines`).toBe(true);
    }
  });
  it('P-4 touched files are TODO-free', () => {
    for (const f of TOUCHED) {
      const c = read(f);
      expect(c, f).not.toMatch(/TODO|FIXME|HACK/);
    }
  });
  it('P-1 remotePatterns covers the Supabase storage host with AVIF/WebP', () => {
    const c = read(path.join(ROOT, 'next.config.ts'));
    expect(c).toMatch(/supabase\.co/);
    expect(c).toMatch(/storage\/v1\/object\/public/);
    expect(c).toMatch(/image\/avif.*image\/webp|image\/webp.*image\/avif/s);
  });
});
