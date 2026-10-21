# DATABASE.md — Modelo de datos Santísima Trinidad

> **Fecha:** 2026-10-20 · **Autor:** 06-dba (rework B3 round 3, t_45480008) · **Motivo:** corregir los 6 findings del review round 1 y re-verificar todo contra `origin/main` (a1189df) y prod al 2026-10-20; reemplaza la versión de fb32a55 (`docs/19-writer-kickoff-docs`).
> **Búsqueda:** keywords: `database, data-model, migraciones, rls, security-definer, policies, orders, estados, carts, supabase` · clasificación: `referencia-técnica` · estado: `canónico` · actualizado: 2026-10-20
> **Canónico (rol 06-DBA).** Cambia el schema → actualizá este doc en el MISMO PR que la migración.
> **Fuentes verificadas (2026-10-20):** repo `origin/main` (migraciones 0001..0026) + prod ref `asbyqyxrpfggxjujfqte` vía Management API (`supabase_migrations`, `pg_policies`, `pg_proc`, `pg_tables`, `pg_constraint`). Cada sección cita el comando con el que se verificó.

## 1. Visión

- Repo `main`: **27 archivos** de migración numerados 0001..0026, con el prefijo **0023 duplicado** (ver §9).
- Prod (2026-10-20): registry `supabase_migrations` = **25 filas** (0001..0025); `0026_keepalive_rpc` aún sin aplicar.
- **21 tablas del modelo** en `public` = **14 de dominio + 7 técnicas**, más `perf_mutex` (lock de infra, §8) → `pg_tables` en prod da **22**.
- **RLS: 39 policies vivas en `public` + 3 en `storage.objects`** (bucket `reviews`) — reproducible por repo y por prod (§6).
- **17 funciones** en `public` (19 `create function` contando re-creaciones); **9 SECURITY DEFINER** en main y **10 vivas en prod** (divergencia en §5).
- Modelo de **e-commerce de productos físicos con auth dual** (registrado vía `auth.users` / anónimo vía `session_id`), **entitlements por rol** y flujo de pedido en **9 estados** con máquina de transiciones transaccional.

## 2. Dominios y tablas

Columna reconstruida con `git grep -in "create table" main -- supabase/migrations/`:

| Dominio | Tablas `public` | Nacen en | Después |
|---|---|---|---|
| Identidad/roles | `profiles`, `entitlements` | 0001, 0005 | — |
| Catálogo | `categories`, `products`, `product_variants`, `launches` | 0001, 0001, 0001, 0015 | 0003 softdelete/FTS en `products` |
| Carrito | `carts`, `cart_items` | 0006, 0001 | 0019→0023 RPC (§8) |
| Pedidos | `orders`, `order_items` | 0001, 0001 | 0007 estados (§4); 0020 checkout |
| Reviews / wishlist | `reviews`, `wishlists` | 0014, 0013 | 0025 `increment_helpful`; 0023 wishlist RLS re-fix |
| Contenido | `cultura_posts` | 0011 | 0018 OCC |
| Intl | `fx_rates` | 0016 | — |
| Técnica (7) | `audit_logs`, `security_logs`, `processed_events`, `failed_webhooks_log`, `abandoned_cart_logs`, `keepalive_logs`, `idempotency_keys` | 0004, 0004, 0005, 0005, 0008, 0009, 0020 | 0010 reafirma `keepalive_logs` (`IF NOT EXISTS`) |

Fuera del modelo (infra): `perf_mutex` (0021) — tabla de lock del retry serializable (§8). El conteo de `pg_tables` (22) la incluye.

## 3. Relaciones (FK)

```
auth.users ──┬── profiles(id)               [1:1, triggers on_auth_user_created_profile / _claims]
             └── entitlements(user_id)      [1:N, cascade]
            ─── carts(user_id|session_id)  [check: user_id OR session_id — admite ambos]
products ──┬── product_variants(product_id) [1:N]
           ├── order_items(product_variant_id) → product_variants(id)
           └── cart_items(variant_id) → product_variants(id)
categories ── products(category_id)         [N:1]
orders ── order_items(order_id)             [1:N]
```

El check de carts (0006) es **OR inclusivo, no exclusión mutua**: `check (user_id is not null or session_id is not null)` — admite ambos set. No hay XOR en ninguna migración (`git grep -i xor` = 0 hits). Mismo predicado en `cart_owner_check NOT VALID` de `cart_items`.

## 4. Estados de pedido (máquina transaccional, 9 estados)

`0007_order_enum.sql` — **9 estados**: `draft, pending, pending_verification, authorized, processing, shipped, delivered, canceled, refunded`. Implementación: CHECK `orders_status_check9 ... NOT VALID` + tabla de transiciones en `check_order_transition()` (no es un `create type` nativo).

- Grafo (verificado contra la función): `draft→pending` · `pending→pending_verification|authorized|canceled` · `pending_verification→authorized|canceled` · `authorized→processing|canceled|refunded` · `processing→shipped|canceled` · `shipped→delivered|refunded` · `delivered→refunded` · `draft→canceled`; mismo estado siempre permitido.
- `raise exception 'invalid_transition: % -> %'` (hint 422) si la transición es ilegal.
- Trigger `trg_orders_status_check` (BEFORE UPDATE of status) ejecuta `enforce_order_transition()`.
- `authorized` = legacy `paid`; `canceled` = legacy `cancelled` (backfill en la misma migración).

## 5. Auth, roles y SECURITY DEFINER

- Rol en `auth.users.app_metadata.role` (`'user' | 'admin'`), seteado por `set_user_role()`. **Nunca** en `user_metadata` (editable por el cliente, riesgo BOLA).
- `is_admin()` / `has_role()` = gates de las policies admin.

**SECURITY DEFINER en repo main (9)** — `git grep -in -B1 "security definer" main -- supabase/migrations/`:

