# payments Specification

## Purpose
Cost-zero PCI-compliant payments: MercadoPago wallet+cards (zero PAN) plus bank transfer with comprobante via presigned URL + email proof. Trace: PRIV-05, WEBHOOKS-01, SEC-01, RESILIENCIA-01, ECOM-04, DOC-01.

## Requirements

### Requirement: MercadoPago Zero-PAN Delegation
The system MUST delegate all card handling to MercadoPago Bricks/Checkout tokenization. The application MUST never store PAN/CVV; only `mp_payment_id`, last4, brand, token. `MERCADOPAGO_ACCESS_TOKEN` SHALL be SERVER-only (ENV-02) via `src/config/env.ts` Zod. Every checkout MUST validate price integrity server-side from DB (not client total). (Trace: PRIV-05, SEC-01, ECOM-04)

#### Scenario: Tokenized checkout
- GIVEN user submits card via MP Bricks
- WHEN preference created
- THEN backend sends `line_items` from DB prices (cents) and returns MP init_point; DB stores only token+last4

#### Scenario: Raw price tamper
- GIVEN client posts `total: 1`
- WHEN Server Action recomputes total from DB
- THEN request is rejected 422 with "price_mismatch"

### Requirement: Three-Layer Webhook
`POST /api/webhooks/mercadopago` MUST implement: (1) HMAC signature verification — only mismatch returns non-200 (401); (2) idempotency via `processed_events(event_id PK)`; (3) DLQ via `failed_webhooks_log` with try/catch returning 200 on business failure. Payload limit 1 MB. (Trace: WEBHOOKS-01, CORS-WH-01, RLIM-01)

#### Scenario: Duplicate delivery
- GIVEN MP retries same `event_id`
- WHEN second POST arrives
- THEN handler returns 200 without reprocessing entitlements/orders

#### Scenario: HMAC failure
- GIVEN signature header invalid
- WHEN webhook validates
- THEN responds 401; payload never reaches business logic

### Requirement: Bank Transfer with Comprobante Proof
The system MUST support `payment_method='bank_transfer'` creating order status `pending_verification`. Client MUST request presigned URL → upload comprobante directly to `bank_proofs/{order_id}/{uuid}.pdf|jpg` (STOR-01, PERF-06) → backend stores `storage_path` only. On upload, system MUST queue async email (Resend via QStash/pg_cron, RES-03) to store owner + buyer confirmation, both in recipient locale. Admin approve/reject MUST transition `pending_verification → authorized|rejected` with audit log and idempotency. Expired unpaid bank orders MUST auto-cancel via pg_cron after 72h.

#### Scenario: Comprobante upload flow
- GIVEN order `pending_verification`
- WHEN client PUTs file via presigned URL
- THEN Storage holds object; DB records path; emails queued async (not in request path, <200ms)

#### Scenario: Admin approves
- GIVEN order with proof uploaded
- WHEN admin calls approve Server Action (RBAC verified, ARCH-05)
- THEN state becomes `authorized`, stock already decremented via SERIALIZABLE holds, audit_logs entry with before/after JSONB
