-- seed.sql T-D08 factories SEED sadPaths 90/80
-- idempotent seed for dev/test: products, editorial, wishlist, reviews, carts
-- New schema: products + product_variants + product_translations + product_images

-- ------------------------------------------------------------------
-- 1) PRODUCTS + VARIANTS + TRANSLATIONS + IMAGES
-- ------------------------------------------------------------------

-- Product 1: Labial líquido mate berry
insert into public.products (id, slug, status, category, subcategory, brand, finish, base_price_cents)
values (
  '11111111-1111-1111-1111-111111111111',
  'labial-liquido-mate-berry',
  'published',
  'labios',
  'labiales',
  'trino.',
  'mate',
  249900
)
on conflict (slug) do nothing;

-- Variants for Product 1
insert into public.product_variants (id, product_id, sku, name, shade, price_cents, stock)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'LL-MAT-001', 'Berry', '8a2e4b', 249900, 50),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'LL-MAT-002', 'Nude', 'd4a59a', 249900, 40),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'LL-MAT-003', 'Red', 'c41e3a', 249900, 35)
on conflict (sku) do nothing;

-- Translations for Product 1
insert into public.product_translations (product_id, locale, name, description, excerpt)
values
  ('11111111-1111-1111-1111-111111111111', 'es-AR', 'Labial líquido mate berry',
   'Labial líquido de alta cobertura y acabado mate sin transferencia. Larga duración hasta 12 horas.',
   'Labial líquido mate de alta cobertura, 12hs duración.'),
  ('11111111-1111-1111-1111-111111111111', 'en', 'Matte Liquid Lipstick Berry',
   'High-coverage matte liquid lipstick with no transfer. Up to 12-hour wear.',
   'Matte liquid lipstick, high coverage, 12hr wear.'),
  ('11111111-1111-1111-1111-111111111111', 'fr', 'Rouge à lèvres liquide mat berry',
   'Rouge à lèvres liquide haute couvrance, fini mat sans transfert. Tenue 12h.',
   'Rouge à lèvres liquide mat, haute couvrance, 12h.'),
  ('11111111-1111-1111-1111-111111111111', 'pt-BR', 'Batom líquido matte berry',
   'Batom líquido de alta cobertura e acabamento matte sem transferência. Duração de até 12 horas.',
   'Batom líquido matte, alta cobertura, 12h duração.')
on conflict (product_id, locale) do nothing;

-- Images for Product 1
insert into public.product_images (product_id, url, alt_text, position)
values
  ('11111111-1111-1111-1111-111111111111', 'products/labial-liquido-mate-berry/01.webp', 'Labial líquido mate berry - vista frontal', 0),
  ('11111111-1111-1111-1111-111111111111', 'products/labial-liquido-mate-berry/02.webp', 'Labial líquido mate berry - swatch en piel', 1),
  ('11111111-1111-1111-1111-111111111111', 'products/labial-liquido-mate-berry/03.webp', 'Labial líquido mate berry - packaging', 2)
on conflict do nothing;

-- Product 2: Paleta de sombras crushed
insert into public.products (id, slug, status, category, subcategory, brand, finish, base_price_cents)
values (
  '22222222-2222-2222-2222-222222222222',
  'paleta-sombras-crushed',
  'published',
  'ojos',
  'sombras',
  'trino.',
  'shimmer',
  129900
)
on conflict (slug) do nothing;

-- Variants for Product 2
insert into public.product_variants (id, product_id, sku, name, shade, price_cents, stock)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'SOM-CRU-001', 'Crushed', 'c4416b', 129900, 30),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'SOM-CRU-002', 'Warm', 'a0522d', 129900, 25)
on conflict (sku) do nothing;

-- Translations for Product 2
insert into public.product_translations (product_id, locale, name, description, excerpt)
values
  ('22222222-2222-2222-2222-222222222222', 'es-AR', 'Paleta de sombras crushed',
   'Paleta de 4 tonos con acabados mate y shimmer. Pigmentación intensa, fácil difuminado.',
   'Paleta 4 tonos mate/shimmer, alta pigmentación.'),
  ('22222222-2222-2222-2222-222222222222', 'en', 'Crushed Eyeshadow Palette',
   '4-shade palette with matte and shimmer finishes. Intense pigmentation, blendable.',
   '4-shade matte/shimmer palette, high pigment.'),
  ('22222222-2222-2222-2222-222222222222', 'fr', 'Palette ombres crushed',
   'Palette de 4 tons aux finis mat et shimmer. Pigmentation intense, facile à estomper.',
   'Palette 4 tons mat/shimmer, haute pigmentation.'),
  ('22222222-2222-2222-2222-222222222222', 'pt-BR', 'Paleta de sombras crushed',
   'Paleta de 4 tons com acabamentos matte e shimmer. Alta pigmentação, fácil esfumar.',
   'Paleta 4 tons matte/shimmer, alta pigmentação.')
