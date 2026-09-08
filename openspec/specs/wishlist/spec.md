# wishlist Specification

## Purpose
Favoritos heart: toggle + anon session merge + dedup + RLS + paginated list, i18n 4 locales, 44px thumb. Trace: WISHLIST-01, ECOM-02, SEC-01, ARCH-05, UX-01, PERF-01.

## Requirements

### Requirement: Wishlist Toggle and Merge
`wishlists(id uuid PK, user_id FK nullable, session_id text nullable, product_id int FK CASCADE, created_at, unique (user_id,product_id) WHERE user_id IS NOT NULL, unique (session_id,product_id) WHERE session_id IS NOT NULL, CHECK user_id OR session_id)` MUST enforce dedup; toggle Server Action MUST be Zod validated, rate-limited 60/m Upstash, idempotent 409 on duplicate, anonymous via `session_id` and merged on login summing deduped. (Trace: WISHLIST-01, CONCURRENCIA-01, SEC-03)

#### Scenario: Toggle add then duplicate
- GIVEN user adds product A to wishlist
- WHEN added again
- THEN 409 duplicate, heart stays filled

#### Scenario: Anonymous merge on login
- GIVEN anon session with wishlisted product A
- WHEN user logs in having no wishlist
- THEN product A appears under user_id, session entries cleared

### Requirement: Wishlist RLS and Security
RLS MUST isolate `auth.uid()=user_id OR session_id=current_setting('request.jwt.claims')->>session_id OR is_admin()`, anon via session only, user A MUST NOT read user B wishlist (403), inserts via owner check, indexes on (user_id),(session_id),(product_id). (Trace: SEC-01, DB-02)

#### Scenario: Cross-user isolation
- GIVEN user A wishlist
- WHEN user B queries A's wishlist
- THEN 403, RLS blocks

### Requirement: Wishlist Page and UX
`/wishlist` MUST be paginated 12 ISR 300, heart 44px thumb zone optimistic with toast, empty Bauhaus state, i18n 4 locales, share via share_token later extension. (Trace: UX-01, PERF-01, I18N-01)

#### Scenario: Heart to list
- GIVEN user clicks heart on product
- WHEN navigates to /wishlist
- THEN product visible as 12-card paginated list, 44px touch target verified
