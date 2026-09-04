import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-C07 LEGAL.md + disclaimer esoteric DOC-01', () => {
  it('docs/LEGAL.md exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'docs/LEGAL.md'))).toBe(true);
  });
  it('LEGAL.md contains esoteric disclaimer and DOC-01', () => {
    const c = fs.readFileSync(path.join(ROOT, 'docs/LEGAL.md'), 'utf8');
    expect(c).toMatch(/esoteric|esot/);
    expect(c).toMatch(/disclaimer|DOC-01|entretenimiento/i);
    expect(c.length).toBeGreaterThan(200);
  });
  it('disclaimer component exists', () => {
    const p = path.join(ROOT, 'src/components/shared/disclaimer.tsx');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/disclaimer|esoteric|entretenimiento/i);
    expect(c).toMatch(/export/);
  });
});
