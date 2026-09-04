-- 0008_cron.sql - T-D06 abandoned cart >4h hourly QStash Resend + T-D07 72h bank cancel
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- abandoned cart: carts older than 4h not converted to order, QStash Resend via /api/cron/abandoned-cart
create table if not exists public.abandoned_cart_logs (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid,
  session_id text,
  checked_at timestamptz not null default now(),
  status text not null default 'pending'
);
alter table public.abandoned_cart_logs enable row level security;
drop policy if exists "abandoned_logs_admin" on public.abandoned_cart_logs;
create policy "abandoned_logs_admin" on public.abandoned_cart_logs for all using (public.is_admin()) with check (public.is_admin());

do $$ begin perform cron.unschedule('abandoned-cart-hourly'); exception when others then null; end $$;
select cron.schedule('abandoned-cart-hourly', '0 * * * *', $$
  insert into public.abandoned_cart_logs (status) values ('checked');
  select net.http_post(url:='http://localhost/api/cron/abandoned-cart', headers:='{"Content-Type":"application/json","Authorization":"Bearer '||coalesce(current_setting('app.cron_secret', true),'')||'"}'::jsonb) from (select 1) s;
$$);

-- T-D07: 72h pending_verification auto-cancel idempotent
do $$ begin perform cron.unschedule('bank-pending-72h-cancel'); exception when others then null; end $$;
select cron.schedule('bank-pending-72h-cancel', '0 * * * *', $$
  update public.orders set status='canceled' where status='pending_verification' and created_at < now() - interval '72 hours';
$$);
