# TRINO — Secrets & env register (ORN-143 / t_d3e7da64)

> **Búsqueda:** keywords: `trino, secrets, env, turnstile, upstash, resend, mercadopago, stripe, paypal, cron-secret, audit-ingest, orn-143, paradero-claves` · clasificación: `ops/runbook` · estado: canónico · actualizado: 2026-10-07

**Regla dura:** en este documento NO hay valores de secrets — solo paradero, emisor y procedimiento de recuperación. Los valores viven únicamente en `.env` (gitignored) y en los dashboards de cada tercero.

## Contexto del incidente (por qué faltan los secrets)

El 2026-09-18/19 una sesión de configuración de flota sobrescribió `E:/Hermes/projects/TRINO/.env` (y el de otros 7 proyectos) con una única línea `TDD_MODE=on` (`echo "TDD_MODE=on" > /e/$d/.env`), destruyendo el contenido previo. Evidencia: request dump de sesión `20260909_131745_4fe796` (outputs @221247/@224325 en Hermes sessions). El `.env` previo al incidente — reconstruido desde el mismo dump — solo contenía 4 vars Supabase (`SUPABASE_PROJECT_NAME/PROJECT_ID/URL/PUBLISHABLE_KEY`) del CLI local en la ubicación original del repo (`E:/sitios web E/santisima-trinidad/`, hoy vacía). **Conclusión clave: los secrets de terceros (Turnstile, Upstash, Resend, MP, Stripe, PayPal) nunca existieron en disco** — el proyecto se deployó a Vercel como `santisima-trinidad` (team `ornellas-projects`) con TODOS sus builds en estado `failure` (BUILD ROJO, 10 deployments GitHub 28-09 → 07-10, sin ninguno exitoso), por lo que tampoco se puede recuperar nada del bundle. Los PATs de GitHub que sí existían en el viejo `.env` (líneas 10-11, ticket ORN-198) deben rotarse desde siempre: no se copian.

## Registro por variable

Estado: `presente` (en `.env` con valor) · `regenerada` (flota generó valor nuevo, consumers a actualizar) · `pending owner` (requiere dashboard/cuenta del owner; placeholder comentado en `.env`).

