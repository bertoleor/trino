import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const SCREENS = [
  'src/components/storefront/auth-screen-frame.tsx',
  'src/components/storefront/auth-screen-primitives.tsx',
  'src/components/storefront/auth-screen-recovery.tsx',
  'src/components/storefront/auth-screen-otp.tsx',
  'src/components/storefront/auth-screen-password.tsx',
  'src/components/storefront/auth-screen-password-form.tsx',
];
const ROUTES = [
  'src/app/login/page.tsx',
  'src/app/signup/page.tsx',
  'src/app/[locale]/recuperar-contrasea/page.tsx',
  'src/app/[locale]/verificar-codigo/page.tsx',
  'src/app/[locale]/nueva-contrasea/page.tsx',
];
const FORBIDDEN_CLAIMS = [
  'aida-public',
  'whatsapp',
  /whats\s*app/i,
  /\bmua\b/i,
  /100\s*%\s*original/i,
  'magic link',
  'cupón',
  'cupon',
  'refill',
  'recarga',
  'ssl',
  'tls',
  '256',
  'encriptaci',
  'timer',
  'stock',
  'cuotas',
  'descuento',
  '48h',
  '15% off',
  'bienvenidatrino',
  'http://',
  'https://',
];

function messageKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    messageKeys(nested, prefix ? `${prefix}.${key}` : key)
  );
}

describe('desktop auth screens', () => {
  it('keeps the four auth-screens namespaces in sync', () => {
    const keySets = LOCALES.map((locale) => {
      const messages = JSON.parse(read(`messages/${locale}/auth-screens.json`));
      return messageKeys(messages).sort();
    });
    const baseline = keySets[0] ?? [];
    for (const keys of keySets.slice(1)) expect(keys).toEqual(baseline);
    expect(baseline.length).toBeGreaterThan(30);
  });

  it('uses only canonical tokens and no blur, glass or invented colors', () => {
    for (const file of SCREENS) {
      const source = read(file);
      expect(source, file).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(source, file).not.toMatch(/backdrop-blur|blur-|glass/i);
      expect(source, file).not.toMatch(/rounded-(?!card\b|control\b)/);
      expect(source, file).not.toMatch(/shadow-(?!pop)/);
    }
  });

  it('rewrites the prohibited source claims in screens and copy', () => {
    const sources = [
      ...SCREENS,
      ...LOCALES.map((locale) => `messages/${locale}/auth-screens.json`),
    ];
    for (const file of sources) {
      const content = read(file).toLowerCase();
      for (const claim of FORBIDDEN_CLAIMS) {
        const match = typeof claim === 'string' ? content.includes(claim) : claim.test(content);
        expect(match, `${file} contains a prohibited claim: ${claim}`).toBe(false);
      }
    }
  });

  it('keeps recovery, OTP and password screens presentation-only', () => {
    for (const file of SCREENS.filter(
      (name) => name.includes('recovery') || name.includes('otp') || name.includes('password')
    )) {
      const source = read(file);
      expect(source, file).toContain('data-purpose=');
      expect(source, file).not.toMatch(/\bfetch\s*\(/);
      expect(source, file).not.toContain('formAction=');
      expect(source, file).not.toContain('useActionState');
      expect(source, file).not.toContain('onSubmit=');
      expect(source, file).not.toContain('role="status"');
    }
    const formFiles = SCREENS.filter(
      (name) => name.includes('recovery') || name.includes('otp') || name.includes('password-form')
    );
    for (const file of formFiles) {
      expect(read(file), file).toContain('disabled');
    }
  });

  it('uses the matching shell type for each screen family', () => {
    expect(read('src/components/storefront/auth-screen-frame.tsx')).toContain(
      'data-shell-type="web_standard"'
    );
    for (const file of SCREENS.filter(
      (name) => name.includes('recovery') || name.includes('otp') || name.includes('password.tsx')
    )) {
      expect(read(file), file).toContain('shellType="web_blank"');
    }
  });

  it('preserves the login and signup server action contracts', () => {
    const login = read('src/app/login/login-form.tsx');
    const signup = read('src/app/signup/signup-form.tsx');
    for (const source of [login, signup]) {
      expect(source).toContain('useActionState');
      expect(source).toContain('cf-turnstile-response');
      expect(source).toContain('pending || !token');
      expect(source).toContain('role="alert"');
      expect(source).toContain('TurnstileWidget');
      expect(source).toContain('AuthScreenFrame');
    }
    expect(signup).toContain('state.ok');
  });

  it('keeps every route thin and marked for QA', () => {
    for (const file of ROUTES) {
      const source = read(file);
      expect(source.split('\n').length, file).toBeLessThan(150);
    }
    for (const file of ROUTES.slice(0, 2)) {
      expect(read(file), file).toContain('data-purpose=');
    }
    for (const file of ROUTES.slice(2)) {
      const source = read(file);
      expect(source).toContain('generateMetadata');
      expect(source).toContain('robots: { index: false, follow: false }');
      expect(source).toContain('import { ');
    }
  });
});
