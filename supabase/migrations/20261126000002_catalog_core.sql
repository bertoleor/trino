-- ============================================================
-- 20261126000002_catalog_core.sql — Beauty Catalog Core
-- products (commercial entity), product_variants (SKU/price/stock/shade),
-- product_images, product_translations (i18n).
-- All monetary amounts in INTEGER centavos, currency='ARS'.
-- ============================================================

-- ------------------------------------------------------------------
-- 1) PRODUCTS — commercial entity (one row per product)
-- ------------------------------------------------------------------
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  status          text not null default 'draft'
                  check (status in ('draft','published','archived')),
  category        text not null
                  check (category in ('ojos','labios','rostro','manicure','pestañas')),
  subcategory     text not null
                  check (subcategory in (
                    'sombras','delineadores','máscaras',
                    'labiales','gloss','esmaltes','herramientas'
                  )),
  brand           text not null check (length(brand) between 2 and 50),
  finish          text not null
                  check (finish in ('mate','satin','gloss','shimmer','metálico')),
  -- Base price in centavos (ARS). Sale window handled by variants.
  base_price_cents integer not null check (base_price_cents >= 0),
  currency        char(3) not null default 'ARS' check (currency = 'ARS'),
  -- SEO / metadata
  search_vector   tsvector,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_products_category on public.products(category) where status = 'published';
create index idx_products_subcategory on public.products(subcategory) where status = 'published';
create index idx_products_brand on public.products(brand) where status = 'published';
create index idx_products_finish on public.products(finish) where status = 'published';
create index idx_products_slug on public.products(slug);
create index idx_products_search_vector on public.products using gin (search_vector);

-- ------------------------------------------------------------------
-- 2) PRODUCT VARIANTS — SKU, price, stock, shade (one row per variant)
-- ------------------------------------------------------------------
create table public.product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  sku             text not null unique,
  name            text not null,                     -- e.g. "Berry", "01"
  shade           text not null check (shade ~* '^[0-9a-f]{6}$'), -- hex without #
  price_cents     integer not null check (price_cents >= 0),
  sale_price_cents integer check (sale_price_cents is null or sale_price_cents < price_cents),
  sale_start      timestamptz,
  sale_end        timestamptz,
  stock           integer not null default 0 check (stock >= 0),
  currency        char(3) not null default 'ARS' check (currency = 'ARS'),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_variants_product on public.product_variants(product_id);
create index idx_variants_sku on public.product_variants(sku);
create index idx_variants_shade on public.product_variants(shade);
create index idx_variants_active on public.product_variants(is_active) where is_active;

-- ------------------------------------------------------------------
-- 3) PRODUCT IMAGES — ordered gallery per product
-- ------------------------------------------------------------------
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,                         -- Storage path: products/{slug}/01.webp
  alt_text    text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_images_product on public.product_images(product_id, position);

-- ------------------------------------------------------------------
-- 4) PRODUCT TRANSLATIONS — i18n for name/description/excerpt
-- ------------------------------------------------------------------
create table public.product_translations (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  locale        text not null check (locale in ('es-AR','en','fr','pt-BR')),
  name          text not null,
  description   text,
  excerpt       text,                                -- meta description 20-155 chars
  updated_at    timestamptz not null default now(),
  unique (product_id, locale)
);

-- ------------------------------------------------------------------
-- 5) SEARCH VECTOR TRIGGER
-- ------------------------------------------------------------------
create or replace function public.products_tsvector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector(
    'spanish',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.description, '') || ' ' ||
    coalesce(new.brand, '') || ' ' ||
    coalesce(new.subcategory, '')
  );
  return new;
end;
$$;

-- We don't have name/description on products directly; they live in translations.
-- The trigger will be useful once we add a generated column or materialized view.
-- For now, create a function that can be used by a materialized view or sync job.

-- ------------------------------------------------------------------
-- 6) UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------
create trigger trg_products_updated
  before update on public.products
  for each row execute procedure public.touch_updated_at();

create trigger trg_variants_updated
  before update on public.product_variants
  for each row execute procedure public.touch_updated_at();

create trigger trg_translations_updated
  before update on public.product_translations
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 7) RLS — PRODUCTS (public read published; admin write)
-- ------------------------------------------------------------------
alter table public.products enable row level security;

create policy "products_select_published"
  on public.products for select
  using (status = 'published');

create policy "products_admin_all"
  on public.products for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 8) RLS — PRODUCT VARIANTS (public read if product published; admin write)
-- ------------------------------------------------------------------
alter table public.product_variants enable row level security;

create policy "variants_select_published"
  on public.product_variants for select
  using (
    is_active = true
    and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and p.status = 'published'
    )
  );

create policy "variants_admin_all"
  on public.product_variants for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 9) RLS — PRODUCT IMAGES (public read if product published; admin write)
-- ------------------------------------------------------------------
alter table public.product_images enable row level security;

create policy "images_select_published"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.status = 'published'
    )
  );

create policy "images_admin_all"
  on public.product_images for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 10) RLS — PRODUCT TRANSLATIONS (public read if product published; admin write)
-- ------------------------------------------------------------------
alter table public.product_translations enable row level security;

create policy "translations_select_published"
  on public.product_translations for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_translations.product_id
        and p.status = 'published'
    )
  );

create policy "translations_admin_all"
  on public.product_translations for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 11) GRANTS — expose to Data API
-- ------------------------------------------------------------------
grant select on public.products to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.product_translations to anon, authenticated;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop trigger if exists trg_translations_updated on public.product_translations;
-- drop trigger if exists trg_variants_updated on public.product_variants;
-- drop trigger if exists trg_products_updated on public.products;
-- drop function if exists public.products_tsvector_update();
-- drop policy if exists "translations_admin_all" on public.product_translations;
-- drop policy if exists "translations_select_published" on public.product_translations;
-- drop policy if exists "images_admin_all" on public.product_images;
-- drop policy if exists "images_select_published" on public.product_images;
-- drop policy if exists "variants_admin_all" on public.product_variants;
-- drop policy if exists "variants_select_published" on public.product_variants;
-- drop policy if exists "products_admin_all" on public.products;
-- drop policy if exists "products_select_published" on public.products;
-- alter table public.product_translations disable row level security;
-- alter table public.product_images disable row level security;
-- alter table public.product_variants disable row level security;
-- alter table public.products disable row level security;
-- drop index if exists idx_translations_product_locale; -- implicit from unique
-- drop index if exists idx_images_product;
-- drop index if exists idx_variants_active;
-- drop index if exists idx_variants_shade;
-- drop index if exists idx_variants_sku;
-- drop index if exists idx_variants_product;
-- drop index if exists idx_products_search_vector;
-- drop index if exists idx_products_finish;
-- drop index if exists idx_products_brand;
-- drop index if exists idx_products_subcategory;
-- drop index if exists idx_products_category;
-- drop index if exists idx_products_slug;
-- drop table if exists public.product_translations;
-- drop table if exists public.product_images;
-- drop table if exists public.product_variants;
-- drop table if exists public.products;