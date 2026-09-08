# cultura-blog Specification

## Purpose
Locale-aware editorial Cultura for trino.: TipTap drafts, social auto-import, related products, SEO Article, calendar scheduling. Trace: CULTURA-01..06, CMS-01, DOC-01, ECOM-07, SEO, I18N-01..03.

## Requirements

### Requirement: Cultura Data Model and RLS
`cultura_posts` MUST have `id uuid PK, slug unique, locale CHECK es-AR/en/fr/pt-BR, title, excerpt, body jsonb TipTap, cover_image Storage, status draft/published, published_at timestamptz, author_id FK, tags text[], related_product_ids int[], social_source enum, social_url, views int, search_vector tsvector GIN, deleted_at` with RLS `anon SELECT published AND deleted_at IS NULL` else 403, `admin via public.is_admin()` for write, GIN + slug index. (Trace: CULTURA-01, CMS-01, DB-02/05)

#### Scenario: Anonymous reads only published
- GIVEN post status draft
- WHEN anon GET /cultura/slug
- THEN 403 or not listed; published returns 200

#### Scenario: Admin creates draft
- GIVEN admin creates post via Server Action
- WHEN Zod validates slug/title/excerpt/body/cover/tags/related_product_ids
- THEN draft inserted with audit log, not visible publicly

### Requirement: Public Listing, Detail, and SEO
Public MUST list 12 per page ISR `revalidate 300` with Bauhaus skeletons, detail MUST render TipTap body + JSON-LD Article + OG + hreflang x4 + related carousel by `related_product_ids`. Search via `search_vector` GIN. (Trace: CULTURA-03, PERF-01, SEO)

#### Scenario: Public cultura listing
- GIVEN 12 published posts
- WHEN visitor visits /es-AR/cultura
- THEN 12 cards render, ISR cached 300s, skeletons on load

#### Scenario: SEO Article
- GIVEN post detail
- WHEN crawled
- THEN JSON-LD Article with headline, image, datePublished present

### Requirement: Admin Editor, Sync, Calendar, and Bulk
Admin MUST edit via TipTap + Dropzone Storage (presigned) + tags + related picker + status draft/published + preview, RBAC `is_admin()` 403 else. Sync MUST auto-import TikTok/IG via `SocialProvider` into draft via `pg_cron daily 06:00 UTC` + `CRON_SECRET` + Upstash dedup hash, manual approve required. Calendar MUST show month/week drag-drop (dnd-kit) with status colors and optimistic revalidate. Bulk MUST support publish/unpublish/archive/delete, duplicate, SEO score, reading time, version history. (Trace: CULTURA-02/04/05/06, CMS-01, RES-02)

#### Scenario: Draft import not public
- GIVEN TikTok video imported
- WHEN sync runs
- THEN post created draft, not visible on /cultura until admin publishes

#### Scenario: Calendar drag reschedule
- GIVEN admin drags post to new date
- WHEN dropped
- THEN published_at updated optimistically and persisted

#### Scenario: Bulk publish
- GIVEN 10 drafts selected
- WHEN bulk publish
- THEN all become published idempotently, revalidatePath triggered

### Requirement: Cultura body strictness with fixtures-first gate
`body` in `src/lib/validations/cultura.ts` MUST NOT use `z.any()`; it MUST validate as structured TipTap JSON (rejecting non-conforming payloads) while every existing cultura fixture/test payload MUST continue to validate unchanged (fixtures run green BEFORE the tightening lands).

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Fixtures-first gate
- GIVEN existing cultura fixtures and tests
- WHEN the strict schema is applied
- THEN all fixture payloads validate and the cultura suite is green

#### Scenario: Malformed body rejected
- GIVEN a payload with `body` as a plain string or arbitrary shape
- WHEN validated
- THEN validation fails with a field-level error, no 500

### Requirement: Non-security void-bait removal
The 36 non-security `void`-bait lines (actions, shipping/cache, api routes, cultura-calendar, cultura-sync) MUST be removed by deleting dead expressions or replacing them with real handling; behavior MUST NOT change beyond minimal handling. `proxy.ts:45,87,136` are EXCLUDED (owned by S3/slice-B).

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Dead void removed
- GIVEN a `void "string"` bait with no side effect
- WHEN the slice lands
- THEN the line is gone, `tsc` + `eslint` stay 0, tests green

### Requirement: eslint-disable triage
Each of the 3 disables (`virtual-list`, `cookie-consent`, `analytics-consent`) MUST be removed or kept with an inline justification + ticket; zero unjustified disables MUST remain.

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Triage complete
- GIVEN the 3 disable sites
- WHEN lint runs after the slice
- THEN each site is either disable-free or carries justification + ticket

### Requirement: Empty catches become structured logs
All ~15 swallowed `catch {}` sites MUST call `src/lib/logger.ts` (existing utility, no new dependency) with level + route (contract defined in `observability-health` delta); catch blocks MUST NOT stay empty and MUST NOT log PII/secrets.

*Synced from `warnings-smells-cleanup` delta spec on 2026-09-06 (ADDED, additive-only merge).*

#### Scenario: Swallowed error surfaces
- GIVEN a failing `share.ts` clipboard call
- WHEN the catch runs
- THEN `logger.warn` emits with route and error string, UI behavior unchanged
