-- ============================================================
-- 0028_product_beauty_attributes.sql — trino. beauty catalog
-- Canonical storefront catalog lives in public.products.
-- 0027 created public.makeup_products as import staging; its
-- attributes are mirrored here so PLP, cart, search and sitemap
-- keep pointing at a single source of truth.
-- ============================================================

alter table public.products
  add column if not exists category text check (
    category in ('ojos', 'labios', 'rostro', 'manicure', 'pestañas')
  ),
  add column if not exists subcategory text check (
    subcategory in (
      'sombras', 'delineadores', 'máscaras', 'labiales', 'gloss', 'esmaltes', 'herramientas'
    )
  ),
  add column if not exists brand text check (brand is null or length(brand) between 2 and 50),
  add column if not exists shade text check (shade ~* '^[0-9a-f]{6}$'),
  add column if not exists finish text check (
    finish in ('mate', 'satin', 'gloss', 'shimmer', 'metálico')
  );

-- Partial indexes: only live, non-deleted products are filterable in the PLP.
create index if not exists idx_products_beauty_category
  on public.products (category) where deleted_at is null;
create index if not exists idx_products_beauty_subcategory
  on public.products (subcategory) where deleted_at is null;
create index if not exists idx_products_beauty_finish
  on public.products (finish) where deleted_at is null;
create index if not exists idx_products_beauty_brand
  on public.products (brand) where deleted_at is null;
create index if not exists idx_products_beauty_shade
  on public.products (shade) where deleted_at is null;

-- FTS now indexes the product tone attributes as well as name/description.
-- The GIN index idx_products_search_vector from 0003 is unchanged and still serves these queries.
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

update public.products
set search_vector = to_tsvector(
  'spanish',
  coalesce(name, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(brand, '') || ' ' ||
  coalesce(subcategory, '')
);

-- RLS and grants are untouched: public.products already has its policies.
-- No legacy esoteric facets are reintroduced.
