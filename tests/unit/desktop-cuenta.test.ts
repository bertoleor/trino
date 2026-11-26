import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const PAGES = [
  'src/app/[locale]/cuenta/page.tsx',
  'src/app/[locale]/cuenta/activada/page.tsx',
  'src/app/[locale]/club/bienvenida/page.tsx',
] as const;

const COMPONENTS = [
  'src/components/storefront/cuenta-ui.tsx',
  'src/components/storefront/cuenta-shell.tsx',
  'src/components/storefront/cuenta-benefit-banner.tsx',
  'src/components/storefront/cuenta-metrics.tsx',
  'src/components/storefront/cuenta-profile-hero.tsx',
  'src/components/storefront/cuenta-tabs.tsx',
  'src/components/storefront/cuenta-order-tracker.tsx',
  'src/components/storefront/cuenta-order-history.tsx',
  'src/components/storefront/cuenta-club-panel.tsx',
  'src/components/storefront/cuenta-shortcuts.tsx',
  'src/components/storefront/club-activation-hero.tsx',
  'src/components/storefront/club-onboarding.tsx',
  'src/components/storefront/club-perks-sidebar.tsx',
  'src/components/storefront/club-welcome.tsx',
  'src/components/storefront/club-welcome-actions.tsx',
] as const;

const SOURCE_BANNED =
  /aida-public|lh3\.googleusercontent|data:image|#[0-9a-fA-F]{3,8}\b|backdrop-blur|rounded-(?:xs|sm|md|lg|xl|2xl|3xl|full)|shadow-\[|bg-white|onClick|useState|useActionState|addToCart|createCheckout|fetch\(|['"]use client['"]|\bMUA\b|WhatsApp|diagn[oó]stic|garantiz|98\s*%/i;

const COPY_BANNED =
  /98\s*%|100\s*%|\bpuntos?\b|\bpoints?\b|acumulad|garantiz|guaranteed|\bMUA\b|maquillad|diagn[oó]stic|whatsapp|reserv|refill|recarga|aida-public|\bARS\b|precis[ió]n|precision|tono\s+\d+/i;

function leaves(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') out[prefix] = value;
  else if (value && typeof value === 'object')
    for (const [key, child] of Object.entries(value))
      leaves(child, prefix ? `${prefix}.${key}` : key, out);
  return out;
}

describe('Desktop cuenta, activada y bienvenida', () => {
  it('compone las tres pantallas sobre el shell web_standard y mantiene páginas cortas', () => {
    const [cuenta, activada, bienvenida] = PAGES.map(read);

    expect(cuenta).toMatch(/CuentaShell/);
    expect(cuenta).toMatch(/CuentaProfileHero/);
    expect(cuenta).toMatch(/CuentaOrderTracker/);
    expect(cuenta).toMatch(/CuentaOrderHistory/);
    expect(cuenta).toMatch(/CuentaClubPanel/);

    expect(activada).toMatch(/ClubActivationHero/);
    expect(activada).toMatch(/ClubOnboarding/);
    expect(activada).toMatch(/ClubPerksSidebar/);

    expect(bienvenida).toMatch(/ClubWelcome/);

    for (const page of PAGES) {
      expect(read(page).split('\n').length).toBeLessThan(150);
      expect(read(page)).toMatch(/generateMetadata/);
      expect(read(page)).toMatch(/robots:\s*\{\s*index:\s*false/);
    }
  });

  it('usa solo tokens canónicos, sin imágenes externas ni estado falso', () => {
    for (const file of [...PAGES, ...COMPONENTS]) {
      const source = read(file);
      expect(SOURCE_BANNED.test(source), file).toBe(false);
      expect(source, file).toMatch(/data-purpose=|purpose=|data-shell-type|CuentaShell/);
    }

    const shell = read('src/components/storefront/cuenta-shell.tsx');
    expect(shell).toMatch(/shellType="web_standard"/);
    expect(shell).toMatch(/StorefrontHeader/);
    expect(shell).toMatch(/StorefrontFooter/);
  });

  it('marca las secciones principales con data-purpose', () => {
    for (const file of COMPONENTS) {
      if (file.endsWith('cuenta-shell.tsx')) continue;
      expect(read(file), file).toMatch(/data-purpose=|purpose=/);
    }
  });

  it('reescribe las afirmaciones prohibidas del Stitch en los cuatro locales', () => {
    let expected: string[] | null = null;

    for (const locale of LOCALES) {
      const messages = JSON.parse(read(`messages/${locale}/cuenta.json`)) as unknown;
      const entries = Object.entries(leaves(messages));
      expect(entries.length).toBeGreaterThan(0);

      for (const [key, value] of entries) {
        expect(value.trim().length, `${locale}/${key}`).toBeGreaterThan(0);
        expect(COPY_BANNED.test(value), `${locale}/${key}`).toBe(false);
      }

      const keys = entries.map(([key]) => key).sort();
      expected ??= keys;
      expect(keys).toEqual(expected);
    }
  });

  it('registra el namespace y documenta las tres fuentes Stitch', () => {
    expect(read('src/i18n/request.ts')).toMatch(/cuenta\.json/);
    const plan = read('docs/plans/PLAN-migracion-frontend-neopop.md');
    expect(plan).toMatch(/mi_perfil_y_cuenta_desktop_neo_pop_ars/);
    expect(plan).toMatch(/mi_cuenta_socia_reci_n_activada_desktop/);
    expect(plan).toMatch(/bienvenida_al_club_y_correo_enviado_desktop/);
  });
});