on conflict (product_id, locale) do nothing;

-- Images for Product 2
insert into public.product_images (product_id, url, alt_text, position)
values
  ('22222222-2222-2222-2222-222222222222', 'products/paleta-sombras-crushed/01.webp', 'Paleta de sombras crushed - estuche abierto', 0),
  ('22222222-2222-2222-2222-222222222222', 'products/paleta-sombras-crushed/02.webp', 'Paleta de sombras crushed - swatches', 1)
on conflict do nothing;

-- Product 3: Máscara volumen extremo
insert into public.products (id, slug, status, category, subcategory, brand, finish, base_price_cents)
values (
  '33333333-3333-3333-3333-333333333333',
  'mascara-volumen-extremo',
  'published',
  'pestañas',
  'máscaras',
  'trino.',
  'gloss',
  349900
)
on conflict (slug) do nothing;

-- Variant for Product 3
insert into public.product_variants (id, product_id, sku, name, shade, price_cents, stock)
values
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '33333333-3333-3333-3333-333333333333', 'MAS-VOL-001', 'Negro intenso', '1a1a1a', 349900, 60)
on conflict (sku) do nothing;

-- Translations for Product 3
insert into public.product_translations (product_id, locale, name, description, excerpt)
values
  ('33333333-3333-3333-3333-333333333333', 'es-AR', 'Máscara volumen extremo',
   'Máscara de pestañas volumen extremo, negra intensa. Resistente al agua, sin grumos.',
   'Máscara volumen extremo, negra, waterproof.'),
  ('33333333-3333-3333-3333-333333333333', 'en', 'Extreme Volume Mascara',
   'Extreme volume mascara, intense black. Waterproof, clump-free.',
   'Extreme volume mascara, intense black, waterproof.'),
  ('33333333-3333-3333-3333-333333333333', 'fr', 'Mascara volume extrême',
   'Mascara volume extrême, noir intense. Waterproof, sans paquets.',
   'Mascara volume extrême, noir, waterproof.'),
  ('33333333-3333-3333-3333-333333333333', 'pt-BR', 'Máscara volume extremo',
   'Máscara de cílios volume extremo, preta intensa. À prova d''água, sem grumos.',
   'Máscara volume extremo, preta, à prova d''água.')
on conflict (product_id, locale) do nothing;

-- Images for Product 3
insert into public.product_images (product_id, url, alt_text, position)
values
  ('33333333-3333-3333-3333-333333333333', 'products/mascara-volumen-extremo/01.webp', 'Máscara volumen extremo - packaging', 0),
  ('33333333-3333-3333-3333-333333333333', 'products/mascara-volumen-extremo/02.webp', 'Máscara volumen extremo - aplicador', 1)
on conflict do nothing;

-- ------------------------------------------------------------------
-- 2) EDITORIAL POSTS (beauty content)
-- ------------------------------------------------------------------
insert into public.editorial_posts (id, slug, locale, title, excerpt, body, status, published_at, tags, deleted_at)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'como-elegir-tu-tono-de-labial', 'es-AR',
   'Cómo elegir tu tono de labial perfecto',
   'Guía para encontrar el shade ideal según tu subtono de piel.',
   '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Identificá tu subtono"}]},{"type":"paragraph","content":[{"type":"text","text":"Observá las venas de tu muñeca: si se ven azuladas, tenés subtono frío; si verdosas, cálido; si ambas, neutro."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Match con tu subtono"}]},{"type":"paragraph","content":[{"type":"text","text":"Frío: rosas, frambuesas, rojos azulados. Cálido: corales, nudes cálidos, rojos anaranjados. Neutro: casi todo te queda bien."}]}]}',
   'published', now(), array['labiales','guía','subtono'], null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'rutina-skincare-basica', 'es-AR',
   'Rutina de skincare básica: 3 pasos esenciales',
   'Limpieza, hidratación y protección solar: la base de toda rutina.',
   '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Paso 1: Limpieza"}]},{"type":"paragraph","content":[{"type":"text","text":"Usá un limpiador suave mañana y noche. Evitá jabones que resequen."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Paso 2: Hidratación"}]},{"type":"paragraph","content":[{"type":"text","text":"Crema hidratante según tu tipo de piel. Gel para grasa, crema para seca."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Paso 3: Protección solar"}]},{"type":"paragraph","content":[{"type":"text","text":"FPS 30+ todos los días. Reaplicá cada 2hs si estás al sol."}]}]}',
   'published', now(), array['skincare','rutina','básica'], null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'como-aplicar-sombras-como-pro', 'es-AR',
   'Cómo aplicar sombras como una pro',
   'Técnicas de difuminado, transición y profundidad para looks de ojos.',
   '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Herramientas"}]},{"type":"paragraph","content":[{"type":"text","text":"Pincel de difuminar (fluffy), pincel plano (packing), pincel detalle."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Técnica 3 tonos"}]},{"type":"paragraph","content":[{"type":"text","text":"Tono claro en párpado móvil, medio en cuenca, oscuro en V externa. Difuminá entre cada capa."}]}]}',
   'published', now(), array['sombras','técnica','maquillaje'], null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 'borrador-test', 'es-AR',
   'Borrador de prueba',
   'Excerpt de borrador',
   '{}',
   'draft', null, array['test'], null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'eliminado-test', 'es-AR',
   'Post eliminado',
   'x',
   '{}',
   'published', now(), array['sad'], now())
