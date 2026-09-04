# Tasks: ecommerce-high-end-constitution (76) — 13 caps (+cultura-blog + wishlist + reviews) + extensions (calendar/share/fx/intl-pay/motion/easter) + PR9 remediation (10 gaps)

## Review Workload Forecast

Est ~6500 400-High 800-High 9WU 9PRs chained stacked-to-main PR1 600 PR2 520 PR3 400 PR4 750 PR5 770 PR6 800 PR7 510 PR8 580 PR9 600 All<=800

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
800-line budget risk: High

## Work Units

| U | PR | Base | Lines | Scope |
|---|----|------|-------|-------|
|1|PR1 T-A00..A09+A08b+T-FG-DOC|main|~600|Bootstrap + RULES 13caps|
|2|PR2 T-B01..B03+B01b+B08|PR1|~520|Money/FTS/keepalive|
|3|PR3 T-B04..B07+T-E01+T-F01+T-G01|PR2|~400|DB audit+carts+ENUM+cultura+wishlist+reviews|
|4|PR4 T-C01..C07+C07b|PR3|~750|Security+Legal|
|5|PR5 T-D01..D05+D01c+T-E02+T-E03|PR4|~770|Perf+Ecom+Cultura Public|
|6|PR6 T-D06..D09+D03b+D09b+D09c+T-E04+T-E05+T-K01+T-K02|PR5|~800|Social/ShippingIntl/Tracking+Cultura Admin/Sync+Motion/Responsive|
|7|PR7 T-F02+T-F03+T-G02+T-G03+T-H01+T-H03|PR6|~510|Wishlist+Reviews+CalendarPosts+Bulk|
|8|PR8 T-H02+T-I01+T-J01+T-J02+T-K03|PR7|~580|Launches+Share+FX+IntlPay+Easter|
|9|PR9 T-L01..L05+T-S01..S05|PR8|~600|Gap-Analysis remediation: Legal P0 + OCC/RPC + checkout integrity + shipping Upstash + sitemap/health/OTel + shallow deepening|

PR5b split ready if PR5>750 (move T-E02 to PR6: PR5→650 PR6→720+overflow to PR8). PR8 absorbs fx/pay/easter/share/launches to keep PR6/PR7 ≤800. PR9 stacked on PR8, base PR8, ~600 lines All≤800.

## Phase 1 PR1 Bootstrap

- [x] T-A00 `openspec/AGENT_RULES.md` 154r CONST 13caps (10+ cultura+wishlist+reviews) categories 12→13 MUST include WISHLIST+REVIEWS+CULTURA appendix via T-FG-DOC <=80l PR1
- [x] T-FG-DOC `docs/RULES.md` appendix + `openspec/AGENT_RULES.md` cat 13 — ensure WISHLIST+REVIEWS+CULTURA reflected in 13 caps, trace DOC-01/CULTURA/WISHLIST/REVIEWS Te markdown render Ac AGENT_RULES shows 13 caps C0 docs only <=60l PR1
- [x] T-A01 eslint150 strict 90/80 CQ-03 <=80l
- [x] T-A02 `.gitignore` .next rm-cached <=20l
- [x] T-A03 `src/config/env.ts` Zod ENV-01 <=60l
- [x] T-A04 `next.config.ts` CSP HSTS Brotli <=40l
- [x] T-A05 `src/types/database.types.ts` gen-types <=30l
- [x] T-A06 `src/lib/logger.ts` OTel Sentry <=40l
- [x] T-A07 `src/i18n/routing.ts` next-intl 4x6ns 308 <=60l
- [x] T-A08 `src/components/ui/*` Bauhaus 44px axe <=100l
- [x] T-A08b `src/styles/tokens.css`+`src/components/ui/design-system.md`+`src/app/[locale]/design/page.tsx` hidden Bauhaus --primary trino --pill 9999 --space 4/8/16/24 Geist 44px 8pt motion Tr UX-01/BAUHAUS/marca Te axe+screenshot Ac hidden/design ok C0 Tailwind strict free <=120l PR1
- [x] T-A09 `docs/DEPLOY.md`+`vercel.json`+`supabase/migrations/0009_cron_keepalive.sql` .com.ar/.com CNAME NIC/Namecheap SSL auto Vercel Cron 100/d pg_cron Tr DEPLOY/RES Te cron200 Ac docs ok C0 free SSL/Cron <=100l PR1

