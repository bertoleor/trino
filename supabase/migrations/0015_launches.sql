create table if not exists public.launches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  launch_date timestamptz not null,
  type text not null check (type in ('drop','collection','restock')),
  title text not null,
  description text,
  status text not null default 'scheduled' check (status in ('scheduled','live','ended')),
  teaser_image text,
  created_at timestamptz not null default now()
);
create index if not exists idx_launches_launch_date on public.launches (launch_date);
create index if not exists idx_launches_product_id on public.launches (product_id);
create index if not exists idx_launches_status on public.launches (status);
alter table public.launches enable row level security;
drop policy if exists "public read launches" on public.launches;
create policy "public read launches" on public.launches for select using (true);
drop policy if exists "admin write launches" on public.launches;
create policy "admin write launches" on public.launches for all using (public.is_admin()) with check (public.is_admin());
