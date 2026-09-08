# Design: client-warnings-fix

## Technical Approach

Delta-only fix for 6 warnings W-02..W-08 (PASS WITH WARNINGS 0C/6W → 0/0) without new caps. Single migration `0022` (CHECK + pg_trgm + entitlements update), `next.config.ts` cache split, `src/proxy.ts` hierarchy gate + `has_role()` SECURITY DEFINER, 3 new libs (`auth/roles`, `realtime/auth-sync`, `customer360`), shipping batch `p-limit` SSE, and supabase-local two-role integration. Stacked-to-main ≤800 lines, zero warnings gate.

Maps to 6 deltas: `admin-backoffice` (RBAC+360), `security-resilience` (headers+RLS), `concurrency-inventory` (BroadcastChannel), `performance-scalability` (pg_trgm+cache), `shipping-carriers` (A4/ZPL batch), `observability-health` (RBAC audit+360 metric).

## Architecture Decisions

### AD-01: RBAC 4-tier via `has_role()` SECURITY DEFINER

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `app_metadata.role` + `is_admin()` boolean | Simple; fails W-02 hierarchy, bypass via `IN SELECT` | Rejected |
| Client-side guard | Zero latency; trivially bypassed, violates ADMIN-04 | Rejected |
| `entitlements` CHECK 4-tier + `has_role(role)` SECURITY DEFINER hierarchy | One DB round-trip; RLS-safe (no `IN SELECT`), deny-default, auditable | **Chosen** |

Hierarchy `super_admin(4)>admin(3)>editor(2)>viewer(1)` compared via `case` rank. Editor ∈ catalog-write, viewer read-only, `super_admin` alone manages roles. Every `/admin/*` goes through `proxy.ts` → `has_role()` → 403 + `security_logs`/`audit_logs` on deny.

### AD-02: Cache-Control private vs public split

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Global `s-maxage 60 swr 300` | CDN caches private `/admin` → W-03 FAIL | Rejected |
| `no-store` everywhere | Safe but kills catalog p95 | Rejected |
| Route-scoped headers in `next.config.ts` | Private `private, no-cache, no-store` for `/admin|/account|/api/*`; public catalog keeps `s-maxage 60 swr 300`; verifiable per-route | **Chosen** |

### AD-03: pg_trgm GIN + similarity fallback

| Option | Tradeoff | Decision |
|--------|----------|----------|
| FTS `tsvector` only | Exact; typo "medialunaa" misses | Rejected |
| `ILIKE '%term%'` alone | Full scan, no index, no ranking | Rejected |
| FTS GIN primary + `pg_trgm` GIN `similarity()>0.3` + `ILIKE` fallback | Typo-tolerant, indexed, EXPLAIN proves GIN | **Chosen** |

### AD-04: BroadcastChannel + storage fallback

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Supabase Realtime presence | Extra cost, violates cost-zero | Rejected |
| `storage` only | Works Safari private but fires on unrelated sets | Rejected |
| `BroadcastChannel('auth')` primary + `localStorage 'auth:logout'` fallback | Cross-tab logout <1s, graceful Safari private, no deps | **Chosen** |

### AD-05: Customer 360 single-join

| Option | Tradeoff | Decision |
|--------|----------|----------|
| N+1 per-entity fetches (5 round-trips) | p95>2s at 200 orders | Rejected |
| Materialized view | Fast but stale LTV | Rejected |
| SQL VIEW `customer_360` + helper `get_customer_360(uuid)` single JOIN aggregating `SUM total_cents WHERE status IN (authorized..delivered)` + `last_login` + `cart` + orders + notifications, one round-trip p95<1s | **Chosen** |

### AD-06: Shipping batch SSE grouped by postal_code

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Sync loop generate-then-download | Blocks >100 rows, timeout | Rejected |
| Background job pg_cron | Overkill for sync admin action | Rejected |
| `groupBy(postal_code)` → `p-limit 10` → `ReadableStream` SSE `progress {completed,total}` per 10 + final `done {urls}`; ZPL `^XA` concatenated per group, A4 one page per label | **Chosen** |