## Phase 2 PR2-3 DB

- [x] T-B01 `supabase/migrations/0002_money_int.sql` price_cents INT MONEY-01 <=30l
- [x] T-B01b `.github/workflows/migrate-preview.yml` supabase db reset 0002..0016 EXPLAIN GIN <=90l
- [x] T-B02 `supabase/migrations/0003_softdelete_fts.sql` deleted_at GIN <=30l
- [x] T-B03 `src/lib/validations/money.ts` Decimal HALF 1c <=40l
- [x] T-B08 `supabase/migrations/0010_keepalive.sql`+`src/lib/supabase/keepalive.ts`+`src/app/api/cron/keepalive/route.ts`+`.github/workflows/keepalive.yml` pause7d fix SELECT1 pg_cron 6h logs Vercel 04:00UTC UptimeRobot 5min Tr RES-02 Te keepalive_logs row Ac heartbeat ok C0 pg_cron+Vercel free <=110l PR2
- [x] T-B04 `supabase/migrations/0004_audit_security.sql` INSERT-only 1yr <=30l
- [x] T-B05 `supabase/migrations/0005_events_entitlements.sql` PK DLQ <=30l
- [x] T-B06 `supabase/migrations/0006_carts_session.sql` session_id ECOM-01 <=40l
- [x] T-B07 `supabase/migrations/0007_order_enum.sql` ENUM 9 422 409 <=30l
- [x] T-E01 `supabase/migrations/0011_cultura.sql` cultura_posts(id uuid pk, slug unique, locale CHECK es-AR/en/fr/pt-BR, title, excerpt, body jsonb TipTap, cover_image Storage, status draft/published, published_at, author_id FK, tags text[], related_product_ids int[], social_source enum, social_url, views int, search_vector tsvector GIN, deleted_at) + RLS anon SELECT published+deleted_at IS NULL, admin via is_admin() GIN+slug idx Tr ECOM/CMS/CULTURA-01 Te RLS anon 403 admin 200 Ac 0011 ok C0 free <=40l PR3
- [x] T-F01 `supabase/migrations/0013_wishlist.sql` wishlists(id uuid pk, user_id uuid FK nullable, session_id text nullable, product_id int FK ON DELETE CASCADE, created_at timestamptz, unique (user_id,product_id) where user_id IS NOT NULL, unique (session_id,product_id) where session_id IS NOT NULL, check user_id OR session_id) + RLS owner read/write, anon via session_id, merge on login like T-B06, idx (user_id),(session_id),(product_id) Tr ECOM/SEC/ARCH-05 Te Vitest RLS 403 vs 200 +409 duplicate Ac 0013 ok C0 free <=40l PR3
- [x] T-G01 `supabase/migrations/0014_reviews.sql` reviews(id uuid pk, product_id int FK CASCADE, user_id uuid FK, order_id uuid FK nullable, rating smallint 1..5, title text <=120, body text <=2000, images text[] <=3 presigned, status pending/approved/rejected default pending, helpful int 0, verified_purchase bool generated, created_at timestamptz, unique (user_id,product_id)) + RLS anon SELECT approved, owner INSERT own pending, admin moderate is_admin(), GIN+avg_rating view Tr ECOM/TRUST/SEC Te Vitest 422 rating 0/6 +403 write Ac 0014 ok C0 free <=50l PR3

## Phase 3 PR4 Security+Legal

