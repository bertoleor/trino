# Gap Analysis: ecommerce-high-end-constitution — Specs vs PRs/Tasks/Tests

> Workspace: `E:\sitios web E\santisima-trinidad` | Date: 2026-09-03 | Branch up to `c411dfc` (PR6 complete, 215 tests claimed) | Audited by general-agent
> Sources: `specs/*/spec.md` (10 present), `proposal.md`, `design.md`, `tasks.md` (66 tasks, 8 PRs), `git log --oneline -40`, `tests/unit/*.test.ts` (53 files), `src/lib/**`, `supabase/migrations/0001..0014`, `DOCS/legal/*` + catalog + checklist, `package.json`, `next.config.ts`, `src/proxy.ts`, `src/app/api/**`

## Methodology

For each spec requirement/scenario trace (`GIVEN/WHEN/THEN`), status:

- **COVERED** — task exists + code exists + test asserts behavior (not just string-match) + migration/contract present
- **PLANNED** — task exists (T-*) but PR7-8 pending or code not yet merged (checked `git log`, file exists check)
- **SHALLOW** — task checked `x` and file+test exist but test depth = string-match (`expect(c).toMatch(/401/)`), no integration/EXPLAIN/RLS/load/fuzz, or implementation stubbed (`void 'SERIALIZABLE'`, `fake-carrier.example`, in-memory Map instead of Upstash)
- **MISSING** — no task, no migration, or spec requirement has zero trace in tasks.md

Risk: **High** = PCI/money/double-sell/auth bypass/data loss or launch-blocking legal; **Med** = quota/SEO/perf degradation; **Low** = DX/docs.

---

## 1. Full Trace Matrix

### A. security-resilience (`spec.md` 3 Requirements, 6 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Headers (SEC-05):** CSP strict, HSTS 63072000, DENY, nosniff, Referrer | **SHALLOW** | T-A04 | PR1 | `next.config.ts:18-42` sets 5 headers — correct values — but CSP has `'unsafe-inline' 'unsafe-eval'` (violates spec "blocks inline unsafe"), no test for exact value per header, no nonce/hash | **High** |
| **XSS HttpOnly exfiltration** | **SHALLOW** | T-C04 | PR4 | `proxy.ts:44-64` sets `httpOnly:true` — but `path="/ "` always Lax, never Strict for `/admin` per COOKIE-02; test `t-c04-proxy.test.ts:35` only string-matches `httpOnly` | **High** |
| **CORS-WH POST-only HMAC-only 1MB** | **COVERED** (shallow) | T-C02 T-C06 | PR4 | `src/app/api/webhooks/mercadopago/route.ts:14-27` implements POST 405 + 1MB + HMAC 401 — but CORS allowlist not configured, test `t-c06-cors` string-only | Med |
| **Rate limiting tiers SLidingWindow 5/15m 60/m 600/m 10/h 429+Retry-After+X-RateLimit** | **SHALLOW** | T-C01 | PR4 | `src/lib/rate-limit.ts` implements correct tiers + slidingWindow + Upstash + memory fallback — **but** `security_logs` append on breach missing (SLOG-02), no IP block after 5 fails/10min, test `t-c01-rate-limit.test.ts` calls real `checkRateLimit` in-memory only, no Redis integration, no 429 header propagation test for proxy | **High** |
| **Brute force lockout 5x→6th 429 Retry-After:900 + security_logs** | **SHALLOW/MISSING** | T-C01 | PR4 | Above — lockout 900s hardcoded but `rateLimitHeaders` never writes `security_logs`; migration `security_logs` exists (0004) but no writer caller | High |
| **Resilience: Abort 8s, circuit 3/60s → open, probe 30s half-open, pending_retry** | **SHALLOW** | T-C05 | PR4 | `src/lib/circuit.ts:7-71` correctly models states — but `withTimeout` unused (dead code), `exec` returns `{status:"pending_retry"}` typed as T (type pollution), no exponential backoff+jitter (spec RES-02), no test for state transition timing (fake timers), test `t-c05-circuit.test.ts` string-only | **High** |
| **Payment API down → "Reintentaremos" pending_retry no 500** | **MISSING** | — | — | No checkout code consuming circuit `pending_retry` to show locale empathetic message; no `instrumentation.ts` OTel span for failure | Med |
| **Secrets via env.ts Zod fail-closed PUBLIC/SERVER/CRITICAL** | **COVERED** | T-A03 | PR1 | `src/config/env.ts` exists, test `t-a03-env.test.ts:48` — but pinned deps (SEC-08) not enforced (no audit CI job) | Med |
| **Missing env boot listing** | **COVERED** | T-A03 | PR1 | Zod throw lists missing vars — ok | Low |
| **Turnstile + Honeypot (SEC-03)** | **SHALLOW** | T-C04 | PR4 | `proxy.ts:24-38` verifyTurnstile true when secret absent (bypass), only guards `/api/contact`+`reviews`, honeypot via `x-honeypot` header only; no T-G02 honeypot field per spec | Med |
| **Security alerts: new country, role grant, bulk>1k (SLOG-02)** | **MISSING** | — | — | Zero implementation, no task maps to this — spec requires email alert, not just `security_logs` | Med |

**Findings:** HMAC constant-time is correctly using `timingSafeEqual` but payload canonicalization is wrong: MP sends `x-signature: ts=...,v1=hmac` — current `verifyHmac(raw, signature, secret)` does `hmac(raw)=hex` vs raw header value → always fails unless MP sends just hex. No test vectors. RLS `wishlists` has open `for all using (true)` (0013) → anon session isolation bypassed (HIGH). `is_admin()` SECURITY DEFINER is correct per Context7/Supabase best practice (avoid `IN SELECT`), but `carts`/`wishlists` policies mix `public.is_admin()` correctly — however `entitlements` role check only allows `admin|customer` not `super_admin|editor|viewer` per ADMIN-04 (gap).

### B. money-arithmetic (`spec.md` 3 Req, 5 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **INTEGER centavos ARS CHECK currency='ARS'** | **COVERED** | T-B01 T-B02 | PR2 | `0002_money_int.sql:2-15` correct — but old `price numeric` never dropped (expand phase stuck); no `NOT VALID`→`VALIDATE` transition | **High** |
| **Storage invariant AR$1.999,90→199990 400 reject non-ARS** | **COVERED** | T-B03 | PR2 | `src/lib/validations/money.ts:toCents` handles AR$+`1.999,90` via `replace(/\./g,'').replace(',', '.')` — correct; test `t-b03` covers | Low |
| **Float prohibition ESLint/TS fail on number arithmetic** | **SHALLOW** | T-A01 T-B03 | PR1-2 | ESLint 150-line + strict exists but no rule banning `price * 0.21` float; relies on convention, not `no-restricted-syntax`; test does not run ESLint | Med |
| **Multi-step Decimal HALF_UP/DOWN via Decimal.js** | **SHALLOW** | T-B03 | PR2 | Spec mandates `Decimal.js` — `package.json` has **no dependency** `decimal.js` (only zod); `src/lib/validations/money.ts:9-11` implements `Math.round` as alias for HALF_UP, no HALF_DOWN path, no split logic; test `HALF_UP rounds 0.5 cent` passes but drift under IEEE 754 not proven (e.g. `0.21*100`) | **High** (money drift) |
| **Cart total 2×199990+shipping+10%+21% IVA snapshot 1c** | **COVERED** (shallow) | T-B03 | PR2 | `calcCartTotal` integer-only, snapshot `617078 ±1` correct — but tax-on-discounted-subtotal order not documented per calculation; missing ROUND_DOWN internal split case | Med |
| **Sale price integrity window UTC tachado** | **COVERED** | T-B03 | PR2 | `getEffectivePriceCents` UTC compare correct, test covers | Low |
| **expand→backfill→dual→drop lifecycle** | **SHALLOW** | T-B01 | PR2 | Migration does `ADD nullable → backfill ROUND(price*100)` but never dual-write nor contract DROP; tasks.md never schedules T for DROP (needs post-verification migration) | Med |

### C. concurrency-inventory (`spec.md` 2 Req, 4 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **OCC Level1 admin `expected_updated_at` → 409 reload_required** | **MISSING** | — | — | Spec CONCURRENCIA-01 L1 — zero tasks map to OCC; `src/lib/actions/cultura.ts` does blind `update(...).eq('id')` without `updated_at` guard; test suite has no 409 for catalog edits | **High** |
| **Admin OCC conflict scenario** | **MISSING** | — | — | No `version`/`updated_at` hidden input, no 409 handler toast | High |
| **SERIALIZABLE/FOR UPDATE stock decrement (L2)** | **SHALLOW** | T-D04 | PR5 | `src/lib/actions/cart.ts:15-27` delegates to RPC `add_to_cart_serializable`/`merge_cart_serializable` — but **those functions do not exist** in any migration (grep `rpc` only in app code); cart.ts also has `void 'SERIALIZABLE FOR UPDATE'` string literal to satisfy tests; test `t-d04-cart.test.ts` only checks regex `/SERIALIZABLE|FOR UPDATE/` in file, never executes transaction | **High** |
| **Concurrent checkout stock=1 → one commits, one "Sin stock"** | **SHALLOW** | T-D04 | PR5 | Same stub above — no k6/load test, no `SERIALIZABLE` isolation proof, no `EXPLAIN` for lock contention | High |
| **Pagination 25/100 PERF-01 EXPLAIN<10k** | **COVERED** (shallow) | T-D01 | PR5 | `src/lib/db/pagination.ts:8-22` correctly clamps 25 default /100 max — but no integration test at 500 SKUs, no `EXPLAIN ANALYZE` cost gate (T-B01b only for migrations) | Med |
| **Admin /admin/products 500→25 fetched** | **SHALLOW** | T-D01 | PR5 | Logic exists, but `/admin` page not paginated — `src/app/(admin)` still loads all (exploration phase noted `limit 12` band-aid not paginated) — no Playwright proof | Med |
| **Single round-trip join, no N+1 in loops** | **SHALLOW** | T-D01 | PR5 | No audit for N+1 (e.g., `cart_items`→`products` loop not checked); `facets.ts` exists but shallow | Med |
| **FTS to_tsvector + GIN` (DB-07)** | **COVERED** | T-B02 T-D01b | PR2/PR5 | `0003_softdelete_fts.sql:6-9` GIN + trigger correct, `facets.ts` FTS query — but missing `pg_trgm` typo tolerance per ECOM-01 / spec `fuzzy typo tolerance via FTS+pg_trgm` — `pg_trgm` extension never enabled | Med |
| **Every FK has index IDX-01** | **COVERED** | T-B06 T-E01 etc | PR2-3 | FK indexes added per migration — ok | Low |
| **BroadcastChannel cross-tab logout** | **MISSING** | — | — | PERF-04 trace present in spec but zero task or code; no `BroadcastChannel('auth')` on logout | Med |

### D. shipping-carriers (`spec.md` 2 Req, 4 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Strategy Andreani/Correo/OCA + POST /api/shipping/rates** | **SHALLOW** | T-D03 | PR5 | `src/lib/shipping/index.ts:12-26` implements Strategy factory — but carrier list hardcoded 3, no real Andreani API (uses `https://fake-carrier.example`), **no route file** `src/app/api/shipping/rates/route.ts` found — grep `api` shows only `bank-proof`, `cron`, `health`, `social`, `webhooks`; spec contract unexposed | **High** |
| **Upstash session+CP+hash 60/300 s-maxage/stale** | **SHALLOW** | T-D03 | PR5 | Cache uses `Map` `MEM` in-memory (fails on serverless scale — Upstash Redis not used); key `ship:${session}:${postalCode}:${hash}` correct but `weightHash` reduces to sum(weight) lossy (collides); no `X-Cache: HIT` header returned by missing route; test `t-d03-shipping` only checks `redis|cache` string | **High** |
| **Cached quote same CP 60s → HIT no external call** | **SHALLOW** | T-D03 | PR5 | In-memory HIT works single-instance — fails across Vercel lambdas; no Upstash SETEX NX, no SWR serve-stale | Med |
| **p-limit x5 + backoff jitter 5 retries, 429→DLQ** | **MISSING** | T-D03 (spec) | PR5 | Code does `for (const c of targets) try...catch{}` sequential no concurrency, no `p-limit`, no jitter; `package.json` has **no `p-limit`** dep; no DLQ table for shipping | **High** (quota burn) |
| **Fallback fixed_shipping_cents from global_settings** | **SHALLOW** | T-D03 | PR5 | Fallback hard-coded `199900` not read from `global_settings`/`tenants` (CMS-01 violation); no DB query | Med |
| **Circuit 8s Abort, 3/60s open, 30s half-open probe** | **COVERED** | T-C05 T-D03 | PR4-5 | `createCircuitBreaker` correctly models — but not wired per-carrier independently in real fetch (shared `MEM` hides failure isolation) | Med |
| **Labels A4/ZPL via carrier API, batch by postal_code p-limit SSE >100** | **MISSING** | JOBS-02 trace | — | No label code anywhere — LOG-01/02/03 deferred; no task beyond T-D03 | **High** (scope creep) |
| **Shipping cost before payment step** | **MISSING** | ECOM-06 trace | — | No PDP/checkout UI wiring in tasks beyond rates lib | Med |
| **International 4th carrier DHL flag** | **PLANNED** | T-D03b | PR6 | `src/lib/shipping/carriers/international.ts` exists per `t-d03b-international.test.ts:29` — SHALLOW: flag `SHIPPING_INTERNATIONAL_ENABLED=false` stub, test string-only, not integrated into main Strategy, fallback flat customs not per-spec | Med |

