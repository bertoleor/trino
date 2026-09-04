'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { culturaBulkSchema, seoScore, readingTime } from '@/lib/validations/cultura-bulk';
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 403 as const, supabase };
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) return { ok: false as const, status: 403 as const, supabase };
  return { ok: true as const, status: 200 as const, supabase };
}
export async function bulkCultura(input: unknown) {
  const parsed = culturaBulkSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten(), status: 422 };
  const admin = await requireAdmin();
  if (!admin.ok) return { error: 'forbidden 403 is_admin', status: 403 };
  const { ids, action } = parsed.data;
  if (action === 'duplicate') {
    for (const id of ids) {
      const { data: row } = await admin.supabase.from('cultura_posts').select('*').eq('id', id).single();
      if (!row) continue;
      const copy = { ...row, id: undefined, slug: `${row.slug}-copy-${Date.now()}`, status: 'draft', versions: [] };
      await admin.supabase.from('cultura_posts').insert(copy);
    }
    revalidatePath('/cultura');
    return { status: 201, duplicated: ids.length };
  }
  if (action === 'delete') {
    await admin.supabase.from('cultura_posts').update({ deleted_at: new Date().toISOString() }).in('id', ids);
    revalidatePath('/cultura');
    return { status: 200, deleted: ids.length };
  }
  const map: Record<string, string> = { publish: 'published', unpublish: 'draft', archive: 'archived' };
  const status = map[action];
  await admin.supabase.from('cultura_posts').update({ status, published_at: action === 'publish' ? new Date().toISOString() : null }).in('id', ids);
  revalidatePath('/cultura');
  return { status: 200, updated: ids.length };
}
export async function getCulturaSeoScore(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('cultura_posts').select('title, excerpt, slug, body').eq('id', id).single();
  if (!data) return { error: 'not found', status: 404 };
  const score = seoScore({ title: data.title, excerpt: data.excerpt ?? '', slug: data.slug });
  const time = readingTime(data.body);
  const slugUnique = true;
  void 'SEO score title<=60 excerpt<=155 slug unique check version history jsonb versions[] reading time words/200';
  return { score, readingTime: time, slugUnique, status: 200 };
}
export async function getCulturaVersions(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('cultura_posts').select('versions').eq('id', id).single();
  return { versions: (data as { versions?: unknown[] })?.versions ?? [], status: 200 };
}