| Variable | Emisor | Paradero / cómo recuperar | Estado |
|---|---|---|---|
| `TDD_MODE` | Flota (flag runtime) | Flag de flota, no de la app. Valor `on` | presente |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Dashboard Supabase ref `asbyqyxrpfggxjujfqte` → Settings/URL; hermana 06-dba la verificó viva (PostgREST 200) | presente |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Dashboard → Settings → API → `anon`/`publishable` key | presente |
| `SUPABASE_SERVICE_ROLE` | Supabase | Dashboard → Settings → API → `service_role`. **Solo server; jamás NEXT_PUBLIC ni client** | presente |
| `NEXT_PUBLIC_SITE_URL` | Flota | URL pública del deployment; default Zod `http://localhost:3000` | presente (localhost) |
| `TURNSTILE_SECRET_KEY` | Cloudflare | **pending owner**: Cloudflare dashboard → Turnstile → widget del dominio → copiar Secret Key. La rama `fix/a01-auth-turnstile` verifica login/signup fail-closed con esta clave (reporte `DOCS/reports/2026-09-28-a01-turnstile-auth.md`): sin ella el login queda bloqueado por diseño | pending owner |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare | **pending owner**: mismo widget Turnstile → Site Key (pública). Se inlinea en el build; requiere rebuild al cambiarla | pending owner |
| `UPSTASH_REDIS_REST_URL` | Upstash | **pending owner**: dashboard.upstash.com → base Redis → REST API. En su ausencia el boot exige `ALLOW_MEMORY_RATE_LIMIT=true` (seteado) | pending owner (vacía) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | **pending owner**: misma pantalla Upstash → REST API TOKEN | pending owner (vacía) |
| `ALLOW_MEMORY_RATE_LIMIT` | Flota (flag) | Escape de rate-limit in-memory sin Upstash. `true` mientras no haya par Upstash (schema Zod superRefine) | presente (`true`) |
| `AUDIT_INGEST_SECRET` | Flota (generada) | Regenerada 2026-10-07 por 22-ops (`openssl rand -hex 32`). Consumers a actualizar al rotar: `src/app/api/internal/audit/route.ts`, `src/lib/proxy/turnstile.ts` (la referencia viva vive en `.env`) | presente (regenerada) |
| `RESEND_API_KEY` | Resend | **pending owner**: resend.com → API Keys (cuenta dueña del dominio). Rotar la expuesta en history previo (mem #1238: 403 en cron de flota — esa es otra key, de Hermes, no reutilizar) | pending owner |
| `EMAIL_FROM` | Owner | **pending owner**: dirección verificada en Resend (dominio del sitio). Sin ella cae a `onboarding@resend.dev` | pending owner |
| `EMAIL_TEST_MODE` | Flota (flag) | `test` envía al sandbox de Resend; `live` a clientes reales. Default por código: test | presente (`test`) |
| `EMAIL_TEST_TO` | Flota (flag) | Recipiente en modo test: `delivered@resend.dev` (sandbox Resend) | presente |
| `CRON_SECRET` | Flota (generada) | Regenerada 2026-10-07 por 22-ops (`openssl rand -hex 32`). Consumers: `/api/cron/keepalive`, `/api/cron/cultura-sync`, `/api/cron/fx` (bearer auth fail-closed, `src/lib/cron/auth.ts`) + Vercel Cron headers | presente (regenerada) |
| `CRON_ALLOW_UNSET_SECRET` | Flota (flag) | Solo con `NODE_ENV=development`; explícito `false` | presente (`false`) |
| `MERCADOPAGO_WEBHOOK_SECRET` | MercadoPago | **pending owner**: MP dashboard (cuenta vendedora) → Aplicación → Webhooks → clave secreta para validar firma `x-signature` | pending owner |
| `PAYMENTS_STRIPE_ENABLED` | Flota (flag) | Feature-flag Stripe off hasta integración real | presente (`false`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | **pending owner** (solo si se habilita Stripe): dashboard.stripe.com → Developers → Webhooks → signing secret `whsec_...` | pending owner |
| `PAYPAL_ENABLED` | Flota (flag) | Feature-flag PayPal off hasta integración real | presente (`false`) |
| `PAYPAL_WEBHOOK_SECRET` | PayPal | **pending owner** (solo si se habilita PayPal): developer.paypal.com → Webhooks → shared secret / `verification_url` | pending owner |
| `SHIPPING_INTERNATIONAL_ENABLED` | Flota (flag) | Envío internacional off por default (`src/lib/shipping/carriers/international.ts`) | presente (`false`) |
| `NEXT_PUBLIC_EASTER_ENABLED` | Flota (flag) | Easter egg ON por default en código (`!== 'false'`); explícito `true` | presente (`true`) |

## Gaps de coherencia `.env.example` ↔ `src/config/env.ts` (T4b, documentados)

1. `NODE_ENV` se lee en código pero no está en `.env.example` — correcto: es runtime de Next, no se provisiona.
2. `ALLOW_MEMORY_RATE_LIMIT` aparece "sin consumer en src" solo porque se consume vía el schema Zod (`src/config/env.ts:16`), no directo — falso gap.
3. `TDD_MODE` está en `.env` pero no en `.env.example` — flag de flota, no de la app; correcto que no esté en el template.
4. **14 vars se leen `process.env.X` directo sin gate Zod** (`CRON_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM/TEST_MODE/TEST_TO`, `MERCADOPAGO_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_WEBHOOK_SECRET`, `PAYMENTS_STRIPE_ENABLED`, `PAYPAL_ENABLED`, `SHIPPING_INTERNATIONAL_ENABLED`, `NEXT_PUBLIC_EASTER_ENABLED`, `CRON_ALLOW_UNSET_SECRET`): no rompen boot (falls graciosos por código), pero no tienen el fail-loud del schema. Candidato a deuda menor si se quiere uniformidad.
5. `.gitignore:23` usa `.env*` con negación `!.env.example` (:26) — patrón correcto ya adoptado (gap F0 cerrado).

## Procedimientos para el owner

- **Turnstile (bloqueante para prod)**: Cloudflare dashboard → Turnstile → Add widget (dominio del sitio) → copiar Site Key + Secret Key a los env vars de Vercel y al `.env` local. Ver `DOCS/reports/2026-09-28-a01-turnstile-auth.md` § Deploy.
- **Upstash**: crear base Redis → REST API (URL+TOKEN) → reemplazar `ALLOW_MEMORY_RATE_LIMIT=true` por el par real (dejar `true` hace el rate-limit in-memory, no durable).
- **Resend**: crear/ingresar a la cuenta → API Key → verificar dominio y `EMAIL_FROM` → pasar `EMAIL_TEST_MODE=live` recién cuando el dominio esté verificado.
- **MercadoPago**: cuenta vendedora → Webhooks → copiar secret → el consumer valida `x-signature` (HMAC).
- **Rotación AUDIT_INGEST_SECRET / CRON_SECRET**: regenerar (`openssl rand -hex 32`), actualizar `.env` local + env vars de Vercel en el mismo cambio (los cron routes y el audit route rechazan distinto al valor viejo — fail-closed).

## Verificación (receipts 2026-10-07)

- `grep -c '^[A-Z]' .env` → **17** vars definidas (4 preservadas de 06-dba + 13 de 22-ops; todas las del Zod schema cubiertas con valor o placeholder explícito `# pending owner`).
- `git ls-files .env.example` → tracked; `.env` → ignorado (`.gitignore:23` + `!.env.example:26`).
- Este register cubre las 24 vars del `.env.example` + `TDD_MODE`.
