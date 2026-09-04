'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { culturaSchema } from '@/lib/validations/cultura';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') return { ok: false, status: 403 as const, supabase };
  const isAdmin = await supabase.rpc('is_admin').then((r) => r.data);
  if (!isAdmin) return { ok: false, status: 403 as const, supabase };
  return { ok: true, status: 200 as const, supabase };
}

export async function createCultura(input: unknown) {
  const parsed = culturaSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten(), status: 422 };
  const admin = await requireAdmin();
  if (!admin.ok) return { error: 'forbidden', status: 403 };
  const { data, error } = await admin.supabase
    .from('cultura_posts')
    .insert({ ...parsed.data, search_vector: undefined })
    .select('id, slug')
    .single();
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/cultura');
  return { data, status: 201 };
}

export async function updateCultura(id: string, input: unknown) {
  const parsed = culturaSchema.partial().safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten(), status: 422 };
  const admin = await requireAdmin();
  if (!admin.ok) return { error: 'forbidden', status: 403 };
  const { data, error } = await admin.supabase.from('cultura_posts').update(parsed.data).eq('id', id).select().single();
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/cultura');
  return { data, status: 200 };
}

export async function publishCultura(id: string) {
  const admin = await requireAdmin();
  if (!admin.ok) return { error: 'forbidden', status: 403 };
  const { data, error } = await admin.supabase
    .from('cultura_posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/cultura');
  return { data, status: 200 };
}

export async function deleteCultura(id: string) {
  const admin = await requireAdmin();
  if (!admin.ok) return { error: 'forbidden', status: 403 };
  const { error } = await admin.supabase.from('cultura_posts').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { error: error.message, status: 422 };
  revalidatePath('/cultura');
  return { status: 200 };
}
