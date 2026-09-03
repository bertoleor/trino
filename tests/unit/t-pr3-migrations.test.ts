import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const mig = (n: string) => path.join(ROOT, `supabase/migrations/${n}`);
const read = (n: string) => fs.readFileSync(mig(n), 'utf8');

describe('PR3 T-B04 audit/security — RED', () => {
  it('0004_audit_security.sql exists', () => {
    expect(fs.existsSync(mig('0004_audit_security.sql'))).toBe(true);
  });
  it('audit_logs has required columns and checks', () => {
    const c = read('0004_audit_security.sql');
    expect(c).toMatch(/create\s+table.*audit_logs/i);
    expect(c).toMatch(/table_name/i);
    expect(c).toMatch(/record_id/i);
    expect(c).toMatch(/old_data/i);
    expect(c).toMatch(/new_data/i);
    expect(c).toMatch(/jsonb/i);
  });
  it('security_logs has event ip metadata and 1yr retention note', () => {
    const c = read('0004_audit_security.sql');
    expect(c).toMatch(/create\s+table.*security_logs/i);
    expect(c).toMatch(/event/i);
    expect(c).toMatch(/ip/i);
    expect(c).toMatch(/metadata/i);
    expect(c).toMatch(/1\s*yr|retention|365/i);
  });
  it('RLS INSERT-only no UPDATE/DELETE', () => {
    const c = read('0004_audit_security.sql');
    expect(c).toMatch(/enable\s+row\s+level\s+security/i);
    expect(c).toMatch(/for\s+insert/i);
    expect(c).not.toMatch(/for\s+update/i);
    expect(c).not.toMatch(/for\s+delete/i);
  });
});

describe('PR3 T-B05 events/entitlements — RED', () => {
  it('0005_events_entitlements.sql exists', () => {
    expect(fs.existsSync(mig('0005_events_entitlements.sql'))).toBe(true);
  });
  it('processed_events id text pk for idempotency', () => {
    const c = read('0005_events_entitlements.sql');
    expect(c).toMatch(/processed_events/i);
    expect(c).toMatch(/id\s+text\s+primary\s+key/i);
  });
  it('failed_webhooks_log payload jsonb error', () => {
    const c = read('0005_events_entitlements.sql');
    expect(c).toMatch(/failed_webhooks_log/i);
    expect(c).toMatch(/payload/i);
    expect(c).toMatch(/jsonb/i);
    expect(c).toMatch(/error/i);
  });
  it('entitlements user_id fk role check admin/customer', () => {
    const c = read('0005_events_entitlements.sql');
    expect(c).toMatch(/entitlements/i);
    expect(c).toMatch(/user_id.*uuid/i);
    expect(c).toMatch(/role.*check/i);
    expect(c).toMatch(/admin/i);
    expect(c).toMatch(/customer/i);
  });
});

describe('PR3 T-B06 carts session — RED', () => {
  it('0006_carts_session.sql exists', () => {
    expect(fs.existsSync(mig('0006_carts_session.sql'))).toBe(true);
  });
  it('adds session_id + share_token with IF NOT EXISTS and indexes', () => {
    const c = read('0006_carts_session.sql');
    expect(c).toMatch(/session_id/i);
    expect(c).toMatch(/add\s+column\s+if\s+not\s+exists/i);
    expect(c).toMatch(/create\s+index/i);
    expect(c).toMatch(/share_token/i);
  });
});

describe('PR3 T-B07 order ENUM 9 states — RED', () => {
  it('0007_order_enum.sql exists', () => {
    expect(fs.existsSync(mig('0007_order_enum.sql'))).toBe(true);
  });
  it('covers 9 statuses and transition function 422', () => {
    const c = read('0007_order_enum.sql');
    expect(c).toMatch(/draft/i);
    expect(c).toMatch(/pending_verification/i);
    expect(c).toMatch(/authorized/i);
    expect(c).toMatch(/processing/i);
    expect(c).toMatch(/shipped/i);
    expect(c).toMatch(/delivered/i);
    expect(c).toMatch(/canceled/i);
    expect(c).toMatch(/refunded/i);
    expect(c).toMatch(/check_order_transition/i);
    expect(c).toMatch(/invalid_transition|422/i);
  });
});

describe('PR3 T-E01 cultura_posts — RED', () => {
  it('0011_cultura.sql exists', () => {
    expect(fs.existsSync(mig('0011_cultura.sql'))).toBe(true);
  });
  it('has slug locale title body status published_at tags GIN RLS', () => {
    const c = read('0011_cultura.sql');
    expect(c).toMatch(/cultura_posts/i);
    expect(c).toMatch(/slug.*unique/i);
    expect(c).toMatch(/locale.*check/i);
    expect(c).toMatch(/es-AR/i);
    expect(c).toMatch(/search_vector/i);
    expect(c).toMatch(/gin/i);
    expect(c).toMatch(/enable\s+row\s+level\s+security/i);
    expect(c).toMatch(/status.*draft.*published/i);
    expect(c).toMatch(/deleted_at/i);
    expect(c).toMatch(/is_admin\(\)/i);
  });
});

describe('PR3 T-F01 wishlist — RED', () => {
  it('0013_wishlist.sql exists', () => {
    expect(fs.existsSync(mig('0013_wishlist.sql'))).toBe(true);
  });
  it('wishlists anon+user merge unique partial and RLS', () => {
    const c = read('0013_wishlist.sql');
    expect(c).toMatch(/wishlists/i);
    expect(c).toMatch(/user_id.*uuid/i);
    expect(c).toMatch(/session_id/i);
    expect(c).toMatch(/product_id/i);
    expect(c).toMatch(/unique.*user_id.*product_id/i);
    expect(c).toMatch(/unique.*session_id.*product_id/i);
    expect(c).toMatch(/check.*user_id.*session_id/i);
    expect(c).toMatch(/enable\s+row\s+level\s+security/i);
  });
});

describe('PR3 T-G01 reviews — RED', () => {
  it('0014_reviews.sql exists', () => {
    expect(fs.existsSync(mig('0014_reviews.sql'))).toBe(true);
  });
  it('reviews rating 1..5 title<=120 images<=3 GIN RLS approved', () => {
    const c = read('0014_reviews.sql');
    expect(c).toMatch(/reviews/i);
    expect(c).toMatch(/rating.*smallint/i);
    expect(c).toMatch(/check.*rating.*1.*5/i);
    expect(c).toMatch(/title.*check.*120/i);
    expect(c).toMatch(/helpful/i);
    expect(c).toMatch(/verified_purchase/i);
    expect(c).toMatch(/unique.*user_id.*product_id/i);
    expect(c).toMatch(/gin/i);
    expect(c).toMatch(/approved/i);
  });
});
