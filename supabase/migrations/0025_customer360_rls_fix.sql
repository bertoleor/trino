-- 0025_customer360_rls_fix.sql — fix P1 RLS bypass (t_45ae26d1, hallazgos kickoff t_63f54e2e)
--
-- Numeracion: el ticket de origen decia 0024, pero ese prefijo quedo tomado en prod
-- por 0024_review_image_storage (registry supabase_migrations, version=PK del prefijo,
-- adoptado via ORN-143). Duplicar el prefijo rompe 'supabase db push' (bug 0013).
--
-- VECTORES CERRADOS (sin cambiar el diseno de la view/RPC, alcance del ticket):
--   1. view customer_360 sin security_invoker -> corria como owner postgres y salteaba
--      RLS de profiles/orders/carts; ACL ALL a anon+authenticated + auto-updatable
--      => anon leia/modificaba perfiles con la anon key. Fix: security_invoker=true
--      (corre como invocador, RLS de tablas base aplica) + ACL minima (SELECT solo
--      a authenticated; anon sin ruta).
--   2. RPC get_customer_360 SECURITY DEFINER sin guard de ownership => fuga de
--      email/LTV/cart de cualquier uuid con la anon key. Fix: guard plpgsql
--      (self o admin) con errcode 42501; mismo select de 0022, mismo search_path.
--
-- Idempotente: alter + create or replace + revoke/grant. PG 17.6 soporta
-- security_invoker en views (desde 15).

-- 1) La view corre como INVOCADOR: RLS de profiles/orders/carts aplica.
--    (security_invoker es una reloption: va con SET (...), PG >= 15.)
alter view public.customer_360 set (security_invoker = true);

-- 2) ACL minima: anon pierde toda ruta; authenticated solo lectura (self-service
--    via RLS de profiles: "select own profile" auth.uid()=id or is_admin()).
revoke all on public.customer_360 from anon, authenticated;
grant select on public.customer_360 to authenticated;

-- 3) RPC con guard de ownership: language sql no soporta RAISE -> plpgsql.
--    Mismo select de 0022 (lineas 75-85); mantiene stable/security definer/search_path.
create or replace function public.get_customer_360(target_user uuid)
returns table (
  id uuid, email text, ltv_cents bigint, last_login timestamptz, cart_id uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from target_user and not public.is_admin() then
    raise exception 'forbidden: target_user must match caller' using errcode = '42501';
  end if;

  return query
  select p.id, p.email,
    coalesce((select sum(o.total_cents) from public.orders o
      where o.user_id = p.id and o.status in ('authorized','processing','shipped','delivered')),0)::bigint,
    p.created_at, (select c.id from public.carts c where c.user_id = p.id limit 1)
  from public.profiles p where p.id = target_user;
end;
$$;

-- Nota ACL de la funcion: get_customer_360 ya tiene execute para anon+authenticated
-- (heredado de 0022). El guard bloquea a anon en runtime: auth.uid() NULL != target
-- y is_admin()=false => RAISE 42501 siempre. anon conserva execute pero no puede
-- leer nada (fail-closed), igual que toda funcion Supabase con grant execute a anon.
-- (Verificado con probe vivo 2026-06-04: anon -> 42501; verificacion completa en
-- TRINO-C360-RLS-FIX-EVIDENCE.md del workspace t_45ae26d1.)

