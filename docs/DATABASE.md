# TRINO — Database Schema v1

> **Versión**: 1.0 (2026-11-27)
> **Proyecto**: `asbyqyxrpfggxjujfqte` (Supabase)
> **Región**: us-west-2
> **Stack**: PostgreSQL 17 + Supabase (Auth, Storage, Realtime, pg_cron, pg_net, pg_trgm)

---

## Resumen de Arquitectura

| Capa | Descripción |
|------|-------------|
| **Identidad** | `profiles` (1:1 auth.users), `entitlements` (RBAC 4-tier) |
| **Catálogo** | `products` + `product_variants` + `product_images` + `product_translations` |
| **Carrito** | `carts` (session/user) + `cart_items` + RPCs serializables |
| **Comercio** | `orders` (ENUM 9 estados) + `order_items` + `payments` + `order_events` |
| **Engagement** | `wishlists` (anon/user) + `reviews` + `product_avg_rating` view |
| **Contenido/Config** | `editorial_posts` (belleza), `global_settings` (legal por categoría) |
| **Plataforma** | `audit_logs`, `security_logs`, `processed_events`, `idempotency_keys` |

---

## Tablas por Dominio

### 1. Identidad y RBAC

#### `profiles`
| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | uuid | PK, FK → auth.users(id) ON DELETE CASCADE |
| `email` | text | NOT NULL |
| `full_name` | text | |
| `avatar_url` | text | |
| `phone` | text | |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |

**RLS**: Owner/super_admin read, owner write. Grants: SELECT anon/auth, INSERT/UPDATE auth.

#### `entitlements`
| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | uuid | PK DEFAULT gen_random_uuid() |
| `user_id` | uuid | NOT NULL FK → auth.users(id) ON DELETE CASCADE |
| `role` | text | NOT NULL CHECK ('super_admin','admin','editor','viewer') |
| `granted_at` | timestamptz | NOT NULL DEFAULT now() |
| **Unique** | | `(user_id, role)` |

**RLS**: Owner/super_admin read, super_admin mutate. Grants: SELECT anon/auth.

#### `has_role(target_role text)` → boolean
- **SECURITY DEFINER**, stable, search_path = public
- Jerarquía: super_admin (4 roles) > admin (3) > editor (2) > viewer (1)
- Usado en RLS en lugar de `IN SELECT` para evitar recursión
- Grants: EXECUTE anon, authenticated, service_role

---

### 2. Catálogo (Belleza)

#### `products` — Entidad comercial (1 fila por producto)
| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | uuid | PK DEFAULT gen_random_uuid() |
| `slug` | text | NOT NULL UNIQUE |
| `status` | text | NOT NULL DEFAULT 'draft' CHECK ('draft','published','archived') |
| `category` | text | NOT NULL CHECK ('ojos','labios','rostro','manicure','pestañas') |
| `subcategory` | text | NOT NULL CHECK ('sombras','delineadores','máscaras','labiales','gloss','esmaltes','herramientas') |
| `brand` | text | NOT NULL CHECK length 2-50 |
| `finish` | text | NOT NULL CHECK ('mate','satin','gloss','shimmer','metálico') |
| `base_price_cents` | integer | NOT NULL CHECK >= 0 |
| `currency` | char(3) | NOT NULL DEFAULT 'ARS' CHECK = 'ARS' |
| `search_vector` | tsvector | Para FTS (pg_trgm + GIN) |
| `created_at` / `updated_at` | timestamptz | DEFAULT now() |

**Índices**: Partial en category/subcategory/brand/finish/status=published + GIN en search_vector
**RLS**: Public read published; admin write

#### `product_variants` — SKU, precio, stock, shade (1 fila por variante)
| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | uuid | PK DEFAULT gen_random_uuid() |
| `product_id` | uuid | NOT NULL FK → products(id) ON DELETE CASCADE |
| `sku` | text | NOT NULL UNIQUE |
| `name` | text | NOT NULL (ej: "Berry", "01") |
| `shade` | text | NOT NULL CHECK hex sin # (`^[0-9a-f]{6}$`) |
| `price_cents` | integer | NOT NULL CHECK >= 0 |
| `sale_price_cents` | integer | CHECK < price_cents |
| `sale_start` / `sale_end` | timestamptz | Ventana de promo |
| `stock` | integer | NOT NULL DEFAULT 0 CHECK >= 0 |
| `currency` | char(3) | NOT NULL DEFAULT 'ARS' CHECK = 'ARS' |
| `is_active` | boolean | NOT NULL DEFAULT true |
| `created_at` / `updated_at` | timestamptz | DEFAULT now() |

