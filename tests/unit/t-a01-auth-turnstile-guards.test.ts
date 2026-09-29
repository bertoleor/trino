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

  // A-01 review round 1, F2: the promise only resolved via the named global,
  // but SCRIPT_SRC lacked &onload=<global> — api.js never invoked it and the
  // first mount hung forever (login/signup bricked). This guard pins the
  // official CF loading contract ("Using onload callback").
  it('turnstile script src declares &onload=onA01TurnstileLoad (official CF contract)', () => {
    const w = read('src/components/auth/turnstile-widget.tsx');
    const src = w.match(
      /SCRIPT_SRC\s*=\s*'(https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js[^']*)'/
    )?.[1];
    expect(src).toBeDefined();
    expect(src).toMatch(/[?&]onload=onA01TurnstileLoad/);
  });

  // F1 remount half: a second mount (React key-bump after a failed attempt)
  // must reuse the in-flight/loaded script instead of overwriting the waiter
  // callback of the first mount. Single-flight at module scope.
  it('turnstile loader is single-flight: a shared module-level promise, not per-call', () => {
    const w = read('src/components/auth/turnstile-widget.tsx');
    expect(w).toMatch(/let turnstileLoader: Promise<TurnstileApi> \| null = null/);
    // in-flight promise is reused, not replaced per call
    expect(w).toMatch(/if \(turnstileLoader\) return turnstileLoader/);
    // a failed fetch frees the slot so a later mount can retry
    expect(w).toMatch(/turnstileLoader = null/);
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
