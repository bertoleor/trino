# Tasks: client-warnings-fix

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900–970 (12 files) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 RBAC → PR2 Data/Sync → PR3 Shipping |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | RBAC + cache split | PR1 → main | 0022, roles, proxy, next.config, RLS tests |
| 2 | 360 + pg_trgm + auth-sync | PR2 → main | single-join LTV, GIN, BroadcastChannel E2E |
| 3 | Shipping batch SSE | PR3 → main | p-limit 10 postal_code SSE >100 |

## Phase 1: Foundation — RBAC Core

- [x] 1.1 Create `supabase/migrations/0022_client_warnings_fix.sql` CHECK 4-tier + `has_role()` SECURITY DEFINER + pg_trgm + GIN + customer_360 view | Trace W-02,W-04,W-06 | Test EXPLAIN GIN | Accept has_role editor true for admin | ~110 PR1
- [x] 1.2 Create `src/lib/auth/roles.ts` Role type, rank map, hasRole/requireRole/isEditorOrAbove | Trace W-02 | Test has-role.test.ts 4×4 matrix | Accept viewer deny | ~60 PR1
- [x] 1.3 Modify `src/proxy.ts` hierarchy gate deny-default 403 → security_logs+audit_logs | Trace W-02 | Test anon /admin 302, editor delete 403 | Accept 5 fails/10min alert | ~45 PR1
- [x] 1.4 Modify `next.config.ts` private no-cache no-store for /admin|/account|/api/* keep s-maxage catalog | Trace W-03 | Test header /admin vs /tienda | Accept CDN no-store | ~25 PR1

## Phase 2: Core — Data & Sync

- [x] 2.1 Create `src/lib/customer360.ts` getCustomer360 single-join SUM total_cents authorized..delivered + last_login+cart metric | Trace W-04 | Test customer360.test.ts no N+1 | Accept p95<1s | ~90 PR2
- [x] 2.2 Create `src/lib/realtime/auth-sync.ts` BroadcastChannel('auth') + localStorage fallback init/broadcast | Trace W-05 | Test auth-sync.spec.ts 2 tabs <1s | Accept Safari fallback | ~80 PR2
- [ ] 2.3 Modify `src/lib/shipping/labels.ts` groupByPostalCode + p-limit 10 A4/ZPL | Trace W-07 | Test 45 orders grouped, spy concurrency 10 | Accept grouped blobs | ~70 PR3
- [ ] 2.4 Create `src/app/api/admin/shipping/batch/route.ts` ReadableStream SSE progress per10 + done {urls} | Trace W-07 | Test 120 rows SSE | Accept progress+done | ~95 PR3

## Phase 3: Testing

- [x] 3.1 Create `tests/integration/rls-two-role.test.ts` supabase-local A≠B 403 has_role DEFINER retry3 | Trace W-08 | Test B≠A cart, anon 403 | Accept security_logs | ~110 PR1
- [ ] 3.2 Tests `has-role.test.ts`+`customer360.test.ts`+`auth-sync.spec.ts`+shipping SSE | Trace W-02,W-04,W-05,W-07 | Test pnpm build 74/74 lint0 coverage≥53% | Accept PASS 0/0 | ~215 PR2/PR3

## Work-Unit Commits

- PR1: `feat(rbac):0022` → `feat(auth):roles` → `fix(proxy):deny-default` → `fix(headers):private` → `test(rls):two-role`
- PR2: `feat(customer360):join` → `feat(realtime):auth-sync` → `test:360+sync`
- PR3: `feat(shipping):p-limit` → `feat(shipping):SSE` → `test:batch`

## Verification

- [ ] lint0 tsc0 build74/74 coverage≥53% global ≥35% changed
- [ ] /admin private /tienda s-maxage60
- [ ] has_role blocks editor, EXPLAIN GIN, logout <1s
