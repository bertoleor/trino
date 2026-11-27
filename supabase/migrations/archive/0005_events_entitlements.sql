-- 0005_events_entitlements.sql — T-B05 + WEBHOOKS-01 idempotency PK + DLQ + entitlements
create table if not exists public.processed_events (
  id text primary key,
  created_at timestamptz not null default now()
);
create table if not exists public.failed_webhooks_log (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  error text,
  created_at timestamptz not null default now()
);
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','customer')),
  granted_at timestamptz not null default now()
);
create index if not exists idx_processed_events_created on public.processed_events (created_at desc);
create index if not exists idx_failed_webhooks_created on public.failed_webhooks_log (created_at desc);
create index if not exists idx_entitlements_user on public.entitlements (user_id);
create unique index if not exists idx_entitlements_user_role on public.entitlements (user_id, role);
alter table public.processed_events enable row level security;
alter table public.failed_webhooks_log enable row level security;
alter table public.entitlements enable row level security;
drop policy if exists "processed_events_admin" on public.processed_events;
create policy "processed_events_admin" on public.processed_events for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "failed_webhooks_admin" on public.failed_webhooks_log;
create policy "failed_webhooks_admin" on public.failed_webhooks_log for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "entitlements_own_select" on public.entitlements;
create policy "entitlements_own_select" on public.entitlements for select using (auth.uid() = user_id or public.is_admin());
