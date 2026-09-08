# Tasks: Clear Pending Work

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 350–500 (slice 1 ~300–450 incl. tests; slice 2 pure delete) |
| 400-line budget risk | Medium |
| 800-line budget risk | Low |
| Chained PRs recommended | Yes (force-chained) |
| Suggested split | PR 1 (slice 1: nonce apply+verify) → PR 2 (slice 2: guarded delete) |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main (recommended; slice 2 independent — feature-branch-chain also viable) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Apply + verify `security-csp-nonce` T-P2-01 | PR 1, base `main` | Proxy nonce, static split, layout + JSON-LD nonce, t-csp-nonce suite, verify gate |
| 2 | Guarded delete of stale duplicate folder | PR 2, base `main` (after PR 1) | Independent pure delete; archive-intact precondition; rollback from git/archive |

Strict TDD: yes for new `t-csp-nonce` suite (Phase 1 RED → Phase 2 GREEN). Test cmds: `pnpm test` (vitest run), `pnpm lint`, `npx tsc --noEmit`, `pnpm build`, staging `curl -sI` header check.

## Phase 1: RED tests (TDD foundation)

- [x] 1.1 Create `tests/unit/t-csp-nonce-proxy.test.ts` asserting uuid nonce, `x-nonce` req-stamp, CSP contains nonce, no response leak (must FAIL pre-impl)
- [x] 1.2 Create `tests/unit/t-csp-nonce-layout.test.ts` + `t-csp-drift-guard.test.ts` asserting nonce on 4 script sites, no `unsafe-inline`/`strict-dynamic` (must FAIL pre-impl)

## Phase 2: Slice 1 core implementation (GREEN)

- [x] 2.1 Modify `src/proxy.ts`: `crypto.randomUUID()` per request, stamp `x-nonce` via `NextResponse.next({request:{headers}})`, HTML-only nonce CSP; keep `/tienda`+`/cultura` static pass-through
- [x] 2.2 Modify `next.config.ts`: remove static `script-src 'self'` for HTML scope; retain HSTS/cache + static CSP for public routes
- [x] 2.3 Modify `src/app/layout.tsx` (read `x-nonce` via `headers()`) + `src/lib/seo/json-ld.ts` (`nonce?: string`) + producto/cultura pages (`nonce={nonce}` on JSON-LD scripts)
- [x] 2.4 GREEN check: `pnpm test -- t-csp-nonce` passes; `pnpm lint` 0, `npx tsc --noEmit` 0, zero TODOs

## Phase 3: Slice 1 verify gate (blocks archive)

- [x] 3.1 Run full `pnpm test` (376+), `pnpm build` (75+ pages) — record counts for verify report <!-- archive-reconciled 2026-09-06: stale checkbox; verify-report proves 399/399 full suite + 75/75 build -->
- [ ] 3.2 Staging `curl -sI`: exactly one CSP, `script-src 'self' 'nonce-…', `x-nonce`⇔CSP match, console zero CSP violations on 4 script sites — **DEFERRED to staging deploy (orchestrator-approved intentional partial archive 2026-09-06; static+unit+build evidence holds per verify-report W-2)**
- [x] 3.3 Confirm verify-gate PASS before `security-csp-nonce` archive; PR 1 boundary: start=static CSP, finish=nonce live+green, rollback=revert PR 1 <!-- archive-reconciled 2026-09-06: stale checkbox; verify-report verdict PASS WITH WARNINGS satisfies gate -->

## Phase 4: Slice 2 guarded delete

- [x] 4.1 Archive-intact check: `openspec/changes/archive/*ecommerce-high-end-constitution*/` contains proposal+specs+design+tasks; diff vs `openspec/changes/ecommerce-high-end-constitution/` byte-identical or archive authoritative
- [x] 4.2 Delete `openspec/changes/ecommerce-high-end-constitution/` (pure removal, no behavior change) as PR 2
- [x] 4.3 Rollback verification: restore from git history or archive copy returns artifacts byte-identical; `openspec/changes/` lists only in-flight work
