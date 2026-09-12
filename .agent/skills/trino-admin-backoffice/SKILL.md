---
name: trino-admin-backoffice
description: >
  White-label backoffice for trino.: zero dead buttons, RBAC four-tier, audit log, Customer 360 LTV,
  responsive tables, white-label theming. Trigger: When implementing /admin routes, admin Server
  Actions, RBAC, audit_logs, customer 360, bulk exports, or tenant theming.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# trino. Admin Backoffice

Trace: ADMIN-01..06, ECOM-05/06, CMS-01, PRIV-02..04, DEV-01/02, W-02, W-04.

## Zero Dead Buttons (ADMIN-01)

Every admin button MUST bind to a Server Action with **ARCH-05 triple check: auth + ownership +
Zod**. Prohibited dead UI — a "Aprobar" button with no wired handler fails the CI/Playwright smoke.

```ts
// Correct Server Action shape
export async function approveBankTransfer(orderId: string) {
  const session = await auth(); // 1. auth
  await requireRole(['admin', 'super_admin']); // 2. ownership/role (has_role)
  const parsed = approveSchema.parse({ orderId }); // 3. Zod
  // ...idempotent transition + audit_logs
}
```

## RBAC (W-02) — deny-default

- All `/admin/*` verify role **server-side on every request** via `proxy.ts` + `has_role()`
  `SECURITY DEFINER` (**no `IN SELECT`**).
- `entitlements` CHECK `role IN ('super_admin','admin','editor','viewer')`, hierarchy
  `super_admin > admin > editor > viewer`.
- Deny → **403** + `security_logs` + `audit_logs` denied entry
  (`{before:null, after:{denied:true}}`).
- **Editor** MAY edit catalog; MUST NOT manage roles.
- **Viewer** SHALL be read-only.
- **2FA SHOULD offered for super_admin.**

### Role scenarios

- Editor calls `deleteProduct` → `has_role('admin')` fails → 403 + both logs.
- Editor calls `updateProduct` → allowed (`editor` ∈ catalog-write) → audit `before/after` JSONB.
- Viewer hits `/admin/products` → 403 (viewer < editor), no mutation.
- `super_admin` revokes editor → audit before/after, editor token **immediately invalid**.

## Audit Logging

Every denied and approved admin mutation writes `audit_logs` with **before/after JSONB**. RBAC
denials additionally write `security_logs`. See `trino-security` for the insert-hardening rule
(service-role server client, never anon-rest).

## Customer 360 (W-04)

Aggregate LTV = `SUM orders.total_cents WHERE status IN (authorized, ...delivered)` + `last_login` +
active `cart` + orders + notifications via a **single join round-trip <1s** — **no N+1**.

- Emit `route:/admin/customers/[id] duration` metric; alert if **p95 > 1s**.

## Responsive Tables (ADMIN-02)

Tables MUST transform to **cards** or `overflow-x-auto` with a **frozen Actions column** on mobile
(375px, e.g. 500 rows). Touch spacing 4/8px (UX-07).

## Rich Content (ADMIN-03, CMS-01)

Rich content uses **TipTap** with presigned uploads. `global_settings` / `pages` MUST back all
CMS/legal copy — never hardcoded.

## White-Label Theming (`marca.md` / Plan backoffice §1)

- Brand colors as **CSS variables** read from `global_settings/tenants`, injected at `:root`:
  `--bg-blanco #FFFFFF`, `--bg-crema #FDFBF7`, `--text-grafito #212529`,
  `--color-terracota #D95D39`, `--color-verde #2B4731`, `--color-mostaza #E6AF2E`,
  `--color-celeste #7A9E9F`.
- Tenant switches a hex in DB → next session loads re-theme, **no code change**.
- `manifest.json` dynamic via `GET /api/manifest?tenant=id`.

## Bulk Export / Jobs (>100 rows)

- Bulk/CSV/export >100 rows MUST delegate to a background worker with **SSE progress** (JOBS-02).
- Result downloadable via **Storage presigned URL**. (Also see shipping batch labels SSE in
  `ecom-engine`/carriers notes.)

## RMA + Stock Re-entry

Orders beyond `pending→…` MUST allow **RMA/devolución per-category policy** (`marca.md §8.2`) with
**stock re-entry** (Plan §5.1).

## Coupons / Campaigns

Marketing campaigns + coupons (uso único/múltiple, mínimo) run **async** via QStash/pg_cron→Resend
with conversion reporting.

## Feature Flags (DEV-01)

`flags.new_checkout_active` provides a **<1s kill switch without redeploy**. See
`trino-feature-flags`.

## GenerateMetadata (DEV-02)

Dynamic OpenGraph per product/entity via `generateMetadata`.

## Traps

- **Never `IN SELECT` for role checks** — always `SECURITY DEFINER has_role()`.
- **Customer 360 must be a single join**, not N+1 loop queries (enforced by `concurrency-inventory`
  pagination rules).
- **Deny-default**: any mutation missing the role check must 403 + audit, never pass silently.
- **Zero dead buttons** is a hard CI/Playwright smoke gate — wire every handler.
