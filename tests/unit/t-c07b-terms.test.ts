import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-C07b terms + defensa-consumidor + TERMS Ley24.240 IVA incluido factura C/B olvido DELETE', () => {
  it('terms page exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/app/[locale]/(legal)/terms/page.tsx'))).toBe(true);
  });
  it('defensa-consumidor page exists', () => {
    expect(
      fs.existsSync(path.join(ROOT, 'src/app/[locale]/(legal)/defensa-consumidor/page.tsx'))
    ).toBe(true);
  });
  it('DOCS/TERMS.md exists with Ley 24.240 IVA factura', () => {
    expect(fs.existsSync(path.join(ROOT, 'DOCS/TERMS.md'))).toBe(true);
    const c = fs.readFileSync(path.join(ROOT, 'DOCS/TERMS.md'), 'utf8');
    expect(c).toMatch(/24\.240|Ley/i);
    expect(c).toMatch(/IVA\s+incluido/i);
    expect(c).toMatch(/factura.*C\/B|factura/i);
    expect(c).toMatch(/olvido|DELETE|anonymize|1\s*a/i);
  });
  it('terms pages contain required legal text and footer links i18n', () => {
    const terms = fs.readFileSync(
      path.join(ROOT, 'src/app/[locale]/(legal)/terms/page.tsx'),
      'utf8'
    );
    expect(terms).toMatch(/24\.240|T[eé]rminos|Terms/i);
    expect(terms).toMatch(/IVA|factura/i);
    const defensa = fs.readFileSync(
      path.join(ROOT, 'src/app/[locale]/(legal)/defensa-consumidor/page.tsx'),
      'utf8'
    );
    expect(defensa).toMatch(/Defensa.*Consumidor|consumidor/i);
    expect(defensa).toMatch(
      /24\.240|https:\/\/www\.argentina\.gob\.ar\/produccion\/defensadelconsumidor/i
    );
  });
  it('soft delete + anonymize 1yr mentioned', () => {
    const c = fs.readFileSync(path.join(ROOT, 'DOCS/TERMS.md'), 'utf8');
    expect(c).toMatch(/soft.*delete|DELETE|anonym/i);
    expect(c).toMatch(/1\s*a|365|12\s*mes/i);
  });
});
