import { createCircuitBreaker } from '@/lib/circuit';
import { logger } from '@/lib/logger';
import { shippingHash } from '@/lib/shipping/cache';

export type ShippingItem = { weight: number; dims?: { w: number; h: number; d: number } };
export type ShippingRate = { carrier: string; priceCents: number; etaDays: number };

const FIXED_CENTS = 199900;
const CACHE_TTL = 60;
const SWR = 300;
const MEM = new Map<string, { data: ShippingRate[]; exp: number }>();

export function ShippingCarrier(name: string) {
  const cb = createCircuitBreaker({
    failureThreshold: 3,
    windowMs: 60_000,
    probeMs: 30_000,
    timeoutMs: 8000,
  });
  return {
    name,
    cb,
    async getRates(
      postalCode: string,
      items: ShippingItem[],
      signal: AbortSignal
    ): Promise<ShippingRate[]> {
      if (!cb.canExecute()) throw new Error('circuit open');
      const res = await fetch(`https://fake-carrier.example/${name}/rates`, {
        method: 'POST',
        signal,
        body: JSON.stringify({ postalCode, items }),
      }).catch((e) => {
        cb.recordFailure();
        throw e;
      });
      if (!res.ok) {
        cb.recordFailure();
        throw new Error(`${name} fail ${res.status}`);
      }
      cb.recordSuccess();
      return [{ carrier: name, priceCents: 150000 + items.length * 1000, etaDays: 3 }];
    },
  };
}

const carriers = ['andreani', 'correo', 'oca'].map(ShippingCarrier);

function cacheKey(session: string, postalCode: string, hash: string) {
  return `ship:${session}:${postalCode}:${hash}`;
}

export async function getShippingRates(opts: {
  sessionId: string;
  postalCode: string;
  items: ShippingItem[];
  carrier?: string;
  signal?: AbortSignal;
}): Promise<{ source: string; rates: ShippingRate[]; cache: string }> {
  // T-S03 (auditoría 34-auditor, S-03 MEDIUM, CWE-706/CWE-20): the cache key
  // derived ONLY from the sum of item weights — distinct carts with equal
  // total weight collided and one cart was served another cart's quote
  // (wrong price/ETA or stale). Reuse the composition-sensitive sha256
  // shippingHash from cache.ts (S-01/S-04 lineage) so the internal lib
  // cache and the route-level cache key agree on identity.
  const hash = shippingHash(opts.postalCode, opts.items);
  const key = cacheKey(opts.sessionId, opts.postalCode, hash);
  const hit = MEM.get(key);
  if (hit && hit.exp > Date.now()) return { source: 'cache', rates: hit.data, cache: 'HIT' };
  const signal = opts.signal ?? AbortSignal.timeout(8000);
  const targets = opts.carrier ? carriers.filter((c) => c.name === opts.carrier) : carriers;
  for (const c of targets) {
    try {
      const rates = await c.getRates(opts.postalCode, opts.items, signal);
      MEM.set(key, { data: rates, exp: Date.now() + CACHE_TTL * 1000 });
      return { source: c.name, rates, cache: 'MISS' };
    } catch (e) {
      logger.warn('shipping carrier failed, trying next', {
        route: 'shipping/rates',
        error: String(e),
      });
    }
  }
  const fallback: ShippingRate[] = [{ carrier: 'fallback', priceCents: FIXED_CENTS, etaDays: 5 }];
  MEM.set(key, { data: fallback, exp: Date.now() + CACHE_TTL * 1000 });
  return { source: 'fallback', rates: fallback, cache: 'MISS' };
}

export const SHIPPING_CACHE = { ttl: CACHE_TTL, swr: SWR, fixed: FIXED_CENTS };
