-- 0014_reviews.sql — T-G01 reviews rating 1..5 title<=120 body<=2000 images<=3 GIN RLS approved
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  title text check (char_length(title) <= 120),
  body text check (char_length(body) <= 2000),
  images text[] not null default '{}' check (array_length(images,1) is null or array_length(images,1) <= 3),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  helpful integer not null default 0 check (helpful >= 0),
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists idx_reviews_product on public.reviews (product_id);
create index if not exists idx_reviews_user on public.reviews (user_id);
create index if not exists idx_reviews_product_status on public.reviews (product_id, status) where status = 'approved';
create index if not exists idx_reviews_rating on public.reviews (rating);
create index if not exists idx_reviews_search on public.reviews using gin (to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(body,'')));
alter table public.reviews enable row level security;
drop policy if exists "reviews_anon_select_approved" on public.reviews;
create policy "reviews_anon_select_approved" on public.reviews for select using (status = 'approved');
drop policy if exists "reviews_admin_select_all" on public.reviews;
create policy "reviews_admin_select_all" on public.reviews for select using (public.is_admin());
drop policy if exists "reviews_owner_insert" on public.reviews;
create policy "reviews_owner_insert" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "reviews_admin_moderate" on public.reviews;
create policy "reviews_admin_moderate" on public.reviews for update using (public.is_admin()) with check (public.is_admin());
create or replace view public.product_avg_rating as select product_id, avg(rating)::numeric(3,2) as avg_rating, count(*) as review_count from public.reviews where status='approved' group by product_id;
