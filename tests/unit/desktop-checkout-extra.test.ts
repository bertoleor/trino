import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const NAMESPACES = ['checkout-extra', 'transferencia'] as const;
const FORBIDDEN =
  /whatsapp|wa\.link|chat\.whatsapp\.com|cuotas|installments|descuento|discount|env[ií]o gratis|free shipping|stock|reserva|timer|SSL|BCRA|AFIP|CUIT|CBU|cuentas? bancarias?|bank account|puntos|points|100% original|directo de f[aá]brica|aida-public|refill|recarga|\bMUA\b|98%/i;
const IDENTIFIERS = /TRN-\d+|#TR-\d+|\b\d{2}:\d{2}\b|[\w.-]+@[\w.-]+\.[a-z]{2,}|\b\d{6,}\b/i;
const COMPONENTS = [
  'confirmacion-hero.tsx',
  'confirmacion-status.tsx',
  'confirmacion-products.tsx',
  'confirmacion-share.tsx',
  'confirmacion-support.tsx',
  'confirmacion-commitment.tsx',
  'confirmacion-cta.tsx',
  'transferencia-intro.tsx',
  'transferencia-data.tsx',
  'transferencia-guide.tsx',
  'transferencia-summary.tsx',
  'transferencia-contact.tsx',
] as const;
const PAGES = [
  'src/app/[locale]/checkout/confirmacion/page.tsx',
  'src/app/[locale]/checkout/transferencia/page.tsx',
] as const;

const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const nonBlankLines = (source: string) =>
  source.split(/\r?\n/).filter((line) => line.trim().length > 0).length;

function keys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return [next, ...keys(child, next)];
  });
}

describe('desktop checkout extra screens', () => {
  it('keeps both route pages thin and wired to the shared checkout shell', () => {
    for (const page of PAGES) {
      const source = read(page);
      expect(nonBlankLines(source)).toBeLessThan(150);
      expect(source).toContain('CheckoutShell');
      expect(source).toContain('activeStep={3}');
      expect(source).toContain('generateMetadata');
      expect(source).toContain('robots: { index: false, follow: false }');
      expect(source).not.toMatch(FORBIDDEN);
    }
  });

  it('ports composition with canonical tokens and presentation-only markup', () => {
    for (const name of COMPONENTS) {
      const source = read(`src/components/storefront/${name}`);
      expect(source).toMatch(/data-purpose="[\w-]+"/);
      expect(source.match(/aria-label=/g)?.length ?? 0).toBe(source.match(/<Link\b/g)?.length ?? 0);
      expect(source).toMatch(/bg-(cream|ink|lemon|pink|lilac|aqua|orange|cobalt)/);
      expect(source).not.toMatch(/#[\da-fA-F]{3,8}\b|backdrop-blur|backdrop-filter/i);
      expect(source).not.toMatch(
        /onClick|onChange|useState|useEffect|navigator\.clipboard|<input/i
      );
      expect(source).not.toMatch(/https?:\/\/|wa\.me|mailto:/i);
      expect(source).not.toMatch(FORBIDDEN);
    }
  });

  it('ships identical namespace keys in all locales without forbidden claims', () => {
    for (const namespace of NAMESPACES) {
      let expected: string[] | null = null;
      for (const locale of LOCALES) {
        const raw = read(`messages/${locale}/${namespace}.json`);
        expect(raw).not.toMatch(FORBIDDEN);
        expect(raw).not.toMatch(IDENTIFIERS);
        const actual = keys(JSON.parse(raw)).sort();
        expected ??= actual;
        expect(actual).toEqual(expected);
      }
    }
  });

  it('does not invent orders, meters, addresses or customer data', () => {
    const sources = [...PAGES, ...COMPONENTS.map((name) => `src/components/storefront/${name}`)];
    for (const file of sources) {
      expect(read(file)).not.toMatch(IDENTIFIERS);
    }
  });
});
