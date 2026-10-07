-- 0024_review_image_storage.sql — S-14 (CWE-639/CWE-434/CWE-22): private `reviews`
-- bucket with owner-scoped storage policies, 5MB file limit and image mime
-- whitelist. Review image uploads are only possible through signed upload URLs
-- issued by getPresignedReviewImageUrl, which builds the path server-side as
-- reviews/{user_id}/{uuid}.{ext} — the client filename never reaches the path.
-- Settings converge on re-run (do update): this is a security boundary, the
-- secure config must win over any pre-existing manual tuning.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reviews', 'reviews', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Owner-scoped capability: first path segment is the auth user id, so a user
-- can only write/read/delete inside their own folder. No anon policy (fail-closed).
drop policy if exists "reviews_owner_upload" on storage.objects;
create policy "reviews_owner_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'reviews' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "reviews_owner_read" on storage.objects;
create policy "reviews_owner_read" on storage.objects for select to authenticated
  using (bucket_id = 'reviews' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "reviews_owner_delete" on storage.objects;
create policy "reviews_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'reviews' and (storage.foldername(name))[1] = auth.uid()::text);