- [x] T-C01 `src/lib/rate-limit.ts` Upstash 5/15m 429 <=40l
- [x] T-C02 `src/app/api/webhooks/mercadopago/route.ts` HMAC 401 DLQ dup200 <=80l
- [x] T-C03 `src/app/api/bank-proof/url/route.ts` presigned 10MB <200ms <=60l
- [x] T-C04 `src/proxy.ts` cookie HttpOnly Turnstile <=40l
- [x] T-C05 `src/lib/circuit.ts` Abort8s 3/60 30s <=40l
- [x] T-C05b `src/components/shared/cookie-consent.tsx`+`consent.json`+`privacy/page.tsx` granular blocks Resend Tr SEC/PRIV-01 Te axe+e2e Ac 4 locales <=130l
- [x] T-C06 CORS-WH POST-only HMAC-only <=30l
- [x] T-C07 `docs/LEGAL.md`+`disclaimer.tsx` DOC-01 esoteric <=80l
- [x] T-C07b `src/app/[locale]/(legal)/terms/page.tsx`+`src/app/[locale]/(legal)/defensa-consumidor/page.tsx`+`docs/TERMS.md` Terms Ley24.240 link+domicilio IVA incluido factura C/B olvido DELETE soft+anonymize 1yr Tr LEGAL/DOC-01 Te 4 locales render Ac footer links ok C0 no cost <=110l PR4

## Phase 4 PR5 Perf+Ecom+Cultura Public

- [x] T-D01 `src/lib/db/pagination.ts` 25/100 PERF-01 <=30l
- [x] T-D01b `src/lib/db/facets.ts`+`src/app/[locale]/tienda/page.tsx` tipo10/tradicion9/intencion7 FTS GIN <=140l
- [x] T-D01c `src/lib/perf/budget.ts`+`next.config.ts` ISR+`src/app/[locale]/tienda/loading.tsx`+`src/components/ui/skeleton.tsx`+`src/proxy.ts` edge LCP<2.5 CLS<0.1 INP<200 LH90 lighthouse-ci Tr PERF-01..07 Te LH-CI Ac budget enforced C0 free edge/ISR/LH <=130l PR5
- [x] T-D02 `src/components/shared/virtual-list.tsx` virtual>50 WebP PERF-02 <=50l
- [x] T-D02b `src/lib/seo/json-ld.ts`+`src/app/[locale]/producto/[slug]/page.tsx` Product JSON-LD ARS OG hreflang x4 <=110l
- [x] T-D02c `next.config.ts` images remotePatterns Storage WebP/AVIF BlurHash <=120l
- [x] T-D03 `src/lib/shipping/*` Strategy 60/300 ECOM-06 <=80l
- [x] T-D04 `src/lib/actions/cart.ts` merge SERIALIZABLE 409 44px <=60l
- [x] T-D05 `src/app/api/health/route.ts` 2s/1s/2s HEALTH 503 <=40l
- [x] T-E02 `src/lib/validations/cultura.ts`+`src/lib/actions/cultura.ts` Zod triple slug/title/excerpt/body/cover/tags/related_product_ids/social_source/url, Server Actions create/update/publish/delete is_admin() 403 revalidatePath FTS soft-delete Tr ARCH-05/CULTURA-02 Te Vitest Zod 422 +403 anon+200 admin Ac ok C0 free <=90l PR5
- [x] T-E03 `src/app/[locale]/cultura/page.tsx`+`src/app/[locale]/cultura/[slug]/page.tsx`+`src/app/[locale]/cultura/loading.tsx` listing 12 ISR revalidate 300 skeletons Bauhaus, detail TipTap + JSON-LD Article + OG/hreflang x4 + related carousel Tr I18N/PERF/SEO/CULTURA-03 Te LH90+Playwright Ac /cultura 200 12 cards C0 ISR free <=120l PR5

## Phase 5 PR6 Social/ShippingIntl/Tracking+Cultura Admin/Sync+Motion/Responsive

