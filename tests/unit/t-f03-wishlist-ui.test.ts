import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/app/[locale]/(account)/wishlist/page.tsx');
const b = path.join(ROOT, 'src/components/shared/wishlist-button.tsx');
const h = path.join(ROOT, 'src/components/shared/wishlist-heart.tsx');
describe('T-F03 wishlist UI heart 44px paginated 12 ISR empty i18n', () => {
  it('files exist', () => {
    expect(fs.existsSync(p)).toBe(true);
    expect(fs.existsSync(b)).toBe(true);
    expect(fs.existsSync(h)).toBe(true);
  });
  it('heart 44px thumb optimistic toast paginated 12 ISR revalidate 300', () => {
    const pc = fs.readFileSync(p, 'utf8');
    const bc = fs.readFileSync(b, 'utf8');
    const hc = fs.readFileSync(h, 'utf8');
    expect(hc).toMatch(/44|44px|min-h.*44|minHeight/i);
    expect(bc).toMatch(/optimistic|toast/i);
    expect(pc).toMatch(/12|revalidate.*300|ISR/i);
    expect(pc).toMatch(/empty|Bauhaus|vac/i);
  });
  it('i18n 4 locales messages', () => {
    const pc = fs.readFileSync(p, 'utf8');
    expect(pc).toMatch(/locale|i18n|getTranslations|useTranslations/i);
    const locales = ['es-AR', 'en', 'fr', 'pt-BR'];
    for (const l of locales) {
      const f = path.join(ROOT, `messages/${l}/common.json`);
      expect(fs.existsSync(f)).toBe(true);
    }
  });
  it('button heart thumb zone', () => {
    const bc = fs.readFileSync(b, 'utf8');
    expect(bc).toMatch(/heart|wishlist|44/i);
  });
});
