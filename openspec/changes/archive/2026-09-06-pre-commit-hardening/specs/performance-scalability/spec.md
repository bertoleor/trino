# Delta for performance-scalability

## ADDED Requirements

### Requirement: Cultura Images via next/image

Cultura list and detail views MUST render covers with `next/image` (AVIF/WebP, `sizes` for mobile-first breakpoints, `alt` preserved); raw `<img>` for covers is forbidden. No new WCAG surface: existing `alt` text is kept, sizes match layout.

#### Scenario: Cultura cover optimized

- GIVEN `cultura/page.tsx` and `cultura/[slug]/page.tsx` covers
- WHEN rendered on a 390px viewport
- THEN a right-sized AVIF/WebP is served with intact `alt` and no layout shift

### Requirement: Heavy-List Dynamic Imports

Lists expecting >50 offscreen elements MUST load their virtualizer/heavy-list code via `next/dynamic` (ssr-safe); static import of heavy list bundles on first paint is forbidden.

#### Scenario: Deferred heavy list

- GIVEN a heavy list route
- WHEN first paint completes
- THEN the virtualizer chunk loads on demand and initial JS stays within budget

### Requirement: Zero console.* and Dead-Code Removal

Touched files MUST contain zero `console.*` (the `console.log` inside `admin/easter` inline script included) and `src/proxy.ts` MUST NOT contain `void`-string dead code (`void "security_logs…"`, `void (isAdminCookie…)`, `void best`).

#### Scenario: Lint proves clean

- GIVEN the hardened slice
- WHEN `console.*`/`void "` patterns are searched in touched files
- THEN zero matches are found

### Requirement: File-Size and Strict-TS Compliance

Every touched file MUST stay ≤150 lines (split or justify with a waiver) and compile under strict TS with zero TODOs; no new paid dependencies are permitted.

#### Scenario: Touched files compliant

- GIVEN the slice diff
- WHEN line count, `tsc --noEmit`, and TODO search run
- THEN all touched files are ≤150 lines, type-clean, and TODO-free