**RLS**: Public read si product published + variant active; admin write

#### `product_images` — Galería ordenada por producto
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `product_id` | uuid FK → products CASCADE |
| `url` | text NOT NULL (Storage path: `products/{slug}/01.webp`) |
| `alt_text` | text |
| `position` | integer DEFAULT 0 |
| `created_at` | timestamptz |

**RLS**: Public read si product published; admin write

#### `product_translations` — i18n nombre/descripción/excerpt
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `product_id` | uuid FK → products CASCADE |
| `locale` | text NOT NULL CHECK ('es-AR','en','fr','pt-BR') |
| `name` | text NOT NULL |
| `description` | text |
| `excerpt` | text (meta description 20-155 chars) |
| `updated_at` | timestamptz DEFAULT now() |
| **Unique** | `(product_id, locale)` |

**RLS**: Public read si product published; admin write

---

### 3. Carrito (Persistencia Anónima + Merge)

#### `carts`
| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | uuid | PK DEFAULT gen_random_uuid() |
| `user_id` | uuid | FK → auth.users ON DELETE SET NULL |
| `session_id` | text | Anon session desde cookie httpOnly |
| `share_token` | uuid | UNIQUE DEFAULT gen_random_uuid() |
| `created_at` / `updated_at` | timestamptz | DEFAULT now() |
| **Check** | | `(user_id IS NOT NULL) XOR (session_id IS NOT NULL)` |

**Índices**: `idx_carts_user` (donde user_id IS NOT NULL), `idx_carts_session` (donde session_id IS NOT NULL)

#### `cart_items`
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `cart_id` | uuid FK → carts CASCADE |
| `variant_id` | uuid FK → product_variants CASCADE |
| `quantity` | integer NOT NULL DEFAULT 1 CHECK > 0 |
| `created_at` / `updated_at` | timestamptz |

**Unique**: `(cart_id, variant_id)` — merge automático de misma variante

**RLS**: Via cart ownership (user_id o session_id via JWT claim)

#### RPCs Serializables (SERIALIZABLE isolation)

**`add_to_cart_serializable(p_variant_id uuid, p_qty int, p_session_id text)` → json**
- Valida stock, crea carrito si no existe, merge misma variante capped at stock
- Grants: EXECUTE anon, authenticated

**`merge_cart_serializable(p_from_session text, p_user_id uuid)` → json**
- Merge carrito anon → user al loguear, suma cantidades capped at stock
- Elimina carrito anon tras merge
- Grants: EXECUTE authenticated

---

### 4. Comercio (Órdenes + Pagos)

#### ENUMs
```sql
CREATE TYPE order_status AS ENUM (
  'draft', 'pending', 'pending_verification', 'authorized',
  'processing', 'shipped', 'delivered', 'canceled', 'refunded'
);
CREATE TYPE payment_provider AS ENUM ('mercadopago', 'bank_transfer');
```

#### `orders`
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `user_id` | uuid FK → auth.users SET NULL |
| `session_id` | text (anon checkout) |
| `status` | order_status DEFAULT 'draft' |
| `subtotal_cents` / `shipping_cents` / `total_cents` | integer CHECK >= 0 |
| `currency` | char(3) DEFAULT 'ARS' CHECK = 'ARS' |
| `payment_provider` | payment_provider |
| `payment_id` | text (MP payment_id o bank ref) |
| `payment_status` | text (provider status) |
| `shipping_address` / `billing_address` | jsonb |
| `notes` | text |
| `idempotency_key` | text UNIQUE |
| `created_at` / `updated_at` | timestamptz |

#### `order_items`
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `order_id` | uuid FK → orders CASCADE |
| `variant_id` | uuid FK → product_variants RESTRICT |
| `product_name` / `variant_name` | text (snapshot at purchase) |
| `unit_price_cents` / `quantity` / `total_cents` | integer CHECK >= 0 |

#### `payments` (MercadoPago zero-PAN + Bank Transfer)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `order_id` | uuid FK → orders CASCADE |
| `provider` | payment_provider |
| `provider_payment_id` | text |
| `amount_cents` | integer CHECK > 0 |
| `currency` | char(3) DEFAULT 'ARS' |
| `status` | text (pending, approved, rejected, refunded) |
| `raw_payload` | jsonb (webhook payload, sin PAN) |
| `comprobante_path` | text (Storage path bank_proofs) |
| `processed_at` | timestamptz |

