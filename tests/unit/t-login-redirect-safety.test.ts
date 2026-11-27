import { describe, expect, it } from 'vitest';
import { destinationAfterLogin, safeRedirect } from '@/lib/auth/safe-redirect';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

describe('login redirect stays internal and unlocalized', () => {
  it('strips the next-intl locale prefix from an admin destination', () => {
    expect(safeRedirect('/es-AR/admin')).toBe('/admin');
    expect(safeRedirect('/en/admin/pedidos')).toBe('/admin/pedidos');
    expect(safeRedirect('/pt-BR/account')).toBe('/account');
  });

  it('rejects external, protocol-relative and unknown destinations', () => {
    for (const value of [
      'https://evil.test/admin',
      '//evil.test/admin',
      '/\\evil.test/admin',
      '/tienda',
      '/es-AR/tienda',
      'admin',
      '',
      null,
      undefined,
    ]) {
      expect(safeRedirect(value)).toBeNull();
    }
  });

  it('only sends admins to an admin destination', () => {
    expect(destinationAfterLogin('/admin', 'admin')).toBe('/admin');
    expect(destinationAfterLogin('/admin/roles', 'admin')).toBe('/admin/roles');
    expect(destinationAfterLogin('/admin', 'viewer')).toBe('/account');
    expect(destinationAfterLogin(null, 'admin')).toBe('/admin');
    expect(destinationAfterLogin(null, undefined)).toBe('/account');
  });

  it('proxy stores the locale-stripped destination in the redirect param', () => {
    expect(read('src/proxy.ts')).toMatch(/searchParams\.set\('redirect', pathname\)/);
  });

  it('login page, form and server action carry and honor the safe destination', () => {
    expect(read('src/app/login/page.tsx')).toMatch(/safeRedirect\(/);
    expect(read('src/app/login/login-form.tsx')).toMatch(/name="redirect"/);
    const action = read('src/app/auth/actions.ts');
    expect(action).toMatch(/safeRedirect\(/);
    expect(action).not.toMatch(/redirect\('\/account'\);/);
  });
});
