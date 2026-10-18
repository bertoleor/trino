# 01 — Complex Functions Checklist (Editors · SEO · Calendars · CRM · Realtime · PWA)

> **Purpose:** For every "complex" capability, decide build scope, cost-zero quota math, files that implement it (trace to `openspec/changes/archive/2026-09-04-ecommerce-high-end-constitution/tasks.md`), alternatives, risks and acceptance.  
> **Trace:** CONSTITUTION CQ-03/04/ARCH-01..06 + openspec 13 caps + tasks 66 (PR1-PR8).  
> **Best-practice sources consulted:** Context7 — TipTap `/ueberdosis/tiptap-docs` (8556 snippets), Supabase Realtime `/supabase/realtime` (518), next-pwa `/shadowwalker/next-pwa` (421) + web (Upstash/Resend/Vercel).

---

## How to read this checklist

Each function has the same 8-row template:

| Campo | Qué responder |
|---|---|
| What it does | 1 sentence |
| File(s) in tasks | Exact paths + task ID |
| Free-tier quota math | Numbers for 500 SKUs + massive traffic — does free tier hold? |
| Best practice (Context7) | What the lib docs say to do |
| Alternatives considered | Why not the other option |
| Risks | What breaks at scale |
| Acceptance | How reviewer proves it works |
| Status | MVP / Next / Cut |

---

## 1. Editors — TipTap + Dropzone Presigned + Collaboration (?)

### What it does
Rich editing for `cultura_posts.body` (JSONB) + product `description` (TipTap) with image Dropzone that uploads **direct to Supabase Storage via presigned URL** (never through Next server). Used by admin in `/admin/cultura` (T-E04) and product admin (T-A08b design tokens).

### File(s) in tasks

| Task | File | Lines |
|---|---|---|
| T-E04 | `src/app/[locale]/admin/cultura/page.tsx` | ≤130 |
| T-E04 | `src/components/admin/cultura-editor.tsx` | TipTap + Dropzone + tags + related picker + preview |
| T-E02 | `src/lib/validations/cultura.ts` + `src/lib/actions/cultura.ts` | Zod + Server Actions (ARCH-05 triple check) + `revalidatePath` |
| T-A08 | `src/components/ui/*` (editor toolbar = pills + Bauhaus tokens) | ≤100 |
| T-E01 | `supabase/migrations/0011_cultura.sql` | `body jsonb`, `search_vector tsvector GIN` |
| T-H03 | `src/lib/actions/cultura-bulk.ts` (bulk, SEO score, reading time, version history `jsonb versions[]`) | ≤90 |

### Extensions (admin editor)

```ts
// src/components/admin/cultura-editor.tsx — minimal viable
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit' // P: paragraph, heading 2/3, bullet/ordered, bold/italic, blockquote
import Image from '@tiptap/extension-image'   // + presigned upload
import Link from '@tiptap/extension-link'     // href validation
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count' // SEO: excerpt 155, reading time 200 wpm
// Prohibited for MVP: Collaboration (Yjs) — see decision below
```

### Free-tier quota math

- TipTap core: **free MIT**, no quota. `@tiptap/starter-kit` + extensions = ~45kB gzipped.
- Storage presigned upload: Supabase Storage free = **1 GiB** storage + 2 GiB egress. 500 products × 3 images × 500kB WebP avg = **~750 MB** → fits with 250 MB margin. Exceeds → enable Supabase $25 Pro or prune orphaned via `STOR-02` weekly GC.
- CAE: Supabase `pg_cron` + Storage presigned = free tier (no QStash in this path).

### Best practice (Context7 — TipTap)

- Use `StarterKit.configure({ undoRedo: false })` only if `Collaboration` (Yjs) is on — otherwise keep default history.
- Image: return absolute `https://...` URL in JSON (`{url}`) — relative paths rejected. Validate via `magic-bytes` server-side (SEC-04), not extension.
- Store content as **TipTap JSON** (`body jsonb`) not HTML — query via `to_tsvector('spanish', title||excerpt)` separately (GIN). Render with `generateHTML` on read.
- Dropzone: client requests presigned URL → `PUT` directly to Storage → backend stores `storage_path` only (PERF-06).

### Alternatives considered