#### `order_events` — Audit trail transiciones
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `order_id` | uuid FK → orders CASCADE |
| `event_type` | text (status_change, payment_received, stock_held) |
| `old_status` / `new_status` | order_status |
| `actor_id` | uuid |
| `metadata` | jsonb |
| `created_at` | timestamptz |

#### Transition Guard
- `check_order_transition(old, new)` → boolean (SECURITY DEFINER)
- `enforce_order_transition()` trigger BEFORE UPDATE OF status
- Transiciones válidas: `draft→pending/canceled`, `pending→pending_verification/authorized/canceled`, `pending_verification→authorized/canceled`, `authorized→processing/canceled/refunded`, `processing→shipped/canceled`, `shipped→delivered/refunded`, `delivered→refunded`
- Inválido → exception `P0001` hint '422'

**RLS**: Owner (user_id/session_id) o super_admin; admin full access

---

### 5. Engagement

#### `wishlists` (Anon + User)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `user_id` | uuid FK → auth.users CASCADE |
| `session_id` | text (anon) |
| `product_id` | uuid FK → products CASCADE |
| `share_token` | uuid UNIQUE DEFAULT gen_random_uuid() |
| `created_at` | timestamptz |
| **Check** | `(user_id IS NOT NULL) XOR (session_id IS NOT NULL)` |
| **Unique** | `(user_id, product_id)`, `(session_id, product_id)` |

**RLS**: Owner (user_id/session_id) o super_admin; admin full

#### `reviews` (Solo verified purchasers, moderados)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `product_id` | uuid FK → products CASCADE |
| `user_id` | uuid FK → auth.users CASCADE |
| `order_id` | uuid FK → orders SET NULL |
| `rating` | smallint CHECK 1-5 |
| `title` | text CHECK length <= 120 |
| `body` | text |
| `images` | text[] DEFAULT '{}' (Storage paths reviews bucket) |
| `status` | text CHECK ('pending','approved','rejected') DEFAULT 'pending' |
| `helpful` | integer DEFAULT 0 |
| `verified_purchase` | boolean DEFAULT false |
| `created_at` / `updated_at` | timestamptz |

**RLS**: Public read approved; owner read all; admin read all; insert verified purchaser; update owner/admin; delete owner/admin

#### `product_avg_rating` View (security_invoker = true)
```sql
SELECT product_id, round(avg(rating)::numeric,2) as avg_rating, count(*) as review_count
FROM reviews WHERE status = 'approved' GROUP BY product_id;
```

#### RPC `increment_helpful(p_review_id uuid)` → json
- Atomic increment, solo authenticated, solo reviews approved
- Grants: EXECUTE authenticated; REVOKE anon

---

### 6. Contenido y Configuración

#### `editorial_posts` (Belleza: blog, guías, glossary)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `slug` | text UNIQUE |
| `locale` | text CHECK ('es-AR','en','fr','pt-BR') |
| `title` | text NOT NULL |
| `excerpt` | text (meta description) |
| `body` | jsonb NOT NULL (TipTap JSON) |
| `cover_image` | text (Storage path) |
| `status` | text CHECK ('draft','published','archived') DEFAULT 'draft' |
| `published_at` | timestamptz |
| `author_id` | uuid FK → auth.users SET NULL |
| `tags` | text[] DEFAULT '{}' |
| `related_product_ids` | uuid[] DEFAULT '{}' |
| `search_vector` | tsvector |
| `deleted_at` | timestamptz (soft delete) |
| `created_at` / `updated_at` | timestamptz |
| **Unique** | `(slug, locale)` |

**RLS**: Public read published + non-deleted; admin full

#### `global_settings` (Singleton — CMS legal/brand)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK DEFAULT gen_random_uuid() |
| `return_policy_by_category` | jsonb DEFAULT '{}' |
| `shipping_policy_by_category` | jsonb DEFAULT '{}' |
| `warranty_policy_by_category` | jsonb DEFAULT '{}' |
| `razon_social`, `cuit`, `condicion_fiscal`, `domicilio_legal`, `email_legal`, `telefono_legal` | text |
| `facturacion_tipo` | text CHECK ('A','B','C') |
| `facturacion_pto_vta`, `facturacion_cuit` | text |
| `brand_tokens` | jsonb DEFAULT '{}' (CSS variable overrides) |
| `flags` | jsonb DEFAULT '{}' (Feature flags) |
| `updated_by` | uuid FK → auth.users SET NULL |
| `updated_at` | timestamptz DEFAULT now() |
| **Unique Singleton** | `((true))` |

