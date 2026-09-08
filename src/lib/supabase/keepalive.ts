import { createClient } from '@/lib/supabase/server';
import { toTypedSupabase } from '@/lib/supabase/typed';

export async function performKeepalive(
  source = 'vercel-cron'
): Promise<{ ok: boolean; checkedAt: string }> {
  const db = toTypedSupabase(await createClient());
  const { error: pingError } = await db.rpc('keepalive_ping');
  if (pingError) {
    const { error: selectError } = await db.from('keepalive_logs').select('id').limit(1);
    if (selectError) throw selectError;
  }
  const checkedAt = new Date().toISOString();
  const { error } = await db
    .from('keepalive_logs')
    .insert({ source, status: 'ok', checked_at: checkedAt });
  if (error) throw error;
  return { ok: true, checkedAt };
}

export async function heartbeatSelectOne(): Promise<number> {
  const db = toTypedSupabase(await createClient());
  const { data, error } = await db.rpc('heartbeat_select_one');
  if (!error && typeof data === 'number') return data;
  const res = await db.from('keepalive_logs').select('id').limit(1);
  if (res.error) throw res.error;
  return 1;
}
