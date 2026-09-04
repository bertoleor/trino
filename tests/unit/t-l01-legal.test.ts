import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('T-L01 legal P0 3 pages + footer arrepentimiento + 0800', () => {
  it('3 legal pages exist with global_settings and generateMetadata hreflang', () => {
    const p1 = 'src/app/[locale]/(legal)/cambios-devoluciones/page.tsx';
    const p2 = 'src/app/[locale]/(legal)/envios/page.tsx';
    const p3 = 'src/app/[locale]/(legal)/garantia/page.tsx';
    for (const p of [p1, p2, p3]) {
      expect(fs.existsSync(p), p).toBe(true);
      const c = fs.readFileSync(p, 'utf8');
      expect(c).toMatch(/global_settings|return_policy_by_tipo/);
      expect(c).toMatch(/generateMetadata|hreflang|alternates/);
      expect(c).toMatch(/Ley 24\.240|24\.240/);
    }
  });
  it('legal pages mention 0800 and CUIT domicilio via CMS', () => {
    const p1 = fs.readFileSync('src/app/[locale]/(legal)/cambios-devoluciones/page.tsx', 'utf8');
    expect(p1).toMatch(/0800-666-1518/);
    expect(p1).toMatch(/CUIT|domicilio/i);
    const p2 = fs.readFileSync('src/app/[locale]/(legal)/envios/page.tsx', 'utf8');
    expect(p2).toMatch(/0800-666-1518/);
    const p3 = fs.readFileSync('src/app/[locale]/(legal)/garantia/page.tsx', 'utf8');
    expect(p3).toMatch(/garantia|garant/i);
  });
  it('legal-footer has boton arrepentimiento art 34 10 dias prominent 44px', () => {
    const f = 'src/components/shared/legal-footer.tsx';
    expect(fs.existsSync(f)).toBe(true);
    const c = fs.readFileSync(f, 'utf8');
    expect(c).toMatch(/arrepentimiento/i);
    expect(c).toMatch(/art\.34|art 34|10 d/);
    expect(c).toMatch(/0800-666-1518/);
    expect(c).toMatch(/44|min-h.*44|minHeight/);
    expect(c).toMatch(/CUIT|domicilio/);
  });
  it('legal.json exists for 4 locales', () => {
    for (const loc of ['es-AR', 'en', 'fr', 'pt-BR']) {
      const p = `messages/${loc}/legal.json`;
      expect(fs.existsSync(p), p).toBe(true);
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      expect(Object.keys(j).length).toBeGreaterThan(0);
    }
  });
  it('footer links legal pages', () => {
    const c = fs.readFileSync('src/components/shared/legal-footer.tsx', 'utf8');
    expect(c).toMatch(/cambios-devoluciones/);
    expect(c).toMatch(/envios/);
    expect(c).toMatch(/garantia/);
  });
});
