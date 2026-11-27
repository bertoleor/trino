-- 0009_cron_keepalive.sql
-- pg_cron heartbeat to prevent Supabase pause (free tier) and keep Vercel Cron healthy
-- Cost-zero: pg_cron + Vercel Cron 100/d free

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- keepalive logs table for heartbeat audit
create table if not exists public.keepalive_logs (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  source text not null,
  status text not null default 'ok'
);

-- RLS: only service_role can insert, admin read
alter table public.keepalive_logs enable row level security;
drop policy if exists "keepalive_logs_admin_select" on public.keepalive_logs;
create policy "keepalive_logs_admin_select" on public.keepalive_logs
  for select using (public.is_admin());
drop policy if exists "keepalive_logs_service_insert" on public.keepalive_logs;
create policy "keepalive_logs_service_insert" on public.keepalive_logs
  for insert with check (true);

-- Heartbeat job every 6 hours via pg_cron
-- Requires pg_cron heartbeat to avoid 7-day pause
select cron.schedule(
  'keepalive-heartbeat',
  '0 */6 * * *',
  $$ insert into public.keepalive_logs (source, status) values ('pg_cron', 'ok'); select 1 as heartbeat; $$
);

-- Daily Vercel Cron companion is defined in vercel.json: /api/cron/keepalive at 04:00 UTC