### E. i18n-routing (`spec.md` 2 Req, 6 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **next-intl [locale]/ 4 locales es-AR default, 308 /** | **COVERED** | T-A07 | PR1 | `src/i18n/routing.ts` exists, test `t-a07-i18n` — but middleware composition order wrong: `proxy.ts:95` runs `intlMiddleware` AFTER rate-limit but returns its 308 only if status 300-400, otherwise falls through to `updateSession` which may double-redirect; no E2E for `/`→`/es-AR/` | Med |
| **Missing key fallback es-AR + MISSING_KEY log** | **SHALLOW** | T-A07 | PR1 | Routing has fallback, but no `onError` `MISSING_KEY` logger configured; test string-only | Low |
| **messages/{locale}/{6ns}.json single source 6 namespaces** | **COVERED** | T-A07 | PR1 | Files exist per deploy — need zero-literals audit (no ESLint `i18n/no-literals`) | Low |
| **hreflang x4 + sitemap 500** | **SHALLOW** | T-D02b T-D01c | PR5 | Hreflang via `generateMetadata alternates.languages` should exist but not tested in `t-d02b-jsonld`; **no `app/sitemap.ts`** for 500 SKUs — `next.config.ts` cache headers reference `/tienda` but sitemap missing; Lighthouse-perf not linked | **Med** (SEO) |
| **Zero string literals t() ICU plural** | **SHALLOW** | T-A08 | PR1 | No automated `no-literals` rule; depends on discipline; tasks claims zero literals but not enforced | Med |
| **Intl currency ARS centavos + dates IANA UTC DB** | **COVERED** | T-B03 | PR2 | `formatCents` uses `Intl.NumberFormat` correct | Low |
| **Emails in recipient locale via react-email+next-intl 3-step fallback** | **SHALLOW** | T-D06 | PR6 | `resend` via QStash queued but no `react-email` template per locale, no `I18N-COMM` triple fallback; spec requires emails use fr if user pref fr even when session es-AR — not implemented | Med |

### F. performance-scalability (`spec.md` 2 Req, 4 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Pagination 25 default 100 max** | **COVERED** | T-D01 | PR5 | Implemented — ok | Low |
| **Virtualization >50 via @tanstack/react-virtual** | **SHALLOW** | T-D02 | PR5 | `src/components/shared/virtual-list.tsx` should use `useVirtualizer` — test `t-d02-virtual.test.ts:22` only checks existence, not viewport DOM win; dep installed `3.13.12` ok but no LH perf ≥90 gate | Med |
| **WebP/AVIF Edge + BlurHash, original never served** | **SHALLOW** | T-D02c | PR5 | `next.config.ts:10-16` remotePatterns + AVIF/WebP ok, but no Edge Function blur generator (PERF-07), no `plaiceholder` dependency, `minimumCacheTTL 60` not per-spec | Low |
| **Presigned >2MB Storage /{org}/{entity}/{uuid} 10MB/1GB** | **COVERED** | T-C03 T-D02c | PR4-5 | `src/app/api/bank-proof/url/route.ts:22-33` 10MB + presigned via Supabase — but path `bank_proofs/{orderId}/{uuid}.{ext}` not `/{org}/{entity}/{uuid}` per STOR-01 | Low |
| **Brotli gzip >1KB** | **COVERED** (shallow) | T-A04 | PR1 | `next.config.ts:19 compress:true` + `1KB` heuristic via Vercel auto — ok but no test for response header | Low |
| **Cache-Control tiers immutable 1y / private no-cache / public s-maxage 60 swr 300 / HTML must-revalidate + ETag 304** | **SHALLOW** | T-A04 T-D01c | PR1/PR5 | `_next/static` immutable 1y ok, `public s-maxage 60 swr 300` only for `/api/catalog`+`/tienda`+`/cultura` — missing `private no-cache` for `/admin` `/account` `/api/*` user data; ETag 304 not implemented (requires custom handler) | Med |
| **Cache stampede mutex/XFetch (PERF-05)** | **MISSING** | PERF-05 trace | — | Zero code: searched `src/lib/perf/mutex.ts` not found, `budget.ts` only has thresholds; `MEM` Map without mutex races on expired cold start | **Med** |
| **Abort 8-10s every fetch** | **SHALLOW** | T-C05 | PR4 | Circuit has 8s but shipping fake fetch uses `AbortSignal.timeout(8000)` — ok — but catalogue fetches not wrapped | Low |
| **Orphan GC weekly STOR-02** | **MISSING** | STOR-02 trace | — | No cron/Upstash job de-duplicating `bank_proofs` orphans; 1 GiB free storage risk (see checklist) | Med |
| **p95<2s, initial load <200ms async, 44px thumb w-full mobile** | **SHALLOW** | T-D01c T-K02 | PR5-6 | `PERF_BUDGET` asserts correct, but LH CI (`lighthouserc.json` not found in repo), no 44px audit per component beyond string `void 44` | Low |
| **Dynamic import heavy lists (PERF-03)** | **MISSING** | PERF-03 trace | — | No `next/dynamic` for virtual-list or cultura; bundle not split | Low |

### G. payments (`spec.md` 3 Req, 6 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **MP zero-PAN Bricks tokenized SERVER-only** | **SHALLOW** | — | — | `env.ts` SERVER-only ok but no Bricks component code anywhere — no `src/lib/payments` exists; tasks claims MP but no file implements preference creation (`POST /api/checkout`) | **High** |
| **Tokenized checkout DB line_items from DB cents + init_point** | **MISSING** | — | — | No checkout route; price integrity recomputation not coded | High |
| **Raw price tamper 422 price_mismatch** | **MISSING** | — | — | Spec requires server recomputes total from DB vs client total — zero Server Action does this | High |
| **Webhook HMAC only 401, DLQ, dedup PK, 1MB** | **COVERED** (shallow) | T-C02 T-C06 | PR4 | Route exists with 401/duplicate 200/DLQ `failed_webhooks_log` — but constant-time vector incomplete (see §A), DLQ only catches inner try (outer catch also inserts but success path never inserts `failed_webhooks_log` on non-exception business rule fail) | High |
| **Duplicate delivery dedup idempotency** | **COVERED** | T-C02 | PR4 | `processed_events PK` + `23505` guard correct | Low |
| **HMAC failure 401 never reaches business logic** | **COVERED** | T-C02 | PR4 | Correct order — HMAC before JSON parse | Low |
| **Bank transfer pending_verification + presigned bank_proofs/{order}/{uuid} STOR-01 PERF-06 <200ms** | **COVERED** (shallow) | T-C03 | PR4 | `bank-proof/url/route.ts:38` presigned + <200ms via `Date.now` elapsed — but no DB `orders.status='pending_verification'` creation, no `storage_path` persistence, no QStash→Resend email queuing in request path (spec requires async email not in request) — route only returns url | **High** |
| **Comprobante upload flow Storage hold + DB path + emails queued** | **SHALLOW** | T-C03 | PR4 | Missing email queue; no `on upload` webhook/trigger | Med |
| **Admin approve pending_verification→authorized audit idempotent 72h cancel** | **SHALLOW** | T-D06 T-D07 | PR6 | `0008_cron.sql` hourly does `status='canceled'` correctly idempotent — but `src/lib/orders/bank-cancel.ts:14` `cancelExpiredPendingVerification` returns `{canceled:0}` never counts rows; re-entry stock hold not modeled (SERIALIZABLE hold spec claims "stock already decremented via SERIALIZABLE holds" — but bank flow holds not deducted) | Med |
| **Bank proof presigned 10MB 72h auto-cancel** | **COVERED** | T-D07 | PR6 | `T-D07` migration + lib — ok but test `t-d07` allows file absence | Low |
| **Stripe/PayPal intl flag + zero-PAN + webhook HMAC cert + DLQ** | **PLANNED** | T-J02 | PR8 | Task exists, not implemented — flag `PAYMENTS_STRIPE_ENABLED=false` not present yet | Med |

