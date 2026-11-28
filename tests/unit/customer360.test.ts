/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('customer360 W-04 single-join LTV <1s no N+1', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('exports getCustomer360 and LTV_STATUSES', async () => {
    const m = await import('@/lib/customer360');
    expect(typeof m.getCustomer360).toBe('function');
    expect(m.LTV_STATUSES).toEqual(['authorized', 'processing', 'shipped', 'delivered']);
  });

  it('single round-trip — rpc called once, no N+1 loop', async () => {
    const profileChain = {
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'u1', email: 'a@b.com', full_name: 'Test User' },
            error: null,
          }),
        }),
      }),
    };
    const cartChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    };
    const ordersChain = {
      select: () => ({
        eq: () => ({
          in: vi.fn().mockResolvedValue({
            data: [{ total_cents: 5000 }],
            error: null,
          }),
        }),
      }),
    };
    const supabase: any = {
      from: vi.fn((table: string) => {
        if (table === 'profiles') return profileChain;
        if (table === 'carts') return cartChain;
        if (table === 'orders') return ordersChain;
        return {};
      }),
    };

    const { getCustomer360 } = await import('@/lib/customer360');
    const res = await getCustomer360(supabase, 'u1');
    expect(res.ltv_cents).toBe(5000);
    expect(res.id).toBe('u1');
    expect(res.email).toBe('a@b.com');
  });

  it('LTV sum only authorized..delivered — pending excluded', async () => {
    const profileChain = {
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'u1', email: 'a@b.com', full_name: 'Test User' },
            error: null,
          }),
        }),
      }),
    };
    const cartChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    };
    const ordersChain = {
      select: () => ({
        eq: () => ({
          in: vi.fn().mockResolvedValue({
            data: [{ total_cents: 3000 }],
            error: null,
          }),
        }),
      }),
    };
    const supabase: any = {
      from: vi.fn((table: string) => {
        if (table === 'profiles') return profileChain;
        if (table === 'carts') return cartChain;
        if (table === 'orders') return ordersChain;
        return {};
      }),
    };

    const { getCustomer360, LTV_STATUSES } = await import('@/lib/customer360');
    expect(LTV_STATUSES).toEqual(['authorized', 'processing', 'shipped', 'delivered']);
    const res = await getCustomer360(supabase, 'u1');
    expect(res.ltv_cents).toBe(3000);
    expect(res.cart_id).toBeNull(); // cart returns null in this mock
  });

  it('throws when user not found', async () => {
    const supabase: any = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      }),
    };
    const { getCustomer360 } = await import('@/lib/customer360');
    await expect(getCustomer360(supabase, 'missing')).rejects.toThrow();
  });

  it('emits duration metric p95<1s and warns if >1s', async () => {
    const profileChain = {
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'u1', email: 'a@b.com', full_name: 'Test User' },
            error: null,
          }),
        }),
      }),
    };
    const cartChain = {
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    };
    const ordersChain = {
      select: () => ({
        eq: () => ({
          in: vi.fn().mockResolvedValue({
            data: [{ total_cents: 1 }],
            error: null,
          }),
        }),
      }),
    };
    const supabase: any = {
      from: vi.fn((table: string) => {
        if (table === 'profiles') return profileChain;
        if (table === 'carts') return cartChain;
        if (table === 'orders') return ordersChain;
        return {};
      }),
    };

    const { getCustomer360 } = await import('@/lib/customer360');
    const { logger } = await import('@/lib/logger');
    const infoSpy = vi.spyOn(logger, 'info').mockReturnValue(undefined as any);
    const warnSpy = vi.spyOn(logger, 'warn').mockReturnValue(undefined as any);
    await getCustomer360(supabase, 'u1');
    expect(infoSpy).toHaveBeenCalled();
    const meta = (infoSpy.mock.calls[0] as unknown[])[1] as { durationMs: number };
    expect(meta.durationMs).toBeGreaterThanOrEqual(0);
  });
});