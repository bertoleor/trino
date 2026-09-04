import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const konami = path.join(ROOT, 'src/lib/easter/konami.ts');
const comp = path.join(ROOT, 'src/components/shared/easter-egg.tsx');
const admin = path.join(ROOT, 'src/app/[locale]/admin/easter/page.tsx');
describe('T-K03 easter konami trino sigil', () => {
  it('konami sequence up up down down left right left right BA', () => {
    expect(fs.existsSync(konami)).toBe(true);
    const c = fs.readFileSync(konami, 'utf8');
    expect(c).toMatch(/ArrowUp.*ArrowUp.*ArrowDown.*ArrowDown.*ArrowLeft.*ArrowRight.*ArrowLeft.*ArrowRight/i);
    expect(c).toMatch(/KeyB| b|BA/i);
    expect(c).toMatch(/KeyA| a/i);
    expect(c).toMatch(/konami/i);
  });
  it('easter-egg trino sigil discount share_token reduced-motion posthog gated', () => {
    expect(fs.existsSync(comp)).toBe(true);
    const c = fs.readFileSync(comp, 'utf8');
    expect(c).toMatch(/trino|sigil/i);
    expect(c).toMatch(/share_token|discount|coupon/i);
    expect(c).toMatch(/reduced-motion|prefers-reduced-motion/i);
    expect(c).toMatch(/posthog|capture/i);
    expect(c).toMatch(/EASTER_ENABLED/i);
  });
  it('admin easter page trino console grid overlay audit easter_found', () => {
    expect(fs.existsSync(admin)).toBe(true);
    const c = fs.readFileSync(admin, 'utf8');
    expect(c).toMatch(/trino/i);
    expect(c).toMatch(/console/i);
    expect(c).toMatch(/grid|overlay/i);
    expect(c).toMatch(/easter_found|audit/i);
  });
});
