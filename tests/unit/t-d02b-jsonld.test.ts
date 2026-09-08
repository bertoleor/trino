import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/seo/json-ld.ts');
const page = path.join(ROOT, 'src/app/[locale]/producto/[slug]/page.tsx');
describe('T-D02b Product JSON-LD ARS OG hreflang x4', () => {
  it('json-ld file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('exports product json-ld', async () => {
    const mod = await import('@/lib/seo/json-ld');
    expect(typeof mod.productJsonLd).toBe('function');
    const ld = mod.productJsonLd({ name: 'Test', slug: 'test', priceCents: 10000, currency: 'ARS', image: 'https://example.com/img.jpg', description: 'desc', availability: 'InStock' });
    expect(ld['@type']).toMatch(/Product/i);
    expect(JSON.stringify(ld)).toMatch(/ARS|Offer/i);
  });
  it('producto page has JSON-LD + OG + hreflang', () => {
    expect(fs.existsSync(page)).toBe(true);
    const c = fs.readFileSync(page, 'utf8');
    expect(c).toMatch(/json-ld|JSON-LD|productJsonLd|application\/ld\+json/i);
    expect(c).toMatch(/generateMetadata|openGraph/i);
    expect(c).toMatch(/hreflang|alternates|languages/i);
    expect(c).toMatch(/ARS|price/i);
  });
});
