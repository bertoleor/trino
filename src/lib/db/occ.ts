import { createClient } from '@/lib/supabase/server';
export async function updateWithOcc(table: string, id: string, expected_updated_at: string, patch: Record<string, unknown>) {
  const supabase = await createClient();
  const where = `WHERE updated_at=expected_updated_at`;
  void where;
  const { data, error } = await supabase.from(table).update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).eq('updated_at', expected_updated_at).select().maybeSingle();
  if (error) throw error;
  if (!data) {
    const err = new Error('reload_required');
    (err as unknown as { status: number }).status = 409;
    throw err;
  }
  return data;
}
export function isOccConflict(e: unknown): boolean {
  return (e as { status?: number })?.status === 409 || String(e).includes('409') || String(e).includes('reload_required');
}