| Alternative | Why not (for Trino) |
|---|---|
| **Collaboration (Yjs + Hocuspocus / TiptapCollabProvider)** | For 1–3 editors, Yjs adds  ~80kB + provider infra (Tiptap Cloud $/self-host). Tasks T-E04/T-E05 use **draft import + manual approve**, not concurrent co-edit. Defer — add only if >5 editors fight over same draft (queue in T-K). Cost: Tiptap Cloud free 1 doc; self-host Hocuspocus free but ops overhead. |
| **Slate / Lexical / CKEditor** | TipTap is ProseMirror-based, headless, shadcn-friendly, and already mandated by ADMIN-03. No reason to diverge. |
| **Upload through Next server** | Hits Vercel 4.5 MB payload + 15s timeout (PERF-06 prohibited). Presigned is mandatory. |

### Risks

- Large paste (Word DOCX) can inject 2 MB HTML → OOM. Mitigate: `CharacterCount` limit 20k chars + `ImportDocx` stripped if not needed.
- XSS via `body` JSON → escape on render (`dangerouslySetInnerHTML` only after `sanitizeHtml` or use `EditorContent`).
- Orphaned images if editor discards draft → weekly `STOR-02` GC moves orphans to `orphaned/` 30d.

### Acceptance

- [ ] Admin creates cultura post → uploads 5 MB image via Dropzone → upload bypasses Next server (Network tab shows PUT to `*.supabase.co/storage/...`), BlurHash placeholder appears, `body` saves as JSON, RLS: anon 403 on POST, admin 200, published appears at `/cultura/[slug]` (Playwright).
- [ ] `products-500-template.csv` import preserves TipTap body stub; FTS `@@` query uses GIN (EXPLAIN).
- [ ] Lighthouse reading time = `wordCount/200` displayed.

### Status: **MVP — without Collaboration.** Collaboration = Next if editors >5.

---

## 2. SEO — JSON-LD + hreflang x4 + sitemap 500 + OG + Lighthouse 90

### What it does
Every product/cultura/review entity emits machine-readable SEO: **JSON-LD** (Product / Article / AggregateRating+Review), **hreflang x4** (`es-AR` default, `en`, `fr`, `pt-BR`), **sitemap.xml** for 500 SKUs, **OpenGraph** per entity, and **Lighthouse perf ≥90**.

### File(s) in tasks

| Task | File |
|---|---|
| T-D02b | `src/lib/seo/json-ld.ts` + `src/app/[locale]/producto/[slug]/page.tsx` (Product JSON-LD ARS, OG, hreflang x4) |
| T-E03 | `src/app/[locale]/cultura/[slug]/page.tsx` (Article JSON-LD) + `src/app/[locale]/cultura/page.tsx` (listing ISR 12) |
| T-G03 | `src/components/product/reviews-list.tsx` + `json-ld` Review/AggregateRating |
| T-D01c | `src/lib/perf/budget.ts` + `next.config.ts` ISR + `skeleton.tsx` + Lighthouse CI |
| T-D02c | `next.config.ts` images remotePatterns + WebP/AVIF |
| T-A09 | `vercel.json` + `supabase/migrations/0009_cron_keepalive.sql` (Cron for sitemap regen) |

### Shapes

```ts
// src/lib/seo/json-ld.ts — Product (ARS INT)
export const productJsonLd = (p: Product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.title,
  description: p.excerpt,
  sku: p.sku,
  image: p.images, // absolute Storage URLs
  offers: {
    "@type": "Offer",
    priceCurrency: "ARS",
    price: (p.price_cents/100).toFixed(2),
    availability: p.stock>0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    priceValidUntil: p.sale_end ?? undefined,
  },
  // agregado si reviews aprobadas >0
  aggregateRating: avg ? { "@type":"AggregateRating", ratingValue: avg, reviewCount: count } : undefined,
});

// Article (cultura)
{ "@type":"Article", headline: title, image: cover_image, datePublished: published_at, author: { "@type":"Organization", name:"trino." } }

// hreflang — en generateMetadata
alternates: { languages: { 'es-AR': '/es-AR/producto/slug', en: '/en/product/slug', 'fr': '/fr/produit/slug', 'pt-BR': '/pt-BR/produto/slug' } }
```

### Free-tier quota math

- Sitemap 500 URLs: generated on-demand via `app/sitemap.ts` (no cron storage). Cost: 1 ISR invocation per `revalidate` (60s per spec HTTP-02) → **~1440/day** → free on Vercel Hobby (100k invocations/mes).
- ISR `s-maxage 60, stale-while-revalidate 300` (HTTP-02): 500 SKUs × 60s = ~500 revalidations/min peak → within Vercel ISR free (no Upstash needed). If stampede → mutex (PERF-05).
- OG images: `next/og` dynamic (no third party). Bundle <100kB.
- Lighthouse CI: `lighthouserc.json` runs on `pnpm build` (GitHub Actions free 2000 min/mes).

