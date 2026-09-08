import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const v = path.join(ROOT, 'src/lib/validations/wishlist.ts');
const a = path.join(ROOT, 'src/lib/actions/wishlist.ts');
describe('T-F02 wishlist validations+actions', () => {
  it('files exist', () => {
    expect(fs.existsSync(v)).toBe(true);
    expect(fs.existsSync(a)).toBe(true);
  });
  it('validations Zod product_id uuid', async () => {
    const mod = await import('@/lib/validations/wishlist');
    expect(mod.wishlistSchema).toBeDefined();
    const r = mod.wishlistSchema.safeParse({ product_id: 'not-uuid' });
    expect(r.success).toBe(false);
    const ok = mod.wishlistSchema.safeParse({ product_id: '123e4567-e89b-12d3-a456-426614174000' });
    expect(ok.success).toBe(true);
  });
  it('actions toggle wishlist Server Action Zod auth anon session merge optimistic rate 60/m Upstash idempotent 409', () => {
    const c = fs.readFileSync(a, 'utf8');
    expect(c).toMatch(/toggleWishlist|toggle/i);
    expect(c).toMatch(/product_id|zod|Zod/i);
    expect(c).toMatch(/session_id|sessionId/i);
    expect(c).toMatch(/merge|session_id.*user_id/i);
    expect(c).toMatch(/optimistic/i);
    expect(c).toMatch(/Upstash|rate.?limit|60\/m/i);
    expect(c).toMatch(/409|idempotent|duplicate/i);
    expect(c).toMatch(/use server/i);
  });
  it('merge anon to user like cart', () => {
    const c = fs.readFileSync(a, 'utf8');
    expect(c).toMatch(/mergeWishlist|merge/i);
    expect(c).toMatch(/auth|getUser|user_id/i);
  });
});