- [x] T-D03b `src/lib/shipping/carriers/international.ts` 4th carrier DHL eCommerce/Correo Intl flag SHIPPING_INTERNATIONAL_ENABLED=false fallback flat customs Tr ECOM-06/AD-04 Te mock rates Ac flag off no key C0 flag false free <=110l PR6
- [x] T-D06 `supabase/migrations/0008_cron.sql` >4h QStash Resend <=40l
- [x] T-D07 72h bank cancel re-entry idempotent <=30l
- [x] T-D08 `supabase/seed.sql` factories 90/80 SEED <=60l
- [x] T-D09 `ARCHITECTURE.md` Storybook Boundary <1s <=40l
- [x] T-D09b `src/lib/social/graph.ts`+`src/app/api/social/stats/route.ts`+`src/components/shared/social-feed.tsx` SocialProvider TikTok Display IG Basic 200/h Meta Graph YT 10k/d pg_cron daily Upstash 24h Tr PERF/RES Te mock+cache hit Ac feed cached C0 all free tiers daily1 poll <=130l PR6
- [x] T-D09c `src/lib/analytics/posthog.ts`+`src/components/shared/analytics-consent.tsx` PostHog 1M/mo gated T-C05b fail-closed Tr PRIV/COOKIE Te consent e2e no-track-before Ac ok C0 1M>>50k free <=110l PR6
- [x] T-E04 `src/app/[locale]/admin/cultura/page.tsx`+`src/components/admin/cultura-editor.tsx` TipTap + Dropzone Storage + tags + related picker + status draft/published + preview, RBAC is_admin()+audit 44px Tr admin-backoffice/CULTURA-04 Te Playwright admin create→publish→/cultura visible +403 anon Ac editor ok C0 free <=130l PR6
- [x] T-E05 `src/lib/social/cultura-sync.ts`+`src/app/api/cron/cultura-sync/route.ts`+`supabase/migrations/0012_cultura_cron.sql` auto-import TikTok/IG via SocialProvider into draft manual approve, pg_cron daily 06:00 UTC + QStash CRON_SECRET + Upstash dedup hash Tr RES/CULTURA-05 Te Vitest mock import→draft + E2E draft not public Ac sync ok C0 free daily <=90l PR6
- [x] T-K01 `src/styles/motion.css`+`src/lib/motion/variants.ts`+`src/components/ui/motion.tsx` Bauhaus geometric system: grid-wipe, mask-reveal, shape-morph, scroll-driven, View Transitions — OPEN QUESTION Animation library TBD — awaiting user pick A/B/C/D or hybrid [A CSS-only+View Transitions API Next16 zero-bundle clip-path/mask grid-wipes CLS-safe/perf limited enter/exit | B Motion One 3kb WAAPI+CSS @scroll-timeline scroll-driven parallax modern lightweight | C Lottie JSON Bodymovin trino sigil/logo morph SVG geometric high-end esoteric +asset weight | D GSAP ScrollTrigger editorial cultura scroll storytelling powerful/heavier lic-check] reduced-motion respected CLS<0.1 no heavy runtime Tr UX-01/BAUHAUS/PERF Te axe + prefers-reduced-motion + LH CLS<0.1 Ac motion ok no CLS regression C0 TBD free/3kb <=120l PR6
- [x] T-K02 `src/hooks/use-breakpoint.ts`+`src/components/shared/responsive.tsx`+`src/styles/responsive.css` mobile vs PC: bottom-nav/bottom-sheet/drawer thumb zone mobile, hover mega-menu desktop, swipe gestures (virtual list), pointer vs touch detection, 8pt grid, 44px touch-only, hidden [locale]/design shows both Tr UX-01 Te Playwright mobile 375px vs desktop 1280px + axe Ac responsive ok C0 free <=90l PR6

## Phase 6 PR7 Wishlist+Reviews+CalendarPosts+Bulk

