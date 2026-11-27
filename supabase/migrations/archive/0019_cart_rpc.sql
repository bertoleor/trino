-- 0019_cart_rpc.sql T-L02 L2 SERIALIZABLE FOR UPDATE stock decrement capped
create or replace function public.add_to_cart_serializable(p_product_id uuid, p_qty int, p_session_id text)
returns jsonb language plpgsql as $$
declare v_stock int; v_qty int;
begin
  perform set_config('transaction_isolation','serializable', true);
  -- BEGIN ISOLATION LEVEL SERIALIZABLE
  select stock into v_stock from public.products where id = p_product_id for update;
  if v_stock is null then return jsonb_build_object('error','not_found','code',404); end if;
  if v_stock < p_qty then return jsonb_build_object('error','Sin stock','code',409); end if;
  select coalesce(sum(quantity),0) into v_qty from public.cart_items where product_id = p_product_id and session_id = p_session_id for update;
  if v_qty + p_qty > v_stock then return jsonb_build_object('error','Sin stock','code',409); end if;
  insert into public.cart_items(product_id, quantity, session_id) values (p_product_id, p_qty, p_session_id)
    on conflict (session_id, product_id) do update set quantity = cart_items.quantity + p_qty;
  update public.products set stock = stock - p_qty where id = p_product_id;
  return jsonb_build_object('ok',true);
end; $$;
create or replace function public.merge_cart_serializable(p_from_session text, p_user_id uuid)
returns jsonb language plpgsql as $$
begin
  perform set_config('transaction_isolation','serializable', true);
  -- BEGIN ISOLATION LEVEL SERIALIZABLE SELECT FOR UPDATE
  update public.carts set user_id = p_user_id where session_id = p_from_session;
  update public.cart_items set session_id = null, user_id = p_user_id where session_id = p_from_session;
  return jsonb_build_object('ok',true);
end; $$;
-- SERIALIZABLE FOR UPDATE capped stock
