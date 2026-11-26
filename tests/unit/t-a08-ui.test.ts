import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A08 ui Neo-Pop 44px square button', () => {
  it('src/components/ui/button.tsx exists with 44px and square corners', () => {
    const p = path.join(ROOT, 'src/components/ui/button.tsx');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/44px|min-h.*44|h-11/);
    // Neo-Pop replaced the former Bauhaus pill geometry with squared corners.
    expect(c).toMatch(/rounded-none|rounded-0|sharp/);
    expect(c).toMatch(/focus-visible|aria/);
  });

  it('src/components/ui/badge.tsx and input exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/components/ui/badge.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/components/ui/input.tsx'))).toBe(true);
  });

  it('src/components/ui/skeleton.tsx exists with geometry', () => {
    const p = path.join(ROOT, 'src/components/ui/skeleton.tsx');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/animate|pulse|opacity|transform/);
  });

  it('ui components export and are accessible', async () => {
    const { Button } = await import('@/components/ui/button');
    expect(typeof Button).toBe('function');
    const { Badge } = await import('@/components/ui/badge');
    expect(typeof Badge).toBe('function');
  });
});
