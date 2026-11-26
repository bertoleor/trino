import { en } from './producto-detalle-copy-en';
import { esAR } from './producto-detalle-copy-es';
import { fr } from './producto-detalle-copy-fr';
import { ptBR } from './producto-detalle-copy-pt';

export type DetalleLocale = 'es-AR' | 'en' | 'fr' | 'pt-BR';

export interface ProductoDetalleCopy {
  breadcrumb: { label: string; home: string; shop: string };
  banner: { label: string; body: string };
  gallery: { emptyTitle: string; emptyBody: string; badge: string; detailBadge: string };
  purchase: {
    priceLabel: string;
    shadeTitle: string;
    shadeMissing: string;
    addToBag: string;
    save: string;
    note: string;
  };
  bundle: { eyebrow: string; title: string; body: string; steps: readonly string[] };
  compatible: {
    eyebrow: string;
    title: string;
    cta: string;
    emptyTitle: string;
    emptyBody: string;
  };
  details: { title: string; items: readonly { title: string; body: string }[] };
  community: { eyebrow: string; title: string; body: string; emptyTitle: string };
}

const COPY: Record<DetalleLocale, ProductoDetalleCopy> = {
  'es-AR': esAR,
  en,
  fr,
  'pt-BR': ptBR,
};

export function productoDetalleCopy(locale: string): ProductoDetalleCopy {
  return COPY[locale as DetalleLocale] ?? esAR;
}