| Función | Migración |
|---|---|
| `handle_new_user_claims`, `handle_new_user_profile`, `is_admin`, `set_user_role` | 0001 |
| `has_role`, `get_customer_360` | 0022 |
| `add_to_cart_serializable`, `merge_cart_serializable` | 0023 (PR #14) |
| `increment_helpful` | 0025 |

- Historia: las RPC de carrito nacieron INVOKER en 0019; 0023 (ya mergeado) las convirtió en SD con grants explícitos y autoridad derivada del JWT.
- **INVOKER (transaccionales normales):** `check_order_transition`, `enforce_order_transition` (0007) — la máquina de estados corre en el trigger del owner de la fila y no necesita SD. También `touch_updated_at`, `products_tsvector_update`, `update_cultura_occ`, `cultura_tsvector_update`.
- Regla: no agregar SECURITY DEFINER para bypassear RLS; cada SD con grants explícitos y `search_path` acotado.
- **Prod (2026-10-20): 10 SD vivas** — las 9 del repo + `rls_auto_enable`, que no existe en ninguna migración ni rama del repo (origen fuera de versionado; verificar procedencia antes de tocar RLS).
- Cuentas anónimas: carrito vía `session_id`; la policy "own carts" cubre user+admin y el flujo anónimo es app-layer (no hay policy por session en DB).

## 6. RLS por tabla (39 policies `public` + 3 `storage` — reproducible)

Dos caminos, mismo resultado (2026-10-20):

- Repo: `git grep -i "create policy\|drop policy" main -- supabase/migrations/` → 77 statements; aplicados en orden de archivo quedan **39 en `public` + 3 en `storage.objects`**.
- Prod: `select schemaname, tablename, policyname from pg_policies where schemaname in ('public','storage');` → 39 + 3.

| Tabla | Policies vivas |
|---|---|
| `profiles` (3) | insert/select/update own profile |
| `products` (3) | public read · admin write · admin write has_role (0022) |
| `categories`, `product_variants`, `launches`, `fx_rates` (2 c/u) | public read + admin write |
| `carts` (1), `cart_items` (1) | own carts / own cart |
| `orders` (2) | insert order · own orders |
| `order_items` (1) | items via order |
| `reviews` (4) | anon select approved · owner insert · admin select all · admin moderate (+ RPC `increment_helpful`, §5) |
| `wishlists` (4) | own select/insert/delete (0013) · `wishlists_owner_strict` (0023) |
| `entitlements` (1) | own select |
| `cultura_posts` (2) | anon select published · admin all |
| `keepalive_logs` (2) | service insert · admin select |
| `audit_logs` (2), `security_logs` (2) | insert service · select admin |
| `processed_events`, `failed_webhooks_log`, `abandoned_cart_logs` (1 c/u) | admin |
| `storage.objects` (3, bucket `reviews` de 0024) | owner upload/read/delete por carpeta `auth.uid()` — sin policy anónima (fail-closed) |

Nota histórica: la policy `wishlists_anon_session_all` de 0013 era `using (true)` — el re-fix 0023 la dropeó y reemplazó por `wishlists_owner_strict` (owner OR session-JWT OR admin). El "36 policies" de la versión anterior no era reproducible; el conteo vivo es 39 + 3.

Regla general: **tabla en `public` = RLS encendida + policy explícita**. Logs de webhook/eventos = solo service_role insert + admin select (sin exposición PostgREST).

## 7. Idempotencia y resiliencia (webhooks/pagos)

- `processed_events` (0005) → idempotencia de eventos de proveedor (PK = hash del evento).
- `idempotency_keys` (0020) → claves de idempotencia de operaciones mutantes del checkout.
- `failed_webhooks_log` (0005) → DLQ: payload crudo + error, para reproducir webhooks fallados.
- `audit_logs` / `security_logs` (0004) → pista de auditoría y eventos de seguridad.

## 8. Concurrencia (carts/orders)

- `add_to_cart_serializable`, `merge_cart_serializable` → nivel SERIALIZABLE + retry usando `perf_mutex` (0021, tabla de lock) para la condición de carrera multi-session del merge.
- `update_cultura_occ` / `cultura_tsvector_update` → OCC de micro-eventos de cultura (0011/0018).

## 9. Notas de mantenimiento

- **Numeración frágil (verificado 2026-10-20).** Prefijos duplicados/divergentes reales:
  - `0023` duplicado en main: `cart_rpc_reconcile` + `wishlist_rls_fix`.
  - `0025` divergente: main = `increment_helpful` (aplicada en prod sin registro; la función vive) vs registry prod = `0025_customer360_rls_fix.sql` (branch `fix/c360-rls`, aplicada a prod sin merge a main).
  - `0026_keepalive_rpc` en main aún sin aplicar.
  - Regla: antes de numerar una migración, verificar contra main Y el registry de prod — el deploy resuelve duplicados por orden lexical de nombre de archivo.
- Historia 0013: el repo llegó a tener dos `0013_*` (wishlist + wishlist_rls_fix); main lo resolvió renumerando el fix a 0023, pero el registry quedó con `0013 = 'wishlist_rls_fix'` (el nombre del archivo al momento del deploy) — renombrar migraciones ya aplicadas rompe la trazabilidad registry↔repo. El registry tampoco tiene fila propia para el wishlist re-fix aunque sus policies viven en prod → el conteo autoritativo de policies es `pg_policies`, no el registry.
- **down.sql / rollback:** hoy el repo NO tiene down.sql (`git ls-tree -r main:supabase | grep -i down` = vacío). Las migraciones son forward-only: el rollback real es una migración correctiva forward (patrón del repo: 0022 `client_warnings_fix`, 0023 `cart_rpc_reconcile`). Política de flota (docs-infaltables v2): las migraciones nuevas llevan `down.sql` referenciado desde este doc.
- Checks **NOT VALID** vivos en prod (2026-10-20): `orders_status_check9` (`orders`) y `cart_owner_check` (`cart_items`). Validar las filas existentes antes de hacer `VALIDATE CONSTRAINT`.
- Regenerar tipos tras cada migración: `supabase gen types typescript --project-id asbyqyxrpfggxjujfqte --schema public > src/types/database.types.ts`.
- Todo conteo de este doc es reproducible con el comando citado en su sección (fuentes: repo main + prod, 2026-10-20).
