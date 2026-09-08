# Proposal: ecommerce-high-end-constitution

## Proposal Question Round

1. Bank comprobante `pending_verification`+admin approve?
2. Shipping Strategy cached — fixed fallback?
3. Brand 0 bytes — infer Bauhaus?
4. Coverage 90/80 hybrid approve?
*Silent = pending+approve, Andreani→fixed, infer, 90/80.*

## Intent

Codify CONSTITUTION v3.1 (154 rules) into enforceable guardrails on Next.js 16+Supabase. Fix 12% compliance and deliver i18n/payments/shipping/500-SKU scale cost-zero.

## Scope

### In Scope
- Guardrails: ESLint 150-line, `env.ts` Zod, CSP/HSTS, RLS, `database.types.ts`
- i18n es-AR/en/fr/pt-BR `next-intl` `[locale]`, ICU, hreflang/sitemap, ARS `INTEGER`
- Payments: MercadoPago zero-PAN + bank comprobante presigned+email
- Shipping: Strategy Andreani/Correo/OCA cached `POST /api/shipping/rates`
- Scale: pagination 25/100, FTS GIN, SERIALIZABLE `FOR UPDATE`, OCC 409, virtualization, stampede mutex
- Automations: abandoned cart >4h pg_cron+Resend, stock alerts, QStash async, Turnstile, audit logs, anon cart+merge, ENUM `draft→refunded`

### Out of Scope
- Turborepo, Algolia, native app, subscriptions, fiscal invoices

## Capabilities

### New Capabilities
- `i18n-routing`: next-intl
- `money-arithmetic`: INTEGER centavos
- `payments`: MP 3-layer + bank proof
- `shipping-carriers`: strategy+cache+A4/ZPL
- `concurrency-inventory`: OCC+SERIALIZABLE
- `security-resilience`: headers/RLIM/SLOG/COOKIE/circuit
- `ecom-engine`: anon cart+merge, ENUM
- `performance-scalability`: pagination/FTS/virtualization
- `observability-health`: OTel+Sentry, `/api/health`
- `admin-backoffice`: RBAC, TipTap/Dropzone, 360 LTV

### Modified Capabilities
- None — `openspec/specs/` empty.

## Approach

Approach 2 baseline + sliced delivery. Expand/contract keeps compat. Slices A Bootstrap → B DB → C Security → D Perf. Chained PRs for 800 lines.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `next.config.ts` | Modified | CSP/HSTS, Brotli, cache |
| `src/config/env.ts` | New | Zod fail-closed |
| `src/{components,hooks,lib,types,i18n}` | New | ui 44px, validations, next-intl |
| `supabase/migrations/*` | New | money INT, audit/DLQ, FTS GIN |
| `src/app/[locale]`,`src/app/api` | New/Mod | locale, shipping/webhook/health |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| PCI zero-PAN | High | MP tokenized, HMAC only non-200 |
| Shipping quota | High | Session cache, p-limit, fallback |
| Double-sell | High | SERIALIZABLE `FOR UPDATE` + OCC |

## Rollback Plan

ROLL-01/02/03 + kill switch `<1s`. Trigger 5% err 2min / p95>3s / 503>30s / payment fail. `vercel rollback` → flag off → health 200 → notify → 48h post-mortem. DB expand/contract = no DB revert; DLQ replay.

## Dependencies

Upstash free, Resend free, Supabase free, MercadoPago free, Andreani rates. Env via Zod.

## Success Criteria

- [ ] lint/tsc/build zero warnings; no emojis
- [ ] 4 locales + hreflang; zero literals; ARS INT
- [ ] MP + bank e2e; webhook idempotent
- [ ] Cached shipping under quota; 500 SKUs paginated+FTS; SERIALIZABLE stock
- [ ] 90% critical / 80% global enforced

*Bauhaus inferred (0 bytes). Folder `app`+`components/[feature]`+`lib/[domain]`; DB deleted_at+RLS+types+Zod; Cost-zero MP 0 fixed, Supabase 500MB, Upstash 10k/d, Resend 100/d, Vercel 100GB.*
