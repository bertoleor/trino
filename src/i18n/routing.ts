import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es-AR', 'en', 'fr', 'pt-BR'],
  defaultLocale: 'es-AR',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
