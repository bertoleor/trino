-- ============================================================
-- 20261126000010_grants_exposure.sql — Data API Exposure Grants
-- Explicit GRANT SELECT on exposed tables to anon/authenticated.
-- Revoke on internal tables. Per Supabase breaking change:
-- new tables no longer auto-exposed to Data API.
-- ============================================================

-- ------------------------------------------------------------------
-- EXPOSED TABLES — public read via Data API (anon key)
-- ------------------------------------------------------------------
grant select on public.products to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.product_translations to anon, authenticated;

grant select on public.editorial_posts to anon, authenticated;
grant select on public.global_settings to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant select on public.entitlements to anon, authenticated;

grant select on public.reviews to anon, authenticated;

-- ------------------------------------------------------------------
-- AUTHENTICATED WRITE — via RLS policies
-- ------------------------------------------------------------------
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.wishlists to authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select, insert, update on public.carts to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select, insert on public.payments to authenticated;
grant select on public.order_events to authenticated;
grant select, insert on public.idempotency_keys to authenticated;

-- ------------------------------------------------------------------
-- SERVICE ROLE — full access for server-side operations
-- ------------------------------------------------------------------
grant all on public.audit_logs to service_role;
grant all on public.security_logs to service_role;
grant all on public.processed_events to service_role;
grant all on public.failed_webhooks_log to service_role;
grant all on public.idempotency_keys to service_role;

-- ------------------------------------------------------------------
-- INTERNAL TABLES — NOT exposed to Data API (no anon grant)
-- ------------------------------------------------------------------
-- entitlements: only select granted above (RLS filters)
-- carts, cart_items, orders, order_items, payments, order_events:
--   authenticated has write via RLS; anon has NO access
-- audit_logs, security_logs, processed_events, failed_webhooks_log:
--   admin/service_role only

-- Explicit revoke from anon on internal tables (defense in depth)
revoke all on public.carts from anon;
revoke all on public.cart_items from anon;
revoke all on public.orders from anon;
revoke all on public.order_items from anon;
revoke all on public.payments from anon;
revoke all on public.order_events from anon;
revoke all on public.audit_logs from anon;
revoke all on public.security_logs from anon;
revoke all on public.processed_events from anon;
revoke all on public.failed_webhooks_log from anon;
revoke all on public.idempotency_keys from anon;
revoke all on public.wishlists from anon;
revoke all on public.reviews from anon;  -- only select granted above

-- ------------------------------------------------------------------
-- FUNCTION GRANTS — RPCs callable by client
-- ------------------------------------------------------------------
grant execute on function public.has_role(text) to anon, authenticated, service_role;
grant execute on function public.add_to_cart_serializable(uuid, int, text) to anon, authenticated;
grant execute on function public.merge_cart_serializable(text, uuid) to authenticated;
grant execute on function public.increment_helpful(uuid) to authenticated;
grant execute on function public.check_order_transition(public.order_status, public.order_status) to authenticated, service_role;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- revoke execute on function public.check_order_transition(public.order_status, public.order_status) from authenticated, service_role;
-- revoke execute on function public.increment_helpful(uuid) from authenticated;
-- revoke execute on function public.merge_cart_serializable(text, uuid) from authenticated;
-- revoke execute on function public.add_to_cart_serializable(uuid, int, text) from anon, authenticated;
-- revoke execute on function public.has_role(text) from anon, authenticated, service_role;
-- grant all on public.wishlists to anon;  -- restore if needed
-- grant all on public.reviews to anon;
-- grant all on public.idempotency_keys from anon;
-- grant all on public.failed_webhooks_log from anon;
-- grant all on public.processed_events from anon;
-- grant all on public.security_logs from anon;
-- grant all on public.audit_logs from anon;
-- grant all on public.order_events from anon;
-- grant all on public.payments from anon;
-- grant all on public.order_items from anon;
-- grant all on public.orders from anon;
-- grant all on public.cart_items from anon;
-- grant all on public.carts from anon;
-- revoke all on public.idempotency_keys from service_role;
-- revoke all on public.failed_webhooks_log from service_role;
-- revoke all on public.processed_events from service_role;
-- revoke all on public.security_logs from service_role;
-- revoke all on public.audit_logs from service_role;
-- revoke select, insert on public.order_events from authenticated;
-- revoke select, insert on public.payments from authenticated;
-- revoke select, insert on public.order_items from authenticated;
-- revoke select, insert, update on public.orders from authenticated;
-- revoke select, insert, update, delete on public.cart_items from authenticated;
-- revoke select, insert, update on public.carts from authenticated;
-- revoke insert, update, delete on public.reviews from authenticated;
-- revoke insert, update, delete on public.wishlists from authenticated;
-- revoke insert, update on public.profiles from authenticated;
-- revoke select on public.reviews from anon, authenticated;
-- revoke select on public.global_settings from anon, authenticated;
-- revoke select on public.editorial_posts from anon, authenticated;
-- revoke select on public.product_translations from anon, authenticated;
-- revoke select on public.product_images from anon, authenticated;
-- revoke select on public.product_variants from anon, authenticated;
-- revoke select on public.products from anon, authenticated;
-- revoke select on public.entitlements from anon, authenticated;
-- revoke select on public.profiles from anon, authenticated;