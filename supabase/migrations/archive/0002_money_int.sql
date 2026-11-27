-- 0002_money_int.sql — MONEY-01 expand/contract INTEGER centavos ARS only
alter table public.products add column if not exists price_cents integer check (price_cents >= 0);
alter table public.products add column if not exists currency char(3) not null default 'ARS' check (currency = 'ARS');
alter table public.products add column if not exists sale_price_cents integer check (sale_price_cents >= 0);
alter table public.products add column if not exists sale_start timestamptz;
alter table public.products add column if not exists sale_end timestamptz;
update public.products set price_cents = round(price * 100)::int where price_cents is null and price is not null;
alter table public.product_variants add column if not exists price_cents integer check (price_cents >= 0);
alter table public.product_variants add column if not exists currency char(3) not null default 'ARS' check (currency = 'ARS');
update public.product_variants set price_cents = round(price * 100)::int where price_cents is null and price is not null;
alter table public.orders add column if not exists subtotal_cents integer not null default 0 check (subtotal_cents >= 0);
alter table public.orders add column if not exists shipping_cents integer not null default 0 check (shipping_cents >= 0);
alter table public.orders add column if not exists total_cents integer not null default 0 check (total_cents >= 0);
alter table public.order_items add column if not exists unit_price_cents integer not null default 0 check (unit_price_cents >= 0);
alter table public.order_items add column if not exists total_cents integer not null default 0 check (total_cents >= 0);
-- expand phase only: keep numeric price columns for contract step later
-- EXPLAIN: currency constraint ensures ARS-only; price_cents INT avoids float drift
