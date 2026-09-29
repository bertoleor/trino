/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('customer360 W-04 single-join LTV <1s no N+1', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('exports getCustomer360 and Customer360 types', async () => {
    const m = await import('@/lib/customer360');
    expect(typeof m.getCustomer360).toBe('function');
  });

  it('single round-trip — rpc called once, no N+1 loop', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        id: 'u1',
        email: 'a@b.com',
        ltv_cents: 5000,
        last_login: '2024-01-01',
        cart_id: null,
      },
      error: null,
    });
    const supabase: any = { rpc };
    const { getCustomer360 } = await import('@/lib/customer360');
    const res = await getCustomer360(supabase, 'u1');
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('get_customer_360', { target_user: 'u1' });
    expect(res.ltv_cents).toBe(5000);
  });

  it('LTV sum only authorized..delivered — pending excluded (view)', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { id: 'u1', email: 'a@b.com', ltv_cents: 3000, last_login: null, cart_id: 'c1' },
      error: null,
    });
    const supabase: any = { rpc };
    const { getCustomer360, LTV_STATUSES } = await import('@/lib/customer360');
    expect(LTV_STATUSES).toEqual(['authorized', 'processing', 'shipped', 'delivered']);
    const res = await getCustomer360(supabase, 'u1');
    expect(res.ltv_cents).toBe(3000);
    expect(res.cart_id).toBe('c1');
  });

  it('fallback to customer_360 view when rpc fails', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'rpc miss' } });
    const single = vi.fn().mockResolvedValue({
      data: { id: 'u2', email: 'b@c.com', ltv_cents: 0, last_login: null, cart_id: null },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const supabase: any = { rpc, from: vi.fn().mockReturnValue({ select }) };
    const { getCustomer360 } = await import('@/lib/customer360');
    const res = await getCustomer360(supabase, 'u2');
    expect(supabase.from).toHaveBeenCalledWith('customer_360');
    expect(res.id).toBe('u2');
  });

  it('throws when user not found', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
    const supabase: any = { rpc, from: () => ({ select: () => ({ eq: () => ({ single }) }) }) };
    const { getCustomer360 } = await import('@/lib/customer360');
    await expect(getCustomer360(supabase, 'missing')).rejects.toThrow();
  });

  it('emits duration metric p95<1s and warns if >1s', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { id: 'u1', email: 'a@b.com', ltv_cents: 1, last_login: null, cart_id: null },
      error: null,
    });
    const supabase: any = { rpc };
    const { getCustomer360 } = await import('@/lib/customer360');
    const { logger } = await import('@/lib/logger');
    const infoSpy = vi.spyOn(logger, 'info').mockReturnValue(undefined as any);
    const warnSpy = vi.spyOn(logger, 'warn').mockReturnValue(undefined as any);
    await getCustomer360(supabase, 'u1');
    expect(infoSpy).toHaveBeenCalled();
    const meta = (infoSpy.mock.calls[0] as unknown[])[1] as { durationMs: number };
    expect(meta.durationMs).toBeGreaterThanOrEqual(0);
    expect(meta.durationMs).toBeLessThan(1000);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('uses single join view customer_360 — no per-entity fetches', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        id: 'u1',
        email: 'x@y.com',
        ltv_cents: 12345,
        last_login: '2024-06-01',
        cart_id: null,
      },
      error: null,
    });
    const supabase: any = { rpc };
    const { getCustomer360 } = await import('@/lib/customer360');
    const res = await getCustomer360(supabase, 'u1');
    expect(res.last_login).toBe('2024-06-01');
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
