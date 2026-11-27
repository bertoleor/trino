-- ============================================================
-- 20261126000006_content_config.sql — Editorial Content & Config
-- editorial_posts (beauty blog/glossary), global_settings (legal CMS).
-- Replaces cultura_posts and return_policy_by_tipo.
-- ============================================================

-- ------------------------------------------------------------------
-- 1) EDITORIAL POSTS — beauty content, SEO, glossary
-- ------------------------------------------------------------------
create table public.editorial_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  locale          text not null check (locale in ('es-AR','en','fr','pt-BR')),
  title           text not null,
  excerpt         text,                                      -- meta description 20-155 chars
  body            jsonb not null,                            -- TipTap JSON
  cover_image     text,                                      -- Storage path
  status          text not null default 'draft'
                  check (status in ('draft','published','archived')),
  published_at    timestamptz,
  author_id       uuid references auth.users(id) on delete set null,
  tags            text[] default '{}',
  related_product_ids uuid[] default '{}',
  search_vector   tsvector,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (slug, locale)
);

create index idx_editorial_slug on public.editorial_posts(slug);
create index idx_editorial_locale_status on public.editorial_posts(locale, status) where status = 'published';
create index idx_editorial_published on public.editorial_posts(published_at desc) where status = 'published';
create index idx_editorial_search on public.editorial_posts using gin (search_vector);
create index idx_editorial_tags on public.editorial_posts using gin (tags);

-- ------------------------------------------------------------------
-- 2) GLOBAL SETTINGS — single-row CMS for legal/brand config
-- ------------------------------------------------------------------
create table public.global_settings (
  id                          uuid primary key default gen_random_uuid(),
  -- Legal (per category policies, CMS-01)
  return_policy_by_category   jsonb not null default '{}',  -- { "ojos": "...", "labios": "..." }
  shipping_policy_by_category jsonb not null default '{}',
  warranty_policy_by_category jsonb not null default '{}',
  -- Merchant identity (P-04)
  razon_social                text,
  cuit                        text,
  condicion_fiscal            text,
  domicilio_legal             text,
  email_legal                 text,
  telefono_legal              text,
  -- Facturación ARCA
  facturacion_tipo            text check (facturacion_tipo in ('A','B','C')),
  facturacion_pto_vta         text,
  facturacion_cuit            text,
  -- Brand theming (white-label)
  brand_tokens                jsonb not null default '{}',  -- CSS variable overrides
  -- Feature flags (DEV-01)
  flags                       jsonb not null default '{}',
  -- Metadata
  updated_by                  uuid references auth.users(id) on delete set null,
  updated_at                  timestamptz not null default now()
);

-- Ensure single row
create unique index idx_global_settings_singleton on public.global_settings ((true));

-- ------------------------------------------------------------------
-- 3) SEARCH VECTOR TRIGGER (editorial)
-- ------------------------------------------------------------------
create or replace function public.editorial_tsvector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector(
    'spanish',
    coalesce(new.title, '') || ' ' ||
    coalesce(new.excerpt, '') || ' ' ||
    coalesce(new.body::text, '') || ' ' ||
    array_to_string(coalesce(new.tags, '{}'), ' ')
  );
  return new;
end;
$$;

-- ------------------------------------------------------------------
-- 4) UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------
create trigger trg_editorial_updated
  before update on public.editorial_posts
  for each row execute procedure public.touch_updated_at();

create trigger trg_global_settings_updated
  before update on public.global_settings
  for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 5) RLS — EDITORIAL POSTS
-- ------------------------------------------------------------------
alter table public.editorial_posts enable row level security;

-- Public read published, non-deleted
create policy "editorial_select_published"
  on public.editorial_posts for select
  using (status = 'published' and deleted_at is null);

-- Admin full
create policy "editorial_admin_all"
  on public.editorial_posts for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 6) RLS — GLOBAL SETTINGS
-- ------------------------------------------------------------------
alter table public.global_settings enable row level security;

-- Public read (single row, non-sensitive)
create policy "global_settings_select_public"
  on public.global_settings for select
  using (true);

-- Admin write
create policy "global_settings_admin_all"
  on public.global_settings for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ------------------------------------------------------------------
-- 7) GRANTS — expose to Data API
-- ------------------------------------------------------------------
grant select on public.editorial_posts to anon, authenticated;
grant select on public.global_settings to anon, authenticated;

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop policy if exists "global_settings_admin_all" on public.global_settings;
-- drop policy if exists "global_settings_select_public" on public.global_settings;
-- drop policy if exists "editorial_admin_all" on public.editorial_posts;
-- drop policy if exists "editorial_select_published" on public.editorial_posts;
-- alter table public.global_settings disable row level security;
-- alter table public.editorial_posts disable row level security;
-- drop trigger if exists trg_global_settings_updated on public.global_settings;
-- drop trigger if exists trg_editorial_updated on public.editorial_posts;
-- drop function if exists public.editorial_tsvector_update();
-- drop index if exists idx_global_settings_singleton;
-- drop index if exists idx_editorial_tags;
-- drop index if exists idx_editorial_search;
-- drop index if exists idx_editorial_published;
-- drop index if exists idx_editorial_locale_status;
-- drop index if exists idx_editorial_slug;
-- drop table if exists public.global_settings;
-- drop table if exists public.editorial_posts;