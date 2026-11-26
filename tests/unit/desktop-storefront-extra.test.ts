import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file: string) => fs.existsSync(path.join(ROOT, file));

const FORBIDDEN =
  /whatsapp|wa\.me|100%\s*original|98%|94%|\bMUA\b|vegan|cruelty[- ]free|refill|recarga|env[ií]o gratis|descuento|\b\d{1,2}%\s*(off|dto)|cuotas|aida-public|disponible ya|stock local|directo de f[aá]brica|distribuidor oficial|glow points|puntos acumulados|equivalen|reservado|contador|timer/i;
const STYLE_FORBIDDEN = /#[0-9a-fA-F]{3,8}\b|backdrop-blur|backdrop-filter|blur\(/i;

function keys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return [next, ...keys(child, next)];
  });
}

const COMPONENTS = [
  'src/components/storefront/producto-agotado.tsx',
  'src/components/storefront/carrito-drawer-glow.tsx',
  'src/components/storefront/filtro-marcas-panel.tsx',
];
const UNOWNED = [
  'src/components/storefront/contacto-desktop.tsx',
  'src/components/storefront/contacto-form-faq.tsx',
  'src/components/storefront/carrito-recomendados-glow.tsx',
  'src/components/storefront/filtro-marcas-resultados.tsx',
];

const CONTACTO = 'src/app/[locale]/contacto/page.tsx';
const AGOTADO = 'src/app/[locale]/producto/[slug]/agotado/page.tsx';
const CARRITO = 'src/app/[locale]/carrito/drawer/page.tsx';
const FILTROS = 'src/app/[locale]/tienda/filtros-marcas/page.tsx';
const ROUTES = [CONTACTO, AGOTADO, CARRITO, FILTROS];

describe('desktop storefront extra port', () => {
  it('ships all four thin routes and their components', () => {
    for (const file of [...ROUTES, ...COMPONENTS]) {
      expect(exists(file), `missing ${file}`).toBe(true);
    }
    for (const file of UNOWNED) {
      expect(exists(file), `out-of-scope file ${file}`).toBe(false);
    }
    for (const file of ROUTES) {
      const c = read(file);
      const nonblank = c
        .split(/\r?\n/)
        .filter((line) => line.trim() && !line.trim().startsWith('//')).length;
      expect(nonblank, `${file} exceeds 150 lines`).toBeLessThan(150);
      expect(c).toMatch(/StitchShell/);
      expect(c).toMatch(/getTranslations/);
    }
    expect(read(CONTACTO)).toMatch(/data-purpose="contacto-hero"/);
    expect(read(AGOTADO)).toMatch(/ProductoAgotado/);
    expect(read(CARRITO)).toMatch(/getCartView/);
    expect(read(FILTROS)).toMatch(/loadCatalog/);
  });

  it('keeps every section tagged with data-purpose', () => {
    const expectedPurposes = [
      'contacto-hero',
      'contacto-canales',
      'contacto-consulta',
      'contacto-faq',
      'contacto-cta',
      'agotado-detail',
      'agotado-notify',
      'carrito-drawer-panel',
      'carrito-drawer-resumen',
      'filtros-marcas-hero',
      'filtros-marcas-controles',
      'filtros-marcas-resultados',
    ];
    const all = [...ROUTES, ...COMPONENTS].map(read).join('\n');
    for (const purpose of expectedPurposes) {
      expect(all).toContain(`data-purpose="${purpose}"`);
    }
  });

  it('uses canonical tokens and no external image URLs', () => {
    const all = [...ROUTES, ...COMPONENTS].map(read).join('\n');
    expect(all).not.toMatch(STYLE_FORBIDDEN);
    expect(all).not.toMatch(/aida-public|data:image|https?:\/\//i);
    expect(all).toMatch(/bg-cream/);
    expect(all).toMatch(/border-ink/);
    expect(all).toMatch(/shadow-pop/);
    expect(all).toMatch(/font-display/);
  });

  it('rewrites banned commercial claims in source and messages', () => {
    const all = [
      ...ROUTES,
      ...COMPONENTS,
      ...LOCALES.map((locale) => `messages/${locale}/storefront-extra.json`),
    ]
      .map(read)
      .join('\n');
    expect(all).not.toMatch(FORBIDDEN);
    expect(all).not.toMatch(/onClick|useActionState|addToCart/);
  });

  it('ships identical storefront-extra keys in every locale', () => {
    let expected: string[] | null = null;
    for (const locale of LOCALES) {
      const messages = JSON.parse(read(`messages/${locale}/storefront-extra.json`)) as Record<
        string,
        unknown
      >;
      const actual = keys(messages).sort();
      expected ??= actual;
      expect(actual, `key drift in ${locale}`).toEqual(expected);
    }
  });

  it('uses real read-only data helpers', () => {
    expect(read('src/components/storefront/carrito-drawer-glow.tsx')).toMatch(/CartView/);
    expect(read(CARRITO)).toMatch(/getCartView/);
    expect(read('src/components/storefront/filtro-marcas-panel.tsx')).toMatch(
      /facetHref|catalogHref/
    );
    expect(read(FILTROS)).toMatch(/parseFacets|sortProducts|getSearchFallback/);
    expect(read('src/components/storefront/producto-agotado.tsx')).toMatch(/loadCatalog/);
  });

  it('keeps the sold-out copy to a no-promise notification', () => {
    const notify = [
      read('messages/es-AR/storefront-extra.json'),
      read('src/components/storefront/producto-agotado.tsx'),
    ].join('\n');
    expect(notify).toMatch(/Avisarme|Avisar|aviso/i);
    expect(notify).not.toMatch(/\b\d+\s*(unidades|stock|personas|d[ií]as|horas)\b/i);
    expect(notify).not.toMatch(/whatsapp|wa\.me/i);
  });
});