- [x] T-F02 `src/lib/actions/wishlist.ts`+`src/lib/validations/wishlist.ts` toggle wishlist Server Action Zod (product_id uuid), auth anon session_id→user_id merge on login like cart T-B06 dedup unique, optimistic, rate-limit 60/m Upstash, idempotent 409 duplicate Tr ARCH-05/CONC/ECOM/SEC Te Vitest 422+409+429+E2E merge anon→login Ac toggle 200 heart persists C0 Upstash free <=60l PR7
- [x] T-F03 `src/app/[locale]/(account)/wishlist/page.tsx`+`src/components/shared/wishlist-button.tsx`+`src/components/shared/wishlist-heart.tsx` heart 44px thumb, optimistic toast, paginated 12 ISR 300, empty Bauhaus, i18n 4 locales Tr UX-01/PERF/I18N/ECOM Te Playwright E2E heart→/wishlist visible → login merge Ac 200 12 cards C0 ISR free <=110l PR7
- [x] T-G02 `src/lib/actions/reviews.ts`+`src/lib/validations/reviews.ts` create review (Zod rating 1-5 title<=120 body<=2000 images text[] presigned 5MB 3 max), verified_purchase if order delivered, moderate approve/reject admin 403, helpful toggle, anti-spam Turnstile+honeypot+rate 3/h Upstash Tr SEC/ANTI-SPAM/TRUST Te Vitest spam 429+409+422 rating 6+403 anon moderate Ac pending ok C0 Turnstile+Upstash free <=90l PR7
- [x] T-G03 `src/app/[locale]/producto/[slug]/reviews/page.tsx`+`src/components/product/reviews-list.tsx`+`src/components/product/star-rating.tsx`+`src/components/product/review-form.tsx` stars 44px distribution bar, paginated 10 ISR, images lightbox, verified badge, moderation queue approve/reject, JSON-LD Review+AggregateRating, i18n 4 locales Tr SEO/UX/TRUST/PERF Te LH90+axe star 44px+Playwright E2E pending→approve→public Ac reviews 200 stars+LD ok C0 ISR free <=130l PR7
- [x] T-H01 `src/app/[locale]/admin/cultura/calendar/page.tsx`+`src/components/admin/cultura-calendar.tsx` editorial calendar month/week view, drag-drop reschedule (dnd-kit free), status colors draft/published/scheduled, filter by locale/tag, pg query by published_at index, optimistic update + revalidate Tr CULTURA-06/CMS Te Playwright E2E calendar renders + drag reschedule persists Ac calendar ok C0 dnd-kit free <=120l PR7
- [x] T-H03 `src/lib/actions/cultura-bulk.ts`+`src/lib/validations/cultura-bulk.ts` Enhance T-E04: bulk publish/unpublish/archive/delete, duplicate, SEO score (title<=60 excerpt<=155 slug unique check), reading time (TipTap word count/200), version history (jsonb versions[] + diff), tests Vitest bulk 10 ops idempotent Tr CMS/CULTURA Te Vitest bulk 200 + duplicate 201 + 409 conflict Ac bulk ok C0 free <=90l PR7

## Phase 7 PR8 Launches+Share+FX+IntlPay+Easter

- [x] T-H02 `supabase/migrations/0015_launches.sql`+`src/app/[locale]/admin/lanzamientos/page.tsx`+`src/components/shared/launch-countdown.tsx` table launches(id uuid pk, product_id int FK products(id) ON DELETE CASCADE, launch_date timestamptz not null, type enum drop/collection/restock CHECK, title text not null, description text, status scheduled/live/ended CHECK, teaser_image text Storage, created_at timestamptz default now(), index launch_date) + calendar view + countdown on storefront (SSR+client tick, i18n Intl.RelativeTimeFormat, 44px) Tr ECOM-07 Te Vitest migration ok + Playwright countdown renders + cron status scheduled→live Ac launches ok C0 free <=120l PR8
- [x] T-I01 `src/components/shared/share-sheet.tsx`+`src/lib/share.ts`+`supabase/migrations/0017_share_token.sql` Web Share API + fallback copy-link + intent URLs WhatsApp/X/Facebook/TikTok/IG, OG image per entity (product/article/cultura/wishlist/review), share cart via carts.share_token uuid unique nullable + carts_share_token idx, share wishlist via wishlists share, share review, 44px bottom-sheet mobile / popover desktop, i18n share text 4 locales, analytics event via T-D09c posthog capture share_clicked gated consent Tr UX-02/SEO/PERF Te Playwright E2E share sheet opens + copy-link + OG meta Ac share ok C0 free <=110l PR8
- [x] T-J01 `src/lib/money/fx.ts`+`src/components/shared/currency-switcher.tsx`+`supabase/migrations/0016_fx_rates.sql`+`src/app/api/cron/fx/route.ts` table fx_rates(id uuid pk, base CHAR(3) default 'ARS' CHECK base='ARS', target CHAR(3) CHECK IN ('USD','EUR','BRL'), rate numeric(12,6) not null, fetched_at timestamptz default now(), source text) + daily fetch Frankfurter free (or exchangerate.host) + Upstash 24h cache + fallback last rate, display via Intl.NumberFormat per locale, store single source ARS cents MONEY-01 convert only display Tr MONEY/I18N Te Vitest fx mock + Playwright switcher ARS→USD Ac fx ok C0 Frankfurter+Upstash free <=110l PR8
- [x] T-J02 `src/lib/payments/providers/stripe.ts`+`src/lib/payments/providers/paypal.ts`+`src/lib/payments/router.ts`+`src/app/api/webhooks/stripe/route.ts`+`src/app/api/webhooks/paypal/route.ts` Strategy extend MP to Stripe intl cards + PayPal, feature-flagged PAYMENTS_STRIPE_ENABLED=false PAYPAL_ENABLED=false, zero-PAN delegated (Stripe Elements/PayPal SDK), webhook HMAC (stripe-signature constant-time + PayPal cert verify), idempotency processed_events PK, DLQ failed_webhooks_log, currency via T-J01 display ARS charge ARS (or USD if Stripe account supports) Tr PRIV-05/PAYMENTS Te Vitest webhook HMAC 401 vs 200 dup + DLQ Ac intl pay ok flag off C0 Stripe/PayPal free until volume <=130l PR8
- [x] T-K03 `src/lib/easter/konami.ts`+`src/components/shared/easter-egg.tsx`+`src/app/[locale]/admin/easter/page.tsx` client konami code (↑↑↓↓←→←→BA) → trino sigil animation (motion variants) + discount coupon share_token + toast i18n, admin type "trino" in console → Bauhaus grid overlay + audit log easter_found, feature-flag EASTER_ENABLED=true, no emojis, safe RLS, analytics event gated consent, respect reduced-motion Tr BRAND/UX Te Playwright E2E konami triggers sigil Ac easter ok C0 free <=90l PR8

