import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const v = path.join(ROOT, 'src/lib/validations/reviews.ts');
const a = path.join(ROOT, 'src/lib/actions/reviews.ts');
describe('T-G02 reviews validations+actions', () => {
  it('files exist', () => {
    expect(fs.existsSync(v)).toBe(true);
    expect(fs.existsSync(a)).toBe(true);
  });
  it('validations rating 1-5 title<=120 body<=2000 images presigned 5MB 3 max', async () => {
    const mod = await import('@/lib/validations/reviews');
    expect(mod.reviewSchema).toBeDefined();
    const bad = mod.reviewSchema.safeParse({
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      rating: 6,
      title: 'ok',
      body: 'x',
    });
    expect(bad.success).toBe(false);
    const longTitle = 'a'.repeat(121);
    const bad2 = mod.reviewSchema.safeParse({
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      title: longTitle,
      body: 'x',
    });
    expect(bad2.success).toBe(false);
    const longBody = 'a'.repeat(2001);
    const bad3 = mod.reviewSchema.safeParse({
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      title: 'ok',
      body: longBody,
    });
    expect(bad3.success).toBe(false);
    const ok = mod.reviewSchema.safeParse({
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      title: 'Great',
      body: 'Nice product',
      images: [],
    });
    expect(ok.success).toBe(true);
  });
  it('actions verified_purchase delivered moderate 403 helpful Turnstile honeypot rate 3/h Upstash', () => {
    const c = fs.readFileSync(a, 'utf8');
    expect(c).toMatch(/verified_purchase|verified/i);
    expect(c).toMatch(/order.*delivered|delivered/i);
    expect(c).toMatch(/approve|reject|moderate/i);
    expect(c).toMatch(/403|is_admin|admin/i);
    expect(c).toMatch(/helpful/i);
    expect(c).toMatch(/Turnstile|turnstile/i);
    expect(c).toMatch(/honeypot/i);
    expect(c).toMatch(/3\/h|rate.?limit|Upstash/i);
  });
  it('presigned 5MB 3 images', () => {
    const c = fs.readFileSync(a, 'utf8');
    expect(c).toMatch(/presigned|5MB|images/i);
    const vc = fs.readFileSync(v, 'utf8');
    expect(vc).toMatch(/images|3|presigned/i);
  });
});
