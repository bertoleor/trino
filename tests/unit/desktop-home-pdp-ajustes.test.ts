import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const PAGES = [
  'src/app/[locale]/page.tsx',
  'src/app/[locale]/producto/[slug]/page.tsx',
  'src/app/[locale]/cuenta/ajustes/page.tsx',
] as const;

const COMPONENTS = [
  'src/components/storefront/home-neopop-copy.tsx',
  'src/components/storefront/home-neopop-copy-es.tsx',
  'src/components/storefront/home-neopop-copy-en.tsx',
  'src/components/storefront/home-neopop-copy-fr.tsx',
  'src/components/storefront/home-neopop-copy-pt.tsx',
  'src/components/storefront/home-neopop-sections.tsx',
  'src/components/storefront/home-neopop-featured.tsx',
  'src/components/storefront/home-neopop-guide.tsx',
  'src/components/storefront/home-neopop-community.tsx',
  'src/components/storefront/producto-detalle-copy.tsx',
  'src/components/storefront/producto-detalle-copy-es.tsx',
  'src/components/storefront/producto-detalle-copy-en.tsx',
  'src/components/storefront/producto-detalle-copy-fr.tsx',
  'src/components/storefront/producto-detalle-copy-pt.tsx',
  'src/components/storefront/producto-detalle-principal.tsx',
  'src/components/storefront/producto-detalle-compra.tsx',
  'src/components/storefront/producto-detalle-curaduria.tsx',
  'src/components/storefront/producto-detalle-paneles.tsx',
  'src/components/storefront/cuenta-ajustes-header.tsx',
  'src/components/storefront/cuenta-ajustes-sections.tsx',
] as const;

const TOKENS_BANNED =
  /aida-public|lh3\.googleusercontent|data:image|#[0-9a-fA-F]{3,8}\b|backdrop-blur|backdrop-filter|rounded-(?:xs|sm|md|lg|xl|2xl|3xl|full)|shadow-\[|bg-white|onClick|useState|useActionState|addToCart|createCheckout|fetch\(|['"]use client['"]|material-symbols-outlined|Geist|font-\[/i;

const CLAIMS_BANNED =
  /100\s*% ORIGINAL|ORIGINALES USA|PRECINTO|F\u00e1brica|98\s*%|LOTE USA|\bCLEAN\b|\bMUA\b|\bturno\b|precisi[oó]n|\bdirecto\b|refill|recarga|cuotas|descuent|env[ií]o gratis|EN STOCK|EN DEP\u00d3SITO|TRENDING|VIRAL EN|STOCK PALERMO|Moto Express|\$24\.500|\$22\.500|\$26\.000|4\.9\b|\+1\.400|\+1\.280|WhatsApp|Sof\u00eda|Mart\u00ednez|\bVIP\b|2FA|garantiz/i;

function leaves(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') out[prefix] = value;
  else if (value && typeof value === 'object')
    for (const [key, child] of Object.entries(value))
      leaves(child, prefix ? `${prefix}.${key}` : key, out);
  return out;
}

