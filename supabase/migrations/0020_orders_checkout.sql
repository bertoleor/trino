-- 0020_orders_checkout.sql checkout price_integrity storage_path idempotency DLQ
alter table public.orders add column if not exists storage_path text;
alter table public.orders add column if not exists idempotency_key text unique;
alter table public.orders add column if not exists total_cents int check (total_cents >=0);
alter table public.orders add column if not exists price_cents int;
alter table public.orders add column if not exists status_detail text;
-- ensure pending_verification enum
do $$ begin
  alter type order_status add value if not exists 'pending_verification';
exception when duplicate_object then null; end $$;
-- allow text check fallback
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending','pending_verification','authorized','processing','shipped','delivered','canceled','refunded','paid','cancelled'));
-- idempotency
create table if not exists public.idempotency_keys (key text primary key, created_at timestamptz default now());
-- DLQ already exists 0004 failed_webhooks_log
