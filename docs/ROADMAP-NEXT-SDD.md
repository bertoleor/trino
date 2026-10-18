# Roadmap Next SDD Cycles — Santísima Trinidad

> **Project**: santisima-trinidad | **Workspace**: `E:\sitios web E\santisima-trinidad`
> **Status**: `sdd-init` done (hybrid: OpenSpec + Engram, 2026-09-03) · Last archive: `client-warnings-fix` 2026-09-04 — PASS 0/0 (6 deltas, 26 scenarios, 10/10 tasks, 359 tests, 58% coverage) · 13 caps in `openspec/specs/*`
> **Source of truth**: `openspec/specs/*` (13 caps) · Archive audit trail: `openspec/changes/archive/2026-09-04-client-warnings-fix/archive-report.md`
> **Pre-read**: Engram memories #866 `security-csp-nonce`, #867 `tooling-ci-regeneration`, #868 `client-mobile-perf` · Archive reports #865, #855

---

## Execution Order (recommended)

| Order | Change | Priority | Size | Why this order |
|-------|--------|----------|------|----------------|
| **P1** | `tooling-ci-regeneration` | Quick win | 1 PR ≤400 | Unblocks `database.types.ts` staleness from 0022; re-enables Lighthouse CI gate; zero-risk tooling, no spec churn — clears runway for the next two |
| **P2** | `security-csp-nonce` | Security harden | 1 PR ≤400 | Per-request nonce CSP (S-01) — isolated from data/shipping, no migration, builds on clean tooling from P1 |
| **P3** | `client-mobile-perf` | Largest | 1 PR ≤400 | Mobile perf + harden pass (RBAC depth, Cache-Control, pg_trgm EXPLAIN, RLS two-role, k6, LCP/CLS/INP, 44px thumb) — depends on P1+P2 being green |
| Backlog | `ecommerce-client-v2` | Feature | not yet planned | Conversion features (buy-again, related carousel, share viral) — parked until P1-P3 PASS |

All three are **stacked-to-main** (branch off `main`, merge sequentially). Each is a **single PR ≤400 lines** / ≤150 lines per file per constitution. No parallel branches.

---

## P1 — `tooling-ci-regeneration` (next up)

