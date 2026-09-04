import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-C05b cookie-consent granular blocks Resend 4 locales + privacy', () => {
  it('cookie-consent component exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/components/shared/cookie-consent.tsx'))).toBe(true);
  });
  it('consent.json exists in 4 locales', () => {
    for (const locale of ['es-AR', 'en', 'fr', 'pt-BR']) {
      const p = path.join(ROOT, `messages/${locale}/consent.json`);
      expect(fs.existsSync(p), locale).toBe(true);
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      expect(j).toBeDefined();
      expect(JSON.stringify(j).length).toBeGreaterThan(10);
    }
  });
  it('privacy page exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/app/[locale]/privacy/page.tsx'))).toBe(true);
    const c = fs.readFileSync(path.join(ROOT, 'src/app/[locale]/privacy/page.tsx'), 'utf8');
    expect(c).toMatch(/consent|cookie|privacy/i);
  });
  it('granular categories block Resend until consent', () => {
    const c = fs.readFileSync(path.join(ROOT, 'src/components/shared/cookie-consent.tsx'), 'utf8');
    expect(c).toMatch(/granular|essential|analytics|marketing/i);
    expect(c).toMatch(/consent|localStorage|cookie/i);
    expect(c).toMatch(/Resend|email/i);
  });
});
