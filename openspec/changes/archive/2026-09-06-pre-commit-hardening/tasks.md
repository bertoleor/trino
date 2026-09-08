# Tasks: Pre-Commit Hardening Gate

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Slice A (H-1..H-4) | ~50-150 lines, docs-only |
| Slice B (S-1..S-5) | ~250-400 lines, edge + tests |
| Slice C (P-1..P-4) | ~150-350 lines, UI-only |
| Total estimate | ~450-900 lines |
| 400-line budget risk | High |
| 800-line risk | Medium (upper bound breaches 800 with tests) |
| Chained PRs recommended | Yes |
| Suggested split | PR-A → PR-B → PR-C (stacked-to-main) |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
NO-commit gate: NO commit until A+B+C verify PASS (vitest + tsc + build).

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| A | Hygiene close-out H-1..H-4 | PR-A → main | Base: main; docs-only; rollback: checkout checklist file |
| B | Security S-1..S-5 severity-ordered | PR-B → main (stacked on A) | Base: PR-A branch; rollback: revert B (C→B→A) |
| C | Perf P-1..P-4 UI sweep | PR-C → main (stacked on B) | Base: PR-B branch; rollback: revert C alone |

## Phase 1: Slice A — Hygiene (H-1 FIRST)

- [x] 1.1 H-1 decision FIRST: run `git diff --name-status` over 15 `D` paths, confirm archive byte-identical, record exclude-or-restore in this file (~10 lines).
- [x] 1.2 H-2 repoint `DOCS/checklist/01-complex-functions.md` lines 3/554 to archive copy; grep proves zero stale `ecommerce-high-end-constitution/` refs (~10 lines).
- [x] 1.3 H-3 close docs-verifiable §8 items only with file:line citations; §1-6 stay open; record staging-curl 3.2 deferral ticket (~30 lines).
- [x] 1.4 H-4 verify `security-csp-nonce/` has proposal+spec+design+tasks and green suite; RED `t-hygiene-closeout`, extend `t-a01-guardrails` (~40 lines).
- [x] 1.5 Verify A: `vitest run t-hygiene-closeout t-a01-guardrails` + stale-ref grep + `tsc --noEmit`. Start: worktree as-is; finish: docs-only diff. ✅ Accepted 2026-09-06 — verify-report Slice A PASS WITH WARNINGS (28/28 + tsc 0); ticked at archive-time per orchestrator "1.5/3.4 tick on acceptance" (stale-checkbox reconciliation, no work added).

## Slice A Evidence (apply batch 2026-09-06, PR-A boundary docs-only)

### H-1 decision: EXCLUDE (no restore)

- `git diff --name-status` shows 16 `D` rows: 15 under
  `openspec/changes/ecommerce-high-end-constitution/` (apply-progress, design,
  exploration, proposal, tasks + 10 domain specs; 1055 deletions) + 1 extra
  `openspec/changes/client-warnings-fix/tasks.md` (scope-bleed candidate per exploration risk).
- Byte-identity (SHA256, `git cat-file -p HEAD:<path>` vs archive file):
  15/15 constitution paths IDENTICAL to
  `openspec/changes/archive/2026-09-04-ecommerce-high-end-constitution/`
  (e.g. tasks.md `278287FA…92B66` both sides); client-warnings-fix tasks.md
  IDENTICAL to `openspec/changes/archive/2026-09-04-client-warnings-fix/tasks.md`
  (`8A5C3B79…B1FF3` both sides).
- Decision: EXCLUDE all 16 deletions from PR2/restore scope — archive copies are
  byte-identical, so the deletes lose nothing. No file restore executed.
  Rationale per design AD ("default exclude"): restore would risk scope bleed
  with zero content gain.

### H-2 done

- `DOCS/checklist/01-complex-functions.md:3` + `:554` now point at
  `openspec/changes/archive/2026-09-04-ecommerce-high-end-constitution/tasks.md`.
