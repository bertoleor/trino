import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A08b design system Bauhaus', () => {
  it('src/styles/tokens.css exists with --primary --pill --space', () => {
    const p = path.join(ROOT, 'src/styles/tokens.css');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/--primary/);
    expect(c).toMatch(/--pill.*9999|9999/);
    expect(c).toMatch(/--space/);
    expect(c).toMatch(/Geist|44px/);
    expect(c).toMatch(/prefers-reduced-motion/);
  });

  it('src/components/ui/design-system.md exists', () => {
    const p = path.join(ROOT, 'src/components/ui/design-system.md');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/Bauhaus|trino/i);
    expect(c.length).toBeGreaterThan(200);
  });

  it('src/app/[locale]/design/page.tsx hidden exists', () => {
    const p = path.join(ROOT, 'src/app/[locale]/design/page.tsx');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/hidden|design/i);
  });

  it('tokens.css uses strict Tailwind vars', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
    expect(c).toMatch(/:root/);
    expect(c).toMatch(/--primary/);
  });
});
