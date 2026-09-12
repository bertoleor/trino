---
name: trino-ecom-engine
description: >
  The trino. commerce engine: anon cart + merge, order ENUM state machine, price integrity,
  abandoned carts, esoteric taxonomy, consent, fuzzy search. Trigger: When implementing cart,
  orders, catalog filters, abandoned-cart jobs, search, or catalog consent flows.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. Ecom Engine

Trace: ECOM-01..07, AUTH-02/03, DB-04/05, JOBS-01, PRIV-01, DB-07.

## Anonymous Cart and Merge (ECOM-01/02)

- Cart MUST persist in DB from the first add via `carts(session_id UUID, user_id FK nullable)` +
  `cart_items`. **`localStorage`-only cart is prohibited.**
- On login, anon cart MUST merge with the user cart, summing same SKU **capped at stock**; no
  duplication.
- Every cart mutation MUST be **optimistic update + rollback toast**, with **44px touch targets**
  (UX-01/03/04).

```ts
// Merge rule: same SKU contributes qty_anon + qty_user, min(sum, stock)
const mergedQty = Math.min(anonQty + userQty, maxStock);
```

### Scenarios to honor

- Guest adds 2×SKU-A, user already has 1× → merged 3× (or stock max), no dup.
- Stock=1, user adds 1, backend rejects 409 → UI reverts qty + shows error toast **in locale**.

## Order State Machine (ECOM-03)

Strict ENUM, server-validated transitions:
`draft → pending → pending_verification → authorized → processing → shipped → delivered → canceled → refunded`

- **No boolean flags** for state.
- Client-requested jump → `422 "invalid_transition"` (e.g. `pending → shipped`).

## Price Integrity (ECOM-04)

- Prices use `sale_price_cents + sale_start/sale_end UTC`; discount % computed at render
  `((base-sale)/base*100)`.
- Server recalculates totals from DB. Client-posted totals are rejected → see `trino-payments`.
- Footer disclaimer MUST appear on every internal receipt PDF (DOC-01).

## Abandoned Cart (ECOM-05, JOBS-01)

- Cart unmodified **>4h** with items and no order → identified by **pg_cron hourly** job →
  dispatched via **QStash→Resend** in **recipient locale**.
- Admin "Abandoned Carts" view MUST list them.

## Esoteric Taxonomy & Consent (ECOM-06/07, PRIV-01)

- Triple taxonomy filters MUST be **combinable**, one round-trip intersect, not separate menus.
- Tradition-linked products SHOULD include origin/context block + disclaimer where legally advisable
  (`marca.md §4`).
- Consent banner MUST gate analytics/marketing cookies with **granular categories** (PRIV-01).
- Search MUST support fuzzy/typo via **FTS + pg_trgm** (DB-07). See `trino-context` / performance
  search notes.

## Concurrency (cross-ref)

Stock decrement and cart merges run under concurrency rules in `specs/concurrency-inventory`
(SERIALIZABLE / FOR UPDATE). See workflow notes — do not re-implement double-sell protection ad hoc.

## Traps

- **Merge must be capped at stock**, not blindly summed.
- **Optimistic rollback must show locale toast** — hardcoded English strings fail both ecom-engine
  and `trino-i18n`.
- **State transitions must be server-validated**; a 422 contract on invalid jumps is mandatory, not
  optional.
- **Abandoned cart is >4h** — 4h not 24h. Recipient locale, not storefront locale.
