# AGENT_RULES — Constitution v3.1 Enforcement (MANDATORY / BLOQUEANTE)

> **BLOCKING CHECKLIST** — Every AI task MUST pass this file before writing code.
> If any rule is violated, STOP and fix. No exceptions, no emojis, zero warnings.
> Trace: `DOCS/DOCS/AGENT CONSTITUTION.MD` (154 rules, 36 sections) + 13 delta specs.

## 13 Categories — 154 Rules

| # | Category | Rules | CONST Sections | Delta Spec |
|---|----------|-------|----------------|------------|
| 1 | Seguridad | 18 | SEC-01..08, COOKIE-01..03, SLOG-01..03, DB-02 | security-resilience |
| 2 | Pagos | 12 | PRIV-05, ECOM-03..04, MONEY-01..03, WEBHOOKS-01 | payments, money-arithmetic |
| 3 | Envíos | 10 | LOG-01..03, ECOM-06, RES-02 | shipping-carriers |
| 4 | I18N | 10 | I18N-01..03 | i18n-routing |
| 5 | DB | 20 | DB-01..07, DB-DRIFT-01, DB-SYNC-01, IDX-01..03 | concurrency-inventory |
| 6 | Performance | 16 | PERF-01..08, HTTP-01..03, IDX-02 | performance-scalability |
| 7 | Testing | 8 | TEST-01..03, SEED-01..03 | observability-health |
| 8 | Estilo | 14 | CQ-01..09, UX-01..09, ARCH-01..06 | ecom-engine |
| 9 | Flujo masivo | 10 | JOBS-01..02, DEV-01..02, PERF-06..07 | ecom-engine |
| 10 | Anti-spam | 8 | SEC-03, RLIM-01..02, CONCURRENCIA-01 | security-resilience |
| 11 | Automatizaciones | 14 | RESILIENCIA-01, RES-02..03, ECOM-05, JOBS-01 | observability-health |
| 12 | Docs | 14 | CMS-01, DOC-01, API-01..02, DR-01..03 | admin-backoffice |
| 13 | Cultura Social | 14 | CULTURA-01..06, WISHLIST-01, REVIEWS-01 | cultura-blog, wishlist, reviews |

Total: **154 rules** — every requirement maps to one CONST ID (RFC 2119: MUST/SHALL).

## Mandatory Pre-Code Checklist

- [ ] CQ-03: file ≤150 lines (extract hook/subcomponent if near limit)
- [ ] CQ-06: strict TS, no `any`, Zod + `database.types.ts` (DB-SYNC-01)
- [ ] CQ-07: zero `console.*` — use `src/lib/logger.ts` (OBS-01)
- [ ] SEC-05: CSP/HSTS headers in `next.config.ts`
- [ ] ENV-01: `src/config/env.ts` Zod fail-closed at boot
- [ ] I18N-02: zero string literals — `t('ns.key')` via `next-intl`
- [ ] MONEY-01: `price_cents INT` — no float arithmetic
- [ ] DB-02/04: RLS on every table, soft delete `deleted_at`
- [ ] PERF-01: pagination 25/100, no full list loads
- [ ] Context7 consulted before any library API

## Spec Trace

13 specs: `ecom-engine`, `security-resilience`, `admin-backoffice`, `concurrency-inventory`, `observability-health`, `performance-scalability`, `payments`, `i18n-routing`, `money-arithmetic`, `shipping-carriers`, `cultura-blog`, `wishlist`, `reviews`.

## Appendix — WISHLIST / REVIEWS / CULTURA (T-FG-DOC)

CULTURA traces DOC-01 + CMS-01 via TipTap drafts, RLS anon vs admin, FTS GIN, pg_cron draft import. WISHLIST via anon session merge + dedup unique. REVIEWS via moderation queue, verified_purchase, helpful, presigned images, JSON-LD AggregateRating.

**Violation = PR blocked.**