describe('Desktop home, PDP y ajustes', () => {
  it('mantiene rutas delgadas y preserva metadata, consultas y seguridad', () => {
    const [home, pdp, ajustes] = PAGES.map(read);

    for (const page of PAGES) {
      expect(read(page).split('\n').length).toBeLessThan(150);
      expect(read(page)).toMatch(/generateMetadata/);
      expect(read(page)).toMatch(/StitchShell/);
      expect(read(page)).toMatch(/StorefrontHeader/);
      expect(read(page)).toMatch(/StorefrontFooter/);
    }

    expect(home).toMatch(/\.from\('products'\)/);
    expect(home).toMatch(/\.limit\(8\)/);
    expect(pdp).toMatch(/\.eq\('slug', slug\)/);
    expect(pdp).toMatch(/\.neq\('id', product\.id\)/);
    expect(pdp).toMatch(/nonceProp/);
    expect(pdp).toMatch(/productJsonLd/);
    expect(pdp).toMatch(/application\/ld\+json/);
    expect(ajustes).toMatch(/auth\.getUser\(\)/);
    expect(ajustes).toMatch(/robots:\s*\{\s*index:\s*false/);
  });

  it('usa solo tokens canónicos y marca las secciones con data-purpose', () => {
    for (const file of [...PAGES, ...COMPONENTS]) {
      const source = read(file);
      expect(TOKENS_BANNED.test(source), file).toBe(false);
      expect(CLAIMS_BANNED.test(source), file).toBe(false);
    }

    for (const file of COMPONENTS.filter((name) => !name.includes('-copy'))) {
      expect(read(file), file).toMatch(/data-purpose=/);
    }
  });

  it('compone home y PDP sobre el shell con grillas 12 columnas y estados vacíos', () => {
    const sections = read('src/components/storefront/home-neopop-sections.tsx');
    const featured = read('src/components/storefront/home-neopop-featured.tsx');
    const guide = read('src/components/storefront/home-neopop-guide.tsx');
    const principal = read('src/components/storefront/producto-detalle-principal.tsx');
    const compra = read('src/components/storefront/producto-detalle-compra.tsx');
    const curaduria = read('src/components/storefront/producto-detalle-curaduria.tsx');

    expect(sections).toMatch(/lg:grid-cols-12/);
    expect(sections).toMatch(/lg:col-span-7/);
    expect(sections).toMatch(/lg:col-span-5/);
    expect(featured).toMatch(/md:grid-cols-4/);
    expect(featured).toMatch(/lg:grid-cols-4/);
    expect(featured).toMatch(/EmptyState/);
    expect(guide).toMatch(/lg:grid-cols-12/);
    expect(read('src/app/[locale]/producto/[slug]/page.tsx')).toMatch(/lg:grid-cols-12/);
    expect(principal).toMatch(/EmptyState|Image/);
    expect(compra).toMatch(/PriceBlock|ShadeSwatch/);
    expect(compra).toMatch(/data-purpose="product-purchase"/);
    expect(curaduria).toMatch(/lg:grid-cols-4/);
  });

  it('reescribe las afirmaciones prohibidas y mantiene cuatro locales alineados', () => {
    let expected: string[] | null = null;

    for (const locale of LOCALES) {
      const messages = JSON.parse(read(`messages/${locale}/ajustes.json`)) as unknown;
      const entries = Object.entries(leaves(messages));
      expect(entries.length).toBeGreaterThan(0);

      for (const [key, value] of entries) {
        expect(value.trim().length, `${locale}/${key}`).toBeGreaterThan(0);
        expect(CLAIMS_BANNED.test(value), `${locale}/${key}`).toBe(false);
      }

      const keys = entries.map(([key]) => key).sort();
      expected ??= keys;
      expect(keys).toEqual(expected);
    }

    const esAR = read('messages/es-AR/ajustes.json');
    expect(esAR).toMatch(/Revisá/);
    expect(esAR).toMatch(/escribinos/);
    expect(read('src/i18n/request.ts')).toMatch(/ajustes\.json/);
  });

  it('muestra datos reales de sesión y estados vacíos honestos en ajustes', () => {
    const header = read('src/components/storefront/cuenta-ajustes-header.tsx');
    const sections = read('src/components/storefront/cuenta-ajustes-sections.tsx');

    expect(header).toMatch(/email: string \| null/);
    expect(header).toMatch(/email \?\? t\('profile\.anonymous'\)/);
    expect(sections).toMatch(/email \?\? t\('profile\.anonymous'\)/);
    expect(sections).toMatch(/emptyTitle/);
    expect(sections).toMatch(/emptyBody/);
    expect(sections).toMatch(/action=\{signOut\}/);
    expect(sections).not.toMatch(/Eliminar Cuenta|Exportar Datos|descuento/);
  });
});
