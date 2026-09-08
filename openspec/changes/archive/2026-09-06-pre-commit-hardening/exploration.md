## Exploration: pre-commit hardening gate

### Current State
The worktree holds two uncommitted in-flight efforts on top of `main`: slice-1 CSP-nonce close-out (6 files + `src/lib/security/csp.ts` + 3 green suites, 23/23; full suite 399/399, build 75/75 per archived verify-report) and a guarded 15-path docs delete, plus tooling-regen dirt (`database.types.ts` +548, `lighthouserc.json`, new `ci.yml`, `t-tooling-types`, `t-lhci`). The prior change `que-hay-pendiente-en-engram` archived PASS WITH WARNINGS with 4 named follow-ups. The single checklist file (`DOCS/checklist/01-complex-functions.md`) is a pre-implementation design checklist — all acceptance boxes unchecked by nature. Security posture is close but has concrete gaps (fail-open Turnstile, unused `auth` rate-limit tier, anon-key REST inserts into `security_logs`, CSP only on 200s, thin `env.ts`). Perf basics exist (virtual-list, next/image on PDP reviews, ISR/static CSP split) but cultura images bypass `next/image` and heavy-list dynamic imports are absent.

### Affected Areas
- `DOCS/checklist/01-complex-functions.md` — lines 3/554 dangle at deleted path; all §8 + per-section acceptance boxes unchecked (pending by design)
- `DOCS/ROADMAP-NEXT-SDD.md` — P1/P2/P3 all still open; tooling-regen half-done in worktree (uncommitted)
- `openspec/changes/security-csp-nonce/` — archive readiness pending (unblocked by slice-1 PASS WITH WARNINGS)
- `src/proxy.ts` — fail-open Turnstile (:45), anon-key log inserts (:36-40, :122, :131), dead code (:57-58, :100, :142), `auth` tier never selected (:128)
- `src/lib/security/csp.ts` — CSP applied only on status 200 (:38); `style-src 'unsafe-inline'` (:9)
- `src/config/env.ts` — only 4 vars validated; no fail-closed coverage for payments/turnstile/upstash/resend keys
- `src/app/[locale]/cultura/[slug]/page.tsx:62`, `src/app/[locale]/cultura/page.tsx:30` — raw `<img>`, no `next/image`/BlurHash
- `src/app/[locale]/admin/easter/page.tsx:25` — inline `console.log` (CQ-07 violation)
- `src/app/page.tsx` — `force-dynamic` home with unpaginated `limit(12)` (fine at 12, watch at scale)

### Approaches
1. **Hygiene-first chain (A: pendings → B: security → C: perf)** — close process/deletion/DOCS pendings first, then security, then perf
   - Pros: unblocks `security-csp-nonce` archive immediately; each slice independently reviewable; smallest conflict surface
   - Cons: staging curl still needs a deploy environment; three verify cycles
   - Effort: Low (A) / Medium (B) / Medium (C)
2. **Security-first single change** — fold everything into one hardening change, slices ordered by severity
   - Pros: one proposal/spec cycle; severity-driven
   - Cons: risks breaching the 800-line review budget; mixes docs hygiene with behavior changes
   - Effort: High

### Recommendation
Approach 1. Slice A is near-zero-risk and unblocks the archive queue; slice B addresses the two highest-severity items (Turnstile fail-open, unused `auth` rate-limit tier) plus server-side log inserts; slice C finishes image-pipeline and code-quality items. Keep `force-chained stacked-to-main`, each slice ≤400 lines.

### Risks
- Staging `curl -sI` single-CSP proof (task 3.2) cannot run in sandbox — needs deploy env or it carries forward again
- `W-S2-1` extra deletion (`client-warnings-fix/tasks.md`) must be excluded from or restored before the delete PR, else scope bleed
- Upstash Redis env may be absent in some envs → rate limiting silently falls back to per-instance memory (no shared state)
- Checklist §1–6 acceptances are product-build acceptances (editors/SEO/calendars/CRM/realtime/PWA), not hardenable pre-commit — do not gate the commit on them; gate only on §8 items that are closable
- LHCI 90-gate wiring is present in worktree but uncommitted and unverified in CI — flake risk on first CI run

### Ready for Proposal
Yes — propose `pre-commit-hardening` as 3 chained slices (A: pendings/checklist closures ~50-150 lines; B: security hardening ~250-400; C: perf/optimization ~150-350). Tell the user: NOTHING may commit until slice A lands the staging-curl evidence or records a new explicit deferral, and `security-csp-nonce` archive is the first domino after slice A.
