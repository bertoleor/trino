import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'next.config.ts');
describe('T-D02c images remotePatterns Storage WebP AVIF BlurHash', () => {
  it('next.config has images', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/images/);
    expect(c).toMatch(/remotePatterns/);
    expect(c).toMatch(/supabase|storage/i);
    expect(c).toMatch(/webp|avif/i);
  });
  it('blur placeholder config', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/blur|placeholder|formats/i);
  });
});
