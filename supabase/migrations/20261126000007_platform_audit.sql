-- ============================================================
-- 20261126000007_platform_audit.sql — Platform, Audit & Security
-- audit_logs, security_logs, processed_events, failed_webhooks_log,
-- idempotency_keys. Append-only, 1yr retention via pg_cron.
-- ============================================================

-- ------------------------------------------------------------------
-- 1) AUDIT LOGS — admin mutations before/after JSONB
-- ------------------------------------------------------------------
create table public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  table_name    text not null,
  record_id     uuid not null,
  action        text not null check (action in ('insert','update','delete')),
  old_data      jsonb,
  new_data      jsonb,
  user_id       uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index idx_audit_table_record on public.audit_logs(table_name, record_id);
create index idx_audit_user on public.audit_logs(user_id) where user_id is not null;
create index idx_audit_created on public.audit_logs(created_at desc);

-- ------------------------------------------------------------------
-- 2) SECURITY LOGS — auth/rate-limit/RLS denials
-- ------------------------------------------------------------------
create table public.security_logs (
  id            uuid primary key default gen_random_uuid(),
  event         text not null,                                 -- login_fail, rate_limit, rls_deny, turnstile_403, rbac_403, etc.
  user_id       uuid references auth.users(id) on delete set null,
  ip            inet,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index idx_security_event on public.security_logs(event);
create index idx_security_user on public.security_logs(user_id) where user_id is not null;
create index idx_security_created on public.security_logs(created_at desc);

-- ------------------------------------------------------------------
-- 3) PROCESSED EVENTS — idempotency for webhooks (PK = event_id)
-- ------------------------------------------------------------------
create table public.processed_events (
  id            text primary key,                              -- provider event ID
  created_at    timestamptz not null default now()
);

create index idx_processed_created on public.processed_events(created_at desc);

-- ------------------------------------------------------------------
-- 4) FAILED WEBHOOKS LOG — DLQ for business failures
-- ------------------------------------------------------------------
create table public.failed_webhooks_log (
  id            uuid primary key default gen_random_uuid(),
  payload       jsonb not null,
  error         text not null,
  provider      text not null,                                 -- mercadopago, paypal, stripe
  event_id      text,
  retry_count   integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_failed_provider_event on public.failed_webhooks_log(provider, event_id);
create index idx_failed_created on public.failed_webhooks_log(created_at desc);

-- ------------------------------------------------------------------
-- 5) IDEMPOTENCY KEYS — client-provided keys for safe mutations
-- ------------------------------------------------------------------
create table public.idempotency_keys (
  key           text primary key,
  created_at    timestamptz not null default now()
);

create index idx_idempotency_created on public.idempotency_keys(created_at desc);

-- ------------------------------------------------------------------
-- 6) RLS — AUDIT LOGS (admin only)
-- ------------------------------------------------------------------
alter table public.audit_logs enable row level security;

create policy "audit_logs_admin_all"
  on public.audit_logs for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- Service role can insert (via server client)
grant insert on public.audit_logs to service_role;

-- ------------------------------------------------------------------
-- 7) RLS — SECURITY LOGS (admin only)
-- ------------------------------------------------------------------
alter table public.security_logs enable row level security;

create policy "security_logs_admin_all"
  on public.security_logs for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- Service role can insert
grant insert on public.security_logs to service_role;

-- ------------------------------------------------------------------
-- 8) RLS — PROCESSED EVENTS (admin only)
-- ------------------------------------------------------------------
alter table public.processed_events enable row level security;

create policy "processed_events_admin_all"
  on public.processed_events for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- Service role can insert
grant insert on public.processed_events to service_role;

-- ------------------------------------------------------------------
-- 9) RLS — FAILED WEBHOOKS LOG (admin only)
-- ------------------------------------------------------------------
alter table public.failed_webhooks_log enable row level security;

create policy "failed_webhooks_admin_all"
  on public.failed_webhooks_log for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- Service role can insert
grant insert on public.failed_webhooks_log to service_role;

-- ------------------------------------------------------------------
-- 10) RLS — IDEMPOTENCY KEYS (admin only)
-- ------------------------------------------------------------------
alter table public.idempotency_keys enable row level security;

create policy "idempotency_keys_admin_all"
  on public.idempotency_keys for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- Authenticated can insert/check their own keys
grant insert, select on public.idempotency_keys to authenticated;

-- ------------------------------------------------------------------
-- 11) GRANTS — expose to Data API (admin tables not exposed to anon)
-- ------------------------------------------------------------------
grant select on public.audit_logs to authenticated;
grant select on public.security_logs to authenticated;
grant select on public.processed_events to authenticated;
grant select on public.failed_webhooks_log to authenticated;
grant select on public.idempotency_keys to authenticated;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop policy if exists "idempotency_keys_admin_all" on public.idempotency_keys;
-- drop policy if exists "failed_webhooks_admin_all" on public.failed_webhooks_log;
-- drop policy if exists "processed_events_admin_all" on public.processed_events;
-- drop policy if exists "security_logs_admin_all" on public.security_logs;
-- drop policy if exists "audit_logs_admin_all" on public.audit_logs;
-- alter table public.idempotency_keys disable row level security;
-- alter table public.failed_webhooks_log disable row level security;
-- alter table public.processed_events disable row level security;
-- alter table public.security_logs disable row level security;
-- alter table public.audit_logs disable row level security;
-- drop index if exists idx_idempotency_created;
-- drop index if exists idx_failed_created;
-- drop index if exists idx_failed_provider_event;
-- drop index if exists idx_processed_created;
-- drop index if exists idx_security_created;
-- drop index if exists idx_security_user;
-- drop index if exists idx_security_event;
-- drop index if exists idx_audit_created;
-- drop index if exists idx_audit_user;
-- drop index if exists idx_audit_table_record;
-- drop table if exists public.idempotency_keys;
-- drop table if exists public.failed_webhooks_log;
-- drop table if exists public.processed_events;
-- drop table if exists public.security_logs;
-- drop table if exists public.audit_logs;