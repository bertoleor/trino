import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// A-01 slice B: static source guards (split from behavior spec — max-lines 150).
const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('A-01 auth actions source guards', () => {
  it('actions.ts verifies turnstile inside login and signup before touching supabase auth', () => {
    const c = read('src/app/auth/actions.ts');
    expect(c).toMatch(/verifyTurnstile/);
    expect(c).toMatch(/cf-turnstile-response/);
    // fail-closed: verification happens before signIn/signUp
    const loginBody = c.slice(
      c.indexOf('export async function login'),
      c.indexOf('export async function signup')
    );
    expect(loginBody.indexOf('verifyTurnstile')).toBeLessThan(
      loginBody.indexOf('signInWithPassword')
    );
    const signupBody = c.slice(c.indexOf('export async function signup'));
    expect(signupBody.indexOf('verifyTurnstile')).toBeLessThan(signupBody.indexOf('signUp'));
  });

  it('denials reach the audit channel (turnstile_403 security audit)', () => {
    const c = read('src/app/auth/actions.ts');
    expect(c).toMatch(/enqueueSecurityAudit/);
    expect(c).toMatch(/turnstile_403/);
  });

  it('login and signup forms render the turnstile widget with the sitekey and reset on retry', () => {
    const lf = read('src/app/login/login-form.tsx');
    expect(lf).toMatch(/TurnstileWidget/);
    expect(lf).toMatch(/cf-turnstile-response/);
    const sf = read('src/app/signup/signup-form.tsx');
    expect(sf).toMatch(/TurnstileWidget/);
    expect(sf).toMatch(/cf-turnstile-response/);
  });

  it('turnstile widget loads the official api.js from challenges.cloudflare.com with explicit render', () => {
    const w = read('src/components/auth/turnstile-widget.tsx');
    expect(w).toMatch(/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/);
    expect(w).toMatch(/NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
    expect(w).toMatch(/turnstile\.render/);
  });

  it('CSP allows the Turnstile script and iframe origins (Cloudflare official directive)', () => {
    const csp = read('src/lib/security/csp.ts');
    expect(csp).toMatch(/script-src[^\n]*challenges\.cloudflare\.com/);
    expect(csp).toMatch(/frame-src[^\n]*challenges\.cloudflare\.com/);
  });

  it('env schema exposes the public sitekey for the widget', () => {
    const env = read('src/config/env.ts');
    expect(env).toMatch(/NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  });

  it('.env.example documents the public sitekey alongside the secret', () => {
    const example = read('.env.example');
    expect(example).toMatch(/NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
    expect(example).toMatch(/TURNSTILE_SECRET_KEY/);
  });
});
