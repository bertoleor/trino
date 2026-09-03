-- 0010_keepalive.sql — pause7d fix: SELECT 1 heartbeat pg_cron 6h + keepalive_logs
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create table if not exists public.keepalive_logs (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  source text not null,
  status text not null default 'ok'
);
alter table public.keepalive_logs enable row level security;
drop policy if exists "keepalive_logs_admin_select" on public.keepalive_logs;
create policy "keepalive_logs_admin_select" on public.keepalive_logs for select using (public.is_admin());
drop policy if exists "keepalive_logs_service_insert" on public.keepalive_logs;
create policy "keepalive_logs_service_insert" on public.keepalive_logs for insert with check (true);
create index if not exists idx_keepalive_checked_at on public.keepalive_logs (checked_at desc);
do $$ begin perform cron.unschedule('keepalive-heartbeat'); exception when others then null; end $$;
select cron.schedule('keepalive-heartbeat', '0 */6 * * *', $$ insert into public.keepalive_logs (source, status) values ('pg_cron', 'ok'); select 1 as heartbeat; $$);
-- Vercel Cron companion: GET /api/cron/keepalive at 04:00 UTC (vercel.json)
-- UptimeRobot 5min fallback: external ping to /api/cron/keepalive
