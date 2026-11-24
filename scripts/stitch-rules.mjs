export const BANNED_COPY = [
  ['refill', /refill/i],
  ['recarga', /recarga/i],
  ['100% original directo', /100\s*%\s*(originales?)?\s*(directo|directa)/i],
  ['directo de fabrica', /directo\s+de\s+f[áa]brica/i],
  ['distribuidor oficial exclusivo', /distribuidor\s+oficial\s+exclusivo/i],
  ['vegano', /vegan[oa]s?/i],
  ['cruelty-free', /cruelty[\s-]?free/i],
  ['MUA', /\bmua\b/i],
  ['maquilladora', /maquillador[ao]s?/i],
  ['turno', /\bturnos?\b/i],
  ['99.9', /99[.,]9/],
  ['precision', /precisión|precision/i],
  ['fabricacion propia', /fabricaci[óo]n\s+propia/i],
  ['CUIT', /\bcuit\b/i],
  ['factura corporativa', /factura\s+corporativa/i],
];

export const LEGACY_SIGNAL =
  /#fef7ff|#1d1a21|#49464b|#625e52|rubik|plus\s*jakarta|bg-surface|backdrop-blur/i;

export const NEOPOP_SIGNAL =
  /fredoka|dm\s*sans|#17141b|#fff8e8|#ff75ae|#ffd84a|#ff5a36|#21bfa6|#a98af5/i;

export const DECISION_RULES = {
  N: 'neo-pop signals only: translate composition and rewrite copy',
  L: 'legacy signals only: repaint with canonical tokens and rewrite copy',
  M: 'mixed signals: keep structure, replace style and copy',
  U: 'no known signal: manual review required',
};

export const PUBLICATION_GATE =
  'Stitch-generated image licenses are not cleared. Mirror local paths only after owner/legal approval; use brand placeholders meanwhile.';
