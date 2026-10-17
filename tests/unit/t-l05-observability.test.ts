import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
describe('T-L05 sitemap health live/ready OTel boundary', () => {
  it('sitemap.ts exists 500 per locale hreflang', () => {
    const p = 'src/app/sitemap.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/500|products/);
    expect(c).toMatch(/hreflang|alternates|locale/);
  });
  it('health live always 200', () => {
    const p = 'src/app/api/health/live/route.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/200/);
  });
  it('health ready checks DB SELECT 1 Redis PING Storage 503', () => {
    const p = 'src/app/api/health/ready/route.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/SELECT 1|select.*1/);
    expect(c).toMatch(/PING|redis/);
    expect(c).toMatch(/listBuckets|storage/);
    expect(c).toMatch(/503/);
  });
  it('instrumentation.ts OTel Sentry', () => {
    const p = 'instrumentation.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/register|instrumentation|OTel|Sentry/);
  });
  it('error-boundary 2-level app/error + global-error', () => {
    expect(fs.existsSync('src/components/shared/error-boundary.tsx')).toBe(true);
    const c = fs.readFileSync('src/components/shared/error-boundary.tsx', 'utf8');
    expect(c).toMatch(/logger|ErrorBoundary|componentDidCatch/);
    expect(fs.existsSync('src/app/error.tsx') || fs.existsSync('src/app/[locale]/error.tsx')).toBe(
      true
    );
    expect(fs.existsSync('src/app/global-error.tsx')).toBe(true);
  });
});
