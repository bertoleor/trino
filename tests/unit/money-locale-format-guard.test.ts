import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { formatArs } from '@/lib/money/fx';
import { formatPriceARS } from '@/lib/money/format-price-ars';

// Guard for the locale-qa-report 2026-10-14 currency finding (t_6412ad44):
// every page that renders an ARS price must go through lib/money
// (Intl.NumberFormat by locale) — never `toFixed(2)`, literal `ARS {…}` or a
// literal `$` glued to a raw DB value.

const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const LITERAL_DOLLAR_PAGES = [
  'src/app/page.tsx',
  'src/app/[locale]/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/producto/[slug]/page.tsx',
];

describe('money-locale-format guard: product prices go through lib/money', () => {
  it('locale producto page renders cents via formatArs(priceCents, locale)', () => {
    const src = read('src/app/[locale]/producto/[slug]/page.tsx');
    expect(src).not.toMatch(/ARS \{|\(priceCents \/ 100\)\.toFixed/);
    expect(src).toMatch(/formatArs\(priceCents, locale\)/);
  });

  it.each(LITERAL_DOLLAR_PAGES)('%s has no literal $ next to a price and uses formatPriceARS', (rel) => {
    const src = read(rel);
    expect(src).not.toMatch(/\$\{[a-z_.]*price/i);
    expect(src).toMatch(/formatPriceARS\(/);
  });

  it('locale home passes the route locale to the formatter', () => {
    expect(read('src/app/[locale]/page.tsx')).toMatch(/formatPriceARS\(product\.price, locale\)/);
  });

  it('legacy non-locale product page formats variants with the es-AR default', () => {
    const src = read('src/app/producto/[slug]/page.tsx');
    expect(src).toMatch(/formatPriceARS\(product\.price\)/);
    expect(src).toMatch(/formatPriceARS\(v\.price\)/);
  });

  it('formatters localize symbol and decimals (pt-BR comma grouping, fr never $)', () => {
    // pt-BR: ARS code + '.' thousands + ',' decimals — never a hardcoded '$'
    // (evidence: Intl returns 'ARS 1.999,90', the QA report's 'R$' claim was wrong)
    const pt = formatArs(199990, 'pt-BR');
    expect(pt).toContain('1.999,90');
    expect(pt).not.toContain('$');
    // fr: ISO code rendered by the locale, never a '$' symbol
    const fr = formatPriceARS(1999.9, 'fr');
    expect(fr).not.toContain('$');
    expect(fr).toContain('ARS');
  });
});
