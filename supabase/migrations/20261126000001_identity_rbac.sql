-- ============================================================
-- 20261126000001_identity_rbac.sql — Identity & RBAC
-- profiles (1:1 auth.users), entitlements (4-tier roles),
-- has_role() SECURITY DEFINER helper for RLS.
-- ============================================================

-- ------------------------------------------------------------------
-- 1) PROFILES
-- ------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 2) ENTITLEMENTS (RBAC)
-- ------------------------------------------------------------------
create table public.entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('super_admin','admin','editor','viewer')),
  granted_at  timestamptz not null default now(),
  unique (user_id, role)
);

create index idx_entitlements_user on public.entitlements(user_id);

-- ------------------------------------------------------------------
-- 3) SECURITY DEFINER HELPER: has_role(target_role)
-- Returns true iff the caller has at least target_role.
-- Hierarchy: super_admin > admin > editor > viewer
-- Used in RLS policies instead of IN SELECT (avoids recursion).
-- ------------------------------------------------------------------
create or replace function public.has_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = auth.uid()
      and (
        (e.role = 'super_admin' and target_role in ('super_admin','admin','editor','viewer')) or
        (e.role = 'admin'       and target_role in ('admin','editor','viewer')) or
        (e.role = 'editor'      and target_role in ('editor','viewer')) or
        (e.role = 'viewer'      and target_role = 'viewer')
      )
  );
$$;

grant execute on function public.has_role(text) to anon, authenticated, service_role;

-- ------------------------------------------------------------------
-- 4) UPDATED_AT TRIGGER
-- ------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

create trigger trg_entitlements_updated
  before update on public.entitlements
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 5) RLS — PROFILES
-- ------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Owner or super_admin can read
create policy "profiles_select_owner_or_super"
  on public.profiles for select
  using (auth.uid() = id or public.has_role('super_admin'));

-- Owner can update own profile
create policy "profiles_update_owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Owner can insert own profile (trigger does it, but allow for completeness)
create policy "profiles_insert_owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------------
-- 6) RLS — ENTITLEMENTS
-- ------------------------------------------------------------------
alter table public.entitlements enable row level security;

-- User can read own entitlements; super_admin reads all
create policy "entitlements_select_owner_or_super"
  on public.entitlements for select
  using (auth.uid() = user_id or public.has_role('super_admin'));

-- Only super_admin can mutate roles
create policy "entitlements_mutate_super"
  on public.entitlements for all
  using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

-- ------------------------------------------------------------------
-- 7) GRANTS — expose to Data API (anon/authenticated)
-- ------------------------------------------------------------------
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.entitlements to anon, authenticated;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop trigger if exists trg_entitlements_updated on public.entitlements;
-- drop trigger if exists trg_profiles_updated on public.profiles;
-- drop function if exists public.touch_updated_at();
-- drop policy if exists "entitlements_mutate_super" on public.entitlements;
-- drop policy if exists "entitlements_select_owner_or_super" on public.entitlements;
-- drop policy if exists "profiles_insert_owner" on public.profiles;
-- drop policy if exists "profiles_update_owner" on public.profiles;
-- drop policy if exists "profiles_select_owner_or_super" on public.profiles;
-- alter table public.entitlements disable row level security;
-- alter table public.profiles disable row level security;
-- revoke execute on function public.has_role(text) from anon, authenticated, service_role;
-- drop function if exists public.has_role(text);
-- drop index if exists idx_entitlements_user;
-- drop table if exists public.entitlements;
-- drop table if exists public.profiles;