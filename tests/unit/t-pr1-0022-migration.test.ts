import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const MIG = path.join(ROOT, 'supabase/migrations/20261126000001_identity_rbac.sql');
const read = () => fs.readFileSync(MIG, 'utf8');

describe('PR1 20261126000001_identity_rbac — Identity & RBAC', () => {
  it('migration file exists', () => expect(fs.existsSync(MIG)).toBe(true));

  it('creates profiles table with required columns', () => {
    const c = read();
    expect(c).toMatch(/create table public\.profiles/);
    expect(c).toMatch(/id\s+uuid primary key/);
    expect(c).toMatch(/email\s+text not null/);
    expect(c).toMatch(/full_name\s+text/);
    expect(c).toMatch(/created_at\s+timestamptz/);
  });

  it('creates entitlements table with 4-tier CHECK', () => {
    const c = read();
    expect(c).toMatch(/create table public\.entitlements/);
    expect(c).toMatch(/role\s+text not null/);
    expect(c).toMatch(/check \(role in \('super_admin','admin','editor','viewer'\)\)/);
    expect(c).toMatch(/unique \(user_id, role\)/);
  });

  it('has_role() SECURITY DEFINER hierarchy', () => {
    const c = read();
    expect(c).toMatch(/create or replace function public\.has_role/i);
    expect(c).toMatch(/security definer/i);
    expect(c).toMatch(/stable/i);
    expect(c).toMatch(/auth\.uid\(\)/);
    // Hierarchy encoded as: super_admin=4 roles, admin=3, editor=2, viewer=1
    expect(c).toMatch(/super_admin.*target_role in \('super_admin','admin','editor','viewer'\)/);
    expect(c).toMatch(/admin.*target_role in \('admin','editor','viewer'\)/);
    expect(c).toMatch(/editor.*target_role in \('editor','viewer'\)/);
    expect(c).toMatch(/viewer.*target_role = 'viewer'/);
    expect(c).toMatch(/entitlements/);
  });

  it('enables RLS on profiles and entitlements', () => {
    const c = read();
    expect(c).toMatch(/alter table public\.profiles enable row level security/);
    expect(c).toMatch(/alter table public\.entitlements enable row level security/);
  });

  it('grants SELECT to anon/authenticated on profiles and entitlements', () => {
    const c = read();
    expect(c).toMatch(/grant select on public\.profiles to anon, authenticated/);
    expect(c).toMatch(/grant select on public\.entitlements to anon, authenticated/);
  });

  it('has rollback documented', () => {
    const c = read();
    expect(c).toMatch(/ROLLBACK/);
    expect(c).toMatch(/drop table if exists public\.entitlements/);
    expect(c).toMatch(/drop table if exists public\.profiles/);
  });
});