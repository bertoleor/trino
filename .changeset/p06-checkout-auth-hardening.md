---
'@santisima-trinidad/lockfile': patch
---

fix(checkout): require auth and bound client input on POST /api/checkout (audit P-06, CWE-284/CWE-20 / OWASP A01): dedicated 5/m rate-limit tier applied before any work, session required via supabase.auth.getUser() (401) — previously any anonymous caller could create orders, 32KB body cap (413), zod validation of line_items (≤25, uuid product_id, qty 1..99), total_cents, enum-restricted payment_provider, storage_path (≤512) and email (≤254) with 422 before any DB work, order status derived ONLY from the validated provider enum, and user_id now always set on the orders insert (NOT NULL column + RLS policy auth.uid() = user_id that the old insert violated on every request).
