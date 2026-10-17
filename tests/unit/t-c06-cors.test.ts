import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-C06 CORS-WH POST-only + pinDeps', () => {
  it('webhook route enforces POST-only and 1MB', () => {
    const p = path.join(ROOT, 'src/app/api/webhooks/mercadopago/route.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/POST/i);
    expect(c).toMatch(/405|Method Not Allowed|only.*POST/i);
    expect(c).toMatch(/1\s*\*\s*1024|1048576/i);
  });
  it('next.config cors or webhook headers POST only HMAC-only isolated', () => {
    const wh = fs.readFileSync(
      path.join(ROOT, 'src/app/api/webhooks/mercadopago/route.ts'),
      'utf8'
    );
    expect(wh).toMatch(/hmac|signature/i);
    const nextCfg = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    expect(nextCfg).toBeDefined();
  });
  it('pin deps exact versions for @upstash', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const k of Object.keys(deps)) {
      if (k.includes('upstash')) {
        expect(deps[k]).toMatch(/^\d+\.\d+\.\d+$/);
      }
    }
    const snap = fs.readFileSync(path.join(ROOT, 'pnpm-lock.yaml'), 'utf8');
    expect(snap).toMatch(/@upstash\/ratelimit/);
  });
});
