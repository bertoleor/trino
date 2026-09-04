-- 0018_occ_serializable.sql T-L02 OCC L1 expected_updated_at -> 409 reload_required
alter table public.cultura_posts add column if not exists updated_at timestamptz not null default now();
create or replace function public.update_cultura_occ(p_id uuid, p_expected_updated_at timestamptz, p_title text)
returns jsonb language plpgsql as $$
declare v_count int;
begin
  update public.cultura_posts set title = coalesce(p_title, title), updated_at = now() where id = p_id and updated_at = p_expected_updated_at;
  get diagnostics v_count = row_count;
  if v_count = 0 then
    return jsonb_build_object('error','reload_required','code',409);
  end if;
  return jsonb_build_object('ok',true);
end; $$;
-- 409 reload_required documentation
