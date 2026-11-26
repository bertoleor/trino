import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = () => fs.readFileSync(path.join(ROOT, 'src/proxy.ts'), 'utf8');

describe('proxy: auth and admin screens stay outside the locale prefix', () => {
  it('declares the top-level route families as unlocalized', () => {
    const c = read();
    expect(c).toMatch(/UNLOCALIZED_PATHS/);
    for (const route of ['/admin', '/account', '/login', '/signup']) {
      expect(c).toContain(`'${route}'`);
    }
  });

  it('skips next-intl prefixing for those routes so /login does not 404', () => {
    const c = read();
    expect(c).toMatch(/isUnlocalizedPath\(path\)\s*\?\s*undefined\s*:/);
  });
});
