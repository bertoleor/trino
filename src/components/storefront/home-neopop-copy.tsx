import { en } from './home-neopop-copy-en';
import { esAR } from './home-neopop-copy-es';
import { fr } from './home-neopop-copy-fr';
import { ptBR } from './home-neopop-copy-pt';

export type NeopopLocale = 'es-AR' | 'en' | 'fr' | 'pt-BR';

export interface HomeNeopopCopy {
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    highlight: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    visualLabel: string;
    visualHint: string;
  };
  ticker: { items: readonly string[] };
  brands: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    items: readonly { name: string; detail: string }[];
  };
  featured: {
    eyebrow: string;
    title: string;
    chips: readonly string[];
    emptyTitle: string;
    emptyBody: string;
  };
  guide: {
    eyebrow: string;
    title: string;
    body: string;
    steps: readonly string[];
    cta: string;
    cardTitle: string;
    cardLabel: string;
    cardQuestion: string;
    options: readonly string[];
    footnote: string;
  };
  community: {
    eyebrow: string;
    title: string;
    body: string;
    emptyTitle: string;
    emptyBody: string;
  };
  reviews: {
    eyebrow: string;
    title: string;
    body: string;
    emptyTitle: string;
    emptyBody: string;
  };
  quality: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
  };
}

const COPY: Record<NeopopLocale, HomeNeopopCopy> = {
  'es-AR': esAR,
  en,
  fr,
  'pt-BR': ptBR,
};

export function homeNeopopCopy(locale: string): HomeNeopopCopy {
  return COPY[locale as NeopopLocale] ?? esAR;
}