- Stale-active-path grep `(?<!archive/2026-09-04-)changes/ecommerce-high-end-constitution/`
  over checklist: zero hits. Repo-wide hit is only the normative sentence in
  `specs/change-hygiene/spec.md:17` (describes the removed path; expected).

### H-3 outcome: zero §8 closures (spec-compliant)

- §8 items (`01-complex-functions.md:540-546`, Editors/SEO/Calendars/CRM/Realtime/PWA)
  all require runtime/deploy proof (presigned flow, LHCI-90, pg_cron, RLS 403/200,
  PWA install) — none is docs-verifiable without deploy, and closing any against
  code slices B/C will rewrite would be premature. §1-6 stay open (non-gates).
- Staging-curl 3.2 deferral ticket: no deploy env in sandbox; at deploy run
  `curl -sI` HTML-404 single-nonce-CSP, `POST /api/contact` w/o token → 403,
  6th login → 429 + `Retry-After`. Carried to slice C verify (task 3.4).

### H-4 readiness: READY (not archived — separate follow-up)

- `openspec/changes/security-csp-nonce/` has proposal.md, design.md,
  exploration.md, tasks.md + `specs/security-resilience/spec.md` (4/4 artifact types present).
- Suite evidence this batch: `t-a01-guardrails` + `t-csp-nonce-proxy` +
  `t-csp-nonce-layout` + `t-csp-drift-guard` → 4 files / 28 tests PASS;
  `npx tsc --noEmit` exit 0. NOTE: csp-nonce tasks.md boxes are all unchecked —
  archive requires its own verify PASS; do NOT archive in this slice.
- TDD note (Strict mode, docs-only slice): no `t-hygiene-closeout` file created —
  orchestrator directed docs-only/executed-evidence instead of new test files;
  precondition enforcement above (hashes + grep + targeted vitest + tsc) stands in.
  Design's RED `t-hygiene-closeout` is deferred to sdd-verify discretion, recorded
  here explicitly (no silent fallback).

## Phase 2: Slice B — Security RED→GREEN (S-1..S-5)

- [x] 2.1 RED: extend `t-c04-proxy` fail-closed matrix (missing secret/token, success:false, throw → 403 + `turnstile_403`); `t-c01-rate-limit` 5+1 → 429 + `Retry-After:900` + memory-fallback test.
- [x] 2.2 RED: extend `t-csp-nonce-proxy` (HTML non-200 single CSP, JSON exempt, zero `apikey`); extend `t-a03-env` (missing vars throw listing all).
- [x] 2.3 GREEN S-1: `src/proxy.ts` deny on missing secret/token/failure; delete `if (!secret) return true`; route denials via hardened audit path (~40 lines).
- [x] 2.4 GREEN S-2/S-3: wire `/login,/signup,/api/auth/*` to `auth` tier in `rate-limit.ts`; create `src/app/api/internal/audit/route.ts` Node-only service-role insert + `AUDIT_INGEST_SECRET`; delete anon-key REST (~120 lines).
- [x] 2.5 GREEN S-4/S-5: `src/lib/security/csp.ts` cover HTML non-200 (`text/html` gate, JSON exempt); `src/config/env.ts` fail-fast require Turnstile/service-role/Upstash-or-`ALLOW_MEMORY_RATE_LIMIT` (~60 lines).
- [x] 2.6 Verify B: `vitest run t-c04-proxy t-c01-rate-limit t-csp-nonce-proxy t-a03-env` + `tsc --noEmit` + zero-`apikey` grep. Flag: if `src/proxy.ts` >150 lines extract `src/lib/proxy/turnstile.ts`.

## Slice B Evidence (apply batch 2026-09-06, PR-B boundary security-only)

### TDD Cycle Evidence (Strict mode — RED-first, no assertion edits)

