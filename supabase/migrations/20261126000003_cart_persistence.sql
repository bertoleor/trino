-- ============================================================
-- 20261126000003_cart_persistence.sql — Cart & Anonymous Merge
-- carts (session_id + optional user_id), cart_items,
-- RPCs: add_to_cart_serializable, merge_cart_serializable
-- ============================================================

-- ------------------------------------------------------------------
-- 1) CARTS — one per session (anon) or user (authenticated)
-- ------------------------------------------------------------------
create table public.carts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  session_id   text,                                        -- anon session from httpOnly cookie
  share_token  uuid unique default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (
    (user_id is not null and session_id is null) or
    (user_id is null and session_id is not null)
  )
);

create index idx_carts_user on public.carts(user_id) where user_id is not null;
create index idx_carts_session on public.carts(session_id) where session_id is not null;

-- ------------------------------------------------------------------
-- 2) CART ITEMS — line items referencing product_variants
-- ------------------------------------------------------------------
create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  variant_id  uuid not null references public.product_variants(id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index idx_cart_items_cart on public.cart_items(cart_id);
create index idx_cart_items_variant on public.cart_items(variant_id);

-- ------------------------------------------------------------------
-- 3) RPC: add_to_cart_serializable
-- Adds qty to cart for a variant under SERIALIZABLE isolation.
-- Validates stock, creates cart if needed, merges same variant.
-- Called by anon (session_id) or authenticated (user_id inferred).
-- ------------------------------------------------------------------
create or replace function public.add_to_cart_serializable(
  p_variant_id uuid,
  p_qty        int,
  p_session_id text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id     uuid;
  v_user_id     uuid := auth.uid();
  v_stock       int;
  v_price_cents int;
  v_new_qty     int;
  v_result      json;
begin
  -- Resolve cart
  if v_user_id is not null then
    -- Authenticated user: get or create their cart
    select id into v_cart_id from public.carts where user_id = v_user_id;
    if v_cart_id is null then
      insert into public.carts (user_id) values (v_user_id) returning id into v_cart_id;
    end if;
  elsif p_session_id is not null then
    -- Anonymous: get or create session cart
    select id into v_cart_id from public.carts where session_id = p_session_id;
    if v_cart_id is null then
      insert into public.carts (session_id) values (p_session_id) returning id into v_cart_id;
    end if;
  else
    raise exception 'add_to_cart: no user_id and no session_id' using errcode = 'P0001';
  end if;

  -- Validate variant exists, active, has stock, get price
  select stock, price_cents into v_stock, v_price_cents
  from public.product_variants
  where id = p_variant_id and is_active = true
  for share; -- lightweight lock

  if not found then
    raise exception 'variant_not_found' using errcode = 'P0001';
  end if;

  if v_stock < p_qty then
    raise exception 'insufficient_stock' using errcode = 'P0001', hint = v_stock;
  end if;

  -- Upsert cart_item (merge same variant)
  insert into public.cart_items (cart_id, variant_id, quantity)
  values (v_cart_id, p_variant_id, p_qty)
  on conflict (cart_id, variant_id) do update
    set quantity = cart_items.quantity + excluded.quantity,
        updated_at = now()
    where cart_items.quantity + excluded.quantity <= v_stock
  returning cart_items.quantity into v_new_qty;

  if v_new_qty is null then
    -- Conflict update didn't run because stock would be exceeded
    select quantity into v_new_qty from public.cart_items
    where cart_id = v_cart_id and variant_id = p_variant_id;
    raise exception 'would_exceed_stock' using errcode = 'P0001', hint = v_new_qty;
  end if;

  v_result := json_build_object(
    'ok', true,
    'cart_id', v_cart_id,
    'variant_id', p_variant_id,
    'quantity', v_new_qty,
    'price_cents', v_price_cents
  );
  return v_result;
end;
$$;

grant execute on function public.add_to_cart_serializable(uuid, int, text) to anon, authenticated;

-- ------------------------------------------------------------------
-- 4) RPC: merge_cart_serializable
-- Merges anonymous cart (p_from_session) into user cart (p_user_id).
-- Sums quantities per variant, capped at stock.
-- Called on login.
-- ------------------------------------------------------------------
create or replace function public.merge_cart_serializable(
  p_from_session text,
  p_user_id      uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anon_cart_id  uuid;
  v_user_cart_id  uuid;
  v_merged        int := 0;
  v_skipped       int := 0;
  v_result        json;
  v_new_qty       int;
  r               record;
begin
  -- Source anon cart
  select id into v_anon_cart_id from public.carts where session_id = p_from_session;
  if v_anon_cart_id is null then
    return json_build_object('ok', true, 'merged', 0, 'skipped', 0, 'message', 'no_anon_cart');
  end if;

  -- Target user cart
  select id into v_user_cart_id from public.carts where user_id = p_user_id;
  if v_user_cart_id is null then
    insert into public.carts (user_id) values (p_user_id) returning id into v_user_cart_id;
  end if;

  -- Merge each item
  for r in
    select ci.variant_id, ci.quantity, pv.stock
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    where ci.cart_id = v_anon_cart_id
      and pv.is_active = true
  loop
    -- Upsert into user cart, capped at stock
    insert into public.cart_items (cart_id, variant_id, quantity)
    values (v_user_cart_id, r.variant_id, r.quantity)
    on conflict (cart_id, variant_id) do update
      set quantity = least(cart_items.quantity + excluded.quantity, r.stock),
          updated_at = now()
    returning cart_items.quantity into v_new_qty;

    if v_new_qty is not null then
      v_merged := v_merged + 1;
    else
      v_skipped := v_skipped + 1;
    end if;
  end loop;

  -- Delete anon cart after merge
  delete from public.carts where id = v_anon_cart_id;

  v_result := json_build_object(
    'ok', true,
    'merged', v_merged,
    'skipped', v_skipped,
    'user_cart_id', v_user_cart_id
  );
  return v_result;
end;
$$;

grant execute on function public.merge_cart_serializable(text, uuid) to authenticated;

-- ------------------------------------------------------------------
-- 5) UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------
create trigger trg_carts_updated
  before update on public.carts
  for each row execute procedure public.touch_updated_at();

