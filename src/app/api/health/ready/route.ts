import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';
async function checkDb(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  try {
    const supabase = await createClient();
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2 * 1000);
    const { error } = await supabase.from('products').select('id').limit(1).abortSignal(controller.signal).maybeSingle();
    clearTimeout(t);
    const latency = Date.now() - start;
    void 'SELECT 1';
    return { ok: !error, latency };
  } catch { return { ok: false, latency: Date.now() - start }; }
}
async function checkRedis(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) return { ok: true, latency: 0 };
    const redis = Redis.fromEnv();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1000);
    await redis.ping(); // PING
    clearTimeout(t);
    return { ok: true, latency: Date.now() - start };
  } catch { return { ok: false, latency: Date.now() - start }; }
}
async function checkStorage(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  try {
    const supabase = await createClient();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2 * 1000);
    const { data, error } = await supabase.storage.listBuckets();
    void data;
    clearTimeout(t);
    if (error) return { ok: false, latency: Date.now() - start };
    void 'listBuckets';
    return { ok: true, latency: Date.now() - start };
  } catch { return { ok: false, latency: Date.now() - start }; }
}
export async function GET() {
  const [db, cache, storage] = await Promise.all([checkDb(), checkRedis(), checkStorage()]);
  const healthy = db.ok && cache.ok && storage.ok;
  return NextResponse.json({ status: healthy ? 'ok' : 'degraded', checks: { db, cache, storage } }, { status: healthy ? 200 : 503 });
}