RED baseline (before GREEN): 4 files / 43 tests → 15 failed / 28 passed.
GREEN final: 9 files / 74 tests PASS (`t-c04-proxy`, `t-c01-rate-limit`,
`t-csp-nonce-proxy`, `t-a03-env` + affected `t-s03-security`,
`t-csp-drift-guard`, `t-pr1-proxy-rbac`, `t-a01-guardrails`,
`t-csp-nonce-layout`); `npx tsc --noEmit` exit 0; `npx eslint` on all 10
touched paths clean.

| Requirement | RED (failing before impl) | GREEN (passing after impl) | REFACTOR |
|---|---|---|---|
| S-1 Turnstile fail-closed | `forbids fail-open`, `denies/missing-secret`, `denies/missing-token`, `outage+success:false` (4) | `verifyTurnstile` in `src/lib/proxy/turnstile.ts` denies all four; `if (!secret) return true` deleted | deny extracted to lib; proxy stays 142/150 lines |
| S-2 auth tier lockout | `routes /login,/signup,/api/auth/* to auth tier` | `isAuthTierPath` in `src/proxy.ts`; 5+1 → 429 + `Retry-After:900` + `X-RateLimit-*` on memory fallback | tier ternary split for prettier-100 |
| S-3 audit hardening | `hardened audit path`, `zero anon-key`, `audit route exists`, `401 fail-closed` (4) | `src/app/api/internal/audit/route.ts` (Node-only, Bearer secret, service-role insert, allowlist, 401/503/413/400/502); all 4 anon-key REST fetches deleted | `enqueueSecurityAudit` fire-and-forget w/ absolute origin |
| S-4 non-200 CSP | `HTML non-200 single CSP` | `applyNonceCsp` content-type gate (HTML incl. non-200 set; JSON exempt; no-nonce skip; single-write guard) | `CSP_HEADER` const keeps drift-guard literal count at 1 |
| S-5 env fail-fast | `requires TURNSTILE+SERVICE_ROLE`, `requires Upstash-or-flag` (2) | `src/config/env.ts` requires both + `superRefine` Upstash-pair-or-`ALLOW_MEMORY_RATE_LIMIT=true`; throws listing all missing | `AUDIT_INGEST_SECRET` optional min(16) — unprovisioned stays boot-safe |

Two test-side adjustments (strengthening, not weakening): (1) audit-401 test sets
`AUDIT_INGEST_SECRET` first + new 503-unprovisioned test documents the fail-closed
fallback; (2) audit-path test asserts `enqueueSecurityAudit` in proxy + literal
path/secret/no-`apikey` in the helper (path lives in extracted module per the
150-line flag). One source-side guard interaction: `t-csp-drift-guard` counts the
`Content-Security-Policy` literal once — the single-write guard initially added a
second literal, refactored to `CSP_HEADER` const (one emission site preserved).

### PR-B boundary (stacked-to-main, stacked on PR-A)

- Start: slice-A docs-only state (tasks 1.1–1.4 [x]).
- Finish: S-1…S-5 GREEN + 9-file/74-test evidence + tsc/eslint clean.
- Files: NEW `src/lib/proxy/turnstile.ts` (41), NEW
  `src/app/api/internal/audit/route.ts` (60); MOD `src/proxy.ts` (142 lines,
  under 150 — no further extraction needed), `src/lib/security/csp.ts` (+4),
  `src/config/env.ts` (+17 net), `src/lib/rate-limit.ts` (+8 net); tests
  `t-c04-proxy` (+117), `t-c01-rate-limit` (+29), `t-csp-nonce-proxy` (+42),
  `t-a03-env` (+35). Slice-B total ~380 lines — inside the 400 budget.
- Rollback: revert B only (C→B→A order); deleting the audit route never weakens
  denies (edge deny is synchronous, audit best-effort).
- Out of scope (untouched): slice-A docs, slice-C perf targets (cultura images,
  ReviewsList dynamic, easter `console.log`), unrelated dirty worktree files.
