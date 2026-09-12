---
name: trino-payments
description: >
  Cost-zero PCI-compliant payments for trino.: MercadoPago zero-PAN delegation, three-layer webhook,
  and bank transfer with comprobante proof. Trigger: When implementing checkout, MercadoPago
  tokenization, payment webhooks, bank-transfer comprobante upload, or payment admin approve/reject.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. Payments

Trace: PRIV-05, WEBHOOKS-01, SEC-01, RESILIENCIA-01, ECOM-04, DOC-01, STOR-01, PERF-06, RES-03.

## MercadoPago Zero-PAN Delegation

- **Never store PAN/CVV.** Only `mp_payment_id`, `last4`, `brand`, `token`.
- All card handling delegated to MercadoPago Bricks/Checkout tokenization. The browser tokenizes;
  the app only receives the token.
- `MERCADOPAGO_ACCESS_TOKEN` is **SERVER-only** (ENV-02), via `src/config/env.ts` Zod. Never expose
  to client, never inline `process.env`.
- **Price integrity is enforced server-side from DB**, never from the client total.

### Scenario: tokenized checkout

1. User submits card via MP Bricks.
2. Preference created.
3. Backend sends `line_items` from **DB prices (cents)** and returns MP `init_point`.
4. DB stores only token + last4 (no card data).

### Scenario: raw price tamper

Client posts `total: 1` → Server Action recomputes total from DB → mismatch →
`422 "price_mismatch"`.

## Three-Layer Webhook `POST /api/webhooks/mercadopago`

1. **HMAC signature verification** — only a mismatch returns non-200 (`401`). Payload never reaches
   business logic on HMAC failure.
2. **Idempotency** via `processed_events(event_id PK)` — duplicate event_id → `200` with no
   reprocessing.
3. **DLQ** via `failed_webhooks_log` — business failure wrapped in try/catch returning **200** (so
   provider stops retrying and DLQ owns replay).

- Payload limit **1 MB**.

```ts
// Layer 2 idempotency guard
const existing = await db
  .from('processed_events')
  .select('event_id')
  .eq('event_id', body.id)
  .maybeSingle();
if (existing) return NextResponse.json({ ok: true }, { status: 200 }); // no reprocess
```

## Bank Transfer with Comprobante Proof

- `payment_method='bank_transfer'` → order status `pending_verification`.
- Flow:
  1. Client requests **presigned URL**.
  2. Client uploads comprobante directly to `bank_proofs/{order_id}/{uuid}.pdf|jpg` (STOR-01 /
     PERF-06).
  3. Backend stores only `storage_path` (never the file bytes in DB).
- On upload: queue async email (Resend via QStash/pg_cron, **RES-03**) to store owner + buyer
  confirmation, both in recipient locale. Emails must NOT block the request path (<200ms).
- Admin approve/reject → `pending_verification → authorized | rejected` with **audit log**
  (before/after JSONB) + idempotency.
- **Expired unpaid bank orders auto-cancel after 72h via pg_cron.**

## Admin Approve (RBAC)

Admin approve Server Action runs ARCH-05 triple check: auth + ownership/role + Zod. On approve,
stock was already decremented under SERIALIZABLE holds (see concurrency) → state becomes
`authorized`.

## Traps

- **HMAC mismatch must be 401, not 500** — distinguish auth failure from processing failure.
- **Business failures return 200** to the provider and land in DLQ; a 500 on business logic would
  lose the event.
- **Never return non-200 for duplicate event_id** — idempotency success is 200.
- **Comprobante upload is direct-to-Storage via presigned URL** — do not proxy the 8MB file through
  the Next.js server.
- **Server-side recompute of totals is mandatory** — trust no client `total`, `price`, or
  `line_items` values for the price check.
- Emails are queued (QStash), not awaited in the request path.
