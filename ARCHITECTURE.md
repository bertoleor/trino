# Architecture — trino. (santisima-trinidad)

## Overview

Next 16 App Router con `[locale]` + Supabase Postgres RLS + Upstash Redis. **16 caps** en
`openspec/specs/*` (10 núcleo + cultura-blog, wishlist, reviews, build-tooling-freshness,
tooling-config, change-hygiene). Deploy Vercel, dominios `santisima-trinidad.com.ar` (primario) +
`.com` (global).

## Boundaries & Design

- **UI**: tokens Bauhaus `--primary #D95D39`, pill 9999, `--space` 4/8/16/24, Geist, target touch
  44px, grid 8pt, axe. Neo-Bauhaus de marca (paleta terracota/verde/mostaza/celeste — heredar, no
  inventar colores; ver `docs/DOCS/marca.md`).
- **ErrorBoundary** a 2 niveles (root + segment), flag `<1s` OFF por defecto, kill-switch por env.
- **State**: Server Actions + Zod + `is_admin()` RLS + `revalidatePath`. Cero escrituras de DB desde
  cliente.
- **CSP**: nonce por request (`src/lib/security/csp.ts` + `src/proxy.ts`, `nextWithNonce` /
  `applyNonceCsp`). Static `script-src 'self'` solo para rutas públicas cacheables (`/tienda`,
  `/cultura`); `style-src 'unsafe-inline'` permanece (Tailwind/styles inline legítimos).
- **Perf**: ISR 300, edge, LCP<2.5 / CLS<0.1 / INP<200, Brotli>1KB, paginación 25/100.
- **Flags**: `SHIPPING_INTERNATIONAL_ENABLED=false` (fallback flat), `PAYMENTS_*` false,
  `EASTER_ENABLED=true`.

## Data Model Caps

- `products.price_cents INT` (money via `decimal.js`, nunca float).
- `cultura_posts.slug` + GIN `search_vector`.
- `wishlists`: uniques parciales + merge anónimo/sesión.
- `reviews.rating` 1..5 con cola de moderación.

## Cron & Resilience

- `pg_cron` keepalive 6h · carrito abandonado 1h (QStash→Resend) · cancel bancaria 72h idempotente ·
  cultura-sync diario 06:00 (dedup hash). Vercel Cron 100/día + GitHub keepalive 04:00 UTC. Todas
  requieren `CRON_SECRET` bearer.

## Observability

OTel + Sentry en `instrumentation.ts`, `/health` (2s/1s/2s → 503), `audit_logs` INSERT-only,
`failed_webhooks_log` como DLQ, `security_logs`.

## Cost Zero

MercadoPago zero-PAN, pg_cron + Upstash 10k/d, QStash 500/d, Resend 100/d, Vercel 100GB Brotli
swr 300. Todo dentro de cap. Ver `docs/DEPLOY.md` + `docs/ROADMAP-NEXT-SDD.md`.