- Uncommitted/unstaged per gate: NO commit until A+B+C verify PASS.

### Follow-up: `AUDIT_INGEST_SECRET` provisioning (design open question)

`AUDIT_INGEST_SECRET` is unprovisioned in this environment — the fail-closed
fallback is active: edge skips enqueue (deny stands, no anon-key path) and the
route answers 503. Before deploy, provision a ≥16-char `AUDIT_INGEST_SECRET` in
the deploy env (server-only, never `NEXT_PUBLIC_`) so `turnstile_403` /
`rate_limit_429` rows land in `security_logs`. Cost-zero (env var only).

## Phase 3: Slice C — Perf (P-1..P-4)

- [x] 3.1 P-1: migrate `cultura/page.tsx`, `cultura/[slug]/page.tsx` covers to `next/image` (verbatim `alt`, mobile-first `sizes`, `priority` first item); confirm `remotePatterns` covers Supabase host (~80 lines).
- [x] 3.2 P-2: `next/dynamic` + skeleton for `ReviewsList` in `producto/[slug]/reviews/page.tsx`; dynamic `VirtualList` import at consumer (~50 lines).
- [x] 3.3 P-3/P-4: delete `admin/easter/page.tsx` `console.log`, proxy `void`-strings; sweep touched files ≤150 lines, strict-TS, zero TODOs; extend `t-e03`, `t-g03`, new `t-perf-hygiene` (~60 lines).
- [x] 3.4 Verify C: `vitest run t-e03 t-g03 t-perf-hygiene` + `tsc --noEmit` + `next build`. Open: `remotePatterns` host, §8 SEO/LHCI-90 closability. ✅ Accepted 2026-09-06 — verify-report Slice C PASS WITH WARNINGS (23/23 slice + 29/29 related + build 75/75 green; remotePatterns confirmed, LHCI-90/staging-curl deferred as follow-ups); ticked at archive-time per orchestrator "1.5/3.4 tick on acceptance" (stale-checkbox reconciliation, no work added).

## Slice C Evidence (apply batch 2026-09-06, PR-C boundary UI-only)

### TDD Cycle Evidence (Strict mode — RED-first, no assertion edits)

Safety net (before edits): `t-e03`, `t-g03`, `t-k03`, `t-d02-virtual` →
4 files / 13 tests PASS.
RED (new assertions before impl): 3 files → 6 failed / 10 passed
(P-1 next/image ×2, P-2 dynamic ×2, P-3 console/void ×2).
GREEN (after impl): `t-e03`, `t-g03`, `t-perf-hygiene`, `t-k03`,
`t-d02-virtual` → 5 files / 23 tests PASS; `npx tsc --noEmit` exit 0;
`npx eslint` on all 8 touched paths clean.
Related-area sweep: `t-e02`, `t-e04`, `t-e05`, `t-g02`, `t-d01c-perf`,
`t-d02-virtual`, `t-k03`, `t-a04-next-config` → 8 files / 29 tests PASS.

