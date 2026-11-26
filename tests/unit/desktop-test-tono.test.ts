import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const STEPS = ['paso-1', 'paso-2', 'paso-3'] as const;
const COMPONENTS = [
  'test-tono-shell.tsx',
  'test-tono-primitives.tsx',
  'test-tono-subtones.tsx',
  'test-tono-questions.tsx',
  'test-tono-paso-1.tsx',
  'test-tono-paso-2.tsx',
  'test-tono-result-panel.tsx',
  'test-tono-product-card.tsx',
  'test-tono-bundle.tsx',
  'test-tono-paso-3.tsx',
] as const;

const read = (relative: string) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const exists = (relative: string) => fs.existsSync(path.join(ROOT, relative));

function flatten(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') out[prefix] = value;
  else if (Array.isArray(value)) value.forEach((item, i) => flatten(item, `${prefix}.${i}`, out));
  else if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value))
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
  return out;
}

const BANNED_COPY =
  /\bmua\b|maquillador[ao]s?|turnos?|fotos?|diagn[óo]stic|99[.,]9|precisi[óo]n|precision|match\s+exacto|garantizado|100\s*%|refill|recarga|cuotas|stock|env[ií]os?|descuentos?|gratis|aida-public|whatsapp|wa\.me/i;
const BANNED_SOURCE =
  /#[0-9a-f]{3,8}\b|backdrop-blur|backdrop-filter|\bglass\b|material-symbols|<img\b|fetch\(|use server|addToCart|useActionState|shade=|rounded-(?!card\b|control\b|none\b)/i;

describe('desktop test de tono port', () => {
  it('creates the three thin localized pages', () => {
    for (const step of STEPS) {
      const relative = `src/app/[locale]/test-de-tono/${step}/page.tsx`;
      expect(exists(relative), relative).toBe(true);
      const source = read(relative);
      expect(source.split(/\r?\n/).length).toBeLessThan(150);
      expect(source).toContain('generateMetadata');
      expect(source).toContain('localizedUrl');
      expect(source).toContain('languageAlternates');
      expect(source).toContain('TestTonoShell');
      expect(source).not.toMatch(/fetch\(|use server|addToCart|useActionState/);
    }
  });

  it('ships only the owned test-tono components', () => {
    for (const component of COMPONENTS) {
      const relative = `src/components/storefront/${component}`;
      expect(exists(relative), relative).toBe(true);
      expect(read(relative)).not.toMatch(BANNED_SOURCE);
    }
  });

  it('keeps the flow presentational, accessible and token-based', () => {
    const source = COMPONENTS.map((component) =>
      read(`src/components/storefront/${component}`)
    ).join('\n');
    expect(source.match(/data-purpose=/g)?.length ?? 0).toBeGreaterThanOrEqual(8);
    expect(source.match(/aria-label=\{t\(/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(source.match(/aria-pressed=/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
    expect(source).toMatch(/\$\{locale\}\/tienda/);
    expect(source).toMatch(/test-de-tono\/paso-2/);
    expect(source).toMatch(/test-de-tono\/paso-3/);
    expect(source).toMatch(/test-de-tono\/paso-1/);
  });

  it('keeps identical testTono keys and digital-only copy in all locales', () => {
    let expected: string[] | null = null;
    let orientativeCount = 0;
    for (const locale of LOCALES) {
      const messages = JSON.parse(read(`messages/${locale}/test-tono.json`)) as unknown;
      const entries = Object.entries(flatten(messages));
      expect(entries.length).toBeGreaterThan(20);
      for (const [key, value] of entries) {
        expect(BANNED_COPY.test(value), `${locale}/${key}`).toBe(false);
        if (key.startsWith('step3.') && /orientativ/i.test(value)) orientativeCount += 1;
      }
      const keys = entries.map(([key]) => key).sort();
      expected ??= keys;
      expect(keys, locale).toEqual(expected);
      for (const namespace of ['meta', 'hero', 'steps', 'step1', 'step2', 'step3', 'common']) {
        expect(messages, `${locale}/${namespace}`).toHaveProperty(namespace);
      }
    }
    expect(orientativeCount).toBeGreaterThanOrEqual(6);
    expect(BANNED_COPY.test(read('messages/es-AR/test-tono.json'))).toBe(false);
    expect(read('messages/es-AR/test-tono.json')).toMatch(/podés|querés|elegí|probá/i);
  });

  it('uses the namespace already registered by the request config', () => {
    const config = read('src/i18n/request.ts');
    expect(config).toContain('test-tono.json');
    expect(config).toContain('testTono');
  });
});
