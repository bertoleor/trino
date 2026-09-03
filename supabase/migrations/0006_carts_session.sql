-- 0006_carts_session.sql — T-B06 ECOM-01 anon carts session_id + share_token expand/contract
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  share_token uuid unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);
alter table public.carts add column if not exists session_id text;
alter table public.carts add column if not exists share_token uuid unique default gen_random_uuid();
alter table public.carts add column if not exists user_id uuid;
-- cart_items session support: anon via session_id, allow user_id nullable for anon
alter table public.cart_items add column if not exists session_id text;
do $$ begin alter table public.cart_items alter column user_id drop not null; exception when others then null; end $$;
alter table public.cart_items add constraint cart_owner_check check (user_id is not null or session_id is not null) not valid;
-- indexes for anon + user + share
create index if not exists idx_carts_session_id on public.carts (session_id) where session_id is not null;
create index if not exists idx_carts_user_id on public.carts (user_id) where user_id is not null;
create index if not exists idx_carts_share_token on public.carts (share_token) where share_token is not null;
create index if not exists idx_cart_items_session_id on public.cart_items (session_id) where session_id is not null;
create index if not exists idx_cart_items_user_variant on public.cart_items (user_id, variant_id);
-- RLS for carts (own + anon via session not enforced at DB — app layer)
alter table public.carts enable row level security;
drop policy if exists "own carts" on public.carts;
create policy "own carts" on public.carts for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
drop trigger if exists trg_carts_updated on public.carts;
create trigger trg_carts_updated before update on public.carts for each row execute procedure public.touch_updated_at();
