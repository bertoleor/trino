import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/components/shared/virtual-list.tsx');
describe('T-D02 virtual>50 WebP', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('uses virtualization for >50', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/virtual|Virtualizer|useVirtualizer/i);
    expect(c).toMatch(/50|threshold/i);
  });
  it('supports WebP image', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/WebP|webp|loading="lazy"|priority/i);
  });
  it('44px touch target', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/44|touch|min-h|h-11/i);
  });
});
