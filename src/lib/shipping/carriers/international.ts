import type { ShippingItem, ShippingRate } from '@/lib/shipping';

export const SHIPPING_INTERNATIONAL_ENABLED = process.env.SHIPPING_INTERNATIONAL_ENABLED === 'true';

const FIXED_INTL_CENTS = 499900;
const CACHE_TTL = 60;
const MEM = new Map<string, { data: ShippingRate[]; exp: number }>();

function keyIntl(country: string, postalCode: string, hash: string) {
  return `ship:intl:${country}:${postalCode}:${hash}`;
}

function hashItems(items: ShippingItem[]) {
  return String(items.reduce((a, b) => a + b.weight, 0));
}

async function fetchDHL(
  country: string,
  postalCode: string,
  items: ShippingItem[],
  signal: AbortSignal
): Promise<ShippingRate[]> {
  const res = await fetch(`https://fake-dhl-ecommerce.example/rates`, {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ country, postalCode, items, customs: true }),
  });
  if (!res.ok) throw new Error(`DHL eCommerce fail ${res.status}`);
  return [{ carrier: 'dhl-ecommerce', priceCents: 350000 + items.length * 2000, etaDays: 12 }];
}

export async function getInternationalRates(opts: {
  postalCode: string;
  country: string;
  items: ShippingItem[];
  signal?: AbortSignal;
}): Promise<{ source: string; rates: ShippingRate[]; cache: string }> {
  const hash = hashItems(opts.items);
  const key = keyIntl(opts.country, opts.postalCode, hash);
  const hit = MEM.get(key);
  if (hit && hit.exp > Date.now()) return { source: 'cache', rates: hit.data, cache: 'HIT' };
  if (!SHIPPING_INTERNATIONAL_ENABLED) {
    const fallback: ShippingRate[] = [
      { carrier: 'fallback', priceCents: FIXED_INTL_CENTS, etaDays: 14 },
    ];
    MEM.set(key, { data: fallback, exp: Date.now() + CACHE_TTL * 1000 });
    return { source: 'fallback', rates: fallback, cache: 'MISS' };
  }
  const signal = opts.signal ?? AbortSignal.timeout(8000);
  try {
    const rates = await fetchDHL(opts.country, opts.postalCode, opts.items, signal);
    MEM.set(key, { data: rates, exp: Date.now() + CACHE_TTL * 1000 });
    return { source: 'dhl-ecommerce', rates, cache: 'MISS' };
  } catch {
    const fallback: ShippingRate[] = [
      { carrier: 'fallback', priceCents: FIXED_INTL_CENTS, etaDays: 14 },
    ];
    MEM.set(key, { data: fallback, exp: Date.now() + CACHE_TTL * 1000 });
    return { source: 'fallback', rates: fallback, cache: 'MISS' };
  }
}

export const INTL_FIXED = FIXED_INTL_CENTS;