### Best practice (Context7 + Next docs)

- `generateMetadata` per entity (DEV-02) — never static global `metadata` object for PDP.
- Sitemap: `app/sitemap.ts` returns `MetadataRoute.Sitemap` with `lastModified`, `changeFrequency`, `priority`, plus `alternates.languages` loop for 4 locales.
- JSON-LD: one `<script type="application/ld+json">` per page; validate at https://search.google.com/test/rich-results + https://validator.schema.org.
- Images: `next.config.ts images.remotePatterns: [{hostname: '*.supabase.co'}]` + `formats: ['image/avif','image/webp']` + `deviceSizes` token.

### Alternatives considered

| Alternative | Why not |
|---|---|
| **Algolia/Typesense for SEO** | FTS GIN (DB-07) suffices for 500 SKUs; Algolia is cost and vendor lock for marginal typo gain (pg_trgm covers it free). |
| **next-seo plugin** | Thin wrapper; manual `json-ld.ts` is 60 lines and typesafe (Zod-derived). |
| **SSR without ISR** | ISR gives `s-maxage 60 swr 300` cache-hit ~95% at massive traffic (HTTP-02) vs SSR 0% hit. |

### Risks

- 500 URLs with 4 locales = **2000 sitemap entries** — must split `sitemap-0.xml` if >5000 (Google limit 50k, safe). Current 2000 ok.
- Stale `sale_price` shown after window ends if ISR not revalidated: mitigate `revalidate 300` + `on-demand revalidatePath` on `sale_end` cron.
- Locale fallback: missing `fr` key must fallback to `es-AR`, not raw key (I18N-01).

### Acceptance

- [ ] `/es-AR/producto/vela-soja-lavanda-200g` view-source contains `application/ld+json` Product with `priceCurrency ARS` and `500` SKUs appear in `/sitemap.xml` with 4× `xhtml:link` each.
- [ ] Lighthouse CI `pnpm build && lhci autorun` → perf ≥90, LCP <2.5s, CLS <0.1, INP <200ms (T-D01c budget).
- [ ] OG image renders per locale (4 screenshots).

### Status: **MVP — full.**

---

## 3. Marketing Calendars — Editorial + Launches (dnd-kit free + pg_cron)

### What it does
Two calendars: **Editorial** (cultura posts by `published_at`) and **Launches** (`launches` table: drop/collection/restock with `launch_date` + countdown on storefront). Both support month/week view, drag-drop reschedule, status colors (draft/published/scheduled / scheduled/live/ended).

### File(s) in tasks

| Task | File |
|---|---|
| T-H01 | `src/app/[locale]/admin/cultura/calendar/page.tsx` + `src/components/admin/cultura-calendar.tsx` (dnd-kit, pg query by `published_at` index, optimistic + revalidate) |
| T-H02 | `supabase/migrations/0015_launches.sql` + `src/app/[locale]/admin/lanzamientos/page.tsx` + `src/components/shared/launch-countdown.tsx` (SSR + client tick, `Intl.RelativeTimeFormat`, 44px) |
| T-H03 | Bulk ops (publish/unpublish/duplicate, SEO score, version history) |
| T-E05 | `src/lib/social/cultura-sync.ts` + `src/app/api/cron/cultura-sync/route.ts` + `0012_cultura_cron.sql` (auto-import TikTok/IG draft daily 06:00 UTC, dedup hash) |

### Calendar schema

```sql
-- 0015_launches.sql
create table launches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  launch_date timestamptz not null,
  type text check (type in ('drop','collection','restock')),
  title text not null,
  description text,
  status text check (status in ('scheduled','live','ended')) default 'scheduled',
  teaser_image text,
  created_at timestamptz default now()
);
create index idx_launches_date on launches (launch_date);
```

Countdown: `useEffect tick 1s` + SSR initial `timeLeft = launch_date - now` (avoids hydration mismatch with `suppressHydrationWarning`).

### Free-tier quota math

- **dnd-kit**: `@dnd-kit/core` + `@dnd-kit/sortable` = **free MIT**, 18kB gzipped. No quota. Used in T-H01 with `PointerSensor` + `TouchSensor` (44px thumb).
- **pg_cron**: Supabase free includes **pg_cron** extension. Jobs: `cultura-sync daily 06:00 UTC` + `launches scheduled→live cron 1m` + `abandoned carts hourly` + `keepalive 6h` → **4 jobs** → well under Supabase free limit (no cap documented, but 10+ is fine).
- **QStash**: for cultura-sync async, not for calendar drag itself. Calendar revalidate is `revalidatePath` (free).

