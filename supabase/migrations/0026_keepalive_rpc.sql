-- 0026_keepalive_rpc.sql — T-F03 (t_e160af44): el call site
-- src/lib/supabase/keepalive.ts llama supabase.rpc('keepalive_ping') (l.8)
-- y supabase.rpc('heartbeat_select_one') (l.23), pero NINGUNA migración
-- declaraba esas funciones y la DB desplegada (ref asbyqyxrpfggxjujfqte)
-- tampoco las tenía → PGRST202/42883 en runtime (hallazgo del inventario
-- T-F01, ticket F-03).
--
-- Decisiones:
--  1. Firma = contrato de la app (cero args ambas, t_e160af44):
--     heartbeat_select_one retorna int porque el call site chequea
--     `typeof data === 'number'` (keepalive.ts:24); keepalive_ping
--     retorna int (no void) para evitar el 204 de PostgREST — el call
--     site solo mira `error`, pero un 200 con body `1` es uniforme.
--  2. SECURITY INVOKER: funciones puras `select 1`, no tocan tablas —
--     RLS no aplica, DEFINER innecesario (y sería privilegio sin uso).
--     search_path pinned por convención del repo (0023/0025) aunque no
--     resuelven ningún identificador: costura defensiva uniforme.
--  3. Grants a los TRES roles INCLUIDO anon: el server client SSR usa la
--     anon key (server.ts:11) y un cron llega SIN sesión de usuario →
--     rol efectivo anon; revocar anon rompería el call site (42501).
--     Superficie cero: `select 1` no expone datos — menos que la policy
--     keepalive_logs insert-with-check-true que ya existe (0010).
--     PUBLIC revocado igual (regla del repo desde 0023).
--  4. Alcance: keepalive.ts hoy no tiene importers en src/ — el route
--     /api/cron/keepalive usa la tabla directa y pg_cron interno hace
--     insert directo (0010). Estos RPC son el contrato de la lib (tests
--     t-b08/t-s2 referencian el archivo); la protección anti-pausa NO
--     depende de ellos. No se cambian ni el route ni pg_cron acá.
--
-- Rollback (forward-only repo, sin down.sql — convención 0019/0023/0025):
--   drop function if exists public.keepalive_ping();
--   drop function if exists public.heartbeat_select_one();

create or replace function public.keepalive_ping()
returns int
language sql
security invoker
set search_path = public
as $$ select 1; $$;

create or replace function public.heartbeat_select_one()
returns int
language sql
security invoker
set search_path = public
as $$ select 1; $$;

revoke all on function public.keepalive_ping() from public;
revoke all on function public.heartbeat_select_one() from public;
grant execute on function public.keepalive_ping() to anon, authenticated, service_role;
grant execute on function public.heartbeat_select_one() to anon, authenticated, service_role;
