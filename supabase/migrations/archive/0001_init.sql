-- =============================================================
-- 0001_init.sql — Santísima Trinidad (productos físicos)
-- Schema base + RLS + custom claims (roles admin / user)
-- =============================================================

-- ------------------------------------------------------------------
-- 1) CUSTOM CLAIMS / ROLES
--    El rol vive en auth.users.app_metadata.role ('user' | 'admin').
--    Utilidades: handle_new_user (trigger) + is_admin() + set_role().
-- ------------------------------------------------------------------

-- Trigger: asignar rol 'user' por defecto al registrar (BEFORE para mutar meta).
create or replace function public.handle_new_user_claims()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) ||
                           jsonb_build_object('role', 'user');
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_claims on auth.users;
create trigger on_auth_user_created_claims
  before insert on auth.users
  for each row execute procedure public.handle_new_user_claims();

-- Trigger: crear el perfil después de insertar el user en auth (AFTER).
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

-- ¿El usuario actual es admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Promover/degresar rol (solo admins). Útil para el panel de admin.
create or replace function public.set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden: only admins can change roles';
  end if;
  if new_role not in ('user', 'admin') then
    raise exception 'Invalid role: %', new_role;
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) ||
        jsonb_build_object('role', new_role)
  where id = target_user_id;

  update public.profiles
  set role = new_role
  where id = target_user_id;
end;
$$;

-- ------------------------------------------------------------------
-- 2) TABLAS DE NEGOCIO
-- ------------------------------------------------------------------

-- Perfiles de usuario (1:1 con auth.users)
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          text not null default 'user'
                check (role in ('user', 'admin')),
  avatar_url    text,
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Categorías de productos
create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  slug         text not null unique,
  description  text,
  created_at   timestamptz not null default now()
);

-- Productos (físicos)
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null,
  slug          text not null unique,
  description   text,
  price         numeric(12, 2) not null check (price >= 0),
  image_url     text,
  is_active     boolean not null default true,
  featured      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Variantes de producto (talle/color + stock propio)
create table public.product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  name          text not null,          -- p.ej. "L", "Rojo"
  sku           text not null unique,
  price         numeric(12, 2) not null check (price >= 0),
  stock         integer not null default 0 check (stock >= 0),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Carrito (sesión del usuario)
create table public.cart_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  variant_id   uuid not null references public.product_variants(id) on delete cascade,
  quantity     integer not null default 1 check (quantity > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, variant_id)
);

-- Pedidos
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'pending'
                   check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  subtotal         numeric(12, 2) not null default 0,
  shipping         numeric(12, 2) not null default 0,
  total            numeric(12, 2) not null default 0,
  payment_provider text not null default 'mercadopago',
  payment_id       text,             -- ID de la transacción en MercadoPago
  shipping_address jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Líneas de pedido
create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  variant_id  uuid not null references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  unit_price  numeric(12, 2) not null,
  quantity    integer not null check (quantity > 0),
  total       numeric(12, 2) not null
);

-- ------------------------------------------------------------------
-- 3) ÍNDICES
-- ------------------------------------------------------------------
create index idx_products_category  on public.products(category_id);
create index idx_products_slug      on public.products(slug);
create index idx_variants_product   on public.product_variants(product_id);
create index idx_cart_user          on public.cart_items(user_id);
create index idx_orders_user        on public.orders(user_id);
create index idx_order_items_order  on public.order_items(order_id);

-- ------------------------------------------------------------------
-- 4) UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated   before update on public.profiles        for each row execute procedure public.touch_updated_at();
create trigger trg_products_updated   before update on public.products        for each row execute procedure public.touch_updated_at();
create trigger trg_cart_updated       before update on public.cart_items      for each row execute procedure public.touch_updated_at();
create trigger trg_orders_updated     before update on public.orders          for each row execute procedure public.touch_updated_at();

-- ------------------------------------------------------------------
-- 5) ROW LEVEL SECURITY
-- ------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.cart_items       enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;

-- --- profiles ---
-- Un usuario ve/edita su propio perfil; los admins ven todos.
create policy "select own profile"         on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "update own profile"         on public.profiles for update using (auth.uid() = id);
create policy "insert own profile"         on public.profiles for insert with check (auth.uid() = id);

-- --- categories / products / variants (catálogo público de lectura) ---
-- Lectura pública; escritura solo admin.
create policy "public read categories" on public.categories       for select using (true);
create policy "admin write categories" on public.categories       for all    using (public.is_admin()) with check (public.is_admin());

create policy "public read products"   on public.products         for select using (true);
create policy "admin write products"   on public.products         for all    using (public.is_admin()) with check (public.is_admin());

create policy "public read variants"   on public.product_variants for select using (true);
create policy "admin write variants"   on public.product_variants for all    using (public.is_admin()) with check (public.is_admin());

-- --- cart_items: cada usuario su propio carrito ---
create policy "own cart" on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --- orders: usuario ve/gestiona sus pedidos; admin ve todos ---
create policy "own orders"  on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "insert order" on public.orders for insert with check (auth.uid() = user_id);

-- --- order_items: hereda acceso por su order ---
create policy "items via order" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