### Best practice (Context7 — dnd-kit)

- Use `DndContext` + `SortableContext` + `useSortable` per event card. Sensors: `PointerSensor` (8px activation) + `TouchSensor` (delay 200ms, tolerance 6px) for mobile 44px.
- On `dragEnd`, optimistic `setEvents` + `POST /api/cultura/calendar {id, published_at}` + `revalidatePath` on success, rollback on 409 OCC (editor conflict).
- Virtualize if >100 events/month (use `@tanstack/react-virtual` same as D02).

### Alternatives considered

| Alternative | Why not |
|---|---|
| **FullCalendar / react-big-calendar** | Heavy (80–150kB), opinionated styles clashing with Neo-Bauhaus pills. dnd-kit free gives drag primitives without calendar dogma; we render our own month grid (4/8px spacing, Bauhaus tokens). |
| **Upstash Workflow for scheduling** | Overkill for date reschedule; `pg_cron` polls `published_at` index (GIN+btree) free. QStash reserved for email/external webhooks (RES-03) |

### Risks

- Drag-drop with 500 SKUs + 20 cultura posts can jitter at 375px. Mitigate: `transform: translate3d` only (hardware accel), no `transition-all`.
- `launch_date` timezone: always UTC, display via `Intl.DateTimeFormat` locale zone (DB-01).
- Concurrent drag by two admins → OCC 409 with "reload" toast (CONCURRENCIA-01 L1).

### Acceptance

- [ ] Admin calendar renders month/week, drags event to new date → DB `published_at` updates, revalidate shows new position, second tab shows updated after refresh; axe at 375px passes.
- [ ] Launch countdown on storefront ticks without hydration error; status `scheduled→live` flips via cron within 1 min of `launch_date`.
- [ ] Social auto-import creates `draft` not `published` (E2E).

### Status: **MVP — Editorial (T-H01) + Launches (T-H02).**

---

## 4. CRM — Entitlements + Audit + Customer 360 (LTV, Resend 100/d, QStash 500/d)

### What it does
Backoffice Customer 360: single-query view of **LTV** (SUM `orders.total_cents` delivered/canceled filter), last login, active cart, purchase history, email/notification history. RBAC via `entitlements` table (no `if(plan==='Pro')`), immutable `audit_logs` (INSERT-only RLS), and async email via **Resend** + **QStash**.

### File(s) in tasks

| Task | File |
|---|---|
| T-B04 | `supabase/migrations/0004_audit_security.sql` (`audit_logs`, `security_logs` INSERT-only RLS, 1yr retention) |
| T-B05 | `supabase/migrations/0005_events_entitlements.sql` (`processed_events` PK, `failed_webhooks_log` DLQ, `entitlements`) |
| T-D08 | `supabase/seed.sql` factories (90/80 coverage) |
| ADMIN-06 | `src/app/[locale]/admin/customers/[id]/page.tsx` + `src/lib/db/customer360.ts` (single join, no N+1, DB-06) |
| ECOM-05 | `supabase/migrations/0008_cron.sql` (abandoned >4h via QStash→Resend) |
| T-D09c | `src/lib/analytics/posthog.ts` (1M/mo free, gated T-C05b) — not CRM but co-located |

### Customer 360 query (one round-trip)

```sql
-- src/lib/db/customer360.ts
select
  p.id, p.email, p.full_name,
  (select coalesce(sum(total_cents),0) from orders o where o.user_id=p.id and o.status in ('delivered','authorized','processing','shipped')) as ltv_cents,
  (select max(created_at) from orders o where o.user_id=p.id) as last_order_at,
  (select json_agg(ci) from cart_items ci where ci.user_id=p.id) as active_cart,
  (select json_agg(o) from orders o where o.user_id=p.id order by o.created_at desc) as orders,
  (select json_agg(a) from audit_logs a where a.record_id=p.id) as audit_trail
from profiles p where p.id=$1;
-- + parallel fetch notification history via Upstash/Resend log table
```

### Free-tier quota math — the critical table