## Data Flow

### Auth RBAC (W-02)

```
Browser → proxy.ts (checkRateLimit → updateSession → has_role) → 200 | 403
                                    ↓ deny                    ↓ allow
                            security_logs + audit_logs      Server Action
                                                         has_role() re-check
```

### Customer 360 (W-04)

```
GET /admin/customers/[id] → getCustomer360(id) → SELECT customer_360 VIEW
  single join: profiles ⟕ orders(SUM) ⟕ carts ⟕ notifications + last_login
  → {ltv, last_login, cart, orders, notifications}  p95<1s
  → logger metric duration → alert if >1s
```

### Cross-tab Auth Sync (W-05)

```
Tab A logout → BroadcastChannel('auth').postMessage({type:'logout'})
           ↘ localStorage.setItem('auth:logout', ts) [fallback]
Tab B onmessage|storage → supabase.auth.signOut() → redirect /login <1s
```

### Shipping Batch (W-07)

```
POST /api/admin/shipping/batch {ids, format:A4|ZPL}
  → groupBy(postal_code) → p-limit(10) generate labels
  → stream SSE: event:progress per 10 → event:done {urls/blobs}
  → ZPL concat ^XA per group | A4 PDF paginated
```

## Data Model — Migration `0022_client_warnings_fix.sql`

Idempotent, `IF NOT EXISTS` everywhere.

```sql
-- 1. Entitlements 4-tier CHECK (W-02)
alter table entitlements drop constraint if exists entitlements_role_check;
alter table entitlements add constraint entitlements_role_check
  check (role in ('super_admin','admin','editor','viewer'));

-- 2. has_role() hierarchy SECURITY DEFINER (replaces IN SELECT)
create or replace function public.has_role(required text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1 from entitlements where user_id=auth.uid()
    and case role when 'super_admin' then 4 when 'admin' then 3
                  when 'editor' then 2 when 'viewer' then 1 else 0 end
      >= case required when 'super_admin' then 4 when 'admin' then 3
                         when 'editor' then 2 when 'viewer' then 1 else 99 end
  ); $$;

-- backfill existing admin→admin, user→viewer ; update RLS policies to has_role()

-- 3. pg_trgm (W-06)
create extension if not exists pg_trgm;
create index if not exists idx_products_name_trgm on products using gin (name gin_trgm_ops);
create index if not exists idx_products_search_trgm on products using gin (search_vector gin_trgm_ops);
-- query: WHERE search_vector @@ plainto_tsquery('spanish',:q)
--        OR (name ILIKE '%'||:q||'%' AND similarity(name,:q)>0.3)

-- 4. Customer 360 VIEW (W-04)
create or replace view customer_360 as
select p.id, p.email, max(o.total_cents) filter (where o.status in
  ('authorized','processing','shipped','delivered')) as ltv_dummy -- real SUM below
from profiles p left join orders o on o.user_id=p.id group by p.id;
-- actual single-join in get_customer_360() using SUM + joins

-- 5. RLS update: replace is_admin() with has_role('editor') etc. where needed
```

Rollback: `drop extension pg_trgm; alter table entitlements drop constraint entitlements_role_check; add check (role in ('admin','customer')); drop function has_role(text);`

## File Changes

