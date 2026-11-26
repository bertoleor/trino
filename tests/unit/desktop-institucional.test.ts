import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;

const CULTURA_ROUTE = 'src/app/[locale]/cultura/page.tsx';
const WISHLIST_ROUTE = 'src/app/[locale]/(account)/wishlist/page.tsx';

const MANIFESTO_COMPONENTS = [
  'manifiesto-hero.tsx',
  'manifiesto-principles.tsx',
  'manifiesto-identity.tsx',
  'manifiesto-team.tsx',
  'manifiesto-cta.tsx',
  'manifiesto-stories.tsx',
] as const;

const WISHLIST_COMPONENTS = [
  'wishlist-gallery-header.tsx',
  'wishlist-gallery-grid.tsx',
  'wishlist-gallery-share.tsx',
  'wishlist-gallery-assurance.tsx',
  'wishlist-gallery-notify.tsx',
] as const;

const ALL_COMPONENTS = [...MANIFESTO_COMPONENTS, ...WISHLIST_COMPONENTS] as const;

const read = (relative: string) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const exists = (relative: string) => fs.existsSync(path.join(ROOT, relative));

function flatten(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') out[prefix] = value;
  else if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value))
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
  return out;
}

const BANNED_COPY =
  /\bmua\b|maquillador[ao]s?|turnos?|fotos?|diagn[óo]stic|99[.,]9|precisi[óo]n|precision|match\s+exacto|garantizado|garantie|100\s*%|refill|recarga|cuotas|stock|estoque|env[ií]os?|descuentos?|gratis|grátis|aida-public|whatsapp|wa\.me|vegan|cruelty/i;
const BANNED_SOURCE =
  /#[0-9a-f]{3,8}\b|backdrop-blur|backdrop-filter|\bglass\b|material-symbols|<img\b|fetch\(|use server|addToCart|useActionState|shade=|rounded-(?!card\b|control\b|none\b)/i;
const ALLOWED_BG = new Set([
  'bg-cream',
  'bg-ink',
  'bg-cobalt',
  'bg-lemon',
  'bg-pink',
  'bg-lilac',
  'bg-aqua',
]);

describe('desktop institucional port', () => {
  it('keeps both routes thin and composed with the shared storefront shell', () => {
    for (const route of [CULTURA_ROUTE, WISHLIST_ROUTE]) {
      expect(exists(route), route).toBe(true);
      const source = read(route);
      expect(source.split(/\r?\n/).length).toBeLessThan(150);
      expect(source).toContain('StitchShell');
      expect(source).toContain('StorefrontHeader');
      expect(source).toContain('StorefrontFooter');
      expect(source).not.toMatch(BANNED_SOURCE);
    }
  });

  it('preserves the cultura query and its real post link', () => {
    const source = read(CULTURA_ROUTE);
    expect(source).toContain(".from('cultura_posts')");
    expect(source).toContain(".select('id, slug, title, excerpt, cover_image, published_at')");
    expect(source).toContain(".eq('status', 'published')");
    expect(source).toContain(".is('deleted_at', null)");
    expect(source).toContain(".order('published_at', { ascending: false })");
    expect(source).toContain('.limit(12)');
    expect(source).toContain('revalidate = 300');
    const stories = read('src/components/storefront/manifiesto-stories.tsx');
    expect(stories).toContain('`/cultura/${post.slug}`');
    expect(stories).toContain('post.cover_image');
    expect(stories).not.toMatch(/https?:\/\//);
  });

  it('preserves wishlist auth, session scoping and pagination logic', () => {
    const source = read(WISHLIST_ROUTE);
    expect(source).toContain("export const dynamic = 'force-dynamic'");
    expect(source).toContain('Math.max(1, Number(sp.page ?? 1))');
    expect(source).toContain('supabase.auth.getUser()');
    expect(source).toContain(
      ".from('wishlists').select('id, product_id, created_at', { count: 'exact' })"
    );
    expect(source).toContain(".eq('user_id', user.id)");
    expect(source).toContain(".eq('session_id', 'anon')");
    expect(source).toContain('(page - 1) * 12');
    expect(source).toContain('from + 12 - 1');
    expect(source).toContain('.range(from, to)');
    expect(source).toContain(".order('created_at', { ascending: false })");
    expect(source).toContain('.slice(0, 5)');
    expect(source).toContain('href={`/${locale}/wishlist?page=${i + 1}`}');
    expect(source).toContain("t.has('wishlist.title')");
    const grid = read('src/components/storefront/wishlist-gallery-grid.tsx');
    expect(grid).toContain("import WishlistHeart from '@/components/shared/wishlist-heart'");
    expect(grid).toContain('<WishlistHeart productId={entry.product_id} initial />');
  });

  it('ships only token-based presentational components', () => {
    const sources = ALL_COMPONENTS.map((component) =>
      read(`src/components/storefront/${component}`)
    );
    for (const [index, source] of sources.entries()) {
      const name = ALL_COMPONENTS[index];
      expect(source, name).not.toMatch(BANNED_SOURCE);
      expect(source, name).not.toMatch(BANNED_COPY);
      const backgrounds = source.match(/\bbg-[a-z][a-z-]*/g) ?? [];
      for (const token of backgrounds) {
        expect(ALLOWED_BG.has(token), `${name}: ${token}`).toBe(true);
      }
    }
    const joined = sources.join('\n');
    expect(joined.match(/data-purpose=/g)?.length ?? 0).toBeGreaterThanOrEqual(16);
    expect(joined).toMatch(/min-h-11/);
    expect(joined).toMatch(/aria-label|aria-labelledby/);
    expect(joined).toMatch(/focus/);
    expect(joined).not.toContain('aida-public');
  });

  it('keeps the sold-out notice presentational and keyboard reachable', () => {
    const notify = read('src/components/storefront/wishlist-gallery-notify.tsx');
    expect(notify).toContain('role="dialog"');
    expect(notify).toContain('aria-modal="true"');
    expect(notify).toContain('closeRef.current?.focus()');
    expect(notify).toContain("event.key === 'Escape'");
    expect(notify).not.toMatch(/fetch\(|useActionState|addToCart|toggleWishlist/);
  });

  it('keeps identical institutional keys and honest copy in all locales', () => {
    let expected: string[] | null = null;
    let voseo = 0;
    for (const locale of LOCALES) {
      const messages = JSON.parse(read(`messages/${locale}/institucional.json`)) as unknown;
      const entries = Object.entries(flatten(messages));
      expect(entries.length, locale).toBeGreaterThan(80);
      for (const [key, value] of entries) {
        expect(BANNED_COPY.test(value), `${locale}/${key}`).toBe(false);
        if (
          /podés|querés|elegí|probá|recorré|tocá|copiá|sacá|guardá|volvé|dejá|encontrá|hablás/i.test(
            value
          )
        ) {
          voseo += 1;
        }
      }
      const keys = entries.map(([key]) => key).sort();
      expected ??= keys;
      expect(keys, locale).toEqual(expected);
      expect(Object.keys(messages as object).sort(), locale).toEqual(['manifiesto', 'wishlist']);
    }
    expect(voseo).toBeGreaterThanOrEqual(8);
    expect(read('messages/es-AR/institucional.json')).toContain('Te avisamos cuando vuelva');
  });

  it('uses the namespace already registered by the request config', () => {
    const config = read('src/i18n/request.ts');
    expect(config).toMatch(/institucional\.json[\s\S]*institucional,/);
  });
});