| Service | Free quota | Trino 500 SKUs need (massive-traffic model) | Verdict |
|---|---|---|---|
| **Supabase DB** | 500 MB DB + 1 GiB Storage + 50k MAU | 500 products + 20 cultura + audit ~200 MB; 50k users okay | ✅ fits |
| **Resend** | **100 emails/day** (free) + 3000/mo | Transacional (~20/day) + marketing batch: must gate. 500 users × 1 abandoned email/week = 71/day → exceeds if + launches. | ⚠️ **tight** — see mitigation |
| **Upstash QStash** | **500 messages/day** free | Abandoned carts 1/h × ~10 msgs + cultura-sync 1/day + factura async → ~30/day | ✅ fits |
| **Supabase pg_cron** | free, no hard cap | 4 jobs above | ✅ fits |
| **Entitlements table** | DB rows, no external quota | 1 row per user-role | ✅ |

**Resend 100/d mitigation (documented):**
- Send **only transactional** on free (order confirm, shipping, factura, password reset) → ~20/d.
- Marketing (abandoned cart, launch teaser, lunar calendar) via **QStash batching + daily cap** + upgrade to Resend Pro ($20/mo 50k) when >80/d sustained. Admin panel shows counter `resend_quota_used_today` (OBS-02 health).
- Fallback: queue `pending_retry` + SSE progress if >100 (JOBS-02).

### Best practice

- **Entitlements:** never `if (user.plan === 'Pro')`. Instead: `can_export_pdf`, `can_access_api`, `max_products` rows in `entitlements`; Stripe/MercadoPago webhooks update rows on `subscription_change` (ECOM-07). Check via `is_admin()` + `entitlements` join, server-side only (ADMIN-04).
- **Audit logs:** `audit_logs` INSERT-only RLS (no UPDATE/DELETE) + `security_logs` separate table (SLOG-01). Retention 1yr (SLOG-03), then cold Storage.
- **Resend async:** `RES-03` — never `await resend.send()` in request path. Instead: `insert into marketing_campaigns` → trigger `n8n` or `QStash → Resend`. Request completes <200ms, failure → DLQ not 500.

### Alternatives considered

| Alternative | Why not |
|---|---|
| **SendGrid / SES** | Resend has better DX for React Email + next-intl locale templates (already used in T-D09c). SES cheaper at scale but heavier ops. Stay Resend free until 100/d wall. |
| **Inngest for jobs** | QStash + pg_cron is free tier sufficient; Inngest adds vendor for marginal benefit. Re-evaluate at >10k jobs/day. |
| **Client-side entitlements** | Prohibited (ADMIN-04) — server middleware + Server Action triple check (ARCH-05) required. |

### Risks

- 500 SKUs × massive traffic (10k visits/day) × 5% cart abandon = 500 potential emails/day → Resend 100/d exceeded → queue backlog. Must show admin warning and cap.
- QStash 500/d hit if retries storm → use `p-limit(5)` + `exponential backoff` (RES-02) + DLQ.
- Customer 360 N+1: fetching orders in loop → blocked. Single join mandatory (DB-06). Add `EXPLAIN ANALYZE cost <10k` to PR (IDX-02).

### Acceptance

- [ ] Admin opens `/admin/customers/{id}` → one network round-trip returns LTV, last login, active cart, orders, notifications (Network tab 1 query).
- [ ] Editor calls `deleteProduct` → 403 + `security_logs` entry + audit denied.
- [ ] Abandoned cart >4h → pg_cron hourly queues locale-aware email via QStash→Resend; admin Abandoned view shows live count (E2E).

### Status: **MVP — transactional CRM + audit + 360. Marketing bulk = gated by Resend cap.**

---

## 5. Live Notifications — Supabase Realtime vs Polling (WebSocket fallback, permission)

### What it does
Admin PWA + storefront live updates: new sale, order status change, stock low, DLQ insertion, and cultura publish — delivered via **Supabase Realtime** (Phoenix Channels over WebSocket) with polling fallback.

### File(s) in tasks

| Task | File |
|---|---|
| T-E05 | `src/lib/social/cultura-sync.ts` (dedup hash) + `src/app/api/cron/cultura-sync/route.ts` |
| OBS-02 | `src/app/[locale]/admin/health/page.tsx` (DLQ counter, error rate, p95, connections) |
| T-D05 | `src/app/api/health/route.ts` (DB SELECT1 2s, Redis PING 1s, Storage 2s) |
| PR6/7 | New: `src/lib/realtime/channels.ts` + `src/hooks/use-realtime-orders.ts` + `src/components/admin/live-badge.tsx` |

### How it works (three features — Context7)

```
Broadcast (ephemeral)           →  "new_order" toast (ACK) — no DB persistence
Presence (shared state)         →  "admin X is viewing order Y" (optional, not MVP)
Postgres Changes (CDC)          →  LISTEN on orders.status / cultura_posts.status via publication
```

