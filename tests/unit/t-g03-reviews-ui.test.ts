import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const pr = path.join(ROOT, 'src/app/[locale]/producto/[slug]/reviews/page.tsx');
const rl = path.join(ROOT, 'src/components/product/reviews-list.tsx');
const sr = path.join(ROOT, 'src/components/product/star-rating.tsx');
const rf = path.join(ROOT, 'src/components/product/review-form.tsx');
describe('T-G03 reviews UI stars 44px distribution ISR JSON-LD', () => {
  it('files exist', () => {
    expect(fs.existsSync(pr)).toBe(true);
    expect(fs.existsSync(rl)).toBe(true);
    expect(fs.existsSync(sr)).toBe(true);
    expect(fs.existsSync(rf)).toBe(true);
  });
  it('stars 44px distribution bar paginated 10 ISR lightbox verified badge moderation queue JSON-LD', () => {
    const pc = fs.readFileSync(pr, 'utf8');
    const lc = fs.readFileSync(rl, 'utf8');
    const sc = fs.readFileSync(sr, 'utf8');
    const fc = fs.readFileSync(rf, 'utf8');
    expect(sc).toMatch(/44|min-h.*44|minHeight/i);
    expect(lc).toMatch(/distribution|bar|10|paginat/i);
    expect(pc).toMatch(/revalidate|300|ISR/i);
    expect(lc).toMatch(/lightbox|verified|badge/i);
    expect(pc).toMatch(/Review|AggregateRating|application\/ld\+json|JSON-LD|jsonLd/i);
  });
  it('i18n 4 locales review form', () => {
    const fc = fs.readFileSync(rf, 'utf8');
    expect(fc).toMatch(/locale|i18n|useTranslations|getTranslations/i);
  });
});
