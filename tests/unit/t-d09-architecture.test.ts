import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-D09 ARCHITECTURE Storybook Boundary <1s flag', () => {
  it('ARCHITECTURE.md exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'ARCHITECTURE.md'))).toBe(true);
  });
  it('mentions ErrorBoundary flag <1s', () => {
    const c = fs.readFileSync(path.join(ROOT, 'ARCHITECTURE.md'), 'utf8');
    expect(c).toMatch(/ErrorBoundary|Boundary/i);
    expect(c).toMatch(/Storybook|flag|<1s|feature/i);
  });
  it('error-boundary component exists', () => {
    const p = path.join(ROOT, 'src/components/shared/error-boundary.tsx');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/ErrorBoundary|componentDidCatch|getDerivedStateFromError/i);
  });
});
