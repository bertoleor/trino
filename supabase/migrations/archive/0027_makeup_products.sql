-- ============================================================
-- 0027_makeup_products.sql — trino. Makeup Products Schema
-- Pivot from esoteric e-commerce to makeup digital store
-- ============================================================

-- ------------------------------------------------------------------
-- 1) EXTENSIONS & SETUP
-- ------------------------------------------------------------------

create extension if not exists "uuid-extension";

-- ------------------------------------------------------------------
-- 2) MAKEUP CATEGORIES (new table — separate from core categories)
--    5 categorías principales: ojos, labios, rostro, manicure, pestañas
-- ------------------------------------------------------------------

create table public.makeup_categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  slug         text not null unique,
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.makeup_categories enable row level security;

create policy "public read makeup_categories" on public.makeup_categories for select using (true);
create policy "admin write makeup_categories" on public.makeup_categories for all using (public.is_admin()) with check (public.is_admin());

insert into public.makeup_categories (name, slug, description) values
  ('Ojos', 'ojos', 'Productos para ojos: sombras, delineadores, máscaras'),
  ('Labios', 'labios', 'Productos para labios: labiales, batones, gloss'),
  ('Rostro', 'rostro', 'Productos para rostro: polvos, bronceadores, correctores'),
  ('Manicure', 'manicure', 'Productos para uñas: esmaltes, herramientas'),
  ('Pestañas', 'pestañas', 'Productos para pestañas: máscaras, postizas, rímel')
on conflict (slug) do nothing;

-- ------------------------------------------------------------------
-- 3) MAKEUP PRODUCTS (extends core product model)
--    Anexa categoría_makeup, subcategory, brand, shade, finish
-- ------------------------------------------------------------------

create table public.makeup_products (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  category_id       uuid references public.makeup_categories(id) on delete set null,
  name              text not null,
  slug              text not null unique,
  description       text,
  price_cents       integer not null check (price_cents >= 0),
  currency          text not null default 'ARS' check (currency = 'ARS'),
  sale_price_cents  integer check (sale_price_cents is null or sale_price_cents < price_cents),
  sale_start        timestamptz,
  sale_end          timestamptz,
  stock             integer not null default 0 check (stock >= 0),
  sku               text not null unique,
  weight_grams      integer,
  dimensions_cm     text,
  image_url         text,
  is_active         boolean not null default true,
  featured          boolean not null default false,
  -- Nuevo campos para rubro maquillaje
  category_makeup   text not null check (category_makeup in ('ojos', 'labios', 'rostro', 'manicure', 'pestañas')),
  subcategory       text not null check (subcategory in ('sombras', 'delineadores', 'máscaras', 'labiales', 'gloss', 'esmaltes', 'herramientas')),
  brand             text not null,
  shade             text not null check (shade ~ '^[0-9a-f]{6}$'),
  finish            text not null check (finish in ('mate', 'satin', 'gloss', 'shimmer', 'metálico')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.makeup_products enable row level security;

create policy "public read makeup_products" on public.makeup_products for select using (true);
create policy "admin write makeup_products" on public.makeup_products for all using (public.is_admin()) with check (public.is_admin());
create policy "owner manage makeup_products" on public.makeup_products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_makeup_products_category on public.makeup_products(category_makeup);
create index idx_makeup_products_brand on public.makeup_products(brand);
create index idx_makeup_products_shade on public.makeup_products(shade);
create index idx_makeup_products_finish on public.makeup_products(finish);
create index idx_makeup_products_active on public.makeup_products(is_active);

-- ------------------------------------------------------------------
-- 4) UPDATE AT TRIGGERS
-- ------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_makeup_products_updated before update on public.makeup_products for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 5) MIGRATION NOTE
-- ------------------------------------------------------------------
-- Esta migración añade la estructura completa de productos de maquillaje
-- sobre la que vivirán los 500+ SKUs del catálogo.
-- Migraciones futuras (T5): ajustes en UI, validaciones Zod, y cambios
-- en el CSV template para llenar estos nuevos campos.
