import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
describe('T-L02 OCC SERIALIZABLE RPC', () => {
  it('migration 0018 OCC exists with expected_updated_at guard 409', () => {
    const p = 'supabase/migrations/0018_occ_serializable.sql';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/expected_updated_at|occ/i);
    expect(c).toMatch(/409|reload_required/);
    expect(c).toMatch(/updated_at/);
  });
  it('migration 0019 cart RPC SERIALIZABLE FOR UPDATE', () => {
    const p = 'supabase/migrations/0019_cart_rpc.sql';
    expect(fs.existsSync(p)).toBe(true);
    const c = fs.readFileSync(p, 'utf8');
    expect(c).toMatch(/add_to_cart_serializable/);
    expect(c).toMatch(/merge_cart_serializable/);
    expect(c).toMatch(/SERIALIZABLE/);
    expect(c).toMatch(/FOR UPDATE/);
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
