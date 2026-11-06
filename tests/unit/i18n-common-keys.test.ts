import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const messagesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../messages');

const locales = readdirSync(messagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function loadCommon(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(messagesDir, locale, 'common.json'), 'utf8'));
}

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [prefix];
}

const NEUTRAL_KEY_RE = /^[a-z][a-zA-Z0-9]*$/;

describe('messages/*/common.json key conventions', () => {
  it('defines common.json for every locale directory', () => {
    expect(locales.length).toBeGreaterThanOrEqual(4);
    for (const locale of locales) {
      expect(() => loadCommon(locale), `locale ${locale}`).not.toThrow();
    }
  });

  it('uses identical keys across all locales (language-neutral parity)', () => {
    const reference = flattenKeys(loadCommon('en')).sort();
    for (const locale of locales) {
      expect(flattenKeys(loadCommon(locale)).sort(), `locale ${locale}`).toEqual(reference);
    }
  });

  it('uses language-neutral keys (lowercase ASCII identifiers)', () => {
    for (const locale of locales) {
      const keys = flattenKeys(loadCommon(locale));
      for (const key of keys) {
        for (const segment of key.split('.')) {
          expect(segment, `${locale}:${key}`).toMatch(NEUTRAL_KEY_RE);
        }
      }
    }
  });

  it('keeps the neutral nav set {cart, home, products} in every locale', () => {
    for (const locale of locales) {
      const common = loadCommon(locale) as Record<string, string>;
      for (const key of ['cart', 'home', 'products']) {
        const value = common[key];
        expect(typeof value, `${locale}:${key}`).toBe('string');
        expect(value?.length, `${locale}:${key}`).toBeGreaterThan(0);
      }
    }
  });
});