on conflict (slug, locale) do nothing;

-- ------------------------------------------------------------------
-- 3) GLOBAL SETTINGS — legal defaults per category
-- ------------------------------------------------------------------
insert into public.global_settings (id, return_policy_by_category, shipping_policy_by_category, warranty_policy_by_category)
values (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '{
    "ojos": "Los productos de ojos (sombras, delineadores, máscaras) no admiten devolución por higiene una vez abiertos. Productos sellados con packaging intacto: 10 días de arrepentimiento (Ley 24.240 art. 34).",
    "labios": "Los labiales, gloss y batones no admiten devolución por higiene una vez abiertos. Productos sellados: 10 días de arrepentimiento.",
    "rostro": "Polvos, correctores y bronceadores sellados: 10 días. Abiertos: no retornables por higiene.",
    "manicure": "Esmaltes y herramientas sellados: 10 días. Abiertos: no retornables.",
    "pestañas": "Máscaras y pestañas postizas selladas: 10 días. Abiertas: no retornables por higiene."
  }',
  '{
    "default": "Envío gratis en compras mayores a $50.000 ARS. CABA y GBA: 24-48hs. Resto del país: 3-5 días hábiles. Costo estándar: $3.500 ARS."
  }',
  '{
    "default": "Garantía legal de 6 meses por defectos de fabricación (Ley 22.802). No cubre uso indebido, desgaste natural ni daño por caídas. Contactá a hola@trino.com.ar con número de orden y fotos."
  }'
)
on conflict do nothing;

-- ------------------------------------------------------------------
-- 4) WISHLISTS
-- ------------------------------------------------------------------
insert into public.wishlists (id, product_id, session_id) values
  ('00000000-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', 'sess-seed-1')
on conflict (id) do nothing;

-- ------------------------------------------------------------------
-- 5) CARTS
-- ------------------------------------------------------------------
insert into public.carts (id, session_id) values
  ('00000000-0000-0000-0000-000000000040', 'sess-seed-1')
on conflict (id) do nothing;

-- ------------------------------------------------------------------
-- 6) SEED AUTH IDENTITIES (for reviews)
-- ------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000101', 'seed-reviewer-1@trino.local', now(), '{"provider":"seed","providers":["seed"]}', '{"full_name":"Seed Reviewer 1"}'),
  ('00000000-0000-0000-0000-000000000102', 'seed-reviewer-2@trino.local', now(), '{"provider":"seed","providers":["seed"]}', '{"full_name":"Seed Reviewer 2"}')
on conflict (id) do nothing;

-- ------------------------------------------------------------------
-- 7) REVIEWS
-- ------------------------------------------------------------------
insert into public.reviews (id, product_id, user_id, rating, title, body, status) values
  ('00000000-0000-0000-0000-000000000030', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000101', 5, 'Excelente', 'Me encanto', 'approved'),
  ('00000000-0000-0000-0000-000000000031', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000102', 1, 'Malo', 'No me gusto', 'rejected'),
  ('00000000-0000-0000-0000-000000000032', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000101', 3, 'Ok', 'Regular', 'pending')
on conflict (id) do nothing;

-- ------------------------------------------------------------------
-- 8) UPDATE SEARCH VECTORS
-- ------------------------------------------------------------------
update public.products p
set search_vector = to_tsvector(
  'spanish',
  coalesce(t.name, '') || ' ' ||
  coalesce(t.description, '') || ' ' ||
  coalesce(p.brand, '') || ' ' ||
  coalesce(p.subcategory, '')
)
from public.product_translations t
where t.product_id = p.id and t.locale = 'es-AR';

update public.editorial_posts
set search_vector = to_tsvector(
  'spanish',
  coalesce(title, '') || ' ' ||
  coalesce(excerpt, '') || ' ' ||
  coalesce(body::text, '') || ' ' ||
  array_to_string(coalesce(tags, '{}'), ' ')
);