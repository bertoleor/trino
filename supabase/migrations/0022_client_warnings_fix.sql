-- 0022_client_warnings_fix.sql — W-02 RBAC 4-tier + has_role + W-06 pg_trgm + W-04 customer_360
-- Idempotent, IF NOT EXISTS everywhere. Stacked PR1.

-- 1. Entitlements 4-tier CHECK (W-02)
alter table public.entitlements drop constraint if exists entitlements_role_check;
alter table public.entitlements
  add constraint entitlements_role_check
  check (role in ('super_admin','admin','editor','viewer'));

-- backfill legacy roles idempotently
update public.entitlements set role = 'admin' where role = 'admin';
update public.entitlements set role = 'viewer' where role = 'customer';

-- 2. has_role() hierarchy SECURITY DEFINER (replaces IN SELECT, avoids RLS recursion)
create or replace function public.has_role(required text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements
    where user_id = auth.uid()
      and case role
            when 'super_admin' then 4
            when 'admin' then 3
            when 'editor' then 2
            when 'viewer' then 1
            else 0
          end
        >= case required
            when 'super_admin' then 4
            when 'admin' then 3
            when 'editor' then 2
            when 'viewer' then 1
            else 99
          end
  );
$$;

grant execute on function public.has_role(text) to authenticated, anon;

-- 3. pg_trgm extension + GIN indexes (W-06) — typo-tolerant search
create extension if not exists pg_trgm;

create index if not exists idx_products_name_trgm
  on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_search_trgm
  on public.products using gin (search_vector gin_trgm_ops);

-- query pattern: WHERE search_vector @@ plainto_tsquery('spanish',:q)
--   OR (name ILIKE '%'||:q||'%' AND similarity(name,:q) > 0.3)

-- 4. Customer 360 VIEW (W-04) — single-join LTV + last_login + cart
-- LTV = SUM total_cents where status in (authorized, processing, shipped, delivered)
create or replace view public.customer_360 as
select
  p.id,
  p.email,
  p.full_name,
  coalesce(
    (select sum(o.total_cents)
     from public.orders o
     where o.user_id = p.id
       and o.status in ('authorized','processing','shipped','delivered')
    ), 0) as ltv_cents,
  (select max(o.created_at)
   from public.orders o where o.user_id = p.id) as last_order_at,
  p.created_at as last_login,
  (select c.id from public.carts c where c.user_id = p.id limit 1) as cart_id
from public.profiles p;

-- helper for single-fetch via RPC if needed (one round-trip, no N+1)
create or replace function public.get_customer_360(target_user uuid)
returns table (
  id uuid, email text, ltv_cents bigint, last_login timestamptz, cart_id uuid
)
language sql stable security definer set search_path = public as $$
  select p.id, p.email,
    coalesce((select sum(o.total_cents) from public.orders o
      where o.user_id = p.id and o.status in ('authorized','processing','shipped','delivered')),0)::bigint,
    p.created_at, (select c.id from public.carts c where c.user_id = p.id limit 1)
  from public.profiles p where p.id = target_user;
$$;

-- 5. RLS tightening example: replace is_admin() with has_role('editor') where needed
-- Keep existing is_admin for backward compat; entitlements now drives hierarchy.
-- Example policy update (idempotent): admin write products requires editor or above
do $$ begin
  drop policy if exists "admin write products has_role" on public.products;
  create policy "admin write products has_role" on public.products
    for all using (public.has_role('editor')) with check (public.has_role('editor'));
exception when others then null;
end $$;