## Phase 8 PR9 Gap-Analysis Remediation — MISSING + SHALLOW (stacked on PR8)

Base PR8 → target PR9. 10 tasks ≤150l each, trace+test+accept, All≤800, ~600 total.

- [x] T-L01 `src/app/[locale]/(legal)/cambios-devoluciones/page.tsx`+`src/app/[locale]/(legal)/envios/page.tsx`+`src/app/[locale]/(legal)/garantia/page.tsx`+`src/components/shared/legal-footer.tsx`+`messages/{locale}/legal.json` 3 legal pages from `global_settings.return_policy_by_tipo` JSONB CMS-01 never hardcoded, footer botón arrepentimiento Ley 24.240 art.34 10d + 0800-666-1518 prominent + CUIT/domicilio marbete, i18n 4 locales, `generateMetadata` hreflang x4 Tr LEGAL-04/05/06/DOC-01/LEGAL P0 art.34 10d Res.424/2020 Res.244/21 Te Vitest 4 locales render + Playwright footer links → pages 200 Ac /cambios /envios /garantia 200 44px footer button ok C0 free <=140l PR9
- [x] T-L02 `supabase/migrations/0018_occ_serializable.sql`+`src/lib/db/occ.ts`+`supabase/migrations/0019_cart_rpc.sql` OCC L1 hidden `expected_updated_at` Server Action guard `WHERE updated_at=expected` → 409 reload_required toast, L2 RPC `add_to_cart_serializable(p_product_id,p_qty,p_session_id)` + `merge_cart_serializable(p_from_session,p_user_id)` with `BEGIN ISOLATION LEVEL SERIALIZABLE; SELECT ... FOR UPDATE;` stock decrement capped Tr CONCURRENCIA-01/DB-06 Te Vitest 409 OCC conflict + integration double-sell 1 stock concurrent → 1 commit 1×409 + k6 stub 50 VUs Ac OCC 409 + SERIALIZABLE no double-sell C0 free <=150l PR9
- [x] T-L03 `src/app/api/checkout/route.ts`+`src/lib/checkout/price-integrity.ts`+`supabase/migrations/0020_orders_checkout.sql` POST checkout recompute `price_cents` INT from DB per line_item, compare client `total_cents` → 422 `price_mismatch` if drift, create `orders` pending/pending_verification (MP pref vs bank proof branch), persist `storage_path`, idempotency `Idempotency-Key` header PK, DLQ `failed_webhooks_log` on MP error, QStash→Resend queued not in request Tr MONEY-01/PRIV-05/PAYMENTS/ECOM-04 Te Vitest 422 tamper (client 199990 vs DB 209990) + 201 ok + DLQ insert Ac checkout 201 pending/verification ok C0 free <=150l PR9
- [x] T-L04 `src/app/api/shipping/rates/route.ts`+`src/lib/shipping/cache.ts` POST `/api/shipping/rates` Upstash `SETEX 60` + SWR 300 `X-Cache HIT/MISS`, `p-limit 5` jitter `100*2^attempt+rand(0,200)` backoff 5 retries, hash `sha256(CP+hash(sorted weight+products))` no sum collision, fallback `SELECT fixed_shipping_cents FROM global_settings`, circuit per-carrier 8s/3/60→30s probe Tr ECOM-06/AD-04/LOG-01 Te Vitest X-Cache HIT no external call + 429 fallback + Playwright rates before payment step Ac route 200 HIT/MISS+429 ok C0 Upstash free <=140l PR9
- [x] T-L05 `src/app/sitemap.ts`+`src/app/api/health/live/route.ts`+`src/app/api/health/ready/route.ts`+`instrumentation.ts`+`src/components/shared/error-boundary.tsx` sitemap dynamic 500 SKUs per locale (i18n routing) + hreflang, `GET /health/live` 200 always, `GET /health/ready` DB `SELECT 1` 2s + Redis `PING` 1s + Storage `listBuckets` 2s → 200|503, `instrumentation.ts` register OTel Sentry, Boundary 2-level `app/error.tsx` + `app/global-error.tsx` <1s reporting to logger Tr OBS/HEALTH/PERF/ERR-01 Te Vitest sitemap 500 URLs + live 200 + ready SELECT1 fault →503 Ac sitemap 500 + live/ready 200|503 ok C0 free <=150l PR9
- [x] T-S01 `tests/integration/rls-wishlist.test.ts`+`tests/integration/rls-carts.test.ts`+`tests/integration/explain-gin.test.ts`+`tests/e2e/wishlist-merge.spec.ts`+`k6/cart-serializable.js` Replace string-match: real RLS integration anon vs `is_admin()` (user A cannot read B wishlist), `EXPLAIN (COSTS OFF) ... USING GIN` cost <10k for FTS+facets, Playwright merge anon heart→login persists, k6 stub 50 VUs SERIALIZABLE no double-sell Tr TEST-01/SEC/CONC/DB-07 90/80 Te `pnpm test:coverage` 90 critical 80 global gate Ac behavioral not string-match C0 free <=150l PR9
- [x] T-S02 `package.json`+`src/lib/money/calc.ts`+`src/lib/money/decimal.ts` Add `decimal.js` + `p-limit` + `@dnd-kit/core` `@dnd-kit/sortable` deps, replace `Math.round` with `new Decimal(subtotal).times(rate).toDecimalPlaces(0, Decimal.ROUND_HALF_UP)` and `ROUND_HALF_DOWN` split path, fix `calcCartTotal` tax-on-discounted-subtotal order, add `@dnd-kit` to T-H01 build Tr MONEY-01/MONEY-02/AD-04 Te Vitest Decimal 1c drift fuzz 100 cases `0.21*100` + HALF_DOWN snapshot Ac calc 1c exact no drift C0 free deps <=60l PR9
- [x] T-S03 `src/app/api/webhooks/mercadopago/route.ts`+`supabase/migrations/0013_wishlist_rls_fix.sql`+`src/proxy.ts` Parse `x-signature: t=..,v1=..` extract `v1` hex, HMAC `hmac(t.payload)` `timingSafeEqual`, tighten wishlists RLS remove `for all using (true)` → `auth.uid()=user_id OR session_id=current_setting('request.jwt.claims')->>session_id` + app-layer filter, cookie `SameSite=Strict` for `/admin*` else `Lax`, `security_logs` insert on 429/403 Tr SEC-01/COOKIE/SLOG-02 Te Vitest HMAC vector `t..,v1` parse + RLS leak user A vs B 403 + cookie Strict Ac HMAC 401 + RLS isolated C0 free <=120l PR9
- [x] T-S04 `src/lib/shipping/hash.ts`+`src/lib/shipping/jitter.ts`+`src/lib/shipping/cache.ts` Fix `weightHash=sum` collision → `sha256(CP+sha256(JSON.stringify(sorted items weight+products)))`, sequential `p-limit 5` jitter `100-500ms` 5 retries, SWR hit serve-stale while revalidate, per-carrier circuit isolation Tr ECOM-06/AD-04/PERF Te Vitest collision 2 carts same sum different products → different hash + SWR hit Ac hash unique + jitter retry ok C0 free <=80l PR9
- [x] T-S05 `src/lib/logger.ts`+`src/app/api/health/ready/route.ts`+`src/lib/perf/mutex.ts`+`supabase/migrations/0021_orphan_gc.sql` Deepen logger `requestId=x-vercel-id|uuid route severity stack env` OTel fields, health real `SELECT 1` 2s / `PING` 1s / `listBuckets` 2s 200|503 latency, mutex `SET key NX EX 60` XFetch stampede for catalog, orphan GC weekly pg_cron `DELETE storage.objects WHERE bucket='products' AND name NOT IN (select cover_image...)` 1GiB guard Tr OBS/PERF/STOR-02 Te Vitest logger fields + health real checks Ac mutex + GC cron ok C0 free <=130l PR9

