-- 0011_cultura.sql — T-E01 cultura_posts GIN slug RLS anon published + admin is_admin()
create table if not exists public.cultura_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  locale text not null check (locale in ('es-AR','en','fr','pt-BR')),
  title text not null,
  excerpt text,
  body jsonb,
  cover_image text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  tags text[] not null default '{}',
  related_product_ids uuid[] not null default '{}',
  social_source text check (social_source in ('tiktok','instagram','youtube','manual')),
  social_url text,
  views integer not null default 0 check (views >= 0),
  search_vector tsvector,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_cultura_slug on public.cultura_posts (slug);
create index if not exists idx_cultura_locale on public.cultura_posts (locale);
create index if not exists idx_cultura_status_published on public.cultura_posts (published_at desc) where status = 'published' and deleted_at is null;
create index if not exists idx_cultura_search_vector on public.cultura_posts using gin (search_vector);
create index if not exists idx_cultura_tags on public.cultura_posts using gin (tags);
create or replace function public.cultura_tsvector_update() returns trigger language plpgsql as $$
begin new.search_vector := to_tsvector('spanish', coalesce(new.title,'') || ' ' || coalesce(new.excerpt,'') || ' ' || coalesce(new.slug,'')); return new; end; $$;
drop trigger if exists trg_cultura_search_vector on public.cultura_posts;
create trigger trg_cultura_search_vector before insert or update on public.cultura_posts for each row execute function public.cultura_tsvector_update();
alter table public.cultura_posts enable row level security;
drop policy if exists "cultura_anon_select_published" on public.cultura_posts;
create policy "cultura_anon_select_published" on public.cultura_posts for select using (status = 'published' and deleted_at is null);
drop policy if exists "cultura_admin_all" on public.cultura_posts;
create policy "cultura_admin_all" on public.cultura_posts for all using (public.is_admin()) with check (public.is_admin());
