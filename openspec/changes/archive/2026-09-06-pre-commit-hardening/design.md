# Design: Pre-Commit Hardening Gate

## Technical Approach

Stacked A→B→C (each ≤400 lines), independently verifiable and revertable. A closes hygiene pendings, unblocks archive queue; B hardens edge security severity-ordered; C applies framework-native perf patterns. No migrations, no new deps, cost-zero. NO commit until A+B+C verify PASS; staging curl (3.2) defers absent deploy env.

## Slice A — Hygiene (H-1…H-4, ~50–150 lines)

Components: `DOCS/checklist/01-complex-functions.md`, `security-csp-nonce/`, `pre-commit-hardening/tasks.md`.
Steps: (1) H-1 FIRST — `git diff --name-status` over the 15 `D` paths; confirm byte-identical archive copy; record exclude-or-restore in tasks.md (scope-bleed guard). (2) H-2 — repoint lines 3/554 to the archive copy; grep proves zero stale refs. (3) H-3 — close only docs-verifiable §8 items with citations; §1–6 stay open. (4) H-4 — security-csp-nonce has proposal+spec+design+tasks and green suite.
Flow: worktree status → decision record → docs edits → archive check.
Tests (RED-first): new `t-hygiene-closeout` (H-1 recorded, H-2 zero stale, H-4 artifacts); extend `t-a01-guardrails`.
Verify: `vitest run t-hygiene-closeout t-a01-guardrails` + stale-ref grep → archive-only + `tsc --noEmit`.
Bounds: start = worktree as-is; finish = docs-only diff; rollback = checkout checklist file.

## Slice B — Security (S-1…S-5 severity-ordered, ~250–400 lines)

Components: `src/proxy.ts` (edge), `csp.ts`, `env.ts`, NEW `api/internal/audit/route.ts`; `rate-limit.ts` wire-only.
S-1: `if (!secret) return true` → deny; all denials → 403 + `turnstile_403` via hardened path. S-2: `/login`, `/signup`, `/api/auth/*` → existing `auth` tier (5/15m/IP, 429 + `Retry-After: 900` + `X-RateLimit-*`). Upstash-absent → declared in-process `memoryCheck` fallback (no shared state). S-3: delete all anon-key REST inserts. S-4: `applyNonceCsp` covers HTML non-200 (`text/html` gate); JSON exempt. S-5: require `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE`, Upstash pair OR `ALLOW_MEMORY_RATE_LIMIT=true`; boot throws listing all missing.
S-3 mechanism (edge cannot hold service-role):

```ts
// Edge: fire-and-forget; denial stands regardless.
fetch("/api/internal/audit", { method: "POST",
  headers: { authorization: `Bearer ${process.env.AUDIT_INGEST_SECRET}` },
  body: JSON.stringify({ event: "turnstile_403", ip, path }) }).catch(() => {});
// Node route: verify secret → service-role insert; INSERT-only RLS kept.
```

Flow: request → gates → deny + headers → async audit enqueue → Node insert; CSP on HTML incl. non-200.
Tests (RED-first): extend `t-c04-proxy` (fail-closed matrix → 403), `t-c01-rate-limit` (5+1 → 429), `t-csp-nonce-proxy` (HTML error single CSP; JSON exempt; zero `apikey`), `t-a03-env` (missing vars → throws listing all).
Verify: `vitest run t-c04-proxy t-c01-rate-limit t-csp-nonce-proxy t-a03-env` + `tsc --noEmit` + grep → zero.
Bounds: start = A stacked; finish = edge diff + audit route; rollback = revert B (C→B→A); deleting audit route never weakens denies.

## Slice C — Perf (P-1…P-4, ~150–350 lines)

Components: `cultura/page.tsx`, `cultura/[slug]/page.tsx`, `producto/[slug]/reviews/page.tsx`, `admin/easter/page.tsx`, `src/proxy.ts`; NEW `src/lib/proxy/turnstile.ts` only if proxy.ts breaches 150 (now 148).
P-1: both covers → `next/image`, `alt` verbatim, mobile-first `sizes`, `priority` on first list item; confirm `remotePatterns` covers Supabase host. P-2: `next/dynamic` + skeleton for `ReviewsList`; `VirtualList` (threshold 50 built-in) dynamically imported at consumer. P-3: delete easter `console.log`; zero `console.*` in touched files; remove proxy.ts `void`-strings. P-4: touched files ≤150 lines, strict-TS, no TODOs, no paid deps.
Flow: same routes; only asset pipeline and chunk graph change.
Tests: extend `t-e03` (no `<img`; sizes + alt), `t-g03` (dynamic + fallback), new `t-perf-hygiene` (zero `console.*`, ≤150 lines, no TODOs).
Verify: `vitest run t-e03 t-g03 t-perf-hygiene` + `tsc --noEmit` + `next build`.
Bounds: start = A+B stacked; finish = UI-only diff; rollback = revert C alone.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| W-S2-1 exclude vs restore | Restore risks scope bleed | Decide FIRST with evidence; default exclude |
| S-3 service-role in edge vs Node route | Edge leaks secret | Node-only audit route + ingest secret; edge never waits |
| S-3 audit failure blocks vs best-effort | Blocking risks availability | Best-effort log, synchronous deny |
| S-2 shared vs memory limit | Memory loses cross-instance state | Declare fallback; shared when Upstash present |
| S-4 CSP on all non-200 vs HTML-only | JSON CSP is noise | HTML non-200 only, JSON exempt |
| P-2 dynamic vs static ReviewsList | Fallback complexity | Dynamic + skeleton; first-paint wins |

## File Changes

| File | Action | Description |
|---|---|---|
| `DOCS/checklist/01-complex-functions.md` | Modify | H-2 repoint + §8 close-out |
| `.../pre-commit-hardening/tasks.md` | Modify | H-1 decision record |
| `src/proxy.ts` + `src/lib/security/csp.ts` | Modify | S-1/S-2/S-3/S-4 + dead-code removal |
| `src/config/env.ts` | Modify | S-5 fail-fast depth |
| `src/app/api/internal/audit/route.ts` | Create | Node-only service-role insert |
| `cultura/page.tsx`, `cultura/[slug]/page.tsx`, `reviews/page.tsx`, `easter/page.tsx` | Modify | P-1 next/image; P-2 dynamic ReviewsList; P-3 console.log removal |

## Staging-Curl Deferral (3.2, carried)

No deploy env → deferral ticket in tasks.md; land on unit+build evidence. At deploy: HTML 404 → single nonce CSP; POST /api/contact w/o token → 403; 6th login → 429 + Retry-After.

## Open Questions

- [ ] `AUDIT_INGEST_SECRET` provisioning acceptable under cost-zero?
- [ ] `remotePatterns` covers Supabase storage host for P-1?
- [ ] §8 SEO/Lighthouse-90 closable docs-side or open pending LHCI?
