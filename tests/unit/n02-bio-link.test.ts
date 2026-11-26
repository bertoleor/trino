import { describe, expect, it } from 'vitest';
import { BANNED_COPY } from '../../scripts/stitch-rules.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const EXTRA_BANNED =
  /stock|env[ií]os?|shipping|cuotas|instalments?|descuentos?|discount|free|reserva|timer|ssl|bcra|afip|whatsapp|aida-public|100\s*%/i;
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

function flat(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') out[prefix] = value;
  else if (Array.isArray(value)) value.forEach((item, i) => flat(item, `${prefix}.${i}`, out));
  else if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value))
      flat(item, prefix ? `${prefix}.${key}` : key, out);
  return out;
}

const RULES = BANNED_COPY as Array<[string, RegExp]>;

describe('N-02 bio link mobile + desktop', () => {
  it('uses only verified social URLs', () => {
    const page = read('src/app/[locale]/bio/page.tsx');
    expect(page).toMatch(/https:\/\/instagram\.com\/trinopunto/);
    expect(page).toMatch(/https:\/\/tiktok\.com\/@puntotrino/);
    expect(page).toMatch(/https:\/\/facebook\.com\/trinopunto/);
    expect(page).not.toMatch(/wa\.me\/549|chat\.whatsapp\.com|aida-public/i);
  });

  it('keeps the profile presentation-only', () => {
    const page = read('src/app/[locale]/bio/page.tsx');
    const links = read('src/components/storefront/bio-links.tsx');
    const share = read('src/components/storefront/bio-share-button.tsx');
    expect(page).not.toMatch(/addToCart|createCheckout|useActionState|fetch\(/);
    expect(links).toMatch(/target="_blank"/);
    expect(links).not.toMatch(/onClick|useState|addToCart/);
    expect(share).toMatch(/canWebShare\(\)/);
    expect(share).toMatch(/copyLink\(window\.location\.href\)/);
    expect(share).not.toMatch(/href="https?:/);
  });

  it('ships identical bio keys in all locales without banned claims', () => {
    let expected: string[] | null = null;
    for (const locale of LOCALES) {
      const messages = JSON.parse(read(`messages/${locale}/bio.json`)) as unknown;
      const entries = Object.entries(flat(messages));
      expect(entries.length).toBeGreaterThan(0);
      for (const [key, value] of entries) {
        for (const [label, pattern] of RULES) {
          expect(pattern.test(value), `${locale}/${key} (${label})`).toBe(false);
        }
        expect(EXTRA_BANNED.test(value), `${locale}/${key} (extra)`).toBe(false);
      }
      const keys = entries.map(([key]) => key).sort();
      expected ??= keys;
      expect(keys).toEqual(expected);
    }
  });

  it('registers the bio namespace and documents the Stitch baseline', () => {
    expect(read('src/i18n/request.ts')).toMatch(/bio\.json/);
    expect(read('docs/plans/PLAN-migracion-frontend-neopop.md')).toMatch(/5\. BIO LINK/);
  });
});