**RLS**: Public read; admin write

---

### 7. Plataforma / Auditoría

#### `audit_logs` (Admin mutations before/after)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `table_name` | text |
| `record_id` | uuid |
| `action` | text CHECK ('insert','update','delete') |
| `old_data` / `new_data` | jsonb |
| `user_id` | uuid FK → auth.users SET NULL |
| `created_at` | timestamptz |

**RLS**: Admin only; service_role INSERT

#### `security_logs` (Auth/rate-limit/RLS denials)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `event` | text (login_fail, rate_limit, rls_deny, turnstile_403, rbac_403) |
| `user_id` | uuid FK → auth.users SET NULL |
| `ip` | inet |
| `metadata` | jsonb |
| `created_at` | timestamptz |

**RLS**: Admin only; service_role INSERT

#### `processed_events` (Idempotency webhooks)
| Columna | Tipo |
|---------|------|
| `id` | text PK (provider event ID) |
| `created_at` | timestamptz |

#### `failed_webhooks_log` (DLQ)
| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `payload` | jsonb |
| `error` | text |
| `provider` | text |
| `event_id` | text |
| `retry_count` | integer DEFAULT 0 |
| `created_at` | timestamptz |

#### `idempotency_keys` (Client-provided safe retry)
| Columna | Tipo |
|---------|------|
| `key` | text PK |
| `created_at` | timestamptz |

**RLS**: Admin only; authenticated INSERT/SELECT own

---

## Storage Buckets

| Bucket | Público | Tamaño máx | MIME Types | Estructura |
|--------|---------|------------|------------|------------|
| `products` | ✅ Sí | 50 MB | `image/*` | `products/{slug}/01.webp` |
| `reviews` | ❌ No | 10 MB | `image/*`, `application/pdf` | `reviews/{user_id}/{uuid}.webp\|jpg\|pdf` |
| `bank_proofs` | ❌ No | 10 MB | `application/pdf`, `image/*` | `bank_proofs/{order_id}/{uuid}.pdf\|jpg` |

**Políticas RLS**: Owner (folder name = user_id/order_id) + admin; products público read

---

## Extensiones Habilitadas

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

---

## Jobs pg_cron (Configurados en migraciones)

| Job | Schedule | Descripción |
|-----|----------|-------------|
| `abandoned-cart-hourly` | `0 * * * *` | Log + QStash → `/api/cron/abandoned-cart` |
| `bank-pending-72h-cancel` | `0 * * * *` | Cancelar orders `pending_verification` > 72h |
| `keepalive-heartbeat` | `0 */6 * * *` | INSERT keepalive_logs + SELECT 1 |
| `cultura-sync-daily` | `0 6 * * *` | QStash → `/api/cron/cultura-sync` |
| `orphan-gc-weekly` | Weekly | Cleanup Storage objects orfanos > 1yr |

---

## Grants Data API (Explícitos)

```sql
-- Expuestos a anon/authenticated
GRANT SELECT ON products, product_variants, product_images, product_translations,
           editorial_posts, global_settings, profiles, entitlements, reviews
TO anon, authenticated;

-- Authenticated writes (RLS enforced)
GRANT INSERT, UPDATE ON profiles, carts, cart_items, wishlists, reviews
     TO authenticated;
GRANT INSERT ON orders, order_items, payments, idempotency_keys TO authenticated;

-- Service role (server-side)
GRANT ALL ON audit_logs, security_logs, processed_events, failed_webhooks_log, idempotency_keys
TO service_role;

-- Funciones RPC
GRANT EXECUTE ON FUNCTION has_role(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_to_cart_serializable(uuid, int, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION merge_cart_serializable(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_helpful(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_order_transition(order_status, order_status) TO authenticated, service_role;

-- Revoke anon en tablas internas
REVOKE ALL ON carts, cart_items, orders, order_items, payments, order_events,
           audit_logs, security_logs, processed_events, failed_webhooks_log,
           idempotency_keys, wishlists, reviews FROM anon;
```

---

## Seed (Beauty)

Ejecutar tras `db reset`:
```bash
pnpm db:seed  # o supabase db reset --local
```

