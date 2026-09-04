import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const listing = path.join(ROOT, 'src/app/[locale]/cultura/page.tsx');
const detail = path.join(ROOT, 'src/app/[locale]/cultura/[slug]/page.tsx');
const loading = path.join(ROOT, 'src/app/[locale]/cultura/loading.tsx');
describe('T-E03 cultura listing 12 ISR Article LD', () => {
  it('files exist', () => {
    expect(fs.existsSync(listing)).toBe(true);
    expect(fs.existsSync(detail)).toBe(true);
    expect(fs.existsSync(loading)).toBe(true);
  });
  it('listing 12 ISR revalidate 300', () => {
    const c = fs.readFileSync(listing, 'utf8');
    expect(c).toMatch(/12|paginate/i);
    expect(c).toMatch(/revalidate\s*=\s*300|ISR|force-static/i);
    expect(c).toMatch(/Skeleton|cultura/i);
  });
  it('detail JSON-LD Article + OG hreflang x4', () => {
    const c = fs.readFileSync(detail, 'utf8');
    expect(c).toMatch(/Article|json-ld|JSON-LD/i);
    expect(c).toMatch(/generateMetadata|openGraph/i);
    expect(c).toMatch(/hreflang|alternates/i);
    expect(c).toMatch(/TipTap|body/i);
  });
});
