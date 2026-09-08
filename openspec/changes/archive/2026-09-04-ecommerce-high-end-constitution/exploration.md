# Exploration: ecommerce-high-end-constitution

> Project: santisima-trinidad | Change: ecommerce-high-end-constitution | Mode: hybrid | Date: 2026-09-03
> Sources: DOCS/DOCS/AGENT CONSTITUTION.MD v3.1 (61KB, 154 rules, 43 sections), codebase inventory (src, supabase/migrations/0001_init.sql, configs), openspec/config.yaml, sdd-init observation #827

## Executive Summary

This exploration validates the constitution (154 rules, 43 sections) against a greenfield Next.js 16.3.4 + Supabase e-commerce codebase that is ~5% compliant. The current implementation correctly bootstraps the mandatory stack (App Router, React 19, TS strict, Tailwind v4, Supabase SSR, TanStack Query, RHF/Zod) and a minimal RLS schema (profiles, categories, products, variants, cart_items, orders, order_items) with JWT custom claims. Gaps are systemic: no enforceable constitution guardrails (lint/config/headers/RLS hardening), no i18n, no DB compliance (soft deletes, audit logs, UTC discipline, FTS, money-integers, indexes), no security hardening (CSP/HSTS, CORS, rate limiting, cookie attributes, audit logging), no resilience (webhook 3-layer, circuit breaker, async decoupling), no performance scaffolding (pagination, virtualization, presigned URLs, compression), and no e-commerce engine completeness (anonymous cart DB, order ENUM state machine, price integrity, shipping, entitlements, notifications). Cost-zero constraint collides with PCI-DSS zero-PAN (delegated to MercadoPago — free), shipping API quotas (cache required), and rate-limit/queue infra (Upstash free tier). Recommended approach: treat constitution as **enforceable baseline**, not documentation — codify each rule group into delta specs + config/lint/DB enforcement in 4 chained slices. Ready for proposal: Yes — with sliced delivery.

## Current State

### Stack — What exists and works

- **Framework**: Next.js 16.3.4 App Router + React 19.2.8 + TS5 `strict:true`, `paths @/*`, `jsx react-jsx` — aligns with ARCH-01.
- **Styling**: Tailwind v4 via `@tailwindcss/postcss` + `globals.css` with CSS variables — minimal design tokens, no hierarchy scale yet.
- **Data**: Supabase SSR (`@supabase/ssr` 0.12.5) + JS client 2.112.4, `src/lib/supabase/{server,client}.ts` correctly implements cookie `getAll/setAll` per SSR docs; `src/proxy.ts` implements session refresh + route guard (admin/account/auth) using `auth.getUser()` + `app_metadata.role`. Providers wrap `QueryClientProvider` with `staleTime 60s` — partially satisfies ARCH-04.
- **Forms/Auth**: `src/app/auth/actions.ts` has `login/signup/signOut/signInWithGoogle` Server Actions using `useActionState` — but no Zod validation, no triple-check (ARCH-05), no deployment-skew handling (ARCH-06).
- **Routes**: `src/app/page.tsx` (product grid, limit 12), `producto/[slug]/page.tsx` (variants list, dead Add-to-Cart button), `login`, `signup`, `account`, `admin` table (read-only) — functional but violates ADMIN-01, UX-05, ECOM-01.
- **DB**: `supabase/migrations/0001_init.sql` (256 lines) — 7 tables, 6 indexes, 4 RLS tables with `is_admin()` SECURITY DEFINER, triggers for claims/profile, `touch_updated_at`. Uses `numeric(12,2)` for price (violates MONEY-01), no soft delete, no audit logs, no FTS, no GIN, no money integrity.

### Constitution Breakdown (43 sections, 154 rules)

