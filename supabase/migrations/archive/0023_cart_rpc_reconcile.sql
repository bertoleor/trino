-- 0023_cart_rpc_reconcile.sql — T-F01 (t_d340fda1): reconciliar los RPC de
-- carrito con la firma que la app usa y con el esquema REAL de la DB.
--
-- Contexto (verificado contra prod ref asbyqyxrpfggxjujfqte 2026-09-29):
--  * add_to_cart_serializable desplegado matcheaba 0019: (p_product_id uuid,
--    p_qty int, p_session_id text) — pero cart.ts llama con
--    {p_variant_id, p_qty, p_user_id, p_session_id} → PGRST202/42883.
--  * Además el CUERPO 0019 referenciaba columnas inexistentes: cart_items no
--    tiene product_id (es variant_id desde 0001) y el stock vive en
--    product_variants, no en products → aunque la firma coincidiera, el RPC
--    reventaba con 42703 en la primera sentencia.
--  * Bugs heredados de 0019 que acá se corrigen en vez de replicar:
--      - ON CONFLICT (session_id, product_id): sin unique que lo respalde y
--        sobre una columna inexistente.
--      - select sum(...) FOR UPDATE: 42803 (FOR UPDATE prohibido con
--        aggregates). La serialización real es el lock FOR UPDATE de la row
--        del variant: todo add para el mismo variant se serializa ahí.
--      - set_config('transaction_isolation') mid-RPC: 25001 (el RPC ya corre
--        dentro de la transacción de PostgREST).
--
-- Decisiones:
--  1. Firma = contrato de la app (S-06: p_user_id SIEMPRE presente, la
--     identidad anónima jamás es client-supplied; el SQL era el lado stale).
--  2. SECURITY DEFINER + autoridad JWT-derived: si p_user_id viene, debe
--     matchear auth.uid() del caller — un cliente jamás elige el uid.
--  3. Uniques parciales alineadas al upsert: (user_id, variant_id) para
--     autenticados y (session_id, variant_id) para anónimos — sin esto el
--     ON CONFLICT anónimo no tenía arbiter (NULLs nunca colisionan).
--  4. merge absorbe cantidades en las rows existentes del usuario ANTES de
--     reasignar, para no violar la unique con duplicados post-merge.
--  5. Tablas vacías (0 rows verificado en prod) → tocar constraints es seguro.

-- ------------------------------------------------------------------
-- 1) Uniques alineadas al upsert del carrito (tabla vacía: 0 rows)
-- ------------------------------------------------------------------
alter table public.cart_items
  drop constraint if exists cart_items_user_id_variant_id_key;
create unique index if not exists cart_items_user_variant_uq
  on public.cart_items (user_id, variant_id)
  where user_id is not null;
create unique index if not exists cart_items_session_variant_uq
  on public.cart_items (session_id, variant_id)
  where session_id is not null;

-- ------------------------------------------------------------------
-- 2) add_to_cart_serializable — firma del contrato de la app
-- ------------------------------------------------------------------
-- 42P13: CREATE OR REPLACE no puede renombrar params (p_product_id→
-- p_variant_id) ni agregar p_user_id → drop explícito de la firma vieja.
drop function if exists public.add_to_cart_serializable(uuid, int, text);
create or replace function public.add_to_cart_serializable(
  p_variant_id uuid,
  p_qty int,
  p_user_id uuid,
  p_session_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock int;
  v_qty int;
  v_owner uuid := null;
begin
  -- Autoridad JWT-derived: solo aceptamos p_user_id si matchea el JWT.
  if p_user_id is not null then
    if auth.uid() is distinct from p_user_id then
      return jsonb_build_object('error', 'forbidden', 'code', 403);
    end if;
    v_owner := p_user_id;
  end if;

  if p_qty is null or p_qty <= 0 then
    return jsonb_build_object('error', 'invalid_qty', 'code', 422);
  end if;
  if v_owner is null and (p_session_id is null or length(trim(p_session_id)) = 0) then
    return jsonb_build_object('error', 'session required', 'code', 401);
  end if;

  -- Lock de la row del variant: serializa TODOS los adds del mismo variant
  -- (stock check + carrito + insert atómicos per-variant). No hace falta
  -- FOR UPDATE en el aggregate: 42803 y además sería redundante con este lock.
  select stock into v_stock
    from public.product_variants
    where id = p_variant_id and is_active
    for update;
  if v_stock is null then
    return jsonb_build_object('error', 'not_found', 'code', 404);
  end if;

  -- Total ya en carrito para este owner (autenticado o anónimo por sesión).
  -- El stock YA está decrementado por lo que está en el carrito (el propio
  -- RPC descuenta al insertar): disponible = stock_actual + lo ya reservado
  -- por ESTE owner. Sin re-sumar, el segundo add del mismo variant siempre
  -- revienta con 409 aunque haya stock físico.
  select coalesce(sum(quantity), 0) into v_qty
    from public.cart_items
    where variant_id = p_variant_id
      and ( (v_owner is not null and user_id = v_owner)
         or (v_owner is null and session_id = p_session_id) );
  if v_qty + p_qty > v_stock + v_qty then
    -- equivalente a p_qty > v_stock, pero deja explícito el modelo de reserva
    return jsonb_build_object('error', 'Sin stock', 'code', 409);
  end if;

  if v_owner is not null then
    insert into public.cart_items (user_id, variant_id, quantity, session_id)
    values (v_owner, p_variant_id, p_qty, null)
    on conflict (user_id, variant_id) where user_id is not null
    do update set quantity = cart_items.quantity + p_qty, updated_at = now();
  else
    insert into public.cart_items (user_id, variant_id, quantity, session_id)
    values (null, p_variant_id, p_qty, p_session_id)
    on conflict (session_id, variant_id) where session_id is not null
    do update set quantity = cart_items.quantity + p_qty, updated_at = now();
  end if;

  update public.product_variants
    set stock = stock - p_qty
    where id = p_variant_id;

  return jsonb_build_object('ok', true);
end;
$$;

-- ------------------------------------------------------------------
-- 3) merge_cart_serializable — firma del contrato de la app
-- ------------------------------------------------------------------
-- p_session_id = sesión anónima origen (cookie httpOnly del caller).
-- p_user_id = uid autenticado destino; debe matchear el JWT del caller.
-- Absorbe primero las cantidades en rows existentes del usuario (evita
-- chocar la unique user_variant) y reasigna solo las que no existen.
-- 42P13: mismo caso — el param cambia de p_from_session a p_session_id.
drop function if exists public.merge_cart_serializable(text, uuid);
create or replace function public.merge_cart_serializable(
  p_session_id text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return jsonb_build_object('error', 'auth required', 'code', 401);
  end if;
  if auth.uid() is distinct from p_user_id then
    return jsonb_build_object('error', 'forbidden', 'code', 403);
  end if;
  if p_session_id is null or length(trim(p_session_id)) = 0 then
    return jsonb_build_object('ok', true); -- nada que mergear
  end if;

  -- 3a) Variantes que el usuario YA tiene: sumar la cantidad anónima.
  update public.cart_items ci
    set quantity = ci.quantity + anon.qty, updated_at = now()
    from (
      select variant_id, sum(quantity) as qty
      from public.cart_items
      where session_id = p_session_id and user_id is null
      group by variant_id
    ) anon
    where ci.user_id = p_user_id and ci.variant_id = anon.variant_id;

  -- 3b) Borrar las anónimas absorbidas en 3a.
  delete from public.cart_items ci
    where ci.session_id = p_session_id and ci.user_id is null
      and exists (
        select 1 from public.cart_items u
        where u.user_id = p_user_id and u.variant_id = ci.variant_id
      );

  -- 3c) Reasignar las que quedan (variantes nuevas para el usuario).
  update public.cart_items
    set user_id = p_user_id, session_id = null, updated_at = now()
    where session_id = p_session_id and user_id is null;

  update public.carts
    set user_id = p_user_id
    where session_id = p_session_id and user_id is null;

  return jsonb_build_object('ok', true);
end;
$$;

-- ------------------------------------------------------------------
-- 4) Grants explícitos (los RPC son SECURITY DEFINER)
-- ------------------------------------------------------------------
revoke all on function public.add_to_cart_serializable(uuid, int, uuid, text) from public;
revoke all on function public.merge_cart_serializable(text, uuid) from public;
grant execute on function public.add_to_cart_serializable(uuid, int, uuid, text) to authenticated, anon;
grant execute on function public.merge_cart_serializable(text, uuid) to authenticated, anon;
