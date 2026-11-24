import { describe, expect, it } from 'vitest';
import { BANNED_COPY } from '../../scripts/stitch-rules.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const NAMESPACES = ['storefront', 'home', 'product'] as const;

function flatten(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') {
    out[prefix] = value;
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}.${index}`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
}

const RULES = BANNED_COPY as Array<[string, RegExp]>;

function load(locale: string, namespace: string) {
  const file = path.join(ROOT, 'messages', locale, `${namespace}.json`);
  return flatten(JSON.parse(fs.readFileSync(file, 'utf8')) as unknown);
}

describe('neo-pop storefront copy', () => {
  it('keeps namespace keys in sync across locales', () => {
    for (const namespace of NAMESPACES) {
      const keys = Object.keys(load('es-AR', namespace)).sort();
      for (const locale of LOCALES) {
        expect(Object.keys(load(locale, namespace)).sort(), `${locale}/${namespace}`).toEqual(keys);
      }
    }
  });

  it('does not ship banned copy in any locale', () => {
    for (const locale of LOCALES) {
      for (const namespace of NAMESPACES) {
        for (const [key, value] of Object.entries(load(locale, namespace))) {
          for (const [label, pattern] of RULES) {
            expect(pattern.test(value), `${locale}/${namespace}/${key} (${label})`).toBe(false);
          }
        }
      }
    }
  });

  it('registers the new namespaces in the request config', () => {
    const config = fs.readFileSync(path.join(ROOT, 'src/i18n/request.ts'), 'utf8');
    for (const namespace of NAMESPACES) {
      expect(config).toContain(`${namespace}.json`);
      expect(config).toContain(namespace);
    }
  });
});
