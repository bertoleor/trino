-- 0007_order_enum.sql — T-B07 ENUM 9 states draft..refunded + transition 422
do $$ begin alter table public.orders drop constraint if exists orders_status_check; exception when others then null; end $$;
do $$ begin alter table public.orders drop constraint if exists orders_status_check9; exception when others then null; end $$;
alter table public.orders add constraint orders_status_check9 check (
  status in ('draft','pending','pending_verification','authorized','processing','shipped','delivered','canceled','refunded')
) not valid;
-- backfill legacy 'paid' -> 'authorized', 'cancelled' -> 'canceled' if exists
update public.orders set status = 'authorized' where status = 'paid';
update public.orders set status = 'canceled' where status = 'cancelled';
-- transition guard 422
create or replace function public.check_order_transition(old_status text, new_status text)
returns boolean language plpgsql as $$
declare allowed boolean := false;
begin
  if old_status = new_status then return true; end if;
  allowed := (old_status, new_status) in (
    ('draft','pending'),('draft','canceled'),
    ('pending','pending_verification'),('pending','authorized'),('pending','canceled'),
    ('pending_verification','authorized'),('pending_verification','canceled'),
    ('authorized','processing'),('authorized','canceled'),('authorized','refunded'),
    ('processing','shipped'),('processing','canceled'),
    ('shipped','delivered'),('shipped','refunded'),
    ('delivered','refunded')
  );
  if not allowed then raise exception 'invalid_transition: % -> %', old_status, new_status using errcode = 'P0001', hint = '422'; end if;
  return true;
end; $$;
create or replace function public.enforce_order_transition() returns trigger language plpgsql as $$
begin perform public.check_order_transition(old.status, new.status); return new; end; $$;
drop trigger if exists trg_orders_status_check on public.orders;
create trigger trg_orders_status_check before update of status on public.orders for each row execute function public.enforce_order_transition();
