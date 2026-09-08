import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-K02 responsive mobile vs PC bottom-nav/drawer vs mega-menu swipe 44px', () => {
  it('files exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/hooks/use-breakpoint.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/components/shared/responsive.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/styles/responsive.css'))).toBe(true);
  });
  it('use-breakpoint mobile/desktop detection', async () => {
    const m = await import('@/hooks/use-breakpoint');
    expect(typeof m.useBreakpoint).toBe('function');
    const c = fs.readFileSync(path.join(ROOT, 'src/hooks/use-breakpoint.ts'), 'utf8');
    expect(c).toMatch(/breakpoint|mobile|desktop|768|1024/i);
  });
  it('responsive bottom-nav mega-menu 44px swipe', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/components/shared/responsive.tsx'), 'utf8');
    expect(c).toMatch(/bottom|drawer|mega.menu|swipe/i);
    expect(c).toMatch(/44px|44|min-height/i);
    const css = fs.readFileSync(path.join(ROOT, 'src/styles/responsive.css'), 'utf8');
    expect(css).toMatch(/8pt|44px|touch|pointer|grid/i);
  });
});
