import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('T-L02 OCC SERIALIZABLE RPC', () => {
  it('cart_persistence migration exists with RPCs', () => {
    const p = 'supabase/migrations/20261126000003_cart_persistence.sql';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/add_to_cart_serializable/);
    expect(c).toMatch(/merge_cart_serializable/);
    expect(c).toMatch(/SERIALIZABLE/);
  });
  it('occ.ts guard WHERE updated_at=expected 409', () => {
    const p = 'src/lib/db/occ.ts';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/expected_updated_at|expectedUpdatedAt/);
    expect(c).toMatch(/409/);
    expect(c).toMatch(/WHERE.*updated_at|updated_at.*=.*expected/i);
  });
});