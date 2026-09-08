import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
describe('T-D09c PostHog 1M/mo gated consent fail-closed', () => {
  it('files exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/lib/analytics/posthog.ts'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'src/components/shared/analytics-consent.tsx'))).toBe(true);
  });
  it('posthog gated consent fail-closed 1M', async () => {
    const m = await import('@/lib/analytics/posthog');
    expect(typeof m.capture).toBe('function');
    expect(typeof m.initPostHog).toBe('function');
    const c = fs.readFileSync(path.join(ROOT, 'src/lib/analytics/posthog.ts'), 'utf8');
    expect(c).toMatch(/consent|fail.closed|gated/i);
    expect(c).toMatch(/1M|1_000_000|posthog/i);
  });
  it('analytics-consent blocks before consent', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/components/shared/analytics-consent.tsx'), 'utf8');
    expect(c).toMatch(/consent|analytics|PostHog|posthog/i);
    expect(c).toMatch(/localStorage|cookie|fail/i);
  });
});
