import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(__dirname, '../..');
const MIG = path.join(ROOT, 'supabase/migrations/0022_client_warnings_fix.sql');
const read = () => fs.readFileSync(MIG, 'utf8');
describe('PR1 0022 migration — CHECK 4-tier + has_role SECURITY DEFINER + pg_trgm + 360', () => {
  it('migration file exists', () => expect(fs.existsSync(MIG)).toBe(true));
  it('entitlements CHECK 4-tier', () => {
    const c = read();
    expect(c).toMatch(/entitlements_role_check/);
    expect(c).toMatch(/super_admin/); expect(c).toMatch(/'admin'/); expect(c).toMatch(/'editor'/); expect(c).toMatch(/'viewer'/);
    expect(c).toMatch(/check\s*\(role in/i);
  });
  it('has_role() SECURITY DEFINER hierarchy', () => {
    const c = read();
    expect(c).toMatch(/create or replace function public\.has_role/i);
    expect(c).toMatch(/security definer/i); expect(c).toMatch(/stable/i); expect(c).toMatch(/auth\.uid\(\)/);
    expect(c).toMatch(/super_admin.*4.*admin.*3.*editor.*2.*viewer.*1/is); expect(c).toMatch(/entitlements/);
  });
  it('pg_trgm GIN trigram indexes', () => {
    const c = read();
    expect(c).toMatch(/create extension if not exists pg_trgm/i); expect(c).toMatch(/gin_trgm_ops/);
    expect(c).toMatch(/idx_products_name_trgm/i); expect(c).toMatch(/using gin/i);
  });
  it('customer_360 view with total_cents', () => {
    const c = read();
    expect(c).toMatch(/customer_360/i); expect(c).toMatch(/create or replace view/i);
    expect(c).toMatch(/total_cents/i); expect(c).toMatch(/authorized.*processing.*shipped.*delivered/is);
  });
  it('idempotent IF NOT EXISTS', () => { const c = read(); expect(c).toMatch(/if not exists/i); expect(c).toMatch(/drop constraint if exists/i); });
  it('EXPLAIN GIN via index count', () => { const ginCount = (read().match(/using gin/gi) ?? []).length; expect(ginCount).toBeGreaterThanOrEqual(1); });
});
