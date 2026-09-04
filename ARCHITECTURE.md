# Architecture — Santisima Trinidad

## Overview
Next 16 App Router [locale] + Supabase Postgres RLS + Upstash Redis. 13 caps (10 + cultura-blog/wishlist/reviews). Deployed Vercel.

## Boundaries & Design
- **UI**: Bauhaus tokens --primary #D95D39, pill 9999, --space 4/8/16/24, Geist, 44px touch, 8pt grid, axe.
- **ErrorBoundary** 2-level (root + segment) <1s flag OFF by default, kill-switch via env. Storybook stories for Boundary, skeletons, responsive.
- **State**: Server Actions Zod + is_admin() RLS + revalidatePath. No client DB writes.
- **Perf**: ISR 300, edge, LCP<2.5 CLS<0.1 INP<200, Brotli>1KB, pagination 25/100.
- **Flags**: SHIPPING_INTERNATIONAL_ENABLED=false fallback flat, PAYMENTS flags false, EASTER_ENABLED=true.

## Data Model Caps
products price_cents INT, cultura_posts slug GIN search_vector, wishlists partial uniques anon/session merge, reviews rating 1..5 moderation.

## Cron & Resilience
pg_cron 6h keepalive, 1h abandoned-cart QStash->Resend, 1h 72h bank cancel idempotent, daily 06:00 cultura-sync dedup hash.

## Observability
OTel+Sentry instrumentation, /health 2s/1s/2s 503, audit_logs INSERT-only, dlq failed_webhooks_log.

## Cost Zero
MP zero-PAN, pg_cron+Upstash 10k/d, QStash 500/d Resend 100/d, Vercel 100GB Brotli swr300.
