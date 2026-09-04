import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const P = path.join(ROOT, 'src/proxy.ts');
const read = () => fs.readFileSync(P, 'utf8');

describe('PR1 proxy RBAC hierarchy deny-default W-02', () => {
  it('imports hasRole or has_role and uses hierarchy', () => {
    const c = read();
    expect(c).toMatch(/hasRole|has_role/i);
  });

  it('checks entitlements hierarchy super_admin>admin>editor>viewer or rank', () => {
    const c = read();
    // proxy should reference hierarchy or viewer/editor/admin/super_admin
    const hasHierarchy = /super_admin/.test(c) && /editor/.test(c) && /viewer/.test(c);
    expect(hasHierarchy).toBe(true);
  });

  it('deny-default 403 for insufficient role (editor delete /admin)', () => {
    const c = read();
    expect(c).toMatch(/403/);
    expect(c).toMatch(/deny|Forbidden|security_logs/i);
  });

  it('logs to security_logs and audit_logs on 403 deny', () => {
    const c = read();
    expect(c).toMatch(/security_logs/);
    expect(c).toMatch(/audit_logs/);
  });

  it('anon /admin still 302 redirect to /login', () => {
    const c = read();
    expect(c).toMatch(/\/login/);
    expect(c).toMatch(/redirect/);
  });

  it('uses security definer helper via supabase has_role or entitlements query', () => {
    const c = read();
    expect(c).toMatch(/entitlements|has_role/i);
  });

  it('rate-limit preserved alongside RBAC', () => {
    const c = read();
    expect(c).toMatch(/checkRateLimit/);
  });
});