```ts
// src/hooks/use-realtime-orders.ts
import { createClient } from '@/lib/supabase/client'
export const useRealtimeOrders = (onInsert: (o: Order)=>void) => {
  useEffect(() => {
    const sb = createClient()
    const ch = sb.channel('realtime:orders')
      .on('postgres_changes', { event: 'INSERT', schema:'public', table:'orders' }, ({new:rec})=>onInsert(rec))
      .subscribe((s)=>{ if(s==='SUBSCRIBED') console.log('live') })
    // Reconnect + fallback
    const fallback = setInterval(()=>{ if(ch.state!=='joined') fetch('/api/orders/recent').then(/*poll*/) }, 30000)
    return () => { ch.unsubscribe(); clearInterval(fallback) } // ERR-02 cleanup mandatory
  }, [])
}
```

### Free-tier quota math

| Resource | Supabase Realtime free | Trino need | Verdict |
|---|---|---|---|
| Concurrent connections | **200** (free) | Admins 5 + storefront watchers (if subscribed) 50 peak | ✅ if only admin subscribes |
| Channels | 100 | `realtime:orders` + `realtime:cultura` + `realtime:health` = 3 | ✅ |
| Messages | 5M/mo (?) | ~1k/day orders × 500 SKUs peak = ~30k/mo | ✅ |
| Postgres Changes throughput | Poll 100ms / 100 changes | Hourly orders 100 → fine | ✅ |

**If massive traffic subscribes storefront (1000+ concurrent):** free 200 exceeded → fallback to **polling every 30s** (`swr refetchInterval` + `Cache-Control s-maxage 60 swr 300`). Add `Upstash Redis` pub/sub only if exceeding.

### Best practice (Context7 — Supabase Realtime)

- Join message: `{topic:"realtime:orders", event:"phx_join", payload:{config:{postgres_changes:[{event:"*",schema:"public",table:"orders"}]}}}`
- Auth via JWT `user_token`; RLS still enforced — `postgres_changes` only emits rows the subscriber can `SELECT` (so admin sees all, anon sees only `published` cultura).
- Always cleanup on unmount: `return () => channel.unsubscribe()` (ERR-02; else memory leak).
- Fallback: on `CLOSED`/`CHANNEL_ERROR`, switch to `setInterval(fetch, 30000)` + `BroadcastChannel` cross-tab sync (PERF-04).

### Alternatives considered

| Alternative | Why not |
|---|---|
| **Polling only (SWR 30s)** | Simplest, cost-zero, and sufficient for MVP storefront. **Chosen as default for public PLP** — Realtime only for `/admin/*`. |
| **Pusher / Ably** | Extra vendor, 100 conn free then $29; Supabase Realtime is bundled free with DB — no second bill. |
| **Server-Sent Events (SSE)** | Works but needs Vercel Edge `ReadableStream`; harder RLS per row than Realtime `postgres_changes`. |

### Risks

- WebSocket blocked by corporate firewall → polling fallback must exist and be tested.
- RLS misconfig leaks draft cultura to anon via Realtime → test RLS `anon SELECT published` vs `admin is_admin()` (T-E01).
- No `ERR-02` cleanup → channel persists after unmount → duplicate toasts + leak.

### Acceptance

- [ ] Admin opens `/admin/orders` → new order INSERT appears within 2s + plays `.mp3` via Web Audio (NOTIF-02).
- [ ] Killing WebSocket (DevTools offline) → fallback poll still updates within 30s; reconnect on online via `reloadOnOnline:true` (next-pwa).
- [ ] Permission: anon tab subscribing `cultura_posts` only receives `published` rows, never `draft` (RLS test 403 vs 200).

### Status: **MVP — Realtime on `/admin/*` only, polling on storefront. WebSocket fallback mandatory.**

---

## 6. Admin Installable on Phone — PWA (manifest + service worker, next-pwa free, offline cache, push)

### What it does
Admin panel as **installable PWA**: Add to Home Screen prompt on Android/iOS, offline cache for `/admin/*` shell + recent orders, background sync, and optional push (via Vercel + Web Push).

### File(s) in tasks

| Task | File |
|---|---|
| T-A08b | `src/app/manifest.ts` (dynamic Route Handler `/api/manifest?tenant=id` if white-label — but for MVP static `manifest.json`) |
| PR6 | `public/manifest.json` + `next.config.ts` `withPWA` + `public/sw.js` (generated) |
| PR6 | `src/components/admin/install-prompt.tsx` (beforeinstallprompt capture + 44px button) |
| T-D09b | `src/components/shared/social-feed.tsx` (offline fallback placeholder) |
| OBS-02 | Health module (shows `navigator.onLine` + service worker state) |