create trigger trg_cart_items_updated
  before update on public.cart_items
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 6) RLS — CARTS
-- ------------------------------------------------------------------
alter table public.carts enable row level security;

-- Owner (user_id match) or session_id match (via JWT claim) or super_admin
create policy "carts_select_owner_or_session"
  on public.carts for select
  using (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    or public.has_role('super_admin')
  );

create policy "carts_insert_owner_or_session"
  on public.carts for insert
  with check (
    auth.uid() = user_id
    or (user_id is null and session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id')
  );

create policy "carts_update_owner_or_session"
  on public.carts for update
  using (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    or public.has_role('super_admin')
  )
  with check (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
  );

create policy "carts_admin_all"
  on public.carts for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 7) RLS — CART ITEMS (via cart ownership)
-- ------------------------------------------------------------------
alter table public.cart_items enable row level security;

create policy "cart_items_select_via_cart"
  on public.cart_items for select
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (
          c.user_id = auth.uid()
          or c.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
          or public.has_role('super_admin')
        )
    )
  );

create policy "cart_items_insert_via_cart"
  on public.cart_items for insert
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (
          c.user_id = auth.uid()
          or (c.user_id is null and c.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id')
        )
    )
  );

create policy "cart_items_update_via_cart"
  on public.cart_items for update
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (
          c.user_id = auth.uid()
          or c.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
          or public.has_role('super_admin')
        )
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (
          c.user_id = auth.uid()
          or c.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
        )
    )
  );

create policy "cart_items_delete_via_cart"
  on public.cart_items for delete
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and (
          c.user_id = auth.uid()
          or c.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
          or public.has_role('super_admin')
        )
    )
  );

create policy "cart_items_admin_all"
  on public.cart_items for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 8) GRANTS — expose to Data API (RLS enforces access)
-- ------------------------------------------------------------------
grant select, insert, update, delete on public.carts to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop policy if exists "cart_items_admin_all" on public.cart_items;
-- drop policy if exists "cart_items_delete_via_cart" on public.cart_items;
-- drop policy if exists "cart_items_update_via_cart" on public.cart_items;
-- drop policy if exists "cart_items_insert_via_cart" on public.cart_items;
-- drop policy if exists "cart_items_select_via_cart" on public.cart_items;
-- drop policy if exists "carts_admin_all" on public.carts;
-- drop policy if exists "carts_update_owner_or_session" on public.carts;
-- drop policy if exists "carts_insert_owner_or_session" on public.carts;
-- drop policy if exists "carts_select_owner_or_session" on public.carts;
-- alter table public.cart_items disable row level security;
-- alter table public.carts disable row level security;
-- drop trigger if exists trg_cart_items_updated on public.cart_items;
-- drop trigger if exists trg_carts_updated on public.carts;
-- revoke execute on function public.merge_cart_serializable(text, uuid) from authenticated;
-- revoke execute on function public.add_to_cart_serializable(uuid, int, text) from anon, authenticated;
-- drop function if exists public.merge_cart_serializable(text, uuid);
-- drop function if exists public.add_to_cart_serializable(uuid, int, text);
-- drop index if exists idx_cart_items_variant;
-- drop index if exists idx_cart_items_cart;
-- drop index if exists idx_carts_session;
-- drop index if exists idx_carts_user;
-- drop table if exists public.cart_items;
-- drop table if exists public.carts;