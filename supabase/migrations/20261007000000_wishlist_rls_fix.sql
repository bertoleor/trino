-- 0013_wishlist_rls_fix tighten RLS remove open policy
drop policy if exists "wishlists_anon_session_all" on public.wishlists;
create policy "wishlists_owner_strict" on public.wishlists for all using (auth.uid() = user_id or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id' or public.is_admin()) with check (auth.uid() = user_id or session_id = current_setting('request.jwt.claims', true)::jsonb->>'session_id' or public.is_admin());
-- ensure no open policy
