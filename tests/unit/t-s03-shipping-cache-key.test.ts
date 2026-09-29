import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// T-S03 (auditoría 34-auditor, S-03 MEDIUM, CWE-706/CWE-20): la cache key de
// shipping derivaba SOLO de la suma de pesos de items (weightHash = sum).
// Sets de items distintos con el mismo peso total colisionaban en la misma
// key: una quote calculada para un carrito se servía a otro (precio/ETA
// equivocados o stale). Mismo flaw en carriers/international.ts (hashItems).

describe('T-S03 shipping cache key: distinct carts must not collide', () => {
  beforeEach(() => {
    process.env.SHIPPING_INTERNATIONAL_ENABLED = 'false';
  });

  it('index.ts no deriva la cache key de la suma de pesos', () => {
    const c = read('src/lib/shipping/index.ts');
    expect(c).not.toMatch(/reduce\(\s*\(a\s*,\s*b\)\s*=>\s*a\s*\+\s*b\.weight/);
    expect(c).toMatch(/shippingHash/);
  });

  it('international.ts no deriva la cache key de la suma de pesos', () => {
    const c = read('src/lib/shipping/carriers/international.ts');
    expect(c).not.toMatch(/reduce\(\s*\(a\s*,\s*b\)\s*=>\s*a\s*\+\s*b\.weight/);
    expect(c).toMatch(/shippingHash/);
  });

  it('getShippingRates: carts with same total weight but different items get separate quotes', async () => {
    const { getShippingRates } = await import('@/lib/shipping');
    // Signal ya abortado: fetch rechaza al instante, todos los carriers
    // fallan y la respuesta es el fallback determinista. El oráculo es el
    // HIT/MISS de la capa de cache interna, no el precio.
    const signal = AbortSignal.abort();
    const cartA = [{ weight: 10 }, { weight: 10 }];
    const r1 = await getShippingRates({
      sessionId: 's03-a',
      postalCode: '1000',
      items: cartA,
      signal,
    });
    expect(r1.cache).toBe('MISS');

    // Carrito DISTINTO (1 item de 20 vs 2 de 10): mismo peso total.
    // Con weightHash=sum ambas llamadas comparten key y r2 roba la quote
    // cacheada de r1 (cache HIT). La key debe distinguir composición.
    const r2 = await getShippingRates({
      sessionId: 's03-a',
      postalCode: '1000',
      items: [{ weight: 20 }],
      signal,
    });
    expect(r2.cache).toBe('MISS');

    // Tercera llamada IGUAL al primer carrito: hit legítimo de la MISMA key.
    const r1again = await getShippingRates({
      sessionId: 's03-a',
      postalCode: '1000',
      items: cartA,
      signal,
    });
    expect(r1again.cache).toBe('HIT');
  });

  it('getInternationalRates: same total weight different items get separate quotes', async () => {
    const { getInternationalRates } = await import('@/lib/shipping/carriers/international');
    const cartA = [{ weight: 5 }, { weight: 5 }];
    const r1 = await getInternationalRates({
      country: 'US',
      postalCode: '1000',
      items: cartA,
    });
    expect(r1.cache).toBe('MISS');

    const r2 = await getInternationalRates({
      country: 'US',
      postalCode: '1000',
      items: [{ weight: 10 }],
    });
    expect(r2.cache).toBe('MISS');

    const r3 = await getInternationalRates({
      country: 'US',
      postalCode: '1000',
      items: cartA,
    });
    expect(r3.cache).toBe('HIT');
  });
});
