export const CATEGORY = ['ojos', 'labios', 'rostro', 'manicure', 'pestañas'] as const;

export const SUBCATEGORY = [
  'sombras',
  'delineadores',
  'máscaras',
  'labiales',
  'gloss',
  'esmaltes',
  'herramientas',
] as const;

export const FINISH = ['mate', 'satin', 'gloss', 'shimmer', 'metálico'] as const;

export type FacetCategory = (typeof CATEGORY)[number];
export type FacetSubcategory = (typeof SUBCATEGORY)[number];
export type FacetFinish = (typeof FINISH)[number];

export type Facets = {
  category: FacetCategory[];
  subcategory: FacetSubcategory[];
  finish: FacetFinish[];
  brand: string[];
  shade: string[];
};

type FacetInput = Record<string, string | string[] | undefined>;

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function values(sp: FacetInput, key: string): string[] {
  return toArray(sp[key])
    .flatMap((s) => s.split(','))
    .map((s) => s.trim())
    .filter(Boolean);
}

function pick<T extends string>(arr: readonly T[], val: string[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const s of val.map((v) => v.toLowerCase())) {
    if (seen.has(s)) continue;
    if (arr.some((a) => a === s)) {
      seen.add(s);
      out.push(s as T);
    }
  }
  return out;
}

function pickText(val: string[], maxLength: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of val) {
    if (s.length > maxLength || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function pickShade(val: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of val) {
    const hex = s.replace(/^#/, '').toLowerCase();
    if (!/^[0-9a-f]{6}$/.test(hex) || seen.has(hex)) continue;
    seen.add(hex);
    out.push(hex);
  }
  return out;
}

export function parseFacets(sp: FacetInput): Facets {
  return {
    category: pick(CATEGORY, values(sp, 'category')),
    subcategory: pick(SUBCATEGORY, values(sp, 'subcategory')),
    finish: pick(FINISH, values(sp, 'finish')),
    brand: pickText(values(sp, 'brand'), 50),
    shade: pickShade(values(sp, 'shade')),
  };
}

export function buildFacetFilter(f: Facets) {
  const where: string[] = [];
  const params: Record<string, string[]> = {};

  const columns: [keyof Facets, string][] = [
    ['category', 'category'],
    ['subcategory', 'subcategory'],
    ['finish', 'finish'],
    ['brand', 'brand'],
    ['shade', 'shade'],
  ];
  for (const [key, column] of columns) {
    const selected = f[key];
    if (!selected.length) continue;
    where.push(`${column} = ANY(:${key})`);
    params[key] = [...selected];
  }

  const searchVector = 'search_vector @@ plainto_tsquery';
  return { where, params, searchVector, ginIndex: 'idx_products_search_vector' };
}