### H. ecom-engine (`spec.md` 3 Req, 5 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Anon cart DB session_id (ECOM-01) prohibited localStorage-only** | **COVERED** (shallow) | T-B06 T-D04 | PR3/PR5 | Migration `0006_carts_session.sql:6-22` correct + RLS; actions exist — but RLS `carts "own carts"` requires `auth.uid()=user_id` so anon has zero DB access (falls through); proxy never creates `session_id` cookie | Med |
| **Guest adds then login → merge capped at stock (ECOM-02)** | **SHALLOW** | T-D04 | PR5 | `mergeCart` delegates to missing RPC — no `SUM qty capped at stock` logic visible; no test for 2×A +1×A →3× capped; optimistic rollback toast not tested | **High** |
| **Optimistic add rollback 409 stock exhausted locale toast** | **SHALLOW** | T-D04 | PR5 | `addToCart` returns 409 but no component shows toast in locale — string `void 'optimistic'` only | Med |
| **ENUM draft→pending→pending_verification→authorized→processing→shipped→delivered→canceled→refunded + 422 trigger** | **COVERED** | T-B07 | PR3 | `0007_order_enum.sql:11-33` CHECK + transition fn `422 hint` correct; missing app-layer Zod enum sync (`T-B07` test string-only) | Low |
| **Invalid state jump pending→shipped 422** | **COVERED** | T-B07 | PR3 | Trigger raises `P0001` → app should map to 422 but `src/lib/actions` never calls transition helper | Med |
| **Sale price parallel + discount % calc** | **COVERED** | T-B03 | PR2 | Done via `getEffectivePriceCents` | Low |
| **DOC-01 footer disclaimer on receipt PDF** | **MISSING** | T-C07 | PR4 | `docs/LEGAL.md` has disclaimer but no receipt PDF generator exists — no `src/lib/receipts` | Med |
| **Abandoned cart >4h pg_cron hourly QStash→Resend recipient locale** | **SHALLOW** | T-D06 | PR6 | Migration `0008` schedules `abandoned-cart-hourly` hourly + `abandoned_cart_logs` — but `/api/cron/abandoned-cart` route missing (grep `cron` shows only `cultura-sync` and `keepalive`); QStash signing not verified; Resend locale not wired | Med |
| **Triple taxonomy tipo10/tradicion9/intencion7 combinable FTS+pg_trgm** | **COVERED** (shallow) | T-D01b | PR5 | `src/lib/db/facets.ts` exists per `t-d01b-facets:36` — but needs EXPLAIN for combined facet intersection single round-trip proof | Low |
| **Origin/context block + disclaimer per tradition** | **PLANNED** | ECOM-01 trace | — | No component yet — brand `marca.md §4` gap | Low |
| **Consent banner granular gating** | **COVERED** | T-C05b | PR4 | `cookie-consent.tsx` + `consent.json` + privacy — but marketing gate for `abandoned cart` email not enforced | Low |
| **Fuzzy typo tolerance FTS+pg_trgm (DB-07)** | **MISSING** | — | — | `pg_trgm` never enabled — `create extension if not exists pg_trgm` absent | Low |

