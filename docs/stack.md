# trino. — stack (framework y plataforma)

> Canónico baseline. Verificado contra `package.json`, `next.config.ts`,
> `src/config/env.ts`, `src/styles/`, `supabase/`, `messages/`.
> `docs/adr/0001-0003` están en estado `accepted` (verificados); este archivo
> es la foto verificada del stack.

## Núcleo

| Capa | Tecnología | Evidencia |
|---|---|---|
| Framework | Next.js 16 (App Router, `[locale]`) | `package.json` `next@16.3.4`, `next.config.ts` |
| UI | React 19.2.8 + TypeScript 5 | `package.json` |
| Estilos | Tailwind CSS 4 + shadcn/ui + tokens propios | `src/styles/tokens.css`, `src/components/ui/` |
| Fuentes | Geist (`--font-geist-sans`) | `src/styles/tokens.css` |
| i18n | next-intl 4, 4 locales (es-AR default, en, fr, pt-BR) | `messages/{es-AR,en,fr,pt-BR}/`, plugin en `next.config.ts` |
| Forms | react-hook-form + Zod 4 (`@hookform/resolvers`) | `package.json`, `src/lib/validations/` |
| Estado server | Server Actions + `revalidatePath` (cero escrituras DB desde cliente) | `ARCHITECTURE.md`, `src/lib/actions/` |
| Data fetching cliente | TanStack Query 5 + React Virtual | `package.json` |

## Backend y datos

| Capa | Tecnología | Evidencia |
|---|---|---|
| DB | Supabase Postgres con RLS (`is_admin()`) | `src/lib/supabase/`, `src/lib/db/`, `supabase/migrations/` |
| Dinero | `price_cents INT` + decimal.js (nunca float) | `package.json` `decimal.js@10.6.0`, `src/lib/money/` |
| Cache / rate limit | Upstash Redis (`@upstash/redis`, `@upstash/ratelimit`) | `package.json`, `src/lib/rate-limit.ts` |
| Pagos | MercadoPago (zero-PAN) + webhooks Stripe/PayPal/MP | `src/app/api/webhooks/`, `src/lib/payments/` |
| Envíos | Carriers propios + `SHIPPING_INTERNATIONAL_ENABLED=false` (fallback flat) | `src/lib/shipping/`, `src/app/api/shipping/rates/` |
| Email | Resend (vía QStash/cron, nunca sincrónico en el request) | `ARCHITECTURE.md`, `src/lib/cron/` |
| Realtime | Supabase realtime | `src/lib/realtime/` |
| Search cultura | Postgres GIN `search_vector` en `cultura_posts.slug` | `ARCHITECTURE.md` |

## Seguridad y observabilidad

- CSP con nonce por request (`src/lib/security/csp.ts` + `src/proxy.ts`);
  `script-src 'self'` estático solo en rutas públicas cacheables
  (`/tienda`, `/cultura`); `style-src 'unsafe-inline'` permanece por
  Tailwind. Headers HSTS/X-Frame/X-Content-Type en `next.config.ts`.
- OTel + Sentry en `instrumentation.ts`; `/api/health` (+ `live`, `ready`);
  `audit_logs` INSERT-only, `failed_webhooks_log` como DLQ, `security_logs`.
- Env validado con Zod fail-closed al boot (`src/config/env.ts`):
  Supabase URL/anon/service-role, Upstash Redis REST, Resend/MercadoPago,
  `CRON_SECRET`.

## Cron y resiliencia

- `pg_cron`: keepalive 6h · carrito abandonado 1h (QStash→Resend) · cancel
  bancaria 72h idempotente · cultura-sync diario 06:00 (dedup hash).
- Vercel Cron (límite 100/día) + keepalive GitHub 04:00 UTC.
- Todo cron requiere bearer `CRON_SECRET`.
- Rutas: `src/app/api/cron/{keepalive,fx,cultura-sync}/`.

## Performance (presupuesto)

ISR 300 · edge · LCP<2.5 / CLS<0.1 / INP<200 · Brotli>1KB · paginación
25/100 · `cacheMaxMemorySize` 50MB · imágenes AVIF/WebP solo desde
Supabase Storage público. Gate LHCI (`lighthouserc.json`).

## Tooling

pnpm 11 · ESLint 9 · Prettier · Husky + lint-staged · Vitest 4 + Playwright ·
Changesets · Vercel (deploy) · `pnpm-workspace.yaml`.
16 caps en `openspec/specs/`: ecom-engine, payments, i18n-routing,
money-arithmetic, security-resilience, concurrency-inventory,
admin-backoffice, performance-scalability, observability-health,
shipping-carriers, cultura-blog, wishlist, reviews,
build-tooling-freshness, tooling-config, change-hygiene.
