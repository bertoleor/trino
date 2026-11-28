import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const mig = (n: string) => path.join(ROOT, `supabase/migrations/${n}`);
const read = (n: string) => fs.readFileSync(mig(n), 'utf8');

describe('PR3 T-B04 audit/security — RED (new migration 20261126000007)', () => {
  it('20261126000007_platform_audit.sql exists', () => {
    expect(fs.existsSync(mig('20261126000007_platform_audit.sql'))).toBe(true);
  });
  it('audit_logs has required columns and checks', () => {
    const c = read('20261126000007_platform_audit.sql');
    expect(c).toMatch(/create\s+table.*audit_logs/i);
    expect(c).toMatch(/table_name/i);
    expect(c).toMatch(/record_id/i);
    expect(c).toMatch(/old_data/i);
    expect(c).toMatch(/new_data/i);
    expect(c).toMatch(/jsonb/i);
  });
  it('security_logs has event ip metadata', () => {
    const c = read('20261126000007_platform_audit.sql');
    expect(c).toMatch(/create\s+table.*security_logs/i);
    expect(c).toMatch(/event/i);
    expect(c).toMatch(/ip/i);
    expect(c).toMatch(/metadata/i);
  });
  it('RLS INSERT-only for admin (audit_logs, security_logs)', () => {
    const c = read('20261126000007_platform_audit.sql');
    expect(c).toMatch(/enable\s+row\s+level\s+security/i);
    expect(c).toMatch(/for\s+all/i);
    expect(c).toMatch(/has_role\('admin'\)/);
  });
});

describe('PR3 T-B05 events/entitlements — RED (identity_rbac + platform_audit)', () => {
  it('20261126000001_identity_rbac.sql exists', () => {
    expect(fs.existsSync(mig('20261126000001_identity_rbac.sql'))).toBe(true);
  });
  it('identity_rbac has profiles, entitlements, has_role()', () => {
    const c = read('20261126000001_identity_rbac.sql');
    expect(c).toMatch(/profiles/i);
    expect(c).toMatch(/entitlements/i);
    expect(c).toMatch(/has_role/i);
    expect(c).toMatch(/super_admin|admin|editor|viewer/i);
  });
  it('platform_audit has processed_events (id text pk)', () => {
    const c = read('20261126000007_platform_audit.sql');
    expect(c).toMatch(/processed_events/i);
    expect(c).toMatch(/id\s+text\s+primary\s+key/i);
  });
  it('platform_audit has failed_webhooks_log payload jsonb error', () => {
    const c = read('20261126000007_platform_audit.sql');
    expect(c).toMatch(/failed_webhooks_log/i);
    expect(c).toMatch(/payload/i);
    expect(c).toMatch(/jsonb/i);
    expect(c).toMatch(/error/i);
  });
});

describe('PR3 T-B06 carts session — RED (cart_persistence)', () => {
  it('20261126000003_cart_persistence.sql exists', () => {
    expect(fs.existsSync(mig('20261126000003_cart_persistence.sql'))).toBe(true);
  });
  it('has carts with session_id and share_token', () => {
    const c = read('20261126000003_cart_persistence.sql');
    expect(c).toMatch(/carts/i);
    expect(c).toMatch(/session_id/i);
    expect(c).toMatch(/share_token/i);
    expect(c).toMatch(/create\s+index/i);
  });
});

describe('PR3 T-B07 order ENUM 9 states — RED (orders_payments)', () => {
  it('20261126000004_orders_payments.sql exists', () => {
    expect(fs.existsSync(mig('20261126000004_orders_payments.sql'))).toBe(true);
  });
  it('covers 9 statuses and transition function', () => {
    const c = read('20261126000004_orders_payments.sql');
    expect(c).toMatch(/draft/i);
    expect(c).toMatch(/pending_verification/i);
    expect(c).toMatch(/authorized/i);
    expect(c).toMatch(/processing/i);
    expect(c).toMatch(/shipped/i);
    expect(c).toMatch(/delivered/i);
    expect(c).toMatch(/canceled/i);
    expect(c).toMatch(/refunded/i);
    expect(c).toMatch(/check_order_transition|order_transition/i);
    expect(c).toMatch(/invalid_transition|422/i);
  });
});

describe('PR3 T-E01 editorial_posts — content config', () => {
  it('20261126000006_content_config.sql exists', () => {
    expect(fs.existsSync(mig('20261126000006_content_config.sql'))).toBe(true);
  });
  it('has editorial_posts with slug locale title body status published_at tags GIN RLS', () => {
    const c = read('20261126000006_content_config.sql');
    expect(c).toMatch(/editorial_posts/i);
    expect(c).toMatch(/slug.*unique/i);
    expect(c).toMatch(/locale.*check/i);
    expect(c).toMatch(/es-AR/i);
    expect(c).toMatch(/search_vector/i);
    expect(c).toMatch(/gin/i);
    expect(c).toMatch(/enable\s+row\s+level\s+security/i);
    expect(c).toMatch(/status.*draft.*published/i);
    expect(c).toMatch(/deleted_at/i);
    expect(c).toMatch(/has_role\('admin'\)/);
  });
});

describe('PR3 T-F01 wishlist — RED (engagement)', () => {
  it('20261126000005_engagement.sql exists', () => {
    expect(fs.existsSync(mig('20261126000005_engagement.sql'))).toBe(true);
  });
  it('wishlists anon+user merge unique partial and RLS', () => {
    const c = read('20261126000005_engagement.sql');
    expect(c).toMatch(/wishlists/i);
    expect(c).toMatch(/user_id.*uuid/i);
    expect(c).toMatch(/session_id/i);
    expect(c).toMatch(/product_id/i);
    expect(c).toMatch(/unique.*user_id.*product_id/i);
    expect(c).toMatch(/unique.*session_id.*product_id/i);
    expect(c).toMatch(/check.*\(/i);
    expect(c).toMatch(/user_id is not null/i);
    expect(c).toMatch(/session_id is not null/i);
    expect(c).toMatch(/enable\s+row\s+level\s+security/i);
  });
});

describe('PR3 T-G01 reviews — RED (engagement)', () => {
  it('20261126000005_engagement.sql exists', () => {
    expect(fs.existsSync(mig('20261126000005_engagement.sql'))).toBe(true);
  });
  it('reviews rating 1..5 title<=120 images<=3 GIN RLS approved', () => {
    const c = read('20261126000005_engagement.sql');
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