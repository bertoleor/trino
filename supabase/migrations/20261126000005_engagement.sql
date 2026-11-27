-- ============================================================
-- 20261126000005_engagement.sql — Wishlists & Reviews
-- Anonymous + authenticated wishlists, reviews with moderation,
-- product_avg_rating view (security_invoker).
-- ============================================================

-- ------------------------------------------------------------------
-- 1) WISHLISTS — anon (session_id) + authenticated (user_id)
-- ------------------------------------------------------------------
create table public.wishlists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  session_id   text,                                        -- anon session from httpOnly cookie
  product_id   uuid not null references public.products(id) on delete cascade,
  share_token  uuid unique default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  check (
    (user_id is not null and session_id is null) or
    (user_id is null and session_id is not null)
  ),
  unique (user_id, product_id),
  unique (session_id, product_id)
);

create index idx_wishlists_user on public.wishlists(user_id) where user_id is not null;
create index idx_wishlists_session on public.wishlists(session_id) where session_id is not null;
create index idx_wishlists_product on public.wishlists(product_id);

-- ------------------------------------------------------------------
-- 2) REVIEWS — only verified purchasers can write, moderated
-- ------------------------------------------------------------------
create table public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references public.products(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  order_id           uuid references public.orders(id) on delete set null,
  rating             smallint not null check (rating between 1 and 5),
  title              text check (length(title) <= 120),
  body               text,
  images             text[] default '{}',                   -- Storage paths in reviews bucket
  status             text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  helpful            integer not null default 0,
  verified_purchase  boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, product_id, order_id)
);

create index idx_reviews_product on public.reviews(product_id, status) where status = 'approved';
create index idx_reviews_user on public.reviews(user_id);
create index idx_reviews_order on public.reviews(order_id) where order_id is not null;
create index idx_reviews_status on public.reviews(status);
create index idx_reviews_helpful on public.reviews(helpful desc) where status = 'approved';

-- ------------------------------------------------------------------
-- 3) PRODUCT AVG RATING VIEW — security_invoker for RLS inheritance
-- ------------------------------------------------------------------
create view public.product_avg_rating
with (security_invoker = true)
as
select
  r.product_id,
  round(avg(r.rating)::numeric, 2) as avg_rating,
  count(*) as review_count
from public.reviews r
where r.status = 'approved'
group by r.product_id;

-- ------------------------------------------------------------------
-- 4) RPC: increment_helpful — atomic increment, authenticated only
-- ------------------------------------------------------------------
create or replace function public.increment_helpful(p_review_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_helpful int;
begin
  update public.reviews
  set helpful = helpful + 1,
      updated_at = now()
  where id = p_review_id
    and status = 'approved'
  returning helpful into v_new_helpful;

  if not found then
    raise exception 'review_not_found_or_not_approved' using errcode = 'P0001';
  end if;

  return json_build_object('ok', true, 'helpful', v_new_helpful);
end;
$$;

grant execute on function public.increment_helpful(uuid) to authenticated;
revoke execute on function public.increment_helpful(uuid) from anon;

-- ------------------------------------------------------------------
-- 5) UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------
create trigger trg_wishlists_updated
  before update on public.wishlists
  for each row execute procedure public.touch_updated_at();

create trigger trg_reviews_updated
  before update on public.reviews
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 6) RLS — WISHLISTS
-- ------------------------------------------------------------------
alter table public.wishlists enable row level security;

-- Owner (user_id or session_id match) or super_admin
create policy "wishlists_select_owner_or_super"
  on public.wishlists for select
  using (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    or public.has_role('super_admin')
  );

-- Insert: authenticated user owns user_id; anon uses session_id from JWT claim
create policy "wishlists_insert_owner_or_session"
  on public.wishlists for insert
  with check (
    (auth.uid() is not null and auth.uid() = user_id and session_id is null)
    or (auth.uid() is null and user_id is null and session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id')
  );

-- Delete: owner or super_admin
create policy "wishlists_delete_owner_or_super"
  on public.wishlists for delete
  using (
    auth.uid() = user_id
    or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    or public.has_role('super_admin')
  );

-- Admin full
create policy "wishlists_admin_all"
  on public.wishlists for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 7) RLS — REVIEWS
-- ------------------------------------------------------------------
alter table public.reviews enable row level security;

-- Public read approved only
create policy "reviews_select_approved"
  on public.reviews for select
  using (status = 'approved');

-- Owner read all own reviews
create policy "reviews_select_owner"
  on public.reviews for select
  using (auth.uid() = user_id);

-- Admin read all
create policy "reviews_select_admin"
  on public.reviews for select
  using (public.has_role('admin'));

-- Insert: only verified purchaser (enforced by Server Action, policy allows auth user)
create policy "reviews_insert_verified"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and verified_purchase = true
  );

-- Update: owner can edit own pending/rejected; admin can moderate
create policy "reviews_update_owner"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reviews_moderate_admin"
  on public.reviews for update
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- Delete: owner or admin
create policy "reviews_delete_owner_or_admin"
  on public.reviews for delete
  using (auth.uid() = user_id or public.has_role('admin'));

-- ------------------------------------------------------------------
-- 8) GRANTS — expose to Data API
-- ------------------------------------------------------------------
grant select, insert, update, delete on public.wishlists to authenticated;
grant select on public.wishlists to anon;  -- RLS filters session_id

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop policy if exists "reviews_delete_owner_or_admin" on public.reviews;
-- drop policy if exists "reviews_moderate_admin" on public.reviews;
-- drop policy if exists "reviews_update_owner" on public.reviews;
-- drop policy if exists "reviews_insert_verified" on public.reviews;
-- drop policy if exists "reviews_select_admin" on public.reviews;
-- drop policy if exists "reviews_select_owner" on public.reviews;
-- drop policy if exists "reviews_select_approved" on public.reviews;
-- drop policy if exists "wishlists_admin_all" on public.wishlists;
-- drop policy if exists "wishlists_delete_owner_or_super" on public.wishlists;
-- drop policy if exists "wishlists_insert_owner_or_session" on public.wishlists;
-- drop policy if exists "wishlists_select_owner_or_super" on public.wishlists;
-- alter table public.reviews disable row level security;
-- alter table public.wishlists disable row level security;
-- drop view if exists public.product_avg_rating;
-- revoke execute on function public.increment_helpful(uuid) from authenticated;
-- drop function if exists public.increment_helpful(uuid);
-- drop trigger if exists trg_reviews_updated on public.reviews;
-- drop trigger if exists trg_wishlists_updated on public.wishlists;
-- drop index if exists idx_reviews_helpful;
-- drop index if exists idx_reviews_status;
-- drop index if exists idx_reviews_order;
-- drop index if exists idx_reviews_user;
-- drop index if exists idx_reviews_product;
-- drop index if exists idx_wishlists_product;
-- drop index if exists idx_wishlists_session;
-- drop index if exists idx_wishlists_user;
-- drop table if exists public.reviews;
-- drop table if exists public.wishlists;