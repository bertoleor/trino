import { describe, it, expect } from 'vitest';

import type { OrderForLabel } from '@/lib/shipping/labels';

function makeOrders(count: number, postalCodes: string[]): OrderForLabel[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `order-${String(i).padStart(3, '0')}`,
    postal_code: postalCodes[i % postalCodes.length]!,
    recipient: `Recipient ${i}`,
  }));
}

describe('shipping labels W-07 groupByPostalCode + p-limit 10 A4/ZPL', () => {
  it('exports groupByPostalCode and createLabelsBatch', async () => {
    const m = await import('@/lib/shipping/labels');
    expect(typeof m.groupByPostalCode).toBe('function');
    expect(typeof m.createLabelsBatch).toBe('function');
  });

  it('groupByPostalCode groups 45 orders CP 1425+1426 correctly', async () => {
    const { groupByPostalCode } = await import('@/lib/shipping/labels');
    const orders = makeOrders(45, ['1425', '1426']);
    const grouped = groupByPostalCode(orders);
    expect(grouped.size).toBe(2);
    expect(grouped.get('1425')!.length).toBe(23);
    expect(grouped.get('1426')!.length).toBe(22);
    // all ids preserved
    const total = [...grouped.values()].reduce((a, b) => a + b.length, 0);
    expect(total).toBe(45);
  });

  it('groupByPostalCode single postal_code returns one group', async () => {
    const { groupByPostalCode } = await import('@/lib/shipping/labels');
    const orders = makeOrders(5, ['2000']);
    const grouped = groupByPostalCode(orders);
    expect(grouped.size).toBe(1);
    expect(grouped.get('2000')!.length).toBe(5);
  });

  it('groupByPostalCode empty returns empty map', async () => {
    const { groupByPostalCode } = await import('@/lib/shipping/labels');
    expect(groupByPostalCode([]).size).toBe(0);
  });

  it('createLabelsBatch ZPL returns ^XA per group concatenated', async () => {
    const { createLabelsBatch } = await import('@/lib/shipping/labels');
    const orders = makeOrders(4, ['1425', '1426', '1425', '1426']);
    const result = await createLabelsBatch(orders, 'ZPL');
    expect(result.groups.size).toBe(2);
    for (const [, blob] of result.groups) {
      expect(blob).toContain('^XA');
      expect(blob).toContain('^XZ');
    }
    // total blobs = number of orders
    const totalLabels = [...result.groups.values()].reduce((n, b) => n + (b.match(/\^XA/g) ?? []).length, 0);
    expect(totalLabels).toBe(4);
  });

  it('createLabelsBatch A4 returns PDF-like content one page per label', async () => {
    const { createLabelsBatch } = await import('@/lib/shipping/labels');
    const orders = makeOrders(3, ['1425']);
    const result = await createLabelsBatch(orders, 'A4');
    expect(result.groups.size).toBe(1);
    const blob = result.groups.get('1425')!;
    // A4 should contain page markers or PDF header
    expect(blob.length).toBeGreaterThan(0);
    expect(blob).toMatch(/%PDF|Page|1425/);
  });

  it('createLabelsBatch content-type differs A4 vs ZPL', async () => {
    const { createLabelsBatch } = await import('@/lib/shipping/labels');
    const orders = makeOrders(2, ['1425', '1426']);
    const zpl = await createLabelsBatch(orders, 'ZPL');
    const a4 = await createLabelsBatch(orders, 'A4');
    const zplBlob = [...zpl.groups.values()][0]!;
    const a4Blob = [...a4.groups.values()][0]!;
    expect(zplBlob).toContain('^XA');
    expect(a4Blob).not.toBe(zplBlob);
  });

  it('createLabelsBatch uses p-limit 10 concurrency spy', async () => {
    const { createLabelsBatch } = await import('@/lib/shipping/labels');
    const orders = makeOrders(30, ['1425', '1426', '2000']);
    let maxConcurrent = 0;
    let current = 0;
    const original = (globalThis as unknown as { setTimeout: typeof setTimeout }).setTimeout;

    // wrap with concurrency tracking via injected delay
    const result = await createLabelsBatch(orders, 'ZPL', {
      concurrency: 10,
      onGenerate: async () => {
        current++;
        maxConcurrent = Math.max(maxConcurrent, current);
        await new Promise<void>((r) => original(() => r(), 5));
        current--;
      },
    });
    expect(result.groups.size).toBe(3);
    expect(maxConcurrent).toBeLessThanOrEqual(10);
    expect(maxConcurrent).toBeGreaterThan(1);
  });

  it('createLabelsBatch grouped blobs count equals groups', async () => {
    const { createLabelsBatch } = await import('@/lib/shipping/labels');
    const orders = makeOrders(45, ['1425', '1426']);
    const result = await createLabelsBatch(orders, 'ZPL');
    expect(result.groups.size).toBe(2);
    // urls per group
    expect(result.urls.length).toBe(2);
    expect(result.urls.every((u) => typeof u === 'string' && u.length > 0)).toBe(true);
  });
});
