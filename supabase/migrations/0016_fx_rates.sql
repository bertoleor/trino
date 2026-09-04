create table if not exists public.fx_rates (
  id uuid primary key default gen_random_uuid(),
  base char(3) not null default 'ARS' check (base = 'ARS'),
  target char(3) not null check (target in ('USD','EUR','BRL')),
  rate numeric(12,6) not null,
  fetched_at timestamptz not null default now(),
  source text
);
create index if not exists idx_fx_rates_target on public.fx_rates (target);
create index if not exists idx_fx_rates_fetched_at on public.fx_rates (fetched_at desc);
alter table public.fx_rates enable row level security;
drop policy if exists "public read fx_rates" on public.fx_rates;
create policy "public read fx_rates" on public.fx_rates for select using (true);
drop policy if exists "admin write fx_rates" on public.fx_rates;
create policy "admin write fx_rates" on public.fx_rates for all using (public.is_admin()) with check (public.is_admin());
