import { describe, expect, it } from 'vitest';
import { formatArs } from '@/lib/money/fx';
import { formatPriceARS } from '@/lib/money/format-price-ars';
import fs from 'node:fs';
import path from 'node:path';

// Guard for the locale-qa-report 2026-10-14 currency finding (t_6412ad44):
// every page that renders an ARS price must go through lib/money
// (Intl.NumberFormat by locale) — never `toFixed(2)`, literal `ARS {…}` or a
// literal `$` glued to a raw DB value.

const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// Locale home/PDP delegate price rendering to PriceBlock (via ProductCard on
// home and ProductoDetalleCompra on PDP). The guard follows the renderer so the
// refactor cannot silently bypass lib/money.
const PAGE_RENDERERS: Record<string, string> = {
  'src/app/page.tsx': 'src/app/page.tsx',
  'src/app/[locale]/page.tsx': 'src/components/storefront/price-block.tsx',
  'src/app/producto/[slug]/page.tsx': 'src/app/producto/[slug]/page.tsx',
  'src/app/[locale]/producto/[slug]/page.tsx': 'src/components/storefront/price-block.tsx',
};

describe('money-locale-format guard: product prices go through lib/money', () => {
  it('locale producto page renders cents via lib/money, never toFixed', () => {
    const src = read('src/app/[locale]/producto/[slug]/page.tsx');
    expect(src).not.toMatch(/ARS \{|\(priceCents \/ 100\)\.toFixed/);
    expect(read('src/components/storefront/price-block.tsx')).toMatch(
      /formatPriceARS\(currentCents \/ 100, locale\)/
    );
  });

  it.each(Object.entries(PAGE_RENDERERS))(
    '%s has no literal $ next to a price; renderer uses formatPriceARS',
    (page, renderer) => {
      expect(read(page)).not.toMatch(/\$\{[a-z_.]*price/i);
      expect(read(renderer)).toMatch(/formatPriceARS\(/);
    }
  );

  it('locale home and PDP pass the route locale to the formatter', () => {
    expect(read('src/components/storefront/home-neopop-featured.tsx')).toMatch(/locale=\{locale\}/);
    expect(read('src/components/storefront/producto-detalle-compra.tsx')).toMatch(
      /locale=\{locale\}/
    );
    expect(read('src/components/storefront/price-block.tsx')).toMatch(
      /formatPriceARS\(currentCents \/ 100, locale\)/
    );
  });

  it('legacy non-locale product page formats variants with the es-AR default', () => {
    const src = read('src/app/producto/[slug]/page.tsx');
    expect(src).toMatch(/formatPriceARS\(product\.price\)/);
    expect(src).toMatch(/formatPriceARS\(v\.price\)/);
  });

  it('formatters localize symbol and decimals (pt-BR comma grouping, fr CLDR currency)', () => {
    // pt-BR: ARS code + '.' thousands + ',' decimals — never a hardcoded '$'
    // (evidence: Intl returns 'ARS 1.999,90', the QA report's 'R$' claim was wrong)
    const pt = formatArs(199990, 'pt-BR');
    expect(pt).toContain('1.999,90');
    expect(pt).not.toContain('$');
    // fr: CLDR defines "$AR" as the ARS symbol; locale-aware Intl output is the
    // contract, not the earlier assumption that fr can never print a '$'.
    const fr = formatPriceARS(1999.9, 'fr');
    expect(fr).toMatch(/1[\u202f\u00a0 ]999,90/);
    expect(fr).toContain('$AR');
    expect(read('src/lib/money/format-price-ars.ts')).toMatch(/new Intl\.NumberFormat\(locale/);
  });
});