### I. observability-health (`spec.md` 2 Req, 4 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Structured logger OTel+Sentry instrumentation.ts UTC fields** | **SHALLOW** | T-A06 | PR1 | `src/lib/logger.ts` exists, `t-a06-logger:32` — but no `instrumentation.ts` register (Next 16 requires `instrumentation.ts` at root); no OTel exporter config, no `userId/organizationId/requestId/route/severity/stack/environment` fields asserted | Med |
| **Alerts >1% per 5min, p95>2s, any DLQ insertion** | **MISSING** | OBS-01 trace | — | No Vercel alert integration, no DLQ counter increment for admin dashboard (spec requires dashboard counter within 1min) | **Med** |
| **SecurityLogs retained 1yr (SLOG-03)** | **COVERED** (shallow) | T-B04 | PR3 | Table + index exists — but no pg_cron purge job at 365d; no `WHERE created_at < now()-1yr` cron | Low |
| **Build zero warnings CI block** | **COVERED** | T-A01 | PR1 | `t-a01-guardrails` + `vercel.json`? Build gate not visible in CI (no `lint --max-warnings=0`) | Low |
| **GET /health live/ready 2s/1s/2s 200{ok,checks} or 503** | **SHALLOW** | T-D05 | PR5 | `src/app/api/health/route.ts:5-38` implements 2s DB timeout but storage check is `Promise.resolve(true)`, redis check stubbed, no `live` vs `ready` split (spec HEALTH-02 requires separate `/live` and `/ready` — `adomin-health` dashboard cannot distinguish); returns 503 on degraded DB correct, but latency not measured with 1s Redis/2s Storage as spec | **High** |
| **Degraded DB → 503 degraded checks.db=fail** | **COVERED** (shallow) | T-D05 | PR5 | Returns 503 but uses `fetch HEAD rest/v1/` not `SELECT 1` (misleading) | Med |
| **ErrorBoundary root+checkout+admin/*+data levels reporting to logger** | **SHALLOW** | T-D09 | PR6 | Task claims `ARCHITECTURE.md Storybook Boundary <1s` — but no `src/components/shared/error-boundary.tsx` or `error.tsx`/`global-error.tsx` files listed; test `t-d09-architecture:21` string-only | Med |
| **Realtime cleanup on unmount ERR-02** | **MISSING** | ERR-02 trace | — | No Realtime subscription code anywhere | Low |
| **Coverage 90% critical /80% global + sad paths** | **SHALLOW** | T-D08 | PR6 | `vitest.config.ts:14-20` thresholds 90 for `env.ts/logger/validations` + 80 global — correct config — but no actual coverage report (`pnpm test:coverage` never run in CI), seeds exist but factories not counted | Med |

### J. admin-backoffice (`spec.md` 3 Req, 6 scenarios)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Zero dead buttons ARCH-05 triple (auth+ownership+Zod)** | **SHALLOW** | T-D04 T-E02 etc | PR5 | Actions have `requireAdmin` checks per file — but no repo-wide audit `grep "onClick.*{}"` or Playwright smoke 0-dead-buttons; spec requires CI fails if any button unwired | Med |
| **Dead button audit CI/Playwright** | **MISSING** | ADMIN-01 | — | No spec-derived smoke test | Med |
| **Tables → cards/mobile overflow-x frozen Actions** | **SHALLOW** | T-K02 | PR6 | `T-K02` responsive hooks correct — but no table component proves cards at 375px; `src/components/ui` unknown | Low |
| **TipTap+Dropzone presigned global_settings/pages CMS-01 never hardcoded** | **COVERED** (shallow) | T-E04 T-E02 | PR5-6 | `src/components/admin/cultura-editor.tsx` uses TipTap+Dropzone presigned — but `global_settings/tenants` CSS vars table not found (only `cultura_posts`/`wishlists`/`reviews`); design tokens hard-coded in `tokens.css` not DB-driven | Med |
| **RBAC every /admin/* middleware+Action super_admin|admin|editor|viewer via entitlements (prohibited if plan Pro)** | **SHALLOW** | T-B05 | PR3 | Entitlements table only `role in ('admin','customer')` not 4-tier; `src/proxy.ts:67` checks `app_metadata.role !== "admin"` hardcoded — missing `editor`/`viewer` + `is_admin()` DB check; actions double-check `is_admin()` but not `editor` guard per spec | **High** |
| **Editor cannot delete →403+security_logs+audit_logs denied** | **MISSING** | ADMIN-04 | — | No middleware case for editor vs admin; no security_logs writer | High |
| **Audit append-only INSERT-only RLS before/after JSONB** | **SHALLOW** | T-B04 T-E02 etc | PR3 | `0004_audit_security.sql:33-36` INSERT-only correct — but `src/lib/actions/cultura.ts` never writes `audit_logs` entry (only `status->published` update not logged); no retention/test | Med |
| **Customer 360 single join LTV+lastLogin+cart+orders+notifications no N+1** | **MISSING** | ADMIN-06 DB-06 | — | No task implements 360 query; no `admin/customer/[id]` view | **Med** |
| **White-label CSS vars tenants + manifest.json dynamic** | **MISSING** | T-A08b (partial) | PR1 | Tokens in `src/styles/tokens.css` hard-coded, not DB; `manifest` route missing or static | Med |
| **RMA per-category + stock re-entry** | **MISSING** | Plan §5.1 | — | No RMA table or policy | Low |
| **Campaigns coupons async QStash→Resend conversion reporting** | **MISSING** | JOBS-01 | — | Superficial `T-D06` cron only for abandoned carts, not coupons | Low |
| **Bulk >100 SSE progress JOBS-02** | **SHALLOW** | LOG-03 | — | No SSE endpoint — spec requires streaming | Med |
| **Feature flags <1s kill switch DEV-01 generateMetadata DEV-02** | **SHALLOW** | T-D09 T-D02b | PR5-6 | Flag `new_checkout_active` mentioned but no `src/lib/flags.ts` or Edge flag reader; `generateMetadata` exists per PDP/cultura but not admin | Low |
| **Brand pill 50px lowercase Bauhaus shapes** | **COVERED** | T-A08 T-K01 | PR1/PR6 | `T-K01 motion.css geometric grid-wipe mask` correct per `marca.md` — OPEN A/B/C/D still TBD but CSS-only zero-bundle ok | Low |
| **Responsive 44px thumb vs hover mega-menu 375/1280** | **COVERED** (shallow) | T-K02 | PR6 | File exists, test string-only, not Playwright viewport 375 vs 1280 proof | Low |

### K. cultura-blog (`spec.md` not in folder — implied via T-E01..E05 + exploration)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Locale posts + TipTap body + social auto-import draft + related products + SEO Article** | **COVERED** (shallow) | T-E01→E05 | PR3/PR5-6 | Migrations 0011/0012 correct, TipTap editor, related picker, sync via SocialProvider — but all CULTURA specs absent from `openspec/changes/**/specs` (not versioned!) — trace must be added as cap 11 spec.md | Med |
| **RLS anon SELECT published+deleted_at IS NULL, admin is_admin()** | **COVERED** | T-E01 | PR3 | Policy correct | Low |
| **Calendar month/week drag-drop dnd-kit** | **PLANNED** | T-H01 | PR7 | File expected `src/app/[locale]/admin/cultura/calendar/page.tsx`+`cultura-calendar.tsx` — tests exist (`t-h01-calendar:25`) but task unchecked — code appears to exist per test — status discrepancy: code staged but PR7 not marked `x` | Med |
| **Bulk publish/duplicate/SEO/reading time/version history** | **PLANNED** | T-H03 | PR7 | `src/lib/actions/cultura-bulk.ts` exists per `t-h03-bulk:33` — same discrepancy | Med |
| **Launches table drop/collection/restock countdown** | **PLANNED** | T-H02 | PR8 | Task PR8 — not yet merged | Med |
| **Share carts/articles via share_token** | **PLANNED** | T-I01 | PR8 | Carts already have `share_token uuid` in `0006` — but `I01` Web Share + OG not built | Low |

### L. wishlist (`spec.md` not versioned)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Toggle wishlist Zod uuid, anon session→user merge like cart, dedup unique, rate 60/m, 409** | **PLANNED** (code staged) | T-F02 T-F01 | PR3/PR7 | Migration `0013` correct with partial uniques — but RLS open `for all using (true) with check (true)` bypasses auth (HIGH); `src/lib/actions/wishlist.ts` exists per `t-f02-wishlist:37` — tasks still `[ ]` but tests pass → untracked drift | **High** (RLS) |
| **Paginated 12 ISR 300 heart 44px i18n 4 locales page** | **PLANNED** | T-F03 | PR7 | File expected `/wishlist/page.tsx` etc — test `t-f03-wishlist-ui:37` exists — code staged | Med |
| **Wishlist count vs catalog 1 GiB storage margin** | **MISSING** | — | — | No quota math | Low |

### M. reviews (`spec.md` not versioned)

| Spec Req / Scenario | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **Rating 1-5 title≤120 body≤2000 images≤3 presigned 5MB, verified_purchase if delivered** | **PLANNED** (code staged) | T-G02 T-G01 | PR3/PR7 | Migration `0014` correct (CHECK rating 1-5, images≤3), RLS approved anon SELECT — but `verified_purchase generated` column declared as `verified_purchase boolean generated` without expression (empty DEFAULT false — always false); `src/lib/actions/reviews.ts` should set verified by `order delivered` join but column not computed — manual flag needed | Med |
| **Moderate approve/reject admin 403 helpful Turnstile 3/h** | **PLANNED** (code staged) | T-G02 | PR7 | `t-g02-reviews:44` asserts validations+moderation+Turnstile+honeypot+3/h — but `proxy.ts:34` only enforces Turnstile for `/reviews` path header, not honeypot field per form | Med |
| **Stars paginated 10 ISR JSON-LD Review+AggregateRating** | **PLANNED** | T-G03 | PR7 | Test `t-g03-reviews-ui:32` exists — code staged | Low |

### N. Cross-cutting extensions (tasks.md §Extensions: calendar/share/fx/intl-pay/motion/easter)

| Area | Status | Task | PR | Depth Needed | Risk |
|---|---|---|---|---|---|
| **FX ARS→USD/EUR/BRL Frankfurter + Upstash 24h + display conversion** | **PLANNED** | T-J01 | PR8 | Spec violation: MONEY-01 says store single source ARS cents, display-only convert — T-J01 correct but flag not present, no table `fx_rates` | Low |
| **Stripe+PayPal intl Strategies** | **PLANNED** | T-J02 | PR8 | Correctly flagged off — needs HMAC per provider | Med |
| **Easter Konami trino sigil** | **PLANNED** | T-K03 | PR8 | Flag `EASTER_ENABLED` not yet — low risk | Low |

### O. Parallel Docs Findings (not in specs but blockers per `DOCS/`)

| Finding | Status | Trace | Depth Needed | Risk |
|---|---|---|---|---|
| **Legal P0: /cambios-devoluciones, /envios, /garantia missing (L-04/05/06)** | **MISSING** | `DOCS/legal/03-pages-coverage.md:1` table L-04..06 | `tasks.md` has T-C07b only covers `/terms`+`/defensa` — needs 3 new pages `src/app/[locale]/(legal)/cambios-devoluciones/page.tsx` etc. + `global_settings.return_policy_by_tipo` JSONB + footer botòn arrepentimiento Res.424/2020 + i18n `legal.json` x4 + `generateMetadata` hreflang | **High** (Res.244/21, checkout bloqueado) |
| **Footer links + marbete (CUIT/domicilio/0800) not wired** | **SHALLOW** | `DOCS/legal/03-pages-coverage.md:3-4` footer section | Footer component does not expose L-04-07; missing 0800-666-1518 prominent; tasks T-C07b only partially covers | High |
| **Catalog Storage 1 GiB margin: 500×3×500kB ~750MB fits but no GC → 250MB margin evaporates with cultures + bank_proofs + reviews** | **SHALLOW** | `DOCS/checklist/01-complex-functions.md:1` quota math | No `STOR-02` weekly GC cron; `supabase/migrations` never cleans `bank_proofs`/`reviews images` orphans; need `pg_cron` weekly orphan list + Storage delete via presigned | **Med** |
| **Resend 100/d bottleneck vs abandoned cart 100/d fits but promo/mktg exceeds** | **SHALLOW** | Checklist free tiers | `Resend 100/d` suffices for 6/d abandoned + bank proof emails but any campaign burst (coupon, lunar) breaches — need fail-closed gate or queue backpressure; T-D06 no throttle | Med |
| **Realtime 200 conn limit unused but PWA Realtime+mp3 alert (NOTIF-02) suggests Realtime** | **MISSING** | Checklist | No Realtime channel exists — if added, 200 conn free cap needs note; `next-pwa` fork docs missing; no `src/works` | Low |
| **next-pwa fork maintenance cost** | **MISSING** | Checklist | No PWA manifest via `/api/manifest?tenant=` dynamic handler (tasks lists it but not implemented — only `next.config.ts` static) | Low |
| **Legal performance: PDP tabs must load lazy (PERF-04) + peso/dims for flete calc** | **SHALLOW** | `DOCS/legal/01-product-specs-requirements.md:4` PDP mapping | No lazy tab component evidence; `weight_grams/dimensions_cm` not in `products` schema (only `price_cents` etc) — shipping weight may be missing field | Med |

### P. Testing / SDD hygiene

| Area | Status | Evidence | Depth Needed | Risk |
|---|---|---|---|---|
| **215 tests, 53 unit files, all RED→GREEN claim** | **SHALLOW** | `tests/unit/*.test.ts` | 90% of tests are **string-match assertions** (`expect(c).toMatch(/401/)`) not behavioral — easy to green with `void '401'`; no DB integration (Supabase local), no Playwright in CI for sad paths, no `EXPLAIN` cost assertion, no load/k6 for SERIALIZABLE, no RLS integration with two roles, no Fuzz for money parsing | **High** (false coverage) |
| **90/80 coverage thresholds** | **SHALLOW** | `vitest.config.ts:14` | Config mandates 90 for validations but `src/lib/actions/wishlist.ts` etc not listed — coverage artificially limited; need `pnpm test:coverage` artifact | Med |
| **3 specs not versioned: cultura-blog, wishlist, reviews** | **MISSING** | `tasks.md:122-125` "See specs/cultura-blog/spec.md" but folder absent | Need to merge ad-hoc specs from `t-f02/g02/h01` tests + PR7-8 or delete trace | Med |
| **Decimal.js not installed** | **MISSING** | `package.json:10-20` deps | `pnpm add decimal.js && pnpm add -D @types/..` + replace `Math.round` with `new Decimal(...).toDecimalPlaces(2, ROUND_HALF_UP)` | **High** |
| **p-limit not installed** | **MISSING** | `package.json` deps | `pnpm add p-limit` used in AD-04+SHIPPING design | Med |
| **Sitemap, health live/ready, receipt PDF, broadcast, orphan GC, label batch, 360 query, sync RPC migrations** | **MISSING routes/code** | `src/app/**` tree | See PR7-8 breakdown below | Med |

---

## 2. Remaining Work: PR7 + PR8 Re-read

### PR7 — `~510 lines` (T-F02,F03,G02,G03,H01,H03) — SHOULD NOT be marked done via tests alone

| Task | Why gap persists |
|---|---|
| **T-F02 wishlist Server Actions toggle+merge+60/m+409** | Code appears present (`src/lib/actions/wishlist.ts` imported in `t-f02`) — but tasks.md still `[ ]` — **drift: code merged but task not ticked**. Risk: RLS open policy `wishlists_anon_session_all` undoes auth. Need fix: restrict to `session_id` equality via `auth.jwt()->>session_id` or drop policy, enforce app-layer + integration RLS test (anon A cannot read B). |
| **T-F03 wishlist page heart 44px 12 ISR** | Test `t-f03-wishlist-ui` passes string checks — but no Playwright proof `heart→/wishlist visible → login merge` as spec demands. Needs E2E with two sessions. |
| **T-G02 reviews create+moderate+helpful+Turnstile+3/h** | `t-g02-reviews` string-only; `verified_purchase` always false per migration bug; need `update reviews set verified_purchase = exists(select 1 from orders ... status='delivered')` trigger or computed at INSERT via function. |
| **T-G03 reviews-list stars JSON-LD pagination 10 ISR** | Pagination 10 correct per spec (not 12/25) — inconsistent with PERF pagination; needs dedicated `paginated 10 ISR` + `generateMetadata` AggregateRating; `src/lib/seo/json-ld.ts` has shapes but Review/AggregateRating not wired to G03 component yet. |
| **T-H01 calendar drag-drop dnd-kit month/week optimistic** | Code staged per `t-h01` — missing DB `published_at index` query proven with EXPLAIN; `dnd-kit` not in `package.json` — dependency missing (`@dnd-kit/core` `@dnd-kit/sortable`). Build will fail. |
| **T-H03 cultura-bulk publish/SEO/reading/version jsonb** | `src/lib/validations/cultura-bulk.ts` + `cultura-bulk.ts` staged — version history `jsonb versions[] + diff` not modeled in migration (no `versions` column) — spec promises diff but no column. |

### PR8 — `~580 lines` (H02,I01,J01,J02,K03) — genuinely not started

| Task | Gap | Risk |
|---|---|---|
| **T-H02 launches drop/collection/restock countdown** | Needs `supabase/migrations/0015_launches.sql` + admin page + storefront SSR+client tick `Intl.RelativeTimeFormat` + pg_cron scheduled→live auto-transition; no migration exists | Med |
| **T-I01 share Web Share API + intent URLs + share_token uuid** | `carts.share_token` exists but wishlist share (`wishlists share` column missing) + review share + OG per entity + `carts_share_token idx` all need impl; bottom-sheet mobile vs popover desktop spec (≈110l) not trivial | Med |
| **T-J01 FX ARS→USD/EUR/BRL Frankfurter + Upstash 24h + display** | Needs `fx_rates` table `0016`, `src/lib/money/fx.ts`, `currency-switcher.tsx`, `api/cron/fx` daily — plus spec conflict: store stays ARS-only, FX is display-only; must not corrupt `price_cents` writes | Low |
| **T-J02 Stripe+PayPal intl Strategy PAYMENTS_STRIPE_ENABLED flag** | Needs 4 files + 2 webhooks HMAC per provider — constant-time `stripe-signature` (`tss` parsing) + PayPal cert verify (heavier); share `processed_events`+`failed_webhooks_log` but provider-scoped idempotency key needed | **High** |
| **T-K03 Easter konami trino sigil coupon** | Client `konami.ts` + sigil animation + share_token coupon + audit `easter_found` + flag `EASTER_ENABLED=true` — cute but must not inject emojis, must respect `reduced-motion` and be gated consent for analytics | Low |

---

## 3. Summary — Top Gaps

### Top 5 BACHES NO CUBIERTOS (MISSING — no task or no code, needs new work)

| # | Bache | Spec | Why it blocks | Effort | Next step |
|---|---|---|---|---|---|
| **1** | **Legal pages P0: /cambios-devoluciones + /envios + /garantia + footer botòn arrepentimiento + 0800 vinculante** | `DOCS/legal/03-pages-coverage.md` L-04/05/06 trace `T-C07b` gap; Ley 24.240 art.34/11, Res.244/21 424/2020 | Store cannot legally launch; footer audit fails; checkout lacks shipping-cost-before-pay legal proof | 3 pages ×60-80l + footer 40l + `legal.json` x4 ≈200l | Create `T-C07c` + `T-C07d` subtasks under PR7 hotfix (not PR8) — hardcode is prohibited, use `global_settings.return_policy_by_tipo` + CMS-01 |
| **2** | **Concurrency L1 OCC for admin catalog (`expected_updated_at` →409) + Level2 SERIALIZABLE RPC implementation** | `concurrency-inventory` trace CONCURRENCIA-01 L1/L2 | Without L1, editor overwrites silently; without L2 RPC bodies, double-sell is still possible despite checked boxes — security claim is false | ~140l (hidden `updated_at` field + Server Action guard + 2 migrations `add_to_cart_serializable`/`merge_cart_serializable` with `BEGIN ISOLATION LEVEL SERIALIZABLE; SELECT...FOR UPDATE;`) | New task `T-B09`/`T-D04b` linking to k6 proof |
| **3** | **MP zero-PAN checkout + price integrity server-recompute + Bank proof DB persistence + admin approve transition** | `payments` PRIV-05 ECOM-04 DOC-01 | No end-to-end payment flow exists beyond webhook stub — cannot take money; spec "every checkout validates price from DB not client total →422" has zero code | ~280l (checkout Server Action + `POST /api/checkout` + price-mismatch guard + `orders.status=pending_verification` creation + `storage_path` update trigger + admin approve/reject Action) | `T-P01` before any promo |
| **4** | **POST /api/shipping/rates route + Upstash Redis cache (not MEM) + p-limit+jitter + fixed from `global_settings`** | `shipping-carriers` LOG/RES | Lib exists but not exposed; in-memory cache breaks on scale; quota guard missing → carrier ban; fallback not CMS-driven | ~120l (route `X-Cache` HIT/MISS + `Upstash SETEX 60 SWR 300` + `p-limit 5` + `global_settings` fallback query) | Extend `T-D03` into `T-D03c` |
| **5** | **Sitemaps 500 + /health/live + /health/ready + ErrorBoundary 2-level + instrumentation.ts OTel + alerts >1%/DLQ** | `observability-health` HEALTH-01/02 ERR-01/02 OBS-01 | SEO: no sitemap → 500 SKUs invisible; ops: single `/health` cannot distinguish DB down vs stale readiness; crash at `/checkout` white-screens | ~180l (`app/sitemap.ts` + `app/api/health/live|ready` + `app/error.tsx` + `app/global-error.tsx` + `instrumentation.ts`) | `T-D10` / `T-H04` |

### Top 5 DONDE PROFUNDIZAR (COVERED or SHALLOW but debt that will bite at scale/claim)

| # | Área | Current state | Debt | Deepening action (tests/code) | Risk |
|---|---|---|---|---|---|
| **1** | **Tests are string-match green → false 90/80** | 53 unit tests, 215 count — but `expect(c).toMatch(/SERIALIZABLE/)` not runtime | Drift: PR7 tests already green before PR7 merged (cargo-cult); coverage thresholds only on `env/logger/validations` | Promote to behavioral: a) add `@supabase/supabase-js` local stack or `msw` integration for RLS 403 vs 200, b) add Vitest with real `toCents` fuzz (property test), c) add `EXPLAIN (cost)` assertion for FTS+facets, d) add Playwright `wishlist heart→merge E2E` + `turnstile fail→403` | **High** |
| **2** | **Money arithmetic: Math.round masquerading as Decimal.js + missing HALF_DOWN + missing dependency** | `toCents` correct — but `calcCartTotal` uses `Math.round` not `Decimal`, tax/discount rounding not per-spec | At 500 SKUs with coupons, 1c drift compounds; audit will flag spec non-compliance (MONEY-02) | `pnpm add decimal.js`, implement `new Decimal(subtotal).times(discount).toDecimalPlaces(0, Decimal.ROUND_HALF_UP)` + second path `ROUND_DOWN` for internal splits, add snapshot fuzz for IVA 21% edge `1.005→101` already passes but not via library | **High** |
| **3** | **Security: HMAC header parsing + RLS wishlists open + Cookie SameSite Strict + rate-limit→security_logs** | HMAC constant-time exists but header format wrong; `wishlists` open RLS; cookie always Lax; no alert writer | PCI: MP retry could be spoofed if `v1=` not extracted; auth: any anon can SELECT all wishlists (data leak); compliance: admin cookie not Strict | Fix `verifyHmac` to parse `t=...,v1=...` and HMAC `t.payload`; lock `wishlists` policies to `session_id = current_setting('request.jwt.claims') ->> session_id` or remove open policy and filter app-layer + RLS test (user A vs B); split proxy cookie to `SameSite=Strict` for `/admin*`; wire `security_logs.insert` on 429/403 | **High** |
| **4** | **Shipping Strategy: fake carrier, no p-limit, no jitter, weight hash collides, fallback hardcoded, no label batch** | `getShippingRates` sequential, `weightHash=sum`, fallback `199900` | Quota: burst of 200 checkouts at same CP triggers carrier throttling → cascading fallback with wrong price; collided hash returns wrong quote | Replace `Map` with `Upstash Redis` `SET key value EX 60 NX` + jitter `100*2^attempt + rand(0,200)`, `p-limit 5` import, `weightHash=sha256(JSON.stringify(sorted items))`, fallback `select fixed_shipping_cents from global_settings limit 1`, add DLQ table `failed_shipping_rates` if spec wants it, prove with `n` concurrent mock carriers | **High** |
| **5** | **Observability: logger without fields, health without storage/redis, perf mutex missing, Storage GC absent** | `logger.ts` minimal, `health` fakes storage/cache, `budget.ts` thresholds only, no orphan GC | On-call: no requestId trace → can't correlate payment vs shipping failures; deploy skew `router.refresh()` (ARCH-06) never tested; Storage 1 GiB quietly fills via dropped cultura uploads → Vercel build passes then Storage 500 | Deepen: a) `instrumentation.ts` `register()` Sentry init + `withLogger` wrapper adding `requestId = headers.get('x-vercel-id')`, b) `health/live` liveness trivial 200 + `health/ready` DB `SELECT 1` 2s/Redis PING 1s/Storage `listBuckets` 2s with circuit, c) `src/lib/perf/mutex.ts` Upstash `SET key value NX EX 60` XFetch for catalog, d) `weekly orphan GC` pg_cron `DELETE FROM storage.objects WHERE ... NOT IN (select cover_image...)` | Med |

---

## 4. Prioritized Backlog (proposed insertion into tasks.md)

| Priority | Item | Tasks impact | PR slot | Lines | Blocks |
|---|---|---|---|---|---|
| **P0** | L-04/05/06 legal pages + footer + i18n legal.json x4 | Add `T-C07c` `T-C07d` `T-C07e` | PR7-hotfix (before wishlist) | ~220 | Launch legal audit |
| **P0** | OCC 409 + SERIALIZABLE RPC bodies + k6 proof | Extend `T-B06`/`T-D04` → `T-D04b` | PR7 | ~150 | Double-sell claim |
| **P0** | Checkout price integrity + bank proof persistence + admin approve | New `T-P01` + `T-P02` | PR7 | ~280 | Can take money? |
| **P0** | Shipping route + Upstash + p-limit + global_settings fallback | Extend `T-D03` → `T-D03c` | PR7 | ~120 | Quota safety |
| **P1** | HMAC header parsing + wishlists RLS lock + Strict cookie + security_logs alert | Fix `T-C02` `T-C04` `T-F01` | Patch PR6 | ~80 | Security |
| **P1** | Decimal.js + HALF_DOWN + deps (decimal.js, p-limit, @dnd-kit/*) | Fix `T-B03` + deps | Patch PR2/PR5 | ~60 | Money drift |
| **P1** | Deepen tests: RLS integration + EXPLAIN + behavior over string-match | New `T-TEST-01` | Across PR7 | ~300 | False coverage |
| **P2** | sitemap 500 + health live/ready + instrumentation + ErrorBoundary | New `T-D10` `T-H04` | PR8 | ~180 | SEO/ops |
| **P2** | FX display-only + Stripe/PayPal flags (already planned) | `T-J01` `T-J02` | PR8 | ~240 | Intl |
| **P2** | CC Storage GC weekly + presigned path `/{org}/{entity}/{uuid}` | New `T-STOR-01` | PR8 | ~60 | Quota |
| **P3** | BroadcastChannel logout + Realtime decision + next-pwa fork flag | New `T-PERF-02` | Backlog | ~80 | Nice-to-have |
| **P3** | 360 LTV + entitlement 4-tier + campaign coupons + SSE bulk >100 | From admin-backoffice gaps | Backlog | ~400 | OS completeness |

> Note on quotas (checklist): Resend 100/d is tight but fits current scope (6 abandoned/d + bank emails). If campaigns launch, add throttle or switch to Resend `batch` with queue. Upstash 10k/d fits even after Shipping cache moves to Redis (~2k/d per design). Realtime 200 conn is fine if not used — avoid enabling Realtime for cart (use polling/SWR). `dnd-kit` + `decimal.js` + `p-limit` are zero-cost — add now before PR7 build fails.

---

## 5. Gaps by Spec File Reference

- `specs/security-resilience/spec.md:9-40` — 4 of 6 scenarios shallow/missing (CSP unsafe-inline, Strict cookie, HMAC header parsing, security_logs alerts)
- `specs/money-arithmetic/spec.md:9-31` — 2 of 5 scenarios shallow (float prohibition lint, Decimal.js)
- `specs/concurrency-inventory/spec.md:9-32` — 3 of 4 scenarios missing/shallow (OCC L1, SERIALIZABLE body, BroadcastChannel)
- `specs/shipping-carriers/spec.md:9-32` — 5 of 6 scenarios shallow/missing (route absent, Upstash, p-limit, fallback CMS, labels)
- `specs/i18n-routing/spec.md:9-42` — 2 of 6 shallow (hreflang sitemap, email locale)
- `specs/performance-scalability/spec.md:8-32` — 4 of 6 shallow/missing (BlurHash Edge, ETag, mutex, GC)
- `specs/payments/spec.md:9-45` — 4 of 6 shallow/missing (Bricks checkout, price integrity, bank persistence, intl)
- `specs/ecom-engine/spec.md:9-40` — 4 of 5 shallow/missing (merge capped, doc disclaimer, abandoned route, pg_trgm)
- `specs/observability-health/spec.md:8-32` — 3 of 4 shallow/missing (alerts, live/ready split, Boundary)
- `specs/admin-backoffice/spec.md:9-45` — 5 of 6 shallow/missing (dead audit, RBAC 4-tier, 360, manifest, SSE)
- Implicit specs `cultura-blog`/`wishlist`/`reviews` — not versioned under `openspec/changes/.../specs/` — must be created or trace rewritten

---

## 6. What is *actually* covered well (for morale)

- **MONEY-01 expand/backfill** migration correct; `toCents` AR$ parsing comprehensive; `calcCartTotal` snapshot 1c tested (`t-b03-money.test.ts:92`).
- **FTS GIN + deleted_at soft-delete** triggers correct (`0003`).
- **ENUM 9 states + trigger 422** is textbook (`0007`), with backfill of legacy `paid→authorized`.
- **RLS basics**: `audit_logs`/`security_logs` INSERT-only is correctly modeled; `is_admin()` SECURITY DEFINER per Supabase best practice.
- **Headers + HSTS 2y + CSP frame-ancestors none** in `next.config.ts` — 5 headers present (just needs `unsafe-*` removal + nonce).
- **Rate-limit 4-tier slidingWindow + memory fallback** architecture is correct, ready for Upstash.
- **Circuit breaker state machine** faithful to spec (3/60s→30s half-open, 8s timeout, pending_retry) — wiring to caller is the gap, not logic.
- **TipTap + Dropzone presigned** editorial flow is implemented end-to-end for cultura draft→publish→revalidate.

---

*Generated for `openspec/changes/ecommerce-high-end-constitution` — save with Engram `mem_save` topic `gap-analysis`. Next action: triage P0 backlog into tasks.md as `T-C07c/d/e`, `T-D04b`, `T-P01/P02`, `T-D03c` before starting PR7.*
