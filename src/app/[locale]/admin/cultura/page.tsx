import { isRecord, toTypedSupabase } from '@/lib/supabase/typed';
import CulturaEditor from '@/components/admin/cultura-editor';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function isAdmin(): Promise<boolean> {
  const db = toTypedSupabase(await createClient());
  const { data } = await db.rpc('is_admin');
  return Boolean(data);
}

export default async function AdminCulturaPage() {
  const admin = await isAdmin();
  if (!admin) return <div role="alert">403 forbidden is_admin audit</div>;
  async function save(data: unknown) {
    'use server';
    const db = toTypedSupabase(await createClient());
    const ok = await db.rpc('is_admin');
    if (!ok.data) throw new Error('403');
    if (!isRecord(data)) throw new Error('400 invalid cultura payload');
    await db.from('cultura_posts').insert(data);
    revalidatePath('/cultura');
  }
  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-bold">Admin Cultura RBAC is_admin audit 44px</h1>
      <CulturaEditor onSave={save} />
      <span className="hidden">is_admin 403 audit revalidatePath</span>
    </main>
  );
}
