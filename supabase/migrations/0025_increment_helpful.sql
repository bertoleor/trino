-- 0025_increment_helpful.sql — T-F02 (t_74844aea): el call site
-- src/lib/actions/reviews.ts:108 llama supabase.rpc('increment_helpful',
-- { p_review_id }) desde toggleHelpful, pero NINGUNA migración declaraba
-- la función y la DB desplegada (ref asbyqyxrpfggxjujfqte) tampoco la
-- tenía → PGRST202/42883 en runtime (hallazgo del inventario T-F01).
--
-- Decisiones:
--  1. Firma = contrato de la app: (p_review_id uuid) — es el SQL el que
--     faltaba, no la app la que estaba mal (guard t-f01 exige este set).
--  2. SECURITY DEFINER: RLS de reviews solo da update a is_admin()
--     (policy reviews_admin_moderate) — sin DEFINER ningún usuario podría
--     tocar helpful. Convención de 0023: search_path pinned, grants
--     explícitos, sin PUBLIC.
--  3. Autoridad JWT-derived (S-06): no hay identidad como argumento;
--     el voto pertenece a auth.uid() del caller. Anónimo → 401.
--  4. No auto-voto: user_id is distinct from auth.uid() — un autor jamás
--     infla su propio review (pedido explícito del ticket).
--  5. Solo reviews approved son votables: es lo único que RLS deja ver a
--     un usuario no-admin (policy reviews_anon_select_approved) — votar
--     una pending/rejected que el caller ni ve sería un oracle de status.
--  6. Dedupe cross-sesión (tabla review_helpful_votes): fuera de scope de
--     este ticket — el call site ya acota con rate-limit Upstash 60/m por
--     usuario (reviews.ts:106, tier 'public'). Documentado, no replicado.
--
-- Rollback (forward-only repo, sin down.sql — convención de 0019/0023):
--   drop function if exists public.increment_helpful(uuid);
--   (la columna reviews.helpful queda como estaba: default 0, check >= 0)

create or replace function public.increment_helpful(
  p_review_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_helpful int;
begin
  if p_review_id is null then
    return jsonb_build_object('error', 'review_id required', 'code', 422);
  end if;
  if auth.uid() is null then
    return jsonb_build_object('error', 'auth required', 'code', 401);
  end if;

  -- Atómico per-row (UPDATE no necesita lock explícito para +1).
  -- returning captura 0 rows como null → not_found / own review / no visible.
  update public.reviews
    set helpful = helpful + 1
    where id = p_review_id
      and status = 'approved'
      and user_id is distinct from auth.uid()
    returning helpful into v_helpful;

  if v_helpful is null then
    return jsonb_build_object('error', 'not_found', 'code', 404);
  end if;

  return jsonb_build_object('ok', true, 'helpful', v_helpful);
end;
$$;

-- Grants explícitos (SECURITY DEFINER): solo usuarios autenticados votan
-- — toggleHelpful exige sesión (reviews.ts:105); anon no tiene la función.
-- OJO: los default privileges de Supabase grantean EXECUTE a
-- anon/authenticated/service_role sobre funciones NUEVAS en public, por eso
-- el revoke explícito de anon — sin él, la DB queda con anon=X aunque este
-- archivo nunca se lo dio (drift archivo↔DB, la clase de bug de este ticket).
revoke all on function public.increment_helpful(uuid) from public;
grant execute on function public.increment_helpful(uuid) to authenticated;
revoke execute on function public.increment_helpful(uuid) from anon;