Contiene:
- 3 productos (labial, paleta sombras, máscara) + 6 variantes + traducciones (4 locales) + imágenes
- 5 posts editorial (3 published, 1 draft, 1 deleted)
- 1 global_settings con políticas legales por categoría
- 1 wishlist anon, 1 cart anon, 3 reviews (approved/pending/rejected)

---

## Migraciones (Orden v1)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `20261126000000_enable_extensions.sql` | uuid, pg_trgm, pg_cron, pg_net |
| 2 | `20261126000001_identity_rbac.sql` | profiles, entitlements, has_role(), RLS |
| 3 | `20261126000002_catalog_core.sql` | products, variants, images, translations, FTS |
| 4 | `20261126000003_cart_persistence.sql` | carts, cart_items, RPCs serializables |
| 5 | `20261126000004_orders_payments.sql` | orders, items, payments, events, ENUMs, transitions |
| 6 | `20261126000005_engagement.sql` | wishlists, reviews, avg_rating view, RPC helpful |
| 6 | `20261126000006_content_config.sql` | editorial_posts, global_settings (legal) |
| 7 | `20261126000007_platform_audit.sql` | audit/security logs, processed_events, failed_webhooks, idempotency_keys |
| 8 | `20261126000008_storage_buckets.sql` | Buckets + policies RLS |
| 9 | `20261126000009_seed_beauty.sql` | Seed beauty (productos, editorial, settings) |
| 10 | `20261126000010_grants_exposure.sql` | Grants Data API + RPCs |

**Migraciones legacy archivadas**: `supabase/migrations/archive/0001_init.sql` … `0028_product_beauty_attributes.sql` (28 archivos)

---

## Operaciones Comunes

### Reset Local
```bash
supabase db reset --local
pnpm gen:types
pnpm typecheck && pnpm lint && pnpm test
```

### Push Remoto
```bash
npx supabase@latest db push --remote="postgresql://postgres:PASSWORD@db.asbyqyxrpfggxjujfqte.supabase.co:5432/postgres"
```

### Regenerar Types
```bash
pnpm gen:types  # usa local
# o remoto:
npx supabase@latest gen types typescript --remote --schema public > src/types/database.types.ts
```

---

## Notas de Migración (Legacy → v1)

| Legacy | v1 |
|--------|----|
| `products` (legacy: price numeric, is_active, category_id FK) | `products` + `product_variants` (price_cents, shade, stock, base_price_cents) |
| `categories` (legacy) | `products.category` + `products.subcategory` (text CHECK) |
| `makeup_products` / `makeup_categories` (staging) | **Eliminadas** — productos viven en `products` + `product_variants` |
| `cultura_posts` | `editorial_posts` (belleza, locale, tags, related_product_ids) |
| `fx_rates`, `launches`, `keepalive_logs` (business), `abandoned_cart_logs`, `perf_mutex` | **Eliminadas** (infra movida a platform_audit o removida) |
| `get_customer_360()` function / `customer_360` view | Tipo TS `Customer360` + app-level `getCustomer360()` |
| `cultura_posts` cron | `editorial_posts` sync via QStash/pg_cron |
| `has_role()` | Mismo nombre, SECURITY DEFINER, jerarquía 4-tier |

---

## Convenciones

- **Moneda**: Solo ARS, `*_cents` integer (1 ARS = 100 centavos)
- **Timestamps**: `timestamptz` (UTC), `created_at` / `updated_at` DEFAULT now()
- **Soft delete**: `deleted_at` timestamptz + `status = 'archived'`
- **IDs**: `uuid` DEFAULT `gen_random_uuid()`
- **Naming**: snake_case tablas/columnas, PascalCase tipos TS
- **RLS**: Deny-by-default, grants explícitos, `has_role()` SECURITY DEFINER
- **Grants**: Explícitos, anon SELECT solo tablas públicas expuestas

---

## Referencias

- **Plan de rebuild**: `docs/plans/PLAN-rebuild-database-v1.md`
- **Schema SQL**: `supabase/migrations/2026112600000*.sql`
- **Seed**: `supabase/seed.sql`
- **Types TS**: `src/types/database.types.ts` (regenerado con `pnpm gen:types`)
- **Proyecto Supabase**: `asbyqyxrpfggxjujfqte` (us-west-2)

---

*Documento generado automáticamente tras rebuild v1 — 2026-11-27*