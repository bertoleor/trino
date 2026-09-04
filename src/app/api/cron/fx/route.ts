import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const frankfurter = 'https://api.frankfurter.app/latest?from=ARS&to=USD,EUR,BRL';
  let rates: Record<string, number> | null = null;
  try {
    const res = await fetch(frankfurter, { signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { rates?: Record<string, number> };
    rates = data.rates ?? null;
  } catch {}
  const supabase = await createClient();
  const fallback = await supabase.from('fx_rates').select('target,rate').order('fetched_at', { ascending: false }).limit(3);
  const last = (fallback.data ?? []) as { target: string; rate: number }[];
  if (!rates) {
    if (last.length > 0) return NextResponse.json({ ok: true, source: 'fallback last rate', rates: last, cache: 'upstash 24h 86400' });
    return NextResponse.json({ ok: false, fallback: 'last rate none' }, { status: 200 });
  }
  const rows = Object.entries(rates).map(([target, rate]) => ({ base: 'ARS', target, rate, source: 'frankfurter', fetched_at: new Date().toISOString() }));
  try {
    await supabase.from('fx_rates').insert(rows as never);
  } catch {}
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    await redis.set('fx_rates', JSON.stringify(rows), { ex: 86400 });
  } catch {}
  return NextResponse.json({ ok: true, source: 'frankfurter', rates: rows, cache: 'upstash 24h 86400 fallback last rate' });
}