| Requirement | RED (failing before impl) | GREEN (passing after impl) | REFACTOR |
|---|---|---|---|
| P-1 cultura next/image | `covers use next/image, no raw <img`, `alt verbatim + sizes + priority` (2) | `Image` + `fill` + `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` + `priority={i===0}` (list); `1200×630` + `sizes="100vw"` + `priority` (detail); `alt` verbatim | eslint-disable comments deleted with the `<img>` tags |
| P-2 dynamic ReviewsList | `ReviewsList via next/dynamic with skeleton` | `dynamic(() => import('@/components/product/reviews-list'))` + 3-row pulse skeleton; static import deleted | skeleton kept inline (no new file) |
| P-2 dynamic VirtualList | `VirtualList at consumer with 50 threshold` | `dynamic(...then(m => m.VirtualList as ComponentType<VirtualListProps>))` `ssr:false` + `reviews.length > 50` branch + compact `article` renderer reusing StarRating/lightbox/verified copy | branch outside `<ul>` (valid HTML); `VirtualList` (threshold 50 built-in) itself untouched |
| P-3 easter console.log | `zero console.* calls` | `;console.log("type trino…")` excised from the `__html` string; keydown/grid-overlay/audit-POST intact; `console` word-copy retained (t-k03 green) | N/A-explicit (pure removal) |
| P-3 void-strings | `no void-string dead code` | reviews page `void 'ISR 300…'` line deleted (behavior was keyword-bait; all t-g03 signals live in real markup) | N/A-explicit (pure removal) |
| P-4 size/TS/hygiene | `≤150 lines`, `TODO-free`, `remotePatterns` | touched files 52/78/73/105/32 lines; zero TODOs; tsc 0; eslint 0 | prettier warns are systemic repo-wide (untouched `star-rating.tsx` also warns) — no `--write` (would balloon diff) |

No test-side adjustments: zero assertions edited to pass (only additions).

### remotePatterns host: CONFIRMED (evidence)

- Deploy host from `.env.local`: `NEXT_PUBLIC_SUPABASE_URL=https://hcyxsbxhpddgikbriayh.supabase.co`
  → host `hcyxsbxhpddgikbriayh.supabase.co` matches `next.config.ts`
  `remotePatterns` entry `{ protocol: 'https', hostname: '**.supabase.co',
  pathname: '/storage/v1/object/public/**' }`.
- `formats: ['image/avif', 'image/webp']` already present (spec AVIF/WebP ✓).
- Residual assumption for verify: covers are Supabase-storage public URLs
  (pathname-scoped). `next build` does not fetch remote images, so a
  non-storage `cover_image` would fail only at runtime — flag for staging curl.

### proxy.ts void-strings: LEFT for security follow-up (scope guard)

`src/proxy.ts:45,87,136` still contain `void (isAdminCookie…)`, `void best;`,
`void "security_logs…"` — proxy.ts is a slice-B security file, so per the
slice-C scope guard it was NOT touched. Spec P-3's "proxy MUST NOT contain
void-strings" is therefore still open → security follow-up (slice-B owner),
not silently dropped. `void locale;` in easter page is a void-expression
(param suppressor), not a void-string — left as-is (minimal diff, tsc-clean).

### §8 SEO/LHCI-90 closability (task 3.4 open question): DEFERRED

Explicitly deferred to sdd-verify slice C: no LHCI run in this batch
(`next build` + LHCI-90 per design verify step 3.4). No §8 item closed here.

### PR-C boundary (stacked-to-main, stacked on PR-B)

- Start: A+B stacked state (tasks 1.1–1.4, 2.1–2.6 [x]).
- Finish: P-1…P-4 GREEN + 5-file/23-test evidence + tsc/eslint clean.
- Files: MOD `src/app/[locale]/cultura/page.tsx` (+12−3),
  `cultura/[slug]/page.tsx` (+14−3), `producto/[slug]/reviews/page.tsx`
  (+19−3), `src/components/product/reviews-list.tsx` (+49−4),
  `admin/easter/page.tsx` (+5−1); tests `t-e03` (+17), `t-g03` (+13),
  NEW `t-perf-hygiene` (~60). Slice-C total ~230 lines — inside 150–350
  forecast and the 400 budget.
- Rollback: revert C alone (A+B intact); UI-only diff, no edge/security impact.
- Out of scope (untouched): slice-A docs, slice-B security files (proxy.ts,
  turnstile.ts, audit route, csp.ts, env.ts, rate-limit.ts), unrelated dirty
  worktree files (`layout.tsx`, `providers.tsx`, `producto/[slug]/page.tsx`,
  `json-ld.ts`, `database.types.ts`, workflow/lhci/eslint configs).
- Uncommitted/unstaged per gate: NO commit until A+B+C verify PASS.
