# Exploration: security-csp-nonce

> Project: santisima-trinidad | Change: security-csp-nonce | Mode: hybrid (both) | Date: 2026-09-04
> Sources: `src/proxy.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/providers.tsx`, inline-script grep, `openspec/specs/security-resilience/spec.md`, `docs/ROADMAP-NEXT-SDD.md` (P2/S-01), archive-report S-01, Context7 Next.js 16 CSP nonce docs.

## Current State

The app enforces a **strict static CSP** (no `unsafe-inline` for scripts) set in `next.config.ts` `async headers()`:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; ...
```

The CSP is emitted as a static header on `/(.*)` (source `'/(.*)'`), meaning the *same* static `script-src 'self'` applies to every response. This was the PR10 HOTFIX that intentionally removed `unsafe-inline` from `script-src` to close C-05 (CSP strict) — a correct hardening win, but it blocks **legitimate inline scripts** that Next.js/next-intl emit during hydration and any `<script>` without a `src`.

Four inline/`dangerouslySetInnerHTML` script sites exist in the codebase (all serve `application/ld+json` structured data or an easter-egg console hook, **none carry a nonce**):

- `src/app/[locale]/producto/[slug]/page.tsx:61` — `<script type="application/ld+json" dangerouslySetInnerHTML>` (Product JSON-LD)
- `src/app/[locale]/producto/[slug]/reviews/page.tsx:42` — `<script type="application/ld+json">` (Review JSON-LD)
- `src/app/[locale]/cultura/[slug]/page.tsx:54` — `<script type="application/ld+json">` (Blog JSON-LD)
- `src/app/[locale]/admin/easter/page.tsx:19` — `<script dangerouslySetInnerHTML>` (easter console hook, admin-only)

These JSON-LD blocks are currently **blocked by the strict CSP** (no nonce, no `unsafe-inline`), silently degrading SEO structured-data rendering. next-intl hydration scripts are likewise at risk. The fix is a **per-request nonce** so these inline scripts become allow-listed without regressing to `unsafe-inline`.

Middleware lives in `src/proxy.ts` (`export async function proxy(request: NextRequest)`), not legacy `middleware.ts` — matching the Next.js 16 `proxy.ts` convention. It handles: Supabase session refresh (`updateSession`), honeypot, Turnstile, rate limiting, next-intl i18n middleware, RBAC role gating, and sets a `x-cookie-opts` header. The `matcher` excludes `_next/static`, `_next/image`, images, and `favicon.ico`.

## Affected Areas

- `src/proxy.ts` — generate `crypto.randomUUID()` nonce per request, set `x-nonce` request header + inject nonce into CSP `script-src`. Must preserve existing session/RBAC/i18n logic; nonce flows through `NextResponse.next({ request: { headers } })`.
- `next.config.ts` — `async headers()` CSP template is static and header-only; the nonce header is now dynamic (per-request) so the static `headers()` source `'/(.*)'` must NOT also emit a conflicting static `script-src 'self'` for HTML pages (see Approaches — static header must be reconciled with the dynamic proxy header to avoid double/conflicting CSP).
- `src/app/layout.tsx` — currently a stateless server component; reads `headers()` for `x-nonce` and propagates to inline scripts via a nonce context/provider (or passes down to JSON-LD script sites).
- `src/app/providers.tsx` — client providers wrapper; candidate host for a nonce context/prop if inline scripts need it client-side (JSON-LD is server-rendered, so likely server-only propagation suffices).
- `src/app/[locale]/{producto/[slug],producto/[slug]/reviews,cultura/[slug]}/page.tsx` + `admin/easter/page.tsx` — the four inline `<script>` sites must receive `nonce={nonce}` (JSON-LD via `dangerouslySetInnerHTML` needs the nonce on the `<script>` element attribute).
- Tests: `tests/unit/t-prx-nonce.spec.ts` (new) — assert nonces differ across requests and header nonce === body nonce, CSP strict preserved. Existing `tests/unit/t-pr1-proxy-rbac.test.ts` and `t-c04-proxy.test.ts` must stay green.

## Approaches

### 1. Proxy nonce + Server Component `headers()` read (RECOMMENDED — Next.js 16 official pattern)

Generate nonce in `proxy()`, stamp it on both request (`x-nonce`) and response (`Content-Security-Policy`) headers, then read it back in Server Components via `headers()` and apply to `<Script>`/inline `<script nonce>`.

- **How**: In `proxy()`, `const nonce = Buffer.from(crypto.randomUUID()).toString('base64')`; build CSP string with `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`; set `requestHeaders.set('x-nonce', nonce)` and `response.headers.set('Content-Security-Policy', csp)`. In `layout.tsx`, `const nonce = (await headers()).get('x-nonce')`, pass to a `NonceProvider` (or prop-drill) and to JSON-LD script sites as `nonce={nonce}`.
- **Pros**: Official, documented Next.js App Router pattern (Context7 confirmed); per-request uniqueness; `strict-dynamic` lets nonce'd scripts load their own subresources; clean separation of middleware and render layers.
- **Cons**: Requires dynamic rendering (all nonce'd routes become dynamic — acceptable since the app is already heavily `force-dynamic`/Supabase-driven); must reconcile the *existing static* `headers()` CSP in `next.config.ts` so it doesn't fight the dynamic header.
- **Effort**: Low

### 2. Static nonce via build-time only (rejected)

Generate one nonce at build and reuse across all requests to avoid dynamic rendering.

- **Pros**: Keeps static pages fully static; trivial.
- **Cons**: **Defeats the purpose of a nonce** — a static nonce = reusable, predictable, bypassable by an attacker; fails the security intent of S-01. Not acceptable for a security harden.
- **Effort**: Low (but wrong)

### 3. `unsafe-inline` re-introduction (rejected)

Keep static header but add `script-src 'self' 'unsafe-inline'`.

- **Pros**: One-line change; all inline scripts work.
- **Cons**: Directly regresses the PR10 C-05 hardening; verify gate explicitly requires "no `unsafe-inline`" in CSP. Violates the delta's own acceptance.
- **Effort**: Trivial (but regressive)

## Recommendation

**Approach 1** (proxy nonce + `headers()` read) — it is the canonical Next.js 16 pattern, satisfies the strict-CSP-then-nonce intent of S-01, and is fully validated by Context7 against the exact installed version (16.3.4, package confirms `next 16.3.4`, `next-intl ^4.14.2`).

### Key design decisions inside Approach 1

1. **Nonce header propagation**: set `x-nonce` on the *request* headers via `NextResponse.next({ request: { headers: requestHeaders } })` (NOT `NextResponse.next({ headers })`, which would leak to the client). This makes `headers()` upstream read it. Confirmed exactly by Context7 proxy docs.
2. **Static vs dynamic CSP reconciliation**: `next.config.ts` `headers()` currently emits a static `Content-Security-Policy` with literal `script-src 'self'`. Two options: (a) remove `script-src`/CSP from the static `headers()` block for `/(.*)` and let proxy emit the full dynamic CSP only for HTML — but static-asset routes excluded by the matcher still need CSP; or (b) keep static headers for non-HTML routes and have the proxy *override* CSP on HTML responses. Recommendation: **proxy owns the CSP for document responses** (it already sets `x-cookie-opts` response headers), and `next.config.ts` drops the `script-src 'self'` literal (or narrows static CSP scope) to avoid double CSP headers. This is the one area requiring a design decision at design phase — recommended to keep the static non-script directives (frame-ancestors, HSTS, etc.) intact and let proxy add the script nonce directive.
3. **`strict-dynamic` vs nonce-only**: Roadmap flags this as a risk. `strict-dynamic` (with nonce) is preferred — it lets the nonce'd bootstrap trust subsequent script loads without listing every third-party origin. **Fallback** if third-party scripts (e.g., analytic tags via `next/script`) break: drop `strict-dynamic` and use `nonce` alone (`script-src 'self' 'nonce-…'`). Must test both in dev and `pnpm build` preview.
4. **JSON-LD script sites**: `<script type="application/ld+json" dangerouslySetInnerHTML={{__html …}} nonce={nonce} />` — the nonce is an attribute on the `<script>` element; `dangerouslySetInnerHTML` content inherits allow-listing from the element's nonce attribute. (Note: JSON-LD is not executable JS; some CSP configurations still require the nonce on any `<script>` element to avoid console warnings — applying nonce uniformly is the safe choice.)
5. **Nonce propagation mechanism**: `layout.tsx` is a server component; it can `await headers()` and either (a) use a React context `NonceContext.Provider` consumed by the JSON-LD pages, or (b) since the four inline sites are all under `[locale]` server components, read `headers()` directly in each page. Prefer a small `src/lib/csp.ts` helper (`getNonce()` reading `headers()`) to avoid repeated `headers()` calls and keep DRY. Avoid exposing nonce to client bundles unnecessarily.

## Risks

- **Dynamic rendering regression** — `headers()` + per-request nonce makes all nonce'd routes dynamic; verify no route that *must* stay static (e.g., cached `/tienda`, `/cultura` `s-maxage 60`) loses its cache benefit. The catalog/cultura routes are already `public, s-maxage=60, stale-while-revalidate=300` — nonce on these pages **disables CDN caching** for the HTML shell. Mitigation: consider NOT nonce-ing public cached pages, or accept the tradeoff and document it. This is the primary real-world risk beyond the roadmap's "streaming" note.
- **Double CSP header conflict** — if `next.config.ts` static `headers()` still emits `script-src 'self'` while proxy also emits `script-src 'self' 'nonce-…'`, browsers apply the *intersection* (most restrictive) and the nonce is effectively ignored (inline scripts still blocked). Must ensure only ONE authoritative `script-src` per response. (Design decision #2.)
- **`strict-dynamic` + third-party scripts** — `strict-dynamic` ignores host allow-lists; any third-party `<script src>` not loaded through a nonce'd script would be blocked. Fall back to nonce-only if breakage. (Roadmap already flags this.)
- **431 header size** — nonce + CSP header is small, non-issue, but avoid over-stuffing request headers per Context7 warning.
- **Easter admin page** — the inline console-hook script must also receive the nonce or it breaks (it's admin-only; its breakage is low-impact but should be covered).

## Ready for Proposal

**Yes** — the approach is fully validated against the installed stack (Next 16.3.4 + next-intl 4.14.2), all four inline-script sites are identified, and the single open design question (static-CSP reconciliation + whether to nonce public cached routes) is precisely scoped for the design phase. Orchestrator should tell the user: exploration complete; one delta (`security-resilience`), 2–3 tasks ≤150 lines each, single PR ≤400, stacked-to-main on top of P1; the one decision to surface at design time is whether public cached routes (`/tienda`, `/cultura`) keep static CSP to preserve `s-maxage` vs. get nonce'd and go dynamic.