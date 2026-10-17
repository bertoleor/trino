import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'];
const HERO = path.join(ROOT, 'src/components/home/hero.tsx');
const LOCALE_PAGE = path.join(ROOT, 'src/app/[locale]/page.tsx');

function read(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

describe('ORN-178 hero geométrico neo-Bauhaus (home)', () => {
  it('messages: home.json exists in 4 locales with identical key sets', () => {
    const keySets: string[][] = [];
    for (const locale of LOCALES) {
      const p = path.join(ROOT, `messages/${locale}/home.json`);
      expect(fs.existsSync(p), `missing ${p}`).toBe(true);
      const json = JSON.parse(read(p)) as Record<string, unknown>;
      keySets.push(flatKeys(json).sort());
    }
    expect(keySets[0]).toEqual(keySets[1]);
    expect(keySets[0]).toEqual(keySets[2]);
    expect(keySets[0]).toEqual(keySets[3]);
  });

  it('request.ts registers the home namespace', () => {
    const c = read(path.join(ROOT, 'src/i18n/request.ts'));
    expect(c).toMatch(/home\.json/);
    expect(c).toMatch(/messages\/\$\{locale\}\/home\.json/);
  });

  it('hero component: token-first geometric composition, no hardcoded hex', () => {
    expect(fs.existsSync(HERO), 'hero component missing').toBe(true);
    const c = read(HERO);
    // ORN-178: arco de medio punto mostaza + formas geométricas (círculo, media luna)
    expect(c).toMatch(/--color-mostaza/);
    expect(c).toMatch(/--color-celeste/);
    expect(c).toMatch(/--color-verde/);
    expect(c).toMatch(/rounded-t-full/); // arco de medio punto
    // regla de oro: heredar tokens, nunca inventar colores
    expect(c).not.toMatch(/#[0-9A-Fa-f]{3,6}\b/i);
    // motion.css verbs only (clip-path/mask/transform), CLS-safe
    expect(c).toMatch(/motion-grid-wipe|motion-mask-reveal/);
    // decoración geométrica no anunciada al lector de pantalla
    expect(c).toMatch(/aria-hidden/);
  });

  it('[locale]/page.tsx renders the hero — placeholder H1+grilla gone, static home', () => {
    const c = read(LOCALE_PAGE);
    expect(c).toMatch(/Hero/);
    expect(c).toMatch(/getTranslations/);
    expect(c).not.toMatch(/Sant[íi]sima/);
    expect(c).not.toMatch(/force-dynamic/);
    expect(c).not.toMatch(/from('\/')\?|supabase/);
  });

  it('root src/app/page.tsx duplication removed — la ruta [locale] manda', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/app/page.tsx'))).toBe(false);
  });

  it('categorías: 3 bloques con formas (arco, círculo, media luna) → TIPO facets reales', () => {
    const hero = read(HERO);
    const facets = read(path.join(ROOT, 'src/lib/db/facets.ts'));
    for (const tipo of ['velas', 'tarot-oraculos', 'inciensos-resinas']) {
      expect(hero).toContain(tipo);
      expect(facets).toContain(tipo);
    }
    expect(hero).toMatch(/tienda\?tipo=/);
  });
});
