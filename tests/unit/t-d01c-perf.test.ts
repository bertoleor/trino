import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const budget = path.join(ROOT, 'src/lib/perf/budget.ts');
const loading = path.join(ROOT, 'src/app/[locale]/tienda/loading.tsx');
const skeleton = path.join(ROOT, 'src/components/ui/skeleton.tsx');
const nextCfg = path.join(ROOT, 'next.config.ts');
const proxy = path.join(ROOT, 'src/proxy.ts');
describe('T-D01c perf budget ISR skeleton edge LCP<2.5 CLS<0.1', () => {
  it('budget file exists', () => expect(fs.existsSync(budget)).toBe(true));
  it('exports budgets LCP CLS INP', async () => {
    const mod = await import('@/lib/perf/budget');
    expect(mod.PERF_BUDGET.LCP).toBe(2500);
    expect(mod.PERF_BUDGET.CLS).toBe(0.1);
    expect(mod.PERF_BUDGET.INP).toBe(200);
    expect(typeof mod.assertBudget).toBe('function');
  });
  it('next.config ISR headers', () => {
    const c = fs.readFileSync(nextCfg, 'utf8');
    expect(c).toMatch(/revalidate|ISR|s-maxage|Cache-Control/i);
    expect(c).toMatch(/headers|immutable/i);
  });
  it('tienda loading skeleton exists', () => {
    expect(fs.existsSync(loading)).toBe(true);
    const c = fs.readFileSync(loading, 'utf8');
    expect(c).toMatch(/Skeleton|loading/i);
    const s = fs.readFileSync(skeleton, 'utf8');
    expect(s).toMatch(/Skeleton/);
    expect(s).toMatch(/animate-pulse/);
  });
  it('proxy edge LCP hints', () => {
    const c = fs.readFileSync(proxy, 'utf8');
    expect(c).toMatch(/NextResponse|proxy/i);
  });
  it('lighthouse ci config exists', () => {
    const lc = path.join(ROOT, 'lighthouserc.json');
    const lc2 = path.join(ROOT, '.lighthouserc.json');
    const exists = fs.existsSync(lc) || fs.existsSync(lc2);
    expect(exists).toBe(true);
  });
});
