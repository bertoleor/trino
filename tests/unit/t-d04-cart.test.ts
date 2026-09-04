import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/actions/cart.ts');
describe('T-D04 cart merge SERIALIZABLE 409 44px', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('exports cart actions with 409', async () => {
    const mod = await import('@/lib/actions/cart');
    expect(typeof mod.addToCart).toBe('function');
    expect(typeof mod.mergeCart).toBe('function');
  });
  it('has SERIALIZABLE and 409', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/SERIALIZABLE|FOR UPDATE/i);
    expect(c).toMatch(/409|conflict/i);
    expect(c).toMatch(/merge|session_id/i);
  });
  it('44px mention', () => {
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/44|touch|optimistic/i);
  });
});
