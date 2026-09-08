# Proposal: client-warnings-fix

## Proposal Question Round

Silent = proceed with assumptions; answer/skip/correct or request second round.

- Editor edits catalog not roles, viewer read-only hierarchy `super_admin>admin>editor>viewer`? **Yes**
- LTV = sum `authorized..delivered` single join <1s? **Yes**
- Labels grouped by `postal_code`, p-limit 10, SSE >100? **Yes**

## Intent

Close 6 warnings W-02..W-08 (`PASS 0C/6W` → `PASS 0/0`). No new caps.

## Scope

### In Scope
- W-02 RBAC 4-tier via entitlements + `has_role()` SECURITY DEFINER
- W-03 `private, no-cache, no-store` for `/admin/*` `/account/*` `/api/*`
- W-04 Customer 360 single-join LTV + last_login + cart (no N+1)
- W-05 BroadcastChannel cross-tab logout + storage fallback
- W-06 `pg_trgm` extension + similarity indexes (with FTS GIN)
- W-07 Batch A4/ZPL grouped by postal_code, p-limit, SSE
- W-08 supabase-local RLS two-role integration (replaces mock)

### Out of Scope
- New caps, S-01..S-05, E2E stubs, k6 load, redesign

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-backoffice`: RBAC 4-tier + Customer 360 LTV
- `security-resilience`: private Cache-Control + RLS depth
- `concurrency-inventory`: BroadcastChannel
- `performance-scalability`: pg_trgm + cache split
- `shipping-carriers`: batch A4/ZPL SSE
- `observability-health`: RBAC audit logs

## Approach

Delta-only: migration `0022` (CHECK+pg_trgm+indexes), `next.config` headers, `proxy`+`auth/roles.ts`, `realtime/auth-sync.ts`, `customer360.ts` join, `shipping/labels.ts` batch, `tests/integration/rls-*`. Stacked-to-main ≤800 lines.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/0022_*` | Modified | CHECK 4-tier, pg_trgm, indexes |
| `next.config.ts` + `proxy.ts` | Modified | private vs public cache, hierarchy |
| `src/lib/customer360.ts` | New | single-join LTV |
| `src/lib/realtime/auth-sync.ts` | New | BroadcastChannel fallback |
| `src/lib/shipping/labels.ts` | Modified | batch A4/ZPL p-limit SSE |
| `tests/integration/rls-*` | New | two-role RLS proof |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| RBAC over-privilege | Med | deny-default, 403+security_logs tests |
| CDN caches private | Low | header tests per route |
| supabase-local flake | Med | healthcheck retry 3 |

## Rollback Plan

`vercel rollback` <1s, flag `new_rbac_active=false`, `DROP CHECK/EXTENSION` revert. Triggers: err>1%/5m, p95>2s, 503>30s.

## Dependencies

Supabase local Docker, Upstash Redis, baseline `0001-0021`, Next 16 headers().

## Success Criteria

- [ ] Verify `PASS 0/0`, lint 0, tsc 0, build 74/74, coverage ≥53% global ≥35% changed
- [ ] Header: `/admin` private, catalog `s-maxage 60 swr 300`
- [ ] RLS A≠B 403, cross-tab logout <1s, pg_trgm fuzzy, batch 45 ZPL grouped+SSE
