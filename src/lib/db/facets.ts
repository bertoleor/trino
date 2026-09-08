export const TIPO = [
  'tarot-oraculos',
  'velas',
  'inciensos-resinas',
  'cristales-piedras',
  'amuletos-talismanes',
  'aceites-esencias',
  'altares-rituales',
  'libros-guias',
  'joyeria-simbolica',
  'sets-regalo',
] as const;

export const TRADICION = [
  'tarot-astrologia',
  'wicca-paganismo',
  'budismo',
  'santeria-afro',
  'feng-shui',
  'cristaloterapia',
  'chamanismo',
  'misticismo-cristiano',
  'espiritualidad-general',
] as const;

export const INTENCION = [
  'amor',
  'proteccion',
  'abundancia',
  'limpieza-energetica',
  'sueno-descanso',
  'conexion-espiritual',
  'duelo-sanacion',
] as const;

export type FacetTipo = (typeof TIPO)[number];
export type FacetTradicion = (typeof TRADICION)[number];
export type FacetIntencion = (typeof INTENCION)[number];

export type Facets = {
  tipo: FacetTipo[];
  tradicion: FacetTradicion[];
  intencion: FacetIntencion[];
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function parseFacets(sp: Record<string, string | string[] | undefined>): Facets {
  const pick = <T extends string>(arr: readonly T[], val: string | string[] | undefined): T[] =>
    toArray(val)
      .flatMap((s) => s.split(','))
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is T => arr.some((a) => a === s));
  return {
    tipo: pick(TIPO, sp.tipo),
    tradicion: pick(TRADICION, sp.tradicion),
    intencion: pick(INTENCION, sp.intencion),
  };
}

export function buildFacetFilter(f: Facets) {
  const where: string[] = [];
  const params: Record<string, string[]> = {};
  if (f.tipo.length) {
    where.push('tipo = ANY(:tipo)');
    params.tipo = f.tipo;
  }
  if (f.tradicion.length) {
    where.push('tradicion = ANY(:tradicion)');
    params.tradicion = f.tradicion;
  }
  if (f.intencion.length) {
    where.push('intencion = ANY(:intencion)');
    params.intencion = f.intencion;
  }
  const searchVector = 'search_vector @@ plainto_tsquery';
  return { where, params, searchVector, ginIndex: 'idx_products_search_vector' };
}
