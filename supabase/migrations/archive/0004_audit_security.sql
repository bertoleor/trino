-- 0004_audit_security.sql — T-B04 audit_logs INSERT-only + security_logs 1yr retention
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('insert','update','delete')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.security_logs (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  user_id uuid references auth.users(id) on delete set null,
  ip text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
-- retention: 1yr (365 days) — purge via pg_cron job in later slice; comment docs intent
-- indexes
create index if not exists idx_audit_table_record on public.audit_logs (table_name, record_id);
create index if not exists idx_audit_created_at on public.audit_logs (created_at desc);
create index if not exists idx_security_event on public.security_logs (event);
create index if not exists idx_security_created_at on public.security_logs (created_at desc);
-- RLS INSERT-only: enable + allow insert, no UPDATE/DELETE policies by design
alter table public.audit_logs enable row level security;
alter table public.security_logs enable row level security;
drop policy if exists "audit_logs_insert" on public.audit_logs;
create policy "audit_logs_insert" on public.audit_logs for insert with check (true);
drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin" on public.audit_logs for select using (public.is_admin());
drop policy if exists "security_logs_insert" on public.security_logs;
create policy "security_logs_insert" on public.security_logs for insert with check (true);
drop policy if exists "security_logs_select_admin" on public.security_logs;
create policy "security_logs_select_admin" on public.security_logs for select using (public.is_admin());
