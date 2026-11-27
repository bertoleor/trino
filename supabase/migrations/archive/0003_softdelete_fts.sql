-- 0003_softdelete_fts.sql — soft-delete + FTS GIN (EXPLAIN verified)
alter table public.products add column if not exists deleted_at timestamptz;
create index if not exists idx_products_deleted_at on public.products (deleted_at) where deleted_at is null;
alter table public.products add column if not exists search_vector tsvector;
create index if not exists idx_products_search_vector on public.products using gin (search_vector);
create or replace function public.products_tsvector_update() returns trigger language plpgsql as $$ begin new.search_vector := to_tsvector('spanish', coalesce(new.name,'') || ' ' || coalesce(new.description,'')); return new; end; $$;
drop trigger if exists trg_products_search_vector on public.products;
create trigger trg_products_search_vector before insert or update on public.products for each row execute function public.products_tsvector_update();
update public.products set search_vector = to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(description,''));
-- EXPLAIN: select * from products where search_vector @@ plainto_tsquery('spanish','trino') and deleted_at is null; -- uses GIN
