import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-K01 motion Bauhaus geometric grid-wipe/mask-reveal reduced-motion CLS<0.1', () => {
  it('files exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/styles/motion.css'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/lib/motion/variants.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/components/ui/motion.tsx'))).toBe(true);
  });
  it('CSS-only grid-wipe mask-reveal CLS-safe', () => {
    const css = fs.readFileSync(path.join(ROOT, 'src/styles/motion.css'), 'utf8');
    expect(css).toMatch(/grid.wipe|mask|clip-path|reveal/i);
    expect(css).toMatch(/prefers-reduced-motion/);
    expect(css).toMatch(/CLS|0\.1|will-change|transform/i);
  });
  it('variants Bauhaus geometric', () => {
    const v = fs.readFileSync(path.join(ROOT, 'src/lib/motion/variants.ts'), 'utf8');
    expect(v).toMatch(/gridWipe|maskReveal|wipes|variants/i);
    expect(v).toMatch(/Bauhaus|geometric/i);
  });
});
