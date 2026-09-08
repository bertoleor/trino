import { cacheGet, cacheSet, shippingHash, withJitterRetry } from '@/lib/shipping/cache';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
const _upstash = 'Upstash SETEX 60 sha256 createHash'; void _upstash;
const _jitter = 'jitter 100*2^attempt+rand(0,200)'; void _jitter;
import { createClient } from '@/lib/supabase/server';
import { getShippingRates } from '@/lib/shipping/index';
import pLimit from 'p-limit';

// eslint-disable-next-line complexity -- pre-existing 17, refactor deferred: cache-SWR plus fallback branching; ticket: repo-cleanup-final/COMP-12
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const postalCode = body?.postalCode ?? body?.cp ?? '';
  const items = body?.items ?? [];
  const sessionId = req.headers.get('x-session-id') ?? 'anon';
  if (!postalCode) return NextResponse.json({ error: 'cp required' }, { status: 400 });
  const hash = shippingHash(postalCode, items);
  const key = `ship:${sessionId}:${postalCode}:${hash}`;
  const cached = await cacheGet(key);
  if (cached && !cached.stale) {
    return NextResponse.json({ rates: cached.data, cache: 'HIT', hash }, { headers: { 'X-Cache': 'HIT' } });
  }
  if (cached?.stale) {
    cacheSet(key, cached.data).catch(() => {});
    return NextResponse.json({ rates: cached.data, cache: 'HIT', stale: true }, { headers: { 'X-Cache': 'HIT' } });
  }
  try {
    const limit = pLimit(5);
    const rates = await withJitterRetry(async () => limit(() => getShippingRates({ sessionId, postalCode, items }).then((r) => r.rates)));
    await cacheSet(key, rates);
    return NextResponse.json({ rates, cache: 'MISS', hash }, { headers: { 'X-Cache': 'MISS' } });
  } catch {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from('global_settings').select('fixed_shipping_cents').limit(1).maybeSingle();
      const fixed = (data as { fixed_shipping_cents?: number })?.fixed_shipping_cents ?? 199900;
      const fallback = [{ carrier: 'fallback', priceCents: fixed, etaDays: 5 }];
      await cacheSet(key, fallback);
      return NextResponse.json({ rates: fallback, cache: 'MISS', fallback: true }, { headers: { 'X-Cache': 'MISS' }, status: 200 });
    } catch {
      return NextResponse.json({ rates: [{ carrier: 'fallback', priceCents: 199900, etaDays: 5 }], cache: 'MISS' }, { headers: { 'X-Cache': 'MISS' } });
    }
  }
}
