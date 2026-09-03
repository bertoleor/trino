import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A07 i18n next-intl 4.x routing', () => {
  it('src/i18n/routing.ts exists with 4 locales and 308', () => {
    const p = path.join(ROOT, 'src/i18n/routing.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/es-AR/);
    expect(c).toMatch(/en/);
    expect(c).toMatch(/fr/);
    expect(c).toMatch(/pt-BR/);
    expect(c).toMatch(/308|\/es-AR|localePrefix/);
  });

  it('src/i18n/request.ts exists and uses next-intl', () => {
    const p = path.join(ROOT, 'src/i18n/request.ts');
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/getRequestConfig|requestLocale/);
  });

  it('messages for 4 locales with 6 namespaces each', () => {
    const locales = ['es-AR', 'en', 'fr', 'pt-BR'];
    const namespaces = ['common', 'auth', 'checkout', 'admin', 'errors', 'emails'];
    for (const locale of locales) {
      for (const ns of namespaces) {
        const p = path.join(ROOT, `messages/${locale}/${ns}.json`);
        expect(fs.existsSync(p), `missing ${p}`).toBe(true);
        const json = JSON.parse(fs.readFileSync(p, 'utf8'));
        expect(typeof json).toBe('object');
      }
    }
  });

  it('routing exports locales and defaultLocale', async () => {
    const mod = await import('@/i18n/routing');
    expect(mod.routing.locales).toContain('es-AR');
    expect(mod.routing.defaultLocale).toBe('es-AR');
  });
});