| File | Action | Description | Lines |
|------|--------|-------------|-------|
| `supabase/migrations/0022_client_warnings_fix.sql` | Create | CHECK 4-tier + `has_role()` + pg_trgm + indexes + customer_360 view + RLS updates | ~110 |
| `next.config.ts` | Modify | Route-scoped Cache-Control: private no-store for `/admin|/account|/api/*`, public catalog unchanged | ~25 |
| `src/proxy.ts` | Modify | Hierarchy gate `has_role()` server-side, deny-default 403 → security/audit logs, rate-limit preserved | ~45 |
| `src/lib/auth/roles.ts` | Create | `hasRole()`, `requireRole()`, rank map, `isEditorOrAbove()` helpers | ~60 |
| `src/lib/realtime/auth-sync.ts` | Create | BroadcastChannel('auth') + storage fallback, `<1s` logout/cart sync | ~80 |
| `src/lib/customer360.ts` | Create | `getCustomer360(id)` single-join LTV+last_login+cart, emits duration metric | ~90 |
| `src/lib/shipping/labels.ts` | Modify | `groupByPostalCode` + `p-limit 10` batch, A4/ZPL selector | ~70 |
| `src/app/api/admin/shipping/batch/route.ts` | Create | SSE `ReadableStream` progress per 10, `done` final, ZPL `^XA` / PDF | ~95 |
| `tests/integration/rls-two-role.test.ts` | Create | supabase-local anon vs auth A≠B 403, `has_role` proof | ~110 |
| `tests/unit/has-role.test.ts` | Create | Hierarchy matrix super_admin>admin>editor>viewer | ~60 |
| `tests/unit/customer360.test.ts` | Create | Single-join mock, LTV sum `total_cents` delivered auth..delivered | ~70 |
| `tests/e2e/auth-sync.spec.ts` | Create | Playwright two-tab BroadcastChannel + storage fallback <1s | ~85 |

All ≤150 lines (CONSTITUTION 43 §file-limit). Decompose if exceed: split `labels.ts` ↔ route handler.

## Interfaces / Contracts

**Headers (W-03)**

```
GET /admin/*, /account/*, /api/* → Cache-Control: private, no-cache, no-store
GET /tienda, /api/catalog/*, /cultura/* → Cache-Control: public, s-maxage=60, stale-while-revalidate=300
GET /_next/static/* → Cache-Control: public, max-age=31536000, immutable
```

**Types**

```typescript
type Role = 'super_admin'|'admin'|'editor'|'viewer';
type Customer360 = { id:string; email:string; ltv_cents:number; last_login:string|null; cart: Cart|null; orders: Order[]; notifications: Notification[] };
type BatchRequest = { ids:string[]; format:'A4'|'ZPL' };
type SSEEvent = { event:'progress'; data:{completed:number;total:number} } | { event:'done'; data:{urls:string[]} };
```

**Auth-sync API**

```typescript
initAuthSync(): () => void  // sets up BroadcastChannel+storage listeners
broadcastLogout(): void       // posts logout + localStorage fallback
```

**RLS helper**

```sql
select has_role('admin') -- boolean, SECURITY DEFINER, replaces is_admin()
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | has_role hierarchy 4-tier, Cache-Control header map, pg_trgm ILIKE+similarity, p-limit grouping | Vitest: matrix tests, header assertion per route, EXPLAIN not FULL SCAN, group postal_code |
| Integration | RLS A≠B 403 isolation, supabase-local two-role (anon vs authenticated), has_role SECURITY DEFINER, security_logs insert on 403, Customer360 single-join no N+1 | `tests/integration/rls-two-role.test.ts` against `supabase-local` docker, healthcheck retry 3 |
| E2E | Cross-tab logout <1s via BroadcastChannel + storage fallback, SSE batch >100 progress, private vs public cache via CDN simulation | Playwright `browser.newContext()` two pages, SSE client consumes stream |

Coverage gate: global ≥53% ≥35% changed (verify baseline). `p-limit` verified via concurrency spy, `pg_trgm` via `EXPLAIN (COSTS OFF)` shows `Bitmap Index Scan on idx_products_name_trgm`.

## Migration / Rollout

1. Deploy migration `0022` idempotent on staging supabase-local; `pnpm build` 74/74.
2. Feature flag `new_rbac_active` (fallback to `is_admin()` if false) — <1s kill switch.
3. Canary 10% → monitor `security_logs` rate, 360 p95, error>1%/5m or 503>30s triggers `vercel rollback`.
4. Full rollout → archive deltas to `openspec/specs/`.

No data backfill beyond `admin→admin, customer→viewer` role remap.

## Open Questions

- [ ] Supabase local Docker image tag pin (`supabase/supabase:15.x` vs `supabase/postgres:15`) — confirm in CI `docker-compose.yml`.
- [ ] ZPL concatenation per `postal_code` group vs single blob — carrier spec prefers per-group; confirm OCA/Andreani.
