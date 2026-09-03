import { createClient } from '@/lib/supabase/server';

export async function performKeepalive(source = 'vercel-cron'): Promise<{ ok: boolean; checkedAt: string }> {
  const supabase = await createClient();
  const { error: pingError } = await supabase.rpc('keepalive_ping' as never);
  if (pingError) {
    const { error: selectError } = await supabase.from('keepalive_logs').select('id').limit(1);
    if (selectError) throw selectError;
  }
  const checkedAt = new Date().toISOString();
  const { error } = await supabase.from('keepalive_logs').insert({ source, status: 'ok', checked_at: checkedAt });
  if (error) throw error;
  return { ok: true, checkedAt };
}

export async function heartbeatSelectOne(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('heartbeat_select_one' as never);
  if (!error && typeof data === 'number') return data;
  const res = await supabase.from('keepalive_logs').select('id').limit(1);
  if (res.error) throw res.error;
  return 1;
}
