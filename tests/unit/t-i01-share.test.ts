import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const lib = path.join(ROOT, 'src/lib/share.ts');
const comp = path.join(ROOT, 'src/components/shared/share-sheet.tsx');
const mig = path.join(ROOT, 'supabase/migrations/0017_share_token.sql');
describe('T-I01 share Web Share API + intents + share_token', () => {
  it('share lib Web Share API copy-link intents OG 4 locales', () => {
    expect(fs.existsSync(lib)).toBe(true);
    const c = fs.readFileSync(lib, 'utf8');
    expect(c).toMatch(/Web Share|navigator\.share|canShare/i);
    expect(c).toMatch(/copy|clipboard/i);
    expect(c).toMatch(/whatsapp/i);
    expect(c).toMatch(/x\.com|twitter/i);
    expect(c).toMatch(/facebook/i);
    expect(c).toMatch(/tiktok|instagram/i);
    expect(c).toMatch(/OG|og:image|open.*graph/i);
  });
  it('share-sheet bottom-sheet mobile popover desktop 44px posthog gated', () => {
    expect(fs.existsSync(comp)).toBe(true);
    const c = fs.readFileSync(comp, 'utf8');
    expect(c).toMatch(/44/);
    expect(c).toMatch(/bottom-sheet|sheet/i);
    expect(c).toMatch(/popover|desktop/i);
    expect(c).toMatch(/share|Share/i);
    expect(c).toMatch(/posthog|capture/i);
  });
  it('migration 0017 share_token uuid unique carts and wishlist', () => {
    expect(fs.existsSync(mig)).toBe(true);
    const c = fs.readFileSync(mig, 'utf8');
    expect(c).toMatch(/share_token/i);
    expect(c).toMatch(/uuid/i);
    expect(c).toMatch(/unique/i);
    expect(c).toMatch(/gen_random_uuid/i);
    expect(c).toMatch(/carts/i);
  });
});
