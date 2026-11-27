-- ============================================================
-- 20261126000008_storage_buckets.sql — Storage Buckets & Policies
-- products (public), reviews (private), bank_proofs (private).
-- Run via Supabase Dashboard or `supabase db reset` applies SQL,
-- but buckets are created via API. This migration documents the
-- intended config and sets RLS policies on storage.objects.
-- ============================================================

-- NOTE: Buckets themselves are created via Supabase Dashboard or
-- Management API. The SQL below configures RLS policies on
-- storage.objects for the three buckets once they exist.
--
-- Bucket creation (run once via Dashboard or `supabase storage`):
--   products      — public, 50MB, image/*
--   reviews       — private, 10MB, image/*, application/pdf
--   bank_proofs   — private, 10MB, application/pdf, image/*
--
-- Folder structure:
--   products/{slug}/01.webp, 02.webp, ...
--   reviews/{user_id}/{uuid}.webp|jpg|pdf
--   bank_proofs/{order_id}/{uuid}.pdf|jpg

-- ------------------------------------------------------------------
-- STORAGE POLICIES — applied to storage.objects
-- ------------------------------------------------------------------

-- PRODUCTS BUCKET — public read, admin write
-- Assumes bucket 'products' exists and is public.

-- Allow public read of product images
create policy "products_public_read"
  on storage.objects for select
  using (bucket_id = 'products');

-- Allow admin (service role) full access
create policy "products_admin_all"
  on storage.objects for all
  using (bucket_id = 'products' and public.has_role('admin'))
  with check (bucket_id = 'products' and public.has_role('admin'));

-- REVIEWS BUCKET — private, owner read/write/delete
-- Assumes bucket 'reviews' exists and is private.

-- Owner (user_id in path) can upload
create policy "reviews_owner_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'reviews'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can read own uploads
create policy "reviews_owner_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'reviews'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete own uploads
create policy "reviews_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'reviews'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin full access
create policy "reviews_admin_all"
  on storage.objects for all
  using (bucket_id = 'reviews' and public.has_role('admin'))
  with check (bucket_id = 'reviews' and public.has_role('admin'));

-- BANK PROOFS BUCKET — private, order owner + admin
-- Assumes bucket 'bank_proofs' exists and is private.

-- Order owner (user_id or session_id via order) can upload
-- The path is bank_proofs/{order_id}/{uuid}.pdf|jpg
-- Server Action verifies ownership before generating presigned URL.
create policy "bank_proofs_owner_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'bank_proofs'
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and (o.user_id = auth.uid()
             or o.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id')
    )
  );

-- Order owner can read
create policy "bank_proofs_owner_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'bank_proofs'
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and (o.user_id = auth.uid()
             or o.session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id')
    )
  );

-- Admin full access
create policy "bank_proofs_admin_all"
  on storage.objects for all
  using (bucket_id = 'bank_proofs' and public.has_role('admin'))
  with check (bucket_id = 'bank_proofs' and public.has_role('admin'));

-- ============================================================
-- ROLLBACK (documented)
-- ============================================================
-- drop policy if exists "bank_proofs_admin_all" on storage.objects;
-- drop policy if exists "bank_proofs_owner_read" on storage.objects;
-- drop policy if exists "bank_proofs_owner_upload" on storage.objects;
-- drop policy if exists "reviews_admin_all" on storage.objects;
-- drop policy if exists "reviews_owner_delete" on storage.objects;
-- drop policy if exists "reviews_owner_read" on storage.objects;
-- drop policy if exists "reviews_owner_upload" on storage.objects;
-- drop policy if exists "products_admin_all" on storage.objects;
-- drop policy if exists "products_public_read" on storage.objects;
--
-- Buckets deleted via Dashboard or Management API:
--   products, reviews, bank_proofs