# Delta for admin-backoffice — client-warnings-fix (W-02, W-04)

## MODIFIED Requirements

### Requirement: RBAC, Audit, and Customer 360
All `/admin/*` MUST verify role server-side on every request via `proxy.ts` + `has_role()` SECURITY DEFINER (no `IN SELECT`) against `entitlements` CHECK `role IN ('super_admin','admin','editor','viewer')` with hierarchy `super_admin>admin>editor>viewer` (W-02). Deny-default: 403 + `security_logs` + `audit_logs` denied entry. Editor MAY edit catalog; MUST NOT manage roles. Viewer SHALL be read-only. Customer 360 MUST aggregate LTV=`SUM orders.total_cents WHERE status IN (authorized..delivered)` + `last_login` + active `cart` + orders + notifications via single join <1s, no N+1 (W-04). 2FA SHOULD be offered for super_admin. (Previously: 2-tier admin|customer, no hierarchy, no `has_role()`, no single-join LTV guarantee)

#### Scenario: Editor cannot delete (is_admin vs editor bypass)
- GIVEN editor session calls `deleteProduct`
- WHEN `has_role('admin')` check runs
- THEN 403 + security_logs INSERT + audit_logs denied

#### Scenario: Editor edits catalog allowed
- GIVEN editor calls `updateProduct`
- WHEN RBAC evaluates `editor` ∈ catalog-write
- THEN 200 and audit_logs records before/after JSONB

#### Scenario: Viewer read-only hierarchy
- GIVEN viewer hits `/admin/products`
- WHEN proxy checks hierarchy `viewer < editor`
- THEN 403 and no mutation allowed

#### Scenario: Customer 360 single-join LTV
- GIVEN admin opens client X with 200 orders
- WHEN profile loads
- THEN one round-trip returns LTV + last_login + cart + orders + notifications p95<1s — no N+1

#### Scenario: Super-admin hierarchy
- GIVEN super_admin revokes editor role
- WHEN `has_role('super_admin')` verified
- THEN 200 + audit_logs before/after; editor token immediately invalid
