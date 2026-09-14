# santisima-trinidad — trino.

E-commerce high-end de productos esotéricos multi-creencia (tarot, velas, inciensos, cristales,
amuletos). Next.js 16 + React 19 + Supabase (RLS) + Upstash Redis + next-intl (4 locales). Deploy en
Vercel. Marca **trino.** (minúscula, con punto final).

## Quickstart

```bash
pnpm install
pnpm dev        # next dev
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint .
pnpm test       # vitest run (TEMP/E:/temp — ver nota)
pnpm test:e2e   # playwright test
pnpm build
```

> `pnpm test` fuerza `TEMP=E:/temp` por un quirk de `vitest` + `playwright` en Windows (paths con
> espacios en `C:\Users\Pc Living`). No lo quites sin correr la suite completa en CI.

## Env

Copiar claves desde el vault de hosting (nunca commitear `.env`/`.env.local`). Requeridas: Supabase
URL/anon/service-role, Upstash Redis REST, Resend/MercadoPago, `CRON_SECRET`. Ver
`src/config/env.ts` (Zod, fail-closed al boot) para la lista completa.

## Docs map

- `ARCHITECTURE.md` — arquitectura técnica (límites, caps, observabilidad, cron)
- `SECURITY.md` — política de seguridad + reporte de vulnerabilidades
- `CHANGELOG.md` — historial de releases (vía changesets, `.changeset/`)
- `DOCS/` — deploy, legal, ADRs, roadmap, planes, reglas de enforcement
- `DOCS/DOCS/` — brief de marca (`marca.md`, `bahaus y neo bahaus.md`) + 3 planes de producto
  (tienda / backoffice / cuenta) + `AGENT CONSTITUTION.MD` (154 reglas)
- `DOCS/legal/` — product specs, facturación (AFIP/KeyCAE), pages coverage
- `DOCS/adr/` — architecture decision records (stack, i18n, money)
- `DOCS/audits/` — informes de auditoría (baseline, gaps, docs)
- `openspec/specs/` — **16 caps** (ecom-engine, payments, i18n-routing, money-arithmetic,
  security-resilience, concurrency-inventory, admin-backoffice, performance-scalability,
  observability-health, shipping-carriers, cultura-blog, wishlist, reviews, build-tooling-freshness,
  tooling-config, change-hygiene)
- `openspec/changes/` — propuestas/archivos de cambios SDD con deltas Given/When/Then
- `messages/{es-AR,en,fr,pt-BR}/` — diccionarios i18n (8 dicts por locale)
- `supabase/migrations/` — migraciones SQL (24) + seeds

## Stack

Next.js 16 · React 19 · TypeScript 5 · Tailwind 4 · shadcn/ui · Zod 4 · next-intl 4 · Supabase SSR +
RLS · Upstash Redis (rate limit + cache) · decimal.js (money) · Vitest 4 · Playwright · ESLint 9 ·
pnpm.

## Status

Branch `main`. Tests: unit + integración (RLS two-role, auth-sync) + e2e. Los releases se versionan
con changesets (`pnpm changeset` → `pnpm version` → `pnpm release`), no con edición manual del
CHANGELOG.
