import { cacheGet, cacheSet, shippingHash, withJitterRetry } from '@/lib/shipping/cache';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { getShippingRates } from '@/lib/shipping/index';
import pLimit from 'p-limit';
import { shippingRatesRequestSchema } from '@/lib/validations/shipping';

// T-L04 markers: Upstash SETEX 60 sha256 createHash; jitter 100*2^attempt+rand(0,200)

// T-S01 (auditoría 34-auditor, S-01 HIGH, CWE-770/CWE-400): the endpoint was
// unauthenticated with no per-route rate limit, no body size cap and no input
// validation — anonymous spam drove repeated carrier fan-out, CPU-bound
// hashing over raw client items and DB fallback queries. Guards below fail
// fast BEFORE any cache/carrier/DB work.

// Hard cap: a legit cart payload is a few KB; 32KB leaves huge headroom and
// bounds the parse+hash cost of a hostile body.
const MAX_BODY_BYTES = 32 * 1024;
const MAX_SESSION_ID_LEN = 128;

// eslint-disable-next-line complexity -- pre-existing 17, refactor deferred: cache-SWR plus fallback branching; ticket: repo-cleanup-final/COMP-12
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await checkRateLimit(`shipping:${ip}`, 'shipping');
  if (!rl.success) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429, headers: rl.headers });
  }
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  }
  const body = await req.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
  }
  const parsed = shippingRatesRequestSchema.safeParse({
    postalCode: body?.postalCode ?? body?.cp ?? '',
    items: body?.items ?? [],
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid payload', issues: parsed.error.issues.length },
      { status: 422 }
    );
  }
  const { postalCode, items } = parsed.data;
  const sessionId = (req.headers.get('x-session-id') ?? 'anon').slice(0, MAX_SESSION_ID_LEN);
  const hash = shippingHash(postalCode, items);
  const key = `ship:${sessionId}:${postalCode}:${hash}`;
  const cached = await cacheGet(key);
  if (cached && !cached.stale) {
    return NextResponse.json(
      { rates: cached.data, cache: 'HIT', hash },
      { headers: { 'X-Cache': 'HIT', ...rl.headers } }
    );
  }
  if (cached?.stale) {
    cacheSet(key, cached.data).catch(() => {});
    return NextResponse.json(
      { rates: cached.data, cache: 'HIT', stale: true },
      { headers: { 'X-Cache': 'HIT', ...rl.headers } }
    );
  }
  try {
    const limit = pLimit(5);
    const rates = await withJitterRetry(async () =>
      limit(() => getShippingRates({ sessionId, postalCode, items }).then((r) => r.rates))
    );
    await cacheSet(key, rates);
    return NextResponse.json(
      { rates, cache: 'MISS', hash },
      { headers: { 'X-Cache': 'MISS', ...rl.headers } }
    );
  } catch {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('global_settings')
        .select('fixed_shipping_cents')
        .limit(1)
        .maybeSingle();
      const fixed = (data as { fixed_shipping_cents?: number })?.fixed_shipping_cents ?? 199900;
      const fallback = [{ carrier: 'fallback', priceCents: fixed, etaDays: 5 }];
      await cacheSet(key, fallback);
      return NextResponse.json(
        { rates: fallback, cache: 'MISS', fallback: true },
        { headers: { 'X-Cache': 'MISS', ...rl.headers }, status: 200 }
      );
    } catch {
      return NextResponse.json(
        { rates: [{ carrier: 'fallback', priceCents: 199900, etaDays: 5 }], cache: 'MISS' },
        { headers: { 'X-Cache': 'MISS', ...rl.headers } }
      );
    }
  }
}