## Gap Scan

154r+13specs(10+ cultura-blog + wishlist + reviews)+6brand+ADs: prior 6 (T-C05b/T-D02b/T-B01b/T-D02c/T-D01b/T-C07) + 8 new (T-D03b/T-D09b/T-D09c/T-C07b/T-D01c/T-A09/T-B08/T-A08b) + 5 cultura (T-E01..E05) + 6 wishlist/reviews (T-F01..F03+T-G01..G03) + T-FG-DOC (RULES 13caps) covered. Extensions (kept at 13 caps, not inflating cap count): calendar posts+launches (T-H01/H02/H03), share carts/articles/blogs/products/wishlist (T-I01), multi-currency ARS→USD/EUR/BRL free FX (T-J01), Stripe+PayPal intl (T-J02), micro-interactions+responsive mobile/pc (T-K01/K02), easter eggs client/admin (T-K03) — now 76 tasks, 9 PRs, ~6500 lines, all ≤800/PR, 100% complete entry docs/rules + PR9 remediation 10 gaps (5 MISSING L01-L05 +5 SHALLOW S01-S05) stacked on PR8. SIXTH UPDATE: T-K01 revised per user request — framer-motion generic stagger/shimmer removed, Bauhaus geometric system OPEN A/B/C/D TBD. SEVENTH UPDATE: PR9 added per gap-analysis.md 270 lines Top5 MISSING + Top5 SHALLOW, ~600 lines base PR8, All≤800, stacked-to-main.