### Manifest (trino. Bauhaus tokens)

```json
// public/manifest.json
{
  "name": "trino. — admin",
  "short_name": "trino admin",
  "start_url": "/es-AR/admin?utm_source=pwa",
  "display": "standalone",
  "background_color": "#FDFBF7",
  "theme_color": "#D95D39",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/android-chrome-192x192.png", "sizes":"192x192", "type":"image/png", "purpose":"any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes":"512x512", "type":"image/png" }
  ],
  "shortcuts": [
    { "name":"Pedidos", "url":"/es-AR/admin/orders", "icons":[{"src":"/icons/orders.png","sizes":"96x96"}] }
  ]
}
```

### next-pwa config (Context7 best practice)

```js
// next.config.ts
const withPWA = require('next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,          // activate new SW immediately
  clientsClaim: true,
  disable: process.env.NODE_ENV === 'development', // no SW in dev
  fallbacks: { document: '/_offline' }, // offline page
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'supabase-images', expiration: { maxEntries: 100, maxAgeSeconds: 7*24*60*60 } }
    },
    {
      urlPattern: /^https:\/\/api\.trino\.com\.ar\/api\/admin\/.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'admin-api', networkTimeoutSeconds: 10, expiration: { maxEntries: 50, maxAgeSeconds: 60 } }
    }
  ],
  reloadOnOnline: true,
  // Vercel: sw scope '/' — entire domain; or '/admin' to isolate
})
module.exports = withPWA(nextConfig)
```

### Install prompt

```ts
// src/components/admin/install-prompt.tsx
let deferredPrompt: BeforeInstallPromptEvent | null = null
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; showButton() })
button.onclick = async () => { deferredPrompt?.prompt(); const {outcome}=await deferredPrompt.userChoice; if(outcome==='accepted') deferredPrompt=null }
```

### Free-tier quota math

| Resource | next-pwa + Workbox | Trino 500 SKUs | Verdict |
|---|---|---|---|
| `next-pwa` lib | free MIT | — | ✅ |
| Service worker precache | `/_next/static/*` immutable 1y (HTTP-02) → ~2 MB .js/.css | fits cache storage 50 MB per origin | ✅ |
| Offline doc cache | `_offline` fallback + 20 recent orders JSON (~200kB) | fits | ✅ |
| Push notifications | Web Push via Vercel? Not free push server | No infra needed for MVP — use Realtime Broadcast + audio .mp3 (NOTIF-02) instead | ✅ |

**Push via Vercel:** Vercel does **not** provide push service. Options: `web-push` lib + VAPID keys self-hosted (free) or OneSignal free 10k subs. For Trino, **no push in MVP** — live Realtime + audio suffices. Document upgrade path: `src/app/api/push/subscribe/route.ts` stores `PushSubscription` + `web-push` send on `new_order` (when >1000 orders/day).

### Best practice (Context7 — next-pwa / @ducanhgh/next-pwa)

- `dest: 'public'`, `register: true`, `skipWaiting: true` + `clientsClaim: true` for immediate activation (avoid stale SW trap).
- `disable: true` in development (else cache poisons HMR).
- `fallbacks.document: '/_offline'` — a dedicated Next page (`src/app/_offline/page.tsx`) with Bauhaus illustration + "Sin conexión — tus últimos pedidos están cacheados".
- `scope: '/'` for whole site or `'/admin'` to isolate; `cacheStartUrl: true` caches `start_url`.
- `buildExcludes: [/chunks\/images\/.*/, /\.map$/]` to keep SW small.
- Icons: 192, 512 `maskable` required for Android install prompt criteria.

### Alternatives considered

| Alternative | Why not |
|---|---|
| **@ducanhgh/next-pwa** (maintained fork) | `shadowwalker/next-pwa` is archival (no Next 16 compat). For Next 16.3.4, **use `ducanhgh/next-pwa`** — drop-in replacement, actively maintained. Task says "next-pwa free" — both are free; pick maintained fork. |
| **Manual SW (Workbox-cli)** | `withPWA` wraps Workbox correctly and emits `sw.js` at build. Manual SW is error-prone for `fallback` + `runtimeCaching`. |
| **Capacitor / native wrapper** | Overkill for admin installable. PWA standalone suffices for phone install (UX-01 thumb zone, 44px). |

### Risks

