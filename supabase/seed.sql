-- seed.sql T-D08 factories SEED sadPaths 90/80
-- idempotent seed for dev/test: products, cultura, wishlist, reviews, carts

-- products — canonical beauty catalog (0028), price_cents INT MONEY
-- schema: name (NOT NULL, no "title" column exists), price numeric NOT NULL
insert into public.products (id, slug, name, price, price_cents, currency, deleted_at, category, subcategory, brand, shade, finish) values
  ('00000000-0000-0000-0000-000000000001','labial-liquido-mate-berry','Labial líquido mate berry', 2499.00, 249900,'ARS',null,'labios','labiales','trino.','8a2e4b','mate'),
  ('00000000-0000-0000-0000-000000000002','paleta-sombras-crushed','Paleta de sombras crushed', 1299.00, 129900,'ARS',null,'ojos','sombras','trino.','c4416b','shimmer'),
  ('00000000-0000-0000-0000-000000000003','mascara-volumen-extremo','Máscara volumen extremo', 3499.00, 349900,'ARS',null,'pestañas','máscaras','trino.','1a1a1a','gloss')
on conflict (id) do nothing;

-- cultura_posts draft/published + sad paths
insert into public.cultura_posts (id, slug, locale, title, excerpt, body, status, published_at, tags, deleted_at) values
  ('00000000-0000-0000-0000-000000000010','rutina-skincare','es-AR','Rutina de skincare','Excerpt skincare', '{"type":"doc"}','published', now(), array['skincare','rutina'], null),
  ('00000000-0000-0000-0000-000000000011','rutina-draft','es-AR','Borrador','draft excerpt','{}','draft', null, array['draft'], null),
  ('00000000-0000-0000-0000-000000000012','deleted-post','es-AR','Eliminado','x','{}','published', now(), array['sad'], now())
on conflict (id) do nothing;

-- wishlists anon + user + sad duplicate
insert into public.wishlists (id, product_id, session_id) values
  ('00000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000001','sess-seed-1')
on conflict (id) do nothing;

-- carts session_id anon merge
insert into public.carts (id, session_id) values
  ('00000000-0000-0000-0000-000000000040','sess-seed-1')
on conflict (id) do nothing;

-- seed auth identities (local dev only) — reviews.user_id is NOT NULL REFERENCES auth.users;
-- the on_auth_user_created_profile trigger creates matching profiles idempotently.
insert into auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000101','seed-reviewer-1@trino.local', now(), '{"provider":"seed","providers":["seed"]}', '{"full_name":"Seed Reviewer 1"}'),
  ('00000000-0000-0000-0000-000000000102','seed-reviewer-2@trino.local', now(), '{"provider":"seed","providers":["seed"]}', '{"full_name":"Seed Reviewer 2"}')
on conflict (id) do nothing;

-- makeup_products staging (0027): same slugs, lowercase shade per its CHECK.
insert into public.makeup_products (id, user_id, name, slug, price_cents, sku, category_makeup, subcategory, brand, shade, finish) values
  ('00000000-0000-0000-0000-000000000050','00000000-0000-0000-0000-000000000101','Labial líquido mate berry','labial-liquido-mate-berry',249900,'LL-MAT-001','labios','labiales','trino.','8a2e4b','mate'),
  ('00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000101','Paleta de sombras crushed','paleta-sombras-crushed',129900,'SOM-CRU-001','ojos','sombras','trino.','c4416b','shimmer')
on conflict (slug) do nothing;

-- reviews pending/approved rejected sad rating 0/6 filtered by app (reviewers = seed identities)
insert into public.reviews (id, product_id, user_id, rating, title, body, status) values
  ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000101',5,'Excelente','Me encanto','approved'),
  ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000102',1,'Malo','No me gusto','rejected'),
  ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000101',3,'Ok','Regular','pending')
on conflict (id) do nothing;
