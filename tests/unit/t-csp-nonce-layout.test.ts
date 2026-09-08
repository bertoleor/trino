import { articleJsonLd, productJsonLd } from '@/lib/seo/json-ld';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const SCRIPT_SITES = [
  'src/app/[locale]/producto/[slug]/page.tsx',
  'src/app/[locale]/producto/[slug]/reviews/page.tsx',
  'src/app/[locale]/cultura/[slug]/page.tsx',
  'src/app/[locale]/admin/easter/page.tsx',
];

describe('T-CSP-Nonce layout wiring: nonce reaches inline scripts (slice 1)', () => {
  it('root layout reads x-nonce via headers()', () => {
    const src = read('src/app/layout.tsx');
    expect(src).toMatch(/async/);
    expect(src).toMatch(/headers\(\)/);
    expect(src).toMatch(/x-nonce|NONCE_HEADER/);
  });

  it('root layout forwards the nonce to Providers', () => {
    expect(read('src/app/layout.tsx')).toMatch(/<Providers nonce/);
  });

  it('Providers accepts an optional nonce and exposes it for verification', () => {
    const src = read('src/app/providers.tsx');
    expect(src).toMatch(/nonce\?: string/);
    expect(src).toMatch(/data-csp-nonce/);
  });

  it.each(SCRIPT_SITES)('script site %s renders its inline script with a nonce', (rel) => {
    const src = read(rel);
    expect(src).toMatch(/headers\(\)/);
    expect(src).toMatch(/nonce=\{/);
  });

  it('json-ld builders accept an optional nonce without embedding it in the payload', () => {
    expect(read('src/lib/seo/json-ld.ts')).toMatch(/nonce\?: string/);
    const product = productJsonLd({
      name: 'Nonce',
      slug: 'nonce',
      priceCents: 100,
      image: 'https://example.com/img.jpg',
      nonce: 'abc123',
    });
    expect(product['@type']).toBe('Product');
    expect(JSON.stringify(product)).not.toMatch(/abc123/);
    const article = articleJsonLd({ headline: 'Nonce', slug: 'nonce', nonce: 'abc123' });
    expect(article['@type']).toBe('Article');
    expect(JSON.stringify(article)).not.toMatch(/abc123/);
  });
});