- iOS Safari `beforeinstallprompt` never fires (Apple uses manual Share → Add to Home Screen). Must show instructional sheet on iOS detection.
- Service worker stale cache serves old price → mitigate `NetworkFirst` for `/api/admin/*` + `stale-while-revalidate` for catalog, not for admin.
- `next-pwa` with Next 16 App Router edge: ensure `instrumentation.ts` does not conflict with SW registration.

### Acceptance

- [ ] Android Chrome on `trino.com.ar/admin` shows "Instalar app" prompt; after install, `display: standalone` (no URL bar), icons 192/512 maskable, theme `#D95D39`.
- [ ] Offline: airplane mode → `/admin` still renders shell + cached last 20 orders + `/_offline` for uncached route; coming online `reloadOnOnline` syncs.
- [ ] Axe + Lighthouse PWA checklist: `manifest` valid, `service-worker` registered, `offline` fallback exists, Lighthouse PWA ≥90.
- [ ] No push infra in MVP — Realtime broadcast + audio .mp3 verified as live alert path.

### Status: **MVP — PWA installable + offline cache. Push = Next (when >1000 orders/day).**

---

## 7. Cross-Cutting Quotas Summary (500 SKUs + Massive Traffic)

| Capability | External service free quota | Trino at 500 SKUs (peak day) | Headroom | When to pay |
|---|---|---|---|---|
| DB + Storage | Supabase free 500 MB + 1 GiB | 200 MB + 750 MB images | 250 MB images | Pro $25 when >1 GiB — run STOR-02 GC |
| Realtime | 200 conn | Admin 5 + 50 public if subscribed | ok if admin-only Realtime | Upgrade Supabase Pro when >200 concurrent live |
| Emails | Resend 100/d | 20 transactional + 70 potential marketing | **tight** | Resend Pro $20 at >80/d sustained |
| Queue | QStash 500/d | 30/d cron+emails | 470 spare | Cloud QStash $10 at >500/d |
| Cron | pg_cron free + Vercel Cron 100/d | 4 pg_cron + 2 Vercel | ok | — |
| PWA | next-pwa free MIT | — | ∞ | — |
| TipTap | MIT free | — | ∞ | — |
| ISR | Vercel Hobby 100k invocations | ~1.4k/day sitemap + 500 ISR | ok | Pro $20 at >100k/mo |
| PostHog | 1M events/mo free | 50k pageviews → 50k | 950k spare | — |

> **Rule of thumb for Trino massivo:** If any free quota hits 80% for 3 consecutive days, open PR to upgrade tier **before** launch promo. Show `OBS-02` health dashboard counters for Resend/QStash/DB/Storage in `/admin/health`.

---

## 8. Final Checklist — Before Chaining PRs

- [ ] **Editors:** presigned URL flow verified, no file through Next, `body jsonb` + GIN, Collaboration deferred documented
- [ ] **SEO:** JSON-LD Product+Article+Review + hreflang x4 + sitemap 500 + OG + Lighthouse 90 (lhci green)
- [ ] **Calendars:** dnd-kit editorial + launches countdown + pg_cron daily, 44px sensors, optimistic rollback on 409
- [ ] **CRM:** entitlements (no if-plan), audit INSERT-only, Customer 360 single join, Resend 100/d cap + QStash 500/d math, health counters
- [ ] **Realtime:** admin Realtime + storefront polling, WebSocket fallback 30s, RLS 403 vs 200 tested, ERR-02 cleanup
- [ ] **PWA:** manifest dynamic if white-label else static, next-pwa (prefer @ducanhgh fork for Next16), offline `_offline`, install prompt Android+iOS sheet, no push in MVP (Realtime+aúdio)

---

## References

- Context7: TipTap `/ueberdosis/tiptap-docs` — Collaboration + image handling
- Context7: Supabase Realtime `/supabase/realtime` — Broadcast/Presence/Postgres Changes, `phx_join`
- Context7: next-pwa `/shadowwalker/next-pwa` — `withPWA({dest:'public', register:true, skipWaiting:true, fallbacks:{document:'/_offline'}})`
- `openspec/changes/archive/2026-09-04-ecommerce-high-end-constitution/tasks.md` — T-A08b/T-D02b/T-E04/T-H01/T-H02/T-D09b/T-D09c/T-C05b
- `DOCS/DOCS/marca.md` §2/§7 (Neo-Bauhaus pills 50px, lowercase) + `openspec/AGENT_RULES.md` 154r
- Vercel/Resend/Upstash/Supabase/PostHog free tiers (2026-09)
