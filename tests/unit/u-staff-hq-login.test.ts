import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

describe('U: dedicated HQ staff login screen', () => {
  it('defaults to admin and never accepts an open redirect', () => {
    const page = read('src/app/staff/login/page.tsx');
    expect(page).toMatch(/safeRedirect\(/);
    expect(page).toMatch(/\?\? '\/admin'/);
    expect(page).toMatch(/destinationAfterLogin\(requested/);
  });

  it('wires only real controls: Turnstile, password toggle, recovery and client login links', () => {
    const form = read('src/app/staff/login/staff-login-form.tsx');
    expect(form).toMatch(/name="cf-turnstile-response"/);
    expect(form).toMatch(/name="email"/);
    expect(form).toMatch(/name="password"/);
    expect(form).toMatch(/href="\/es-AR\/recuperar-contrasea"/);
    expect(form).toMatch(/href="\/login"/);
    expect(form).toMatch(/aria-pressed=\{showPassword\}/);
    for (const dead of [
      'alert(',
      'setTimeout(',
      'onclick=',
      'type="checkbox"',
      'MasterTrino',
      'sofia.ops@',
      'simulateHardwareAuth',
      'value="',
    ]) {
      expect(form).not.toContain(dead);
    }
  });

  it('uses canonical tokens, not raw colors or var() in classNames', () => {
    for (const file of [
      'src/app/staff/login/page.tsx',
      'src/app/staff/login/staff-login-form.tsx',
    ]) {
      const source = read(file);
      expect(source).not.toMatch(/className="[^"]*#[0-9a-f]{3,8}/i);
      expect(source).not.toMatch(/className="[^"]*var\(/);
    }
  });

  it('keeps /staff private, unlocalized and on the auth rate-limit tier', () => {
    const proxy = read('src/proxy.ts');
    expect(proxy).toMatch(/'\/staff'/);
    expect(proxy).toMatch(/isStaffLogin = pathname\.startsWith\('\/staff\/login'\)/);
    expect(proxy).toMatch(/includes\('\/login'\)/);
    const config = read('next.config.ts');
    expect(config).toMatch(/source: '\/staff\/:path\*'/);
  });
});
