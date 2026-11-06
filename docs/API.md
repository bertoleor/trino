# TRINO API — HTTP routes, server actions & RPC surface

> **Fecha:** 2026-10-17 · **Autor:** 16-backend (Hermes) · **Motivo:** ticket [FLEET-DOCS] t_0fae1500 — crear `docs/API.md` del set v2 documentando la superficie real contra código verificable
> **Búsqueda:** keywords: `api, rest, routes, server actions, auth, rbac, rate limit, cron, webhooks, supabase, rpc, checkout, health` · clasificación: `referencia` · estado: `canónico` · actualizado: 2026-10-17
> **Resumen:** Superficie de API de TRINO verificada contra el código el 2026-10-17: 16 route handlers en `src/app/api/`, 21 server actions (`src/lib/actions/` + `src/app/auth/actions.ts`), RBAC por middleware (`src/proxy.ts`) con `has_role`/`is_admin`, rate limiting Upstash por tiers, webhooks de pago con HMAC + dedup, y funciones RPC en Postgres. Cada endpoint listado existe como archivo; nada documentado contra código inexistente.
> **Parte de:** [[README]] · Relacionados: [[ARCHITECTURE]] · [[SECURITY]]

## Overview

Next.js App Router (package `santisima-trinidad`). Tres superficies:

1. **HTTP route handlers** — `src/app/api/**/route.ts` (16 handlers, tabla abajo).
2. **Server Actions** (RPC desde componentes React) — `src/lib/actions/*.ts`, `src/app/auth/actions.ts` y acciones inline en páginas admin.
3. **Funciones RPC de Postgres** invocadas con el cliente Supabase `.rpc(...)` (sección abajo).

Fuente de verdad: el código. Si agregás una ruta o acción, agregala acá en el mismo commit.

## Authentication & authorization

- **Sesiones**: cookies Supabase SSR (`createClient` de `src/lib/supabase/server`, `@supabase/ssr`).
- **RBAC por middleware** (`src/proxy.ts`): jerarquía `super_admin(4) > admin(3) > editor(2) > viewer(1)`. `requiredRole()`: `/admin/users` y `/admin/roles` → `super_admin`; cualquier `DELETE` → `admin`; `/admin*` → `editor`. El prefijo de locale (`localePrefix: 'always'`) se descuenta antes de los gates. El rol se resuelve con la RPC `has_role`. La cadena también aplica CSP con nonce y refresh de sesión.
- **Route handlers**: `supabase.auth.getUser()` → `401` anónimo; rol fino vía tabla `user_roles` + fallback RPC `has_role` → `403` (`isEditorOrAbove` en `src/app/api/admin/shipping/batch/route.ts:62`).
- **Server actions**: patrón local `requireAdmin()` = `getUser()` + RPC `is_admin` (más `app_metadata.role === 'admin'` en `src/lib/actions/cultura.ts:11`) → `{ error, status: 403 }`.
- **Auth actions con Turnstile fail-closed**: el check corre DENTRO de la acción (`cf-turnstile-response` del FormData, `src/app/auth/actions.ts:17`); sin token válido no hay intento de signIn. Los rechazos se envían al audit ingest (`enqueueSecurityAudit('turnstile_403')`).
- **Identidad anónima de comercio**: cookie httpOnly `trino_cart_sid`, resuelta server-side (`src/lib/cart/session.ts`) — el owner de los rows jamás llega como argumento del cliente.
- **Rutas cron**: `isCronAuthorized()` (`src/lib/cron/auth.ts`) — `Authorization: Bearer $CRON_SECRET`, fail-closed: secret sin configurar deniega en cualquier entorno salvo dev local con `CRON_ALLOW_UNSET_SECRET=true`.
- **Audit ingest**: `Authorization: Bearer $AUDIT_INGEST_SECRET` con `timingSafeEqual`.
- **Webhooks de pago**: HMAC-SHA256 contra `$MERCADOPAGO_WEBHOOK_SECRET` / `$PAYPAL_WEBHOOK_SECRET` / `$STRIPE_WEBHOOK_SECRET`, comparación timing-safe + dedup en `processed_events`.

## Rate limiting