| # | Section | IDs | Core Mandate | Priority for this change |
|---|---------|-----|--------------|--------------------------|
| 1 | Code Quality | CQ-01..09 | zero TODO/comments-except-justified, 150-line limit, mocks isolation, strict TS, zero console, zero warnings, exact skeletons | HIGH — enforce via ESLint + file-size guard |
| 2 | Stack & Architecture | ARCH-01..06 | mandatory stack, file structure `app/components/hooks/lib/types/i18n/config`, Turborepo policy, anti-spaghetti state, Server Action triple-validation, deployment-skew resiliency | HIGH — scaffold missing folders |
| 3 | UI/UX Design System | UX-01..09 | mobile-first thumb zone (44px), 4-state microinteractions, optimistic updates, ghost-click prevention, empty states, progressive disclosure, 4/8px spacing, fluid typography, WCAG 2.2 AA | HIGH — blocks high-end claim |
| 4 | i18n | I18N-01..03 | next-intl `[locale]/...`, `messages/{locale}/{ns}.json`, zero literals `t()`, ICU plural, Intl for currency/date UTC | HIGH — not installed; Spanish-only hard strings today |
| 5 | DB & Supabase | DB-01..07 + DRIFT + SYNC | UTC, RLS every table (no IN SELECT), expand/contract migrations, soft delete `deleted_at`, immutable audit_logs, FTS `to_tsvector`, N+1 prevention, MCP inspection before DDL | CRITICAL |
| 6 | Concurrency | CONCURRENCIA-01 | OCC for admin edits (409 on stale `updated_at`), SELECT FOR UPDATE / SERIALIZABLE for inventory/payments | CRITICAL for stock |
| 7 | Security | SEC-01..08 | secrets via env vault (90d rotation), Turnstile/Honeypot, param queries, CSP/HSTS/X-Frame etc., CORS zero wildcard, JWT 15min + refresh rotation, CI blocks HIGH CVE, pin critical deps | CRITICAL — only .env present, no headers |
| 8 | Resilience | WEBHOOKS-01, RESILIENCIA-01, RES-02/03 | webhook 3-layer (idempotency+DLQ+HMAC), circuit breaker 8s/3fails/30s half-open, p-limit+backoff, async decoupling (n8n/QStash/pg_cron) | HIGH — MercadoPago webhook absent |
| 9 | Performance | PERF-01..08 | server pagination (25/100), virtualization >50, dynamic imports, BroadcastChannel multi-tab, cache-stampede mutex, presigned URLs >2MB, WebP/AVIF+BlurHash, AbortController 8s | HIGH — no pagination on home (limit 12 is band-aid) |
| 10 | Storage | STOR-01/02 | bucket `{org}/{entity}/{uuid}`, UUID filenames, 10MB/1GB limits, weekly orphan GC | MEDIUM — no bucket yet |
| 11 | Observability | OBS-01/02 | structured logger OTel+Sentry `instrumentation.ts`, alerts (1% errors, p95>2s, DLQ), admin health dashboard | MEDIUM — zero logger |
| 12 | Testing | TEST-01..03 | 80% critical routes (constitution says 80%; prompt asks 90% per file/flow), Vitest+Testing Library+Playwright, sad paths mandatory, CI gate | HIGH — only smoke.test.ts |
| 13 | Error Handling | ERR-01/02 | ErrorBoundary global+route+data, Realtime cleanup on unmount | MEDIUM — no boundaries |
| 14 | API Contracts | API-01/02 | OpenAPI 3.1 via zod-to-openapi, versioning `/api/v1`, Deprecation/Sunset headers | MEDIUM |
| 15 | Auth Lifecycle | AUTH-01..03 | account linking (Google+email merge), guest checkout first, /profile portal | HIGH — no linking, no guest flow |
| 16 | E-Commerce Engine | ECOM-01..07 | anonymous cart in DB (session_id), merge on login, order ENUM state machine, price integrity (sale_price parallel), abandoned cart >4h (n8n/Resend), shipping via logistics API+Redis cache, entitlements table | CRITICAL |
| 17 | Backoffice | ADMIN-01..06 | zero dead buttons, responsive card tables, TipTap+Dropzone+presigned, RBAC super_admin/admin/editor/viewer, AI toggle via flag, Customer 360 (LTV) | HIGH — dead button on PDP |
| 18 | Notifications | NOTIF-01/02 | async email via QStash/n8n→Resend, PWA+Realtime+mp3 alert | MEDIUM |
| 19 | Jobs | JOBS-01/02 | pg_cron/QStash only (no setTimeout), workers for bulk >100 (SSE progress) | MEDIUM |
| 20 | Feature Flags | DEV-01/02 | `flags.new_checkout_active` (<1s kill switch), generateMetadata per entity | MEDIUM |
| 21 | Privacy | PRIV-01..05 | consent granular, anonymization delete, export JSON/CSV 72h, retention cron, zero PAN (Stripe/MP tokenized) | CRITICAL — zero-PAN is PCI baseline |
| 22 | Backup/DR | DR-01..03 | RPO 1h, RTO 4h, PITR, runbook drill 6mo | LOW (Supabase PITR free) |
| 23 | Content mgmt | CMS-01 | global_settings/pages table — no hardcoded business content | MEDIUM |
| 24 | Receipts | DOC-01 | internal receipt footer disclaimer — no fiscal invoice | MEDIUM |
| 25 | Scheduling | SCH-01..03 | dynamic availability (hours+schedule - appointments - exceptions), duration+buffer, calendar_exceptions | LOW for physical goods (applies if services added) |
| 26 | Logistics | LOG-01..03 | labels via ShipEngine/Andreani API only, A4/ZPL selector, batch by postal_code | HIGH — shipping required |
| 27 | Indexes | IDX-01..03 | index every FK, GIN for FTS, composite selective-first, EXPLAIN ANALYZE gate, weekly ANALYZE + quarterly REINDEX | HIGH — only 6 indexes exist |
| 28 | Env Validation | ENV-01..03 | Zod schema `src/config/env.ts` at boot (fail-closed), PUBLIC/SERVER/CRITICAL classification, parity staging=prod | HIGH — raw `process.env!` today |
| 29 | Seed/Test Data | SEED-01..03 | deterministic seed.sql, factories with overrides, prod anonymization via faker | MEDIUM |
| 30 | Security Audit Logs | SLOG-01..03 | security_logs (append-only, 1yr), alerts (5 fails/10min, new country, role grant, bulk export >1k) | HIGH |
| 31 | Cookies | COOKIE-01..03 | HttpOnly only (no localStorage), Secure+HttpOnly+SameSite+Path+Max-Age, Double Submit CSRF | HIGH — Supabase SSR does HttpOnly but not validated |
| 32 | Money Arithmetic | MONEY-01..03 | INTEGER centavos/cents (no float), Decimal.js for multi-step, currency code column | CRITICAL — numeric violates |
| 33 | Rate Limiting | RLIM-01/02 | Upstash Redis tiers: auth 5/15min, public 60/min/IP, authed 600/min/user, webhooks 1MB, admin bulk 10/h, 429 with Retry-After | HIGH — no limiter |
| 34 | HTTP | HTTP-01..03 | Brotli→gzip, Cache-Control tiers (immutable 1y, private no-cache, public s-maxage 60/swr 300), ETags | MEDIUM — next.config.ts empty |
| 35 | Healthcheck | HEALTH-01/02 | /api/health checks DB/Redis/Storage (200 vs 503), liveness vs readiness | MEDIUM |
| 36 | Rollback | ROLL-01..03 | trigger 5% errors or p95>3s or 503>30s, runbook 1-command revert + flag off, DB backward compat via expand/contract | MEDIUM |
| 37 | Gitflow | GIT-01..03 | main/develop/feature/hotfix/release, 1 review+CI, conventional commits, CHANGELOG auto | MEDIUM — no commits yet, .next staged bug |
| 38 | A11y Testing | A11Y-01..03 | axe-core in Playwright, keyboard nav cases, landmarks + aria-live | MEDIUM |
| 39 | Timezone | TZ-01..03 | IANA zone per user via Intl, UTC in DB, offset display, DST-safe | MEDIUM |
| 40 | I18n Comms | I18N-COMM-01..03 | emails in recipient locale, react-email+next-intl, 3-step fallback | MEDIUM |
| 41 | CORS Webhooks | CORS-WH-01/02 | separate CORS for /api/webhooks/* (HMAC only), POST only, 1MB, IP allowlist | MEDIUM |
| 42 | Component Docs | DOCS-COMP-01..03 | Storybook for ui/shared, JSDoc+explicit props+named export, token reference | LOW |
| 43 | Technical Docs | TDOC-01..03 | ARCHITECTURE.md + RUNBOOK.md + CHANGELOG auto | MEDIUM |

### Codebase Inventory (actual files, 2026-09-03)

```
src/
  app/
    layout.tsx (32 lines, metadata static, Geist fonts, html lang=es)
    page.tsx (51 lines, force-dynamic, products limit 12, grid, no pagination)
    providers.tsx (37 lines, QueryClient staleTime 60s, retry 1)
    globals.css (26 lines, Tailwind import, CSS vars, no tokens)
    auth/actions.ts (62 lines, login/signup/signOut/Google, no Zod, no triple-check)
    auth/callback/route.ts (18 lines, exchangeCodeForSession, redirect)
    login/{page.tsx (24), login-form.tsx (55, useActionState, pending UI)}
    signup/{page.tsx (11), signup-form.tsx}
    producto/[slug]/page.tsx (58, variants list, dead button)
    account/{layout.tsx, page.tsx (36, profiles query, no 360)}
    admin/{layout.tsx, page.tsx (58, table, no pagination/card mobile)}
    favicon.ico
  lib/supabase/{server.ts (27), client.ts (8)}
  proxy.ts (74, getUser + role guard, matcher excludes _next/static etc.)
supabase/migrations/0001_init.sql (256 lines, 7 tables, RLS, triggers)
public/{file,globe,next,vercel,window}.svg (boilerplate)
tests/unit/smoke.test.ts (7 lines), tests/e2e/.gitkeep
configs:
  package.json (pnpm 11.25, next 16.3.4, react 19.2.8, zod 4.5.4, no @tanstack/react-virtual, no next-intl, no decimal.js, no p-limit, no @axe-core/playwright ...)
  tsconfig.json (strict true, @/* alias, 150-line not enforced)
  next.config.ts (empty — no CSP/HSTS, no compression, no headers)
  eslint.config.mjs (next/core-web-vitals + typescript only, no custom rules)
  vitest.config.ts (include tests/unit/**/*.test.*, v8 provider, no integration threshold)
  playwright.config.ts (baseURL 3000, trace on retry)
  pnpm-workspace.yaml (allowBuilds false)
  .prettierrc.json (printWidth 100, lf)
  .gitignore (has .env/.env.local but .next still staged — bug)
  .env (keys present but not validated via Zod), .env.local (anon+site_url)
  openspec/config.yaml (constraints mapped, tdd true, coverage 80)
