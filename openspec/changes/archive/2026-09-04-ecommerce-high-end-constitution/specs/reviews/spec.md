# reviews Specification

## Purpose
Ratings 1-5 + verified_purchase + moderation queue + helpful + images presigned 3 + JSON-LD Review/AggregateRating, 44px. Trace: REVIEWS-01, TRUST-01, SEC-03, ECOM-07, SEO, PRIV-02.

## Requirements

### Requirement: Review Creation and Verification
`reviews(id uuid PK, product_id FK CASCADE, user_id FK, order_id FK nullable, rating smallint 1..5 CHECK, title <=120, body <=2000, images text[] <=3 presigned 5MB, status pending/approved/rejected default pending, helpful int 0, verified_purchase bool, created_at, unique (user_id,product_id))` MUST Zod validate, set verified_purchase true only if delivered order exists, RLS anon SELECT approved only, owner INSERT own pending, admin moderate via is_admin(). (Trace: REVIEWS-01, ECOM-07, DB-02)

#### Scenario: Rating out of range
- GIVEN rating 0 or 6
- WHEN submitted
- THEN 422 validation error

#### Scenario: Verified purchase
- GIVEN user bought product and order delivered
- WHEN review created
- THEN verified_purchase true and badge shown

### Requirement: Moderation, Helpful, and Anti-Spam
Admin MUST approve/reject pending → approved/rejected with 403 if non-admin, RLS enforced. Helpful toggle MUST increment. Anti-spam MUST enforce Turnstile + honeypot + rate 3/h Upstash. (Trace: SEC-03, RLIM-01, TRUST-01)

#### Scenario: Moderation queue
- GIVEN pending review
- WHEN admin approves
- THEN status approved and visible publicly, audit logged

#### Scenario: Spam rate limit
- GIVEN 3 reviews in 1h
- WHEN 4th submitted
- THEN 429 with Retry-After

### Requirement: Reviews List and SEO
`producto/[slug]/reviews` MUST be paginated 10 ISR, star distribution bar 44px, images lightbox, verified badge, moderation queue approve/reject inline, JSON-LD Review + AggregateRating with aggregate rating computed view, i18n 4 locales. (Trace: SEO, UX-01, PERF-01)

#### Scenario: Reviews SEO
- GIVEN approved reviews
- WHEN product page crawled
- THEN JSON-LD AggregateRating with ratingValue and reviewCount present

#### Scenario: Pagination
- GIVEN 15 reviews
- WHEN page 1 loaded
- THEN 10 shown, page 2 loads remaining 5