`src/lib/rate-limit.ts` — sliding window Upstash Redis con fallback in-memory cuando `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` no están (o si Redis falla). Todo 429 devuelve `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.

| Tier | Presupuesto | Uso |
|---|---|---|
| `auth` | 5 / 15m | login/signup (capa Turnstile) |
| `public` | 60 / 60s | tier default |
| `authed` | 600 / 60s | tráfico autenticado |
| `webhook` | 60 / 60s | rutas webhook (cap de body 1MB) |
| `admin` | 10 / 60m | fan-out admin |
| `shipping` | 20 / 60s | `POST /api/shipping/rates` |
| `social` | 200 / 60m | `GET /api/social/stats` (por plataforma) |

Presupuestos documentados en los módulos: reviews 3/h (`src/lib/actions/reviews.ts:9`), wishlist 60/m con 409 idempotente (`src/lib/actions/wishlist.ts:9`). La key del limiter jamás deriva de la cookie (T-S09).

## Error format

- **HTTP routes**: `NextResponse.json({ error: <string> }, { status })` — algunos agregan `issues` (conteo zod), `code`, `required`. Body cap → `413`; validación zod → `422`; rate limit → `429` con headers.
- **Server actions**: devuelven objetos planos `{ error, status }` (sin throw): `401` sin sesión/cookie, `403` sin rol, `409` conflicto/dupe, `422` validación.
- **Códigos en uso**: 202, 400, 401, 403, 405, 409, 413, 422, 429, 500, 502, 503.

## HTTP routes (16 verificadas 2026-10-17)

| Método(s) | Ruta | Auth | Qué hace | Fuente |
|---|---|---|---|---|
| POST | `/api/admin/shipping/batch` | sesión + rol editor (`401`/`403`) | etiquetas de envío en lote (groupByPostalCode, pLimit) | `src/app/api/admin/shipping/batch/route.ts` |
| POST | `/api/bank-proof/url` | sesión (`401`) | URL firmada de upload al bucket `bank_proofs` (zod `422`, cap 10MB) | `src/app/api/bank-proof/url/route.ts` |
| POST | `/api/checkout` | pública (checkout guest) + integridad de precios `422 price_mismatch` | crea orden; idempotente (`200 already_processed`); DLQ en error; email Resend | `src/app/api/checkout/route.ts` |
| GET | `/api/cron/cultura-sync` | `Bearer CRON_SECRET` | sync de cultura desde social (fuente QStash) | `src/app/api/cron/cultura-sync/route.ts` |
| GET | `/api/cron/fx` | `Bearer CRON_SECRET` | refresh de cotizaciones (frankfurter + fallback tabla `fx_rates`) | `src/app/api/cron/fx/route.ts` |
| GET | `/api/cron/keepalive` | `Bearer CRON_SECRET` | probe + insert en `keepalive_logs` (heartbeat) | `src/app/api/cron/keepalive/route.ts` |
| GET | `/api/health` | pública | salud compuesta `{status, checks, elapsed}` `200/503` | `src/app/api/health/route.ts` |
| GET | `/api/health/live` | pública | liveness `{status:'ok', live:true}` | `src/app/api/health/live/route.ts` |
| GET | `/api/health/ready` | pública | readiness: db + cache Upstash + storage (`200/503`) | `src/app/api/health/ready/route.ts` |
| POST | `/api/internal/audit` | `Bearer AUDIT_INGEST_SECRET` | ingesta de eventos de seguridad en `security_logs` (allowlist `turnstile_403`, `rate_limit_429`, `rbac_403`; cap 8KB; `202`; GET → `405`) | `src/app/api/internal/audit/route.ts` |
| POST | `/api/shipping/rates` | pública + tier `shipping` | tarifas de courier (fan-out con cache, zod `422`, `413`) | `src/app/api/shipping/rates/route.ts` |
| GET | `/api/social/stats` | pública + tier `social` por plataforma (`422` inválida) | stats sociales con `Cache-Control: s-maxage=86400` | `src/app/api/social/stats/route.ts` |
| GET, POST | `/api/webhooks/mercadopago` | HMAC `x-signature` | webhook de pagos (procesa POST; resto → `405`) + dedup `processed_events` | `src/app/api/webhooks/mercadopago/route.ts` |
| POST, GET | `/api/webhooks/paypal` | HMAC `paypal-transmission-sig` | idem PayPal | `src/app/api/webhooks/paypal/route.ts` |
| POST, GET | `/api/webhooks/stripe` | HMAC `stripe-signature` | idem Stripe | `src/app/api/webhooks/stripe/route.ts` |
| GET | `/auth/callback` | pública (code OAuth) | `exchangeCodeForSession` → redirect (`/login?error=auth` en fallo) | `src/app/auth/callback/route.ts` |

## Server Actions (21 exports)

| Módulo | Acciones | Auth / notas |
|---|---|---|
| `src/app/auth/actions.ts` | `login`, `signup`, `signOut`, `signInWithGoogle` | Turnstile fail-closed dentro de la acción; `AuthState {error?, ok?, message?}` |
| `src/lib/actions/cart.ts` | `addToCart`, `mergeCart`, `getCart` | identidad por cookie `trino_cart_sid`; RPCs `add_to_cart_serializable` / `merge_cart_serializable`; `409` en conflicto `23505` |
| `src/lib/actions/wishlist.ts` | `toggleWishlist`, `mergeWishlist`, `getWishlist` | misma cookie; rate limit 60/m; toggle idempotente `409` |
| `src/lib/actions/reviews.ts` | `createReview`, `moderateReview`, `toggleHelpful`, `getPresignedReviewImageUrl` | `createReview`: Turnstile + honeypot (`422` spam) + 3/h; `moderateReview`: admin; `toggleHelpful`: contador idempotente (RPC `increment_helpful`) |
| `src/lib/actions/cultura.ts` | `createCultura`, `updateCultura`, `publishCultura`, `deleteCultura` | `requireAdmin` + RPC `is_admin` |
| `src/lib/actions/cultura-bulk.ts` | `bulkCultura`, `getCulturaSeoScore`, `getCulturaVersions` | idem; zod `culturaBulkSchema` `422` |
| `src/app/[locale]/admin/cultura/page.tsx` | acción inline (sin export) | gate `is_admin` con render 403 |

## Funciones RPC de Postgres (definidas en `supabase/migrations`)

| Función | Callers verificados |
|---|---|
| `has_role(required)` | `src/proxy.ts` (RBAC), `src/app/api/admin/shipping/batch/route.ts` |
| `is_admin()` | `src/lib/actions/cultura*.ts`, páginas admin, `requireAdmin` local |
| `set_user_role` | gestión de roles admin (migración) |
| `add_to_cart_serializable` / `merge_cart_serializable` | `src/lib/actions/cart.ts` |
| `get_customer_360` | `src/lib/customer360.ts` |
| `increment_helpful` | `src/lib/actions/reviews.ts` (idempotente) |
| `keepalive_ping` / `heartbeat_select_one` | `src/lib/supabase/keepalive.ts` |
| `check_order_transition` / `enforce_order_transition` | máquina de estados de órdenes (migración) |
| `update_cultura_occ` | ocupación de cultura (migración) |
| Triggers: `handle_new_user_claims`, `handle_new_user_profile`, `touch_updated_at`, `products_tsvector_update`, `cultura_tsvector_update` | auth users / auditoría / tsvector |

## Variables de entorno (solo nombres, jamás valores)

`CRON_SECRET`, `CRON_ALLOW_UNSET_SECRET` (solo dev), `AUDIT_INGEST_SECRET`, `MERCADOPAGO_WEBHOOK_SECRET`, `PAYPAL_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SUPABASE_SERVICE_ROLE` (audit ingest), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL`.

## Re-verificación (gate del doc)

```bash
rg --files src/app/api -g 'route.ts' | sort        # debe dar 16
rg -l "'use server'" src/app src/lib               # módulos de acciones
rg -n "\.rpc\(" src --type ts | sort               # llamadas RPC
```

Cualquier endpoint de este doc debe resolvar a un archivo real con esos comandos. Verificado por última vez: 2026-10-17 (branch `orn-206/design-qa-gate`).