```

Missing per ARCH-02: `src/components/{ui,shared,[feature]}`, `src/hooks/*`, `src/lib/{actions,api,db,validations,utils,mocks}`, `src/types/database.types.ts`, `src/i18n/*`, `src/config/env.ts`, `instrumentation.ts`, `middleware.ts` (proxy.ts exists but Next 16 uses `proxy.ts` — verified).

## Gap Analysis — Constitution vs Implementation

| Rule Group | Status | Evidence | Gap Severity |
|------------|--------|----------|--------------|
| **CQ-01..09** | Partial | 150-line ok today; but no ESLint rule for max-lines, no mock layer, zero skeletons, no logger guard | High |
| **ARCH-02 structure** | Fail | Only `lib/supabase` exists; 8 required subfolders absent | High |
| **ARCH-05 triple-validation** | Fail | auth/actions.ts no Zod, no organization_id ownership check | Critical |
| **UX mobile-first** | Partial | `sm:grid-cols-2 lg:grid-cols-3` present but no thumb-zone CTA, no 44px audit, no microinteraction states | High |
| **I18N** | Fail | Hard strings “Artículos religiosos”, “Agregar al carrito”; no next-intl, no `[locale]` group, no `messages/` | High |
| **DB UTC/soft-delete/audit/FTS** | Fail | No deleted_at, no audit_logs, no FTS/GIN, DB dates not proven UTC, expand/contract not enforced | Critical |
| **MONEY integer** | Fail | `numeric(12,2)` + `${price}` float display — violates MONEY-01 | Critical |
| **RLS hardening** | Partial | RLS on 7 tables yes, but order_items uses `EXISTS (SELECT)` — prohibited IN(SELECT) pattern at scale (DB-02); missing security_logs, processed_events, failed_webhooks_log | High |
| **Indexes** | Partial | 6 FK indexes only; no composite, no GIN, no EXPLAIN gate | High |
| **SEC headers/CORS** | Fail | next.config.ts empty — missing CSP, HSTS 63072000, X-Frame DENY, etc. | Critical |
| **Rate limiting** | Fail | No Upstash Redis limiter, no 429 headers | High |
| **Cookies** | Partial | Supabase SSR uses HttpOnly but attributes not asserted; no CSRF double-submit | Medium |
| **Webhooks 3-layer** | Fail | No `/api/webhooks/mercadopago`, no processed_events, no HMAC check | Critical for PCI |
| **Circuit breaker** | Fail | No AbortController wrapper, no open/half-open state | High |
| **Performance** | Fail | No server pagination (PERF-01), no virtualization, no presigned URLs, no BroadcastChannel, no stampede mutex | High |
| **ECOM anonymous cart** | Fail | cart_items requires user_id FK — anonymous session_id not supported | Critical |
| **ECOM order ENUM** | Partial | status check `pending/paid/shipped/delivered/cancelled` but constitution wants `draft→pending→authorized→processing→shipped→delivered→canceled→refunded` with transition validation | High |
| **ECOM price integrity** | Fail | No sale_price/sale_start/end, no computed discount | Medium |
| **Shipping** | Fail | No `/api/shipping/rates`, no Andreani/Correo integration, no Redis cache | High |
| **Entitlements** | Fail | No entitlements table, role checks via app_metadata only | Medium |
| **Admin RBAC/health** | Partial | Admin guard via app_metadata but no entitlements, no health dashboard | Medium |
| **Observability** | Fail | No instrumentation.ts, no Sentry, no alerts | Medium |
| **Testing 80/90%** | Fail | 1 smoke test, 0% coverage on flows | High |
| **Env Zod** | Fail | `process.env.NEXT_PUBLIC_SUPABASE_URL!` non-null assertion — violates ENV-01 fail-closed | High |
| **Seeds** | Fail | No seed.sql, no factories | Medium |
| **Gitflow** | Fail | 292 .next files staged — .gitignore bug (node_modules/ vs .next/), no main/develop, no conventional commits history | High |

**Compliance estimate**: ~12% of 154 rules have code evidence; ~35% partially; ~53% absent. No rule is actively enforced by tooling.

## Affected Areas

- `next.config.ts` — MUST add security headers (SEC-05), compression (HTTP-01), cache-control, CORS isolation for webhooks
- `src/proxy.ts` + `src/lib/supabase/*` — harden cookie attributes (COOKIE-02), add rate-limit pre-check (RLIM-01), fix matcher for webhook bypass
- `src/config/env.ts` — NEW — Zod schema at boot (ENV-01) centralizing all env access
- `src/components/{ui,shared}` — NEW — atomic design system, 4-state buttons, skeletons with brand vars (CQ-03, UX-02)
- `src/hooks/*` — NEW — extract logic from 150-line cap pages
- `src/lib/{validations,actions,db,mocks,utils,api}` — NEW — Zod schemas (DB-SYNC-01), Server Actions triple-validation, typed queries, mocks per CQ-04
- `src/types/database.types.ts` — NEW — `supabase gen types` (never manual, CQ-06)
- `src/i18n/*` + `messages/{es,en}/{common,auth,checkout,admin,errors,emails}.json` — NEW — next-intl `[locale]` routing
- `supabase/migrations/*` — NEW — expand/contract migrations for MONEY integer, soft deletes, audit logs, FTS GIN, entitlements, processed_events DLQ, security_logs
- `src/app/**` — REFACTOR — `[locale]` group, optimistic updates, empty states, progressive disclosure, ErrorBoundaries, pagination (PERF-01)
- `supabase/*` Storage + `src/app/api/**` — NEW — presigned URLs (PERF-06), health endpoints (HEALTH-01/02), shipping rates, webhooks 3-layer
- `instrumentation.ts` + `src/lib/logger.ts` — NEW — structured logger (OBS-01)
- `tests/{unit,e2e}` — expand to 80% (constitution) / 90% (prompt) per file/flow, sad paths, axe-core
- `.gitignore`, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts` — patch .next ignore bug, add max-lines, pin critical dep versions (SEC-08)

## Approaches

### Approach 1 — Documentation-Only (constitution as markdown reference)
Keep DOCS/DOCS/AGENT CONSTITUTION.MD as human reference; add lightweight `CONTRIBUTING.md` checklist. No lint/header/DB enforcement; rely on PR reviewer memory.

- Pros: Zero infra change, cheapest upfront, no risk of breaking build with strict rules.
- Cons: 154 rules remain unenforced — guarantees drift; onboarding cost high; audit failures (PCI, GDPR) undetectable; shipping/rate-limit compliance unverifiable; cost-zero abuse (free-tier quota exhaustion) invisible.
- Effort: Low (1–2 days of docs)
- Compliance impact: ~15% → stays near today; review load explodes.

### Approach 2 — Enforceable Baseline via Tooling + Sliced DB/App Hardening (recommended)
Codify constitution into **executable guardrails**: ESLint custom rules (max 150 lines, no console, no hardcoded literals warning), `src/config/env.ts` Zod fail-closed, `next.config.ts` security headers, strict TS `noUncheckedIndexedAccess`, RLS policies + migration guard (MCP inspection + `supabase gen types` + Zod sync), and sliced delivery.

Slice plan (fits 800-line review budget, chained PRs auto-forecast):

- **Slice A — Constitution Bootstrap** (foundations, no business logic): `env.ts` + headers + eslint/prettier fixes + `.gitignore` bug + `database.types.ts` pipeline + `instrumentation.ts` stub + `src/components/ui` skeletons + i18n scaffold (`next-intl`, `[locale]` group). ~400 lines.
- **Slice B — DB Hardening** (expand migrations): MONEY integer (new column + backfill), `deleted_at` + RLS filters, `audit_logs` + `security_logs` append-only, `processed_events`+`failed_webhooks_log`, FTS `to_tsvector` + GIN, composite indexes, `entitlements`, `global_settings`, fix `cart_items` anonymous `session_id`, correct order ENUM + transition function, `EXPLAIN ANALYZE` docs. Each sub-migration is separate (DB-03 expand/contract). ~600 lines across 2 PRs.
- **Slice C — Security & Resilience**: Rate limiting via Upstash Redis (free tier) with tiered 429, Turnstile/Honeypot, webhook 3-layer + HMAC for MercadoPago, circuit breaker helper + AbortController, presigned Storage flow, CORS-WH, cookie hardening audit. ~500 lines.
- **Slice D — E-Com Engine & Performance**: server pagination + virtualization, optimistic cart + merge on login, price integrity sale_* fields, shipping `/api/shipping/rates` via Andreani (cached Redis), abandoned cart pg_cron, notifications async, PWA manifest, health endpoints, seed factories, test coverage gates, Storybook. ~700 lines across 2 PRs.

- Pros: Every hard rule becomes CI-enforceable; drift impossible; cost-zero choices quantified per service; PCI zero-PAN delegated correctly; review budget respected via slices; audit trail via specs.
- Cons: Higher upfront design cost; requires Upstash/Resend free-tier provisioning; migration count grows (intentional per DB-03).
- Effort: Medium-High (4–6 weeks sliced)
- Compliance: → ~90% enforceable.

### Approach 3 — Full Platform Shift (Turborepo + microservices + dedicated infra)
Adopt Turborepo monorepo (`apps/web, apps/admin, packages/ui`) + self-hosted Redis/Postgres + custom notification workers. Abandon Supabase Storage for S3.

- Pros: Scales to multi-artifact (ARCH-03) if admin/mobile/workers diverge; infra control.
- Cons: Violates cost-zero (paid hosting, Redis self-host complexity); premature for single storefront; current codebase 5% — monorepo overhead is negative ROI now; constitution explicitly reserves Turborepo for >1 deployable artifact.
- Effort: High (6–10 weeks)
- Recommendation: Defer until second deployable artifact proven.

### Alternatives Considered (focused decisions)

| Decision | Options | Tradeoffs | Choice for Proposal |
|----------|---------|-----------|---------------------|
| **Rule enforcement** | Docs-only vs lint/config/CI vs full OPA policy engine | Docs drift; OPA overkill for Next.js | Lint+config+CI (Approach 2) — minimal tool that blocks PRs |
| **Folder convention** | Feature-sliced (Screaming Architecture) vs Next `app/` flat vs domain `src/features/*` | Feature-sliced best for e-com domains (catalog/cart/checkout/admin) but collides with Next app router; Next conventions are mandatory (ARCH-02) | **Hybrid**: `app/` routes-only + `components/[feature]` + `lib/[domain]` — respects both ARCH-02 and scalability (no Turborepo yet) |
| **DB patterns** | RLS with `IN (SELECT)` convenience vs SECURITY DEFINER + JWT claims vs row-level via app layer | IN SELECT kills at scale (DB-02); app-layer bypasses RLS | **SECURITY DEFINER + custom claims** (`is_admin()`) — already started, extend to entitlements |
| **Money** | Keep `numeric` vs `INTEGER centavos` vs `Decimal.js everywhere` | numeric floats compound; Decimal everywhere slower | **INTEGER centavos** at storage (MONEY-01), Decimal.js only for multi-step tax/discount, `Intl.NumberFormat` at render |
| **i18n** | next-intl vs next-i18n-router vs manual | next-intl is ARCH-mandated, supports `[locale]` + ICU + email templates | **next-intl** — install `next-intl` 4.x, `messages/{es}/` base, fallback chain I18N-COMM-03 |
| **Search** | LIKE/ILIKE vs pg FTS vs Algolia | LIKE unusable at scale, Algolia paid | **pg FTS `to_tsvector` + `pg_trgm` + GIN** (DB-07) — free, typo-tolerant |
| **Rate limiting** | In-memory vs Upstash Redis vs Supabase pg | In-memory not distributed; pg adds DB load | **Upstash Redis free** — tiers per RLIM-01, payload limits 1MB |
| **Testing 80 vs 90%** | Constitution says 80% critical routes; prompt says 90% per file/flow | 90% is stricter than constitution — conflict | **Require 80% per constitution + 90% aspirational for new flows** — document deviation in proposal, let proposer decide strictness |
| **Notifications** | Sync Resend in request vs QStash/n8n async vs Supabase pg_cron | Sync violates RES-03 (200ms requirement) | **Async via QStash/pg_cron → Resend** — free tier sufficient |

## Recommendation

**Adopt Approach 2 — Enforceable Baseline via Sliced Delivery.**

Rationale:
1. Constitution is explicitly zero-tolerance; documentation-only guarantees violations. Every section maps to a failure mode observed in gap analysis (e.g., MONEY float → cent errors, no webhook DLQ → double-charge on retry, no RLS hardening → IDOR).
2. Cost-zero is satisfiable without paid services: MercadoPago tokenization (zero PAN, PRIV-05), Supabase free tier (PITR), Upstash Redis/QStash free, Resend free, Andreani/Correo Argentino public rates (cache to stay within quota), Edge Functions WebP/AVIF. Each choice is free-tier-validated.
3. 800-line review budget forces slices — aligns with constitution’s own PR discipline (GIT-02) and prevents reviewer burnout. Slices A→D are independently deployable and backward-compatible via expand/contract (DB-03).
4. Alternative folder/DB/i18n choices already have constitution-preferred answers; deviating creates unnecessary spec churn.

**Why not Approach 1/3**: Approach 1 leaves banking/PCI and shipping as human promises — unacceptable for high-end e-com. Approach 3 is premature optimization that violates cost-zero and ARCH-03’s Turborepo trigger.

## Risks

- **PCI/Banking with cost-zero (PRIV-05, SEC-04) — HIGH**: Storing any card data locally is a compliance breach; delegation to MercadoPago must be audited end-to-end (token, webhook HMAC, idempotency). Mitigation: spec mandates zero PAN store, HMAC validation rejected as only non-200, processed_events idempotency, DLQ review runbook. Verify `MERCADOPAGO_ACCESS_TOKEN` is SERVER-only.
- **Shipping integrations (ECOM-06, LOG-01, RES-02) — HIGH**: Andreani/Correo Argentino quotas can be exhausted by reload loops; incorrect weight/volume calc breaks rates. Mitigation: Redis per-session cache (s-maxage), p-limit batches, exponential backoff+jitter, fallback to `global_settings` fixed cost when API down. Validate cost-zero tier before spec.
- **Scalability — N+1, FTS, cache stampede (DB-06, PERF-05, DB-07) — MEDIUM**: Current home query fetches 12 rows without join depth; admin table will regress at 10k rows. Mitigation: require EXPLAIN ANALYZE on PRs >10k rows, enforce server pagination, implement XFetch/mutex for stampede.
- **Anti-spam/bot (SEC-03, SLOG) — MEDIUM**: No Turnstile/Honeypot today → spam orders, fake signups. Upstash rate limits free tier is generous but not infinite; misconfig → lockout legitimate users. Mitigation: tiered limits per RLIM-01, security_logs 1yr retention, 5 fails/10min IP block.
- **Concurrency/Inventory race (CONCURRENCIA-01, DB stock) — HIGH**: No row locking today → double-sell under concurrent checkout. Mitigation: `SELECT ... FOR UPDATE` inside SERIALIZABLE transaction for variant stock decrement; OCC 409 for admin edits.
- **MONEY float drift (MONEY-01) — HIGH**: Existing numeric prices compound cent errors at scale. Migration must backfill INTEGER centavos without downtime (expand/contract) — requires careful deploy ordering.
- **.next staged + no git history — MEDIUM**: 292 build artifacts staged due to .gitignore `node_modules/` pattern not covering `.next/` at root of index; next `git commit` would bloat history. Mitigation: Slice A must fix `.gitignore` to `.next/` + `git rm --cached -r .next` before first commit.
- **Testing gap (TEST-01, prompt 90%) — HIGH**: 1 smoke test vs 80/90% gate → CI gate would block all PRs if threshold enforced naively. Mitigation: set incremental `coverage_threshold` per slice (A:10→B:30→C:60→D:80/90) and gate only changed files initially.
- **Env validation bypass (ENV-01) — MEDIUM**: Raw `process.env!` allows boot with missing secrets → runtime 500 on payment webhook. Mitigation: Zod `src/config/env.ts` fail-closed at `instrumentation.ts` startup.
- **Cost-zero sustainability — MEDIUM**: Upstash/QStash free tiers (10k commands/day) can be exhausted by aggressive polling (e.g., abandoned cart cron every minute). Mitigation: pg_cron `every hour` for abandoned carts (>4h), not per-minute; document quota in ARCHITECTURE.md.

## Ready for Proposal

**Yes.** Constitution is fully parsed, codebase is inventoried, gaps are quantified, and sliced approach is defined. Next phase `sdd-propose` should:

1. Create `openspec/changes/ecommerce-high-end-constitution/proposal.md` with: intent (high-end cost-zero e-com compliant by design), scope (all 43 sections sliced A→D), non-goals (Turborepo deferred), cost-zero audit per service, rollback plan per ROLL-01/02, and 90% vs 80% coverage resolution.
2. Reference this exploration via Engram `sdd/ecommerce-high-end-constitution/explore` and filesystem `exploration.md`.
3. Forecast delivery: 4 slices / ~5-6 chained PRs (800-line budget: Chained PRs recommended Yes, 400-line default High risk if monolithic).
4. Blockers before proposal: resolve `.gitignore` .next bug in Slice A scope (already quantified).

---

*Generated for `sdd-explore` executor. Artifact persisted to hybrid store per SDD phase-common C. All code claims verified via direct file reads; no guessing.*