**Engram topic_key**: `sdd/tooling-ci-regeneration` (also indexed as `next-sdd/tooling-ci-regeneration`, obs #867)
**Initiation**: `sdd-new tooling-ci-regeneration`

### Intent

Bundle the two hygiene gaps left as S-02/S-03 in archive report §Next SDD Suggestion into one tooling-only SDD cycle. No product behavior change, no DB migration beyond type regen. Closes the "stale types after 0022" and "Lighthouse gate present but not enforced" warnings before they bite the next feature.

### Scope

- **Files**
  - `lighthouserc.json` — assert `categories:performance ≥90`, `pwa ≥90` (and keep existing asserts)
  - `.github/workflows/ci.yml` — wire `lighthouserc` step (LHCI `assert` + `upload` artifact), pin `supabase/supabase:15.x` image / compose where applicable (resolves design open question on image pin)
  - `src/types/database.types.ts` — regenerate via `supabase gen types typescript --local` after migration `0022` (CHECK + pg_trgm + entitlements)
  - `supabase/config.toml` or `docker-compose.yml` (whichever pins local image) — document pin decision
  - `src/lib/validations/*` — Zod sync check if types drift (read-only unless drift found)
- **Spec traces**
  - `performance-scalability` — Lighthouse threshold requirement (MODIFIED: enforce 90 gate in CI)
  - `observability-health` / `security-resilience` — indirect: types freshness is a correctness gate, not a new cap
  - No new delta required beyond build-tooling if team treats this as non-product; otherwise a 1-requirement delta `Build Tooling Freshness` under `performance-scalability` or `observability-health` with 2 scenarios (Given stale types / When `gen types` runs / Then file matches live schema; Given LHCI / When CI runs / Then assert ≥90).
- **Out of scope**: product features, migrations, UI changes, `ecommerce-client-v2`.

### Approach

- **Tasks**: 2–3
  1. Regenerate `database.types.ts` + verify Zod alignment (counts as 1 task, ≤150 lines generated file excluded from budget per usual `gen` exemption — verify via `tsc` + `diff`)
  2. Wire Lighthouse CI gate 90 in `ci.yml` + `lighthouserc.json` (1 task)
  3. Pin Supabase image for CI/local + doc decision (can merge into task 2 if ≤150 lines)
- **PR split**: **1 PR ≤400**, stacked-to-main off current `main` (`dcb9a84` + P1 will be new HEAD). No chain needed — estimator 120–200 lines + generated types.
- **TDD**: Strict. Pre-write failing assertions: `t-tooling-types.spec.ts` (types reflect 0022 CHECK), workflow yaml lint, lighthouserc assert shape.

### Risks

- `supabase gen types` output churn is noisy — mitigate by committing with `--local` deterministically and reviewing diff, not hand-editing.
- LHCI in CI can flake on runner perf — mitigate with `assert` only (no `performance` budget fail-hard initially) and `upload` artifact for triage; threshold stays 90.

### Success Criteria (verify PASS gates)

- `npx tsc --noEmit` 0 errors, `pnpm lint` 0/0, `pnpm build` 75/75 (or 75+ if route added — expect 75), `pnpm test` ≥359 green (no regression), coverage ≥35% (target ≥58% hold), `database.types.ts` matches `supabase gen types --local` output, CI shows LHCI assert step green with threshold 90.

### Dependencies

- None — this is the unblocker. Must land before P2/P3 so their verify can rely on fresh types.

---

## P2 — `security-csp-nonce` (S-01)

**Engram topic_key**: `sdd/security-csp-nonce` (obs #866)
**Initiation**: `sdd-new security-csp-nonce`

### Intent

Replace the static CSP `script-src 'self'` (PR10 HOTFIX strict CSP without `unsafe-inline`) with a **per-request nonce** flow. Keeps the strict CSP win, restores legitimate inline script support (e.g., `next-intl` hydration) without regressing to `unsafe-inline`. Small, isolated, high-leverage security delta.

### Scope

- **Files**
  - `src/proxy.ts` (Next.js `proxy`/`middleware`) — `crypto.randomUUID()` per request, set `x-nonce` / `csp-nonce` header, inject into CSP `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'` (or `'nonce-…'` alone if `strict-dynamic` deferred)
  - `next.config.ts` — change static header template to nonce placeholder; remove any residual `unsafe-inline` fallback
  - `src/app/layout.tsx` or nonce provider — read nonce from headers and pass to `<Script nonce={nonce}>` / inline `<script nonce>`
  - Tests: integration `t-prx-nonce.spec.ts` — assert response headers contain `script-src … 'nonce-…'` + body `<script nonce>` matches header nonce
- **Spec traces**
  - `security-resilience` — delta 1 requirement, 2–3 scenarios (Given request / When proxy generates nonce / Then header `script-src` contains `nonce-…` without `unsafe-inline`; Given response / When rendered / Then every inline `<script>` carries matching nonce)
  - No DB migration.
- **Out of scope**: data layer, shipping batch, RLS, performance budgets.

### Approach

- **Tasks**: 2–3, each ≤150 lines
  1. Proxy/middleware nonce generation + header injection
  2. Layout/script nonce propagation + `next.config.ts` header template update
  3. Integration tests + verify CSP still strict (optional merge into 2)
- **PR split**: **1 PR ≤400**, stacked-to-main on top of P1. Estimated 120–180 lines + tests.
- **TDD**: Strict. RED: request 2 sequential GETs → nonces differ, nonce in header equals nonce in body; GREEN: implement `proxy.ts:generateNonce`.

### Risks

- Middleware streaming / `headers()` async boundary — Next 16 `proxy.ts` is the correct surface (not legacy `middleware.ts`); verify with Context7 for Next 16 proxy API.
- `strict-dynamic` interaction with `'self'` — test in both dev and `pnpm build` preview; fall back to nonce-only if `strict-dynamic` breaks third-party scripts.

### Success Criteria

- `pnpm build` 75/75, lint 0, tsc 0, tests ≥361 (P1 baseline + 2 nonce tests), CSP header on every route contains `'nonce-…'` and no `'unsafe-inline'`; `verify` PASS 0/0 for this delta.

### Dependencies

- **Depends on P1** (`tooling-ci-regeneration`) — types must be fresh so P2's `proxy.ts`/`layout.tsx` changes type-check cleanly; LHCI artifact from P1 not required but preferred.

---

## P3 — `client-mobile-perf` (harden pass, largest of the three)

**Engram topic_key**: `sdd/client-mobile-perf` (also `sdd/client-mobile-first`, obs #868)
**Initiation**: `sdd-new client-mobile-perf`

### Intent

Close the remaining 6 minor verify warnings at depth (not just surface) and ship the **mobile-first perf** slice that matters before launch with 500 SKUs: prove RBAC 4-tier enforcement depth, private `Cache-Control` correctness, `pg_trgm` index EXPLAIN, Customer 360 LTV single-join `<1s`, RLS two-role integration with `supabase-local` + k6 `50 VUs` `SERIALIZABLE`, and Core Web Vitals `LCP<2.5 CLS<0.1 INP<200` + `44px` thumb / `bottom-nav` / `bottom-sheet` + virtualization tuning. This is the largest of the three but still budgeted to **≤400** by scoping to single-PR harden (no new caps).

### Scope

- **Files (indicative, ≤150 each)**
  - `src/proxy.ts` / `src/lib/auth/roles.ts` — RBAC 4-tier depth proof (E2E two-role matrix `super_admin>admin>editor>viewer` deny-default 403)
  - `next.config.ts` / `src/app/**/route.ts` headers — `private, no-cache, no-store` vs `s-maxage 60 swr 300` route split verification + tests
  - `supabase/migrations/0022_*` + `src/lib/customer360.ts` — `pg_trgm` GIN `ILIKE`+`similarity>0.3` EXPLAIN proof + LTV single-join `authorized..delivered` p95`<1s` metric
  - `supabase/config.toml` / `.github/workflows/ci.yml` — `supabase-local` two-role RLS integration + `k6` 50 VUs `SERIALIZABLE` job
  - `src/components/mobile/*` — `44px` thumb, `bottom-nav`/`bottom-sheet`, virtualization (`@tanstack/virtual`) tuning; existing `performance-scalability` virtualization requirement deepened
  - `lighthouserc.json` + `src/lib/observability/*` — LCP/CLS/INP budget wiring (leverages P1 gate)
- **Spec traces** (refine existing caps, no new cap unless needed)
  - `security-resilience` — RBAC depth + RLS two-role (`has_role()` DEFINER A≠B 403) harden
  - `concurrency-inventory` — `BroadcastChannel('auth')`+`storage` fallback + `SERIALIZABLE` k6 proof
  - `performance-scalability` — `pg_trgm` EXPLAIN + Customer 360 LTV p95 + virtualization + LCP/CLS/INP
  - `admin-backoffice` — hierarchy gate E2E depth
  - `observability-health` — latency metric wiring
  - `shipping-carriers` — unchanged (P3 does not touch batch SSE)
- **Out of scope**: `ecommerce-client-v2` conversion features; new product caps.

### Approach

- **Tasks**: 5–7 (still 1 PR)
  1. RBAC 4-tier E2E depth matrix + audit log proof
  2. Cache-Control private/public split verification (header tests)
  3. `pg_trgm` EXPLAIN + Customer 360 LTV p95 metric
  4. RLS two-role `supabase-local` integration + k6 50 VUs
  5. Mobile perf: 44px thumb + bottom-nav/sheet + virtualization tuning + LCP/CLS/INP budget
  - Grouped for ≤400: tasks are slices, PR aggregates them; if any slice exceeds 150, split the task — but keep **1 PR total** (budget is the gate).
- **PR split**: **1 PR ≤400**, stacked-to-main on top of P2. Estimator 280–380 lines. If it threatens >400, defer the `k6` job to a follow-up `tooling-k6` — do not breach 400.
- **TDD**: Strict. Each task has RED `t-*.spec.ts` + E2E where noted (`has_role` DEFINER, auth-sync cross-tab, LTV p95, RLS two-role). Triangulation ≥3 cases per slice.

### Risks

- Largest scope of the three — risk is scope creep past 400. Mitigate by hard budget; park overflow to backlog, not to a second PR in this cycle.
- `supabase-local` + k6 in CI needs Docker — already pinned in P1, so P3 inherits it.
- Core Web Vitals thresholds are runner-sensitive — use LHCI `assert` budgets + lab metrics first, field metrics later.

### Success Criteria

- `verify` PASS 0/0 for the 5–7 refined scenarios; `pnpm build` 75/75, lint 0, tsc 0, tests net +8–12 vs P2 baseline, coverage ≥58% hold, LCP`<2.5` CLS`<0.1` INP`<200` in LHCI lab, `44px` thumb audit (axe/accessibility) green, EXPLAIN shows `Bitmap Index Scan` on `pg_trgm` GIN, k6 `50 VUs` no `SERIALIZABLE` abort >1%.

### Dependencies

- **Depends on P1 + P2** — P1 provides pinned local image + fresh types for RLS tests; P2 provides nonce CSP so mobile inline scripts don't regress.

---

## Backlog — `ecommerce-client-v2` (not yet planned)

**Status**: Backlog — do not initiate SDD until P1–P3 are archived PASS 0/0.
**Engram topic_key**: `backlog/ecommerce-client-v2` (to be created at proposal time)
**Initiation (when ready)**: `sdd-new ecommerce-client-v2` — only after `client-mobile-perf` archive.

### Intent (parked)

Conversion features that directly move revenue — scoped as a **feature** change, not a fix/harden, so it comes after the harden pass.

- **buy-again** — one-tap reorder from `/account/orders` (reuse `customer360` LTV join + order history)
- **related carousel afinado** — tuned related-products carousel (refine `ecom-engine` + `performance-scalability` image pipeline + virtualization)
- **share viral** — social share / referral affordance (Web Share API + OG image, `next-intl` locale-aware)

Spanish product terms kept per constitution brand context (`Trinidad` triple taxonomy, Neo-Bauhaus palette).

### Why parked

Archive report deferred 6 minor warnings at depth — P3 hardens them. Launching `v2` conversion on top of unfixed perf/RLS depth would compound risk. Ordering P1→P2→P3→v2 keeps each cycle **≤400** and reviewable.

### When to plan it

After P3 archive: run `sdd-propose ecommerce-client-v2` with intent/scope/approach, then `sdd-spec` (deltas to `ecom-engine`, `performance-scalability`, `i18n-routing`), then `sdd-design` + `sdd-tasks` (expect 6–10 tasks, likely **2 PRs ≤400** chained stacked-to-main given feature scope — exception to the 1-PR rule for P1–P3).

---

## How to start next SDD

`sdd-init` is **already done** — hybrid mode, `openspec/config.yaml` present, 13 caps in `openspec/specs/*`, `pnpm` + `vitest` + `playwright` wired, `cross-env TEMP=E:/temp` cache. Do not re-run `sdd-init` unless reinitializing the workspace.

### Start the next change (P1 first)

```bash
# from E:\sitios web E\santisima-trinidad
sdd-new tooling-ci-regeneration
# equivalent: gentle-ai sdd-propose tooling-ci-regeneration  (then spec/design/tasks/apply/verify/archive)
```

### Subsequent cycles (stacked-to-main)

```bash
# after P1 archive PASS 0/0
sdd-new security-csp-nonce

# after P2 archive PASS 0/0
sdd-new client-mobile-perf
```

### Resume an in-flight change

```bash
sdd-continue tooling-ci-regeneration   # or security-csp-nonce / client-mobile-perf
```

### SDD phase order (per change)

`proposal` → `spec` (delta, Given/When/Then, RFC 2119) → `design` (ADRs, diagrams, 150-line plan) → `tasks` (phased, <800 per PR) → `apply` (TDD RED→GREEN, ≤150 per file) → `verify` (build/lint/tsc/tests/coverage/TDD/spec gates) → `archive` (merge to `openspec/specs/*` + Engram).

Verify gate for every cycle: `pnpm build` 75/75, `pnpm lint` 0, `tsc` 0, `vitest run` green, coverage ≥35% (hold ≥58%), `verify` PASS 0/0. Follow `openspec/AGENT_RULES.md` + `openspec/config.yaml` tdd:true.

---

## Traceability

| Plan | Engram obs | Archive source | Spec delta target |
|------|------------|----------------|-------------------|
| P1 tooling-ci-regeneration | #867 | `archive-report` S-02/S-03 (2026-09-04) | `performance-scalability` (LHCI 90), types freshness (tooling) |
| P2 security-csp-nonce | #866 | `archive-report` S-01 | `security-resilience` 1 req 2–3 scenarios |
| P3 client-mobile-perf | #868 | `archive-report` 6 warnings depth + S-04/S-05 deferred | `security-resilience`, `concurrency-inventory`, `performance-scalability`, `admin-backoffice`, `observability-health` (refinements) |
| Backlog ecommerce-client-v2 | — (create at propose) | Brand plan + conversion backlog | `ecom-engine`, `performance-scalability`, `i18n-routing` (future) |

*Roadmap generated 2026-09-04 — canonical file `docs/ROADMAP-NEXT-SDD.md`. Do not duplicate to `openspec/ROADMAP-NEXT-SDD.md` per instruction (canonical is `docs/`).*
