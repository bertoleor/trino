alter table public.carts add column if not exists share_token uuid unique default gen_random_uuid();
create index if not exists idx_carts_share_token on public.carts (share_token) where share_token is not null;
alter table public.wishlists add column if not exists share_token uuid unique default gen_random_uuid();
create index if not exists idx_wishlists_share_token on public.wishlists (share_token) where share_token is not null;