Deps A->B->C->D->E->F/G/H/I/J/K->L/S lint/dbReset/RLS/k6/LH/cron/axe flags<1s All ≤150l ≤800/PR

## Spec Stub

Capability 11 `cultura-blog` — locale posts + TipTap body + social auto-import draft + related products + SEO Article. See `openspec/changes/ecommerce-high-end-constitution/specs/cultura-blog/spec.md`.
Capability 12 `wishlist` — favoritos heart: toggle + anon session merge + RLS + paginated list, i18n 4 locales. Count 11→12. See `openspec/changes/ecommerce-high-end-constitution/specs/wishlist/spec.md`.
Capability 13 `reviews` — ratings 1-5 + verified_purchase + moderation queue + helpful + images presigned 3 + JSON-LD Review/AggregateRating. Count 12→13. See `openspec/changes/ecommerce-high-end-constitution/specs/reviews/spec.md`.
Extensions (no new cap count — sub-features of existing caps): H calendar → cultura-blog (CULTURA-06), I share → ecom-engine/SEO, J fx → money-arithmetic/I18N, J intl-pay → payments, K motion/responsive → performance-scalability/UX-01, K easter → brand/observability.
PR9 remediation caps: L-04/05/06 legal → legal pages, CONCURRENCIA-01 L1/L2 → OCC+SERIALIZABLE, MONEY-01/PRIV-05 → checkout price integrity, ECOM-06/AD-04 → shipping Upstash+p-limit, OBS/HEALTH → sitemap/live/ready/OTel/Boundary, TEST-01/SEC/MONEY/PERF → shallow deepening (RLS behavioral, Decimal.js, HMAC Strict, hash collision, logger mutex GC).

