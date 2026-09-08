# admin-backoffice Specification

## Purpose
White-label backoffice as business OS: drill-down nav, optimistic bulk, RBAC, Customer 360. Trace: ADMIN-01..06, ECOM-05/06, CMS-01, PRIV-02..04, DEV-01/02, Plan backoffice 2026 full, Plan cuenta usuario 2026, marca.md palettes.

## Requirements

### Requirement: Zero Dead Buttons, Responsive Tables, and Rich Inputs
Every admin button MUST bind to a Server Action with ARCH-05 triple check (auth+ownership+Zod) — prohibited dead UI (ADMIN-01). Tables MUST transform to cards or `overflow-x-auto` with frozen Actions col on mobile (ADMIN-02, UX-07 4/8px spacing). Rich content MUST use TipTap (ADMIN-03) with presigned uploads; `global_settings`/`pages` MUST back all CMS/legal copy, never hardcoded (CMS-01).

#### Scenario: Dead button audit
- GIVEN admin clicks "Aprobar" on bank transfer order
- WHEN no handler wired
- THEN CI/Playwright smoke fails — zero dead buttons tolerated

#### Scenario: Table on 375px
- GIVEN admin views /admin/orders with 500 rows
- WHEN viewport 375px
- THEN rows render as cards or horizontally scrollable with Actions sticky

### Requirement: RBAC, Audit, and Customer 360
All `/admin/*` MUST verify role server-side on every request via middleware+Server Action: `super_admin | admin | editor(asistente) | viewer` per entitlements table (ADMIN-04, ECOM-07 — prohibited `if(plan==='Pro')`); client-only guard is forbidden. `audit_logs` append-only (INSERT-only RLS, DB-05) MUST record price/catalog/role changes with before/after JSONB. Customer profile MUST aggregate LTV (sum order totals), last login, active cart, purchase history, email/notification history via single join (ADMIN-06, DB-06). 2FA SHOULD be offered for super_admin.

#### Scenario: Editor cannot delete
- GIVEN editor hits `deleteProduct` Server Action
- WHEN RBAC check runs
- THEN 403 + security_logs entry + audit_logs denied attempt

#### Scenario: Customer 360 query
- GIVEN admin opens client X
- WHEN profile loads
- THEN one round-trip returns LTV, last login, active cart, orders, notifications — no N+1

### Requirement: White-Label Theming, Automations, and Entitlements
White-label branding MUST be CSS variables (`--bg-blanco #FFFFFF`, `--bg-crema #FDFBF7`, `--text-grafito #212529`, `--color-terracota #D95D39`, `--color-verde #2B4731`, `--color-mostaza #E6AF2E`, `--color-celeste #7A9E9F`) read from `global_settings/tenants` table injected at `:root` (Plan backoffice §1, marca.md). `manifest.json` MUST be dynamic Route Handler `/api/manifest?tenant=id`. Orders beyond `pending→…` MUST allow RMA/devolución per-category policy (marca.md §8.2) + stock re-entry (Plan backoffice §5.1). Marketing campaigns + coupons (uso único/múltiple, mínimo) MUST be async via QStash/pg_cron→Resend with conversion reporting (NOTIF-01, Plan backoffice §3.E). Export/CSV/bulk >100 rows MUST delegate to background worker with SSE progress (JOBS-02). Feature flags (e.g., `flags.new_checkout_active`) MUST provide <1s kill switch without redeploy (DEV-01). `generateMetadata` dynamic OpenGraph per product (DEV-02). Storefront Brand: pills `border-radius:50px`, lowercase via `text-transform`, neo-Bauhaus geometric shapes for hero/category blocks (marca.md §2/7).

#### Scenario: Rebrand without deploy
- GIVEN tenant switches `--color-terracota` to new hex in DB
- WHEN next session loads
- THEN header/CTA colors update without code change

#### Scenario: Bulk export 1k orders
- GIVEN admin exports 1k rows
- WHEN export requested
- THEN job queues to worker; admin sees SSE progress bar; result downloadable via Storage presigned URL
