> **Búsqueda:** keywords: `p06, checkout, auth, rate-limit, cwe-284, cwe-20, owasp-a01, zod` · clasificación: `odd-feature` · estado: closed · actualizado: 2026-10-07

# ODD Feature — p06-checkout-auth-hardening

## Objective
Harden `POST /api/checkout` against forged orders and anonymous resource exhaustion: auth required, per-route rate limit, bounded/validated input, server-side status derivation, and a correct `orders` insert (user_id).

## Problem / Why
Audit finding P-06 (MEDIUM, STATIC, 34-auditor, 2026-09-17): the route had no authentication/authorization, no per-route rate limit, derived `status` from the client-supplied `payment_provider` raw string (`'bank' -> 'pending_verification'`), and stored `storage_path`/`email` unvalidated. Anonymous callers could create forged bank orders and spam unbounded order creation (email fan-out per order). Additionally the `orders` insert never set `user_id` — the column is NOT NULL (migration 0001) and RLS `insert order` policy requires `auth.uid() = user_id`, so every request violated the policy at DB level. CWE-284/CWE-20 / OWASP A01:2021.

## Scope
- In: `src/app/api/checkout/route.ts` (guard stack + insert fix), `src/lib/validations/checkout.ts` (new zod schema), `src/lib/rate-limit.ts` (new `checkout` tier 5/60s), tests.
- Out: the TOCTOU idempotency race (P-04, ticket t_89a2faff), price integrity qty validation (P-07 — ticket mapping note: the audit report table maps P-07 to this ticket id t_943c6ae6 while this card's title/body describes P-06; both fixes land separately), webhook signatures (P-01/P-02), front-end checkout caller (none exists yet — contract change is additive: new 401/413/422 responses), proxy-level tiers.

## Constraints
- Strict TDD (RED first): `tests/unit/t-p06-checkout-auth.test.ts` 10/12 RED on main, 12/12 GREEN after change.
- vitest runner, `TEMP=E:/temp` (Windows), typecheck 0, eslint 0 errors (sort-imports + complexity contract: `warnings-pr-followup/COMP-2` disable kept directly above POST).
- `orders.user_id` is NOT NULL; `payment_provider` default 'mercadopago'; status enum from migration 0020 accepts 'pending' and 'pending_verification'.
- No front-end caller exists today (search found zero fetch of /api/checkout), so no client contract breaks.

## Tasks (stable IDs)
- [x] T1: RED — `tests/unit/t-p06-checkout-auth.test.ts` (12 contract tests, 10 failing on pre-change code)
  - evidence: `pnpm exec vitest run tests/unit/t-p06-checkout-auth.test.ts` → `Tests 10 failed | 2 passed (12)` (2026-10-07)
- [x] T2: zod schema `src/lib/validations/checkout.ts` — `checkoutRequestSchema` (line_items 1..25 with uuid product_id + qty 1..99, total_cents int ≤ 100M cents, payment_provider enum [mercadopago, bank], storage_path ≤512, email ≤254), `orderStatusForProvider` helper
  - evidence: t-p06 suite green; `pnpm typecheck` exit 0
- [x] T3: `checkout` rate-limit tier (5/60s) in `src/lib/rate-limit.ts`, applied first-thing in the route with 429 + X-RateLimit headers
  - evidence: t-p06 tier assertions + t-c01-rate-limit suite green
- [x] T4: route guard stack in order rate-limit → auth (401) → 32KB body cap (413) → invalid JSON (400) → zod (422), all before idempotency/recompute/insert; insert now sets `user_id: user.id`
  - evidence: t-p06 guard-order assertions green; full suite 596/596
- [x] T5: changeset `.changeset/p06-checkout-auth-hardening.md`

## Verification
- `pnpm exec vitest run` → Test Files 106 passed, Tests 596 passed (2026-10-07, worktree fix/p06-checkout-auth)
- `pnpm typecheck` → exit 0
- `pnpm exec eslint <changed files>` → 0 problems
- Base (main, stashed) guard suites 16/16 green — all 4 earlier failures were introduced by the change and fixed within it.
