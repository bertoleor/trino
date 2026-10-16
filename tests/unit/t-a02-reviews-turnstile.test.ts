import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A-02: the reviews form sent a hardcoded 'dummy-turnstile' token and nothing
// verified it; the proxy path-gate (/api/contact — a nonexistent route) read
// a header Server Actions cannot set, 403-blocking every POST while verifying
// nothing. The fix moved real verification INSIDE createReview, fail-closed,
// mirroring A-01 auth actions. This spec exercises that runtime contract.

const UUID = '123e4567-e89b-12d3-a456-426614174000';

type CaptchaCall = { secret: string; response: string };

function fromChain(result: { data?: unknown; error?: unknown }) {
  const pending = { data: result.data ?? null, error: result.error ?? null };
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => pending),
    single: vi.fn(async () => pending),
    limit: vi.fn(() => chain),
    insert: vi.fn(() => chain),
  };
  return chain;
}

describe('A-02 createReview verifies Turnstile fail-closed (runtime)', () => {
  const captchaCalls: CaptchaCall[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock
  let supabaseMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock
  let reviewsChain: any;

  const loadActions = async () => {
    vi.resetModules();
    captchaCalls.length = 0;
    reviewsChain = fromChain({ data: null });
    const ordersChain = fromChain({ data: [] });
    supabaseMock = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn((table: string) => (table === 'orders' ? ordersChain : reviewsChain)),
    };
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn().mockResolvedValue(supabaseMock),
    }));
    vi.doMock('@/lib/rate-limit', () => ({
      checkRateLimit: vi.fn().mockResolvedValue({ success: true, headers: {} }),
    }));
    vi.doMock('next/headers', () => ({
      headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '203.0.113.10' })),
    }));
    vi.doMock('next/cache', () => ({
      revalidatePath: vi.fn(),
    }));
    // Siteverify spy: fail-closed (success:false) unless the test flips it.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: unknown, init?: RequestInit) => {
        const params = new URLSearchParams(String(init?.body ?? ''));
        captchaCalls.push({
          secret: params.get('secret') ?? '',
          response: params.get('response') ?? '',
        });
        return new Response(JSON.stringify({ success: false }), { status: 200 });
      })
    );
    return import('@/lib/actions/reviews');
  };

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
  });

  afterEach(() => {
    vi.doUnmock('@/lib/supabase/server');
    vi.doUnmock('@/lib/rate-limit');
    vi.doUnmock('next/headers');
    vi.doUnmock('next/cache');
    vi.unstubAllGlobals();
    delete process.env.TURNSTILE_SECRET_KEY;
    vi.restoreAllMocks();
  });

  const input = () => ({
    product_id: UUID,
    rating: 5,
    title: 'Great',
    body: 'Nice product',
    images: [],
  });

  it('rejects a missing token (fail-closed): 403, no insert, no siteverify call', async () => {
    const { createReview } = await loadActions();
    const res = await createReview(input(), {});
    expect(res.status).toBe(403);
    expect(reviewsChain.insert).not.toHaveBeenCalled();
    expect(supabaseMock.auth.getUser).not.toHaveBeenCalled();
    expect(captchaCalls).toHaveLength(0);
  });

  it('rejects when siteverify answers success:false: 403, no insert, one siteverify call', async () => {
    const { createReview } = await loadActions();
    const res = await createReview(input(), { turnstileToken: 'tok' });
    expect(res.status).toBe(403);
    expect(reviewsChain.insert).not.toHaveBeenCalled();
    expect(captchaCalls).toHaveLength(1);
    expect(captchaCalls[0]).toMatchObject({ secret: 'test-secret', response: 'tok' });
  });

  it('never accepts the legacy placeholder "dummy-turnstile" (A-02 regression)', async () => {
    // The action must route ANY token through siteverify — no placeholder
    // shortcut, no allowlist.
    const { createReview } = await loadActions();
    const res = await createReview(input(), { turnstileToken: 'dummy-turnstile' });
    expect(res.status).toBe(403);
    expect(captchaCalls).toHaveLength(1);
    expect(captchaCalls[0]).toMatchObject({ response: 'dummy-turnstile' });
    expect(reviewsChain.insert).not.toHaveBeenCalled();
  });

  it('inserts the review only after a valid token (siteverify success:true)', async () => {
    const { createReview } = await loadActions();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      captchaCalls.push({ secret: 'test-secret', response: 'tok' });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });
    const res = await createReview(input(), { turnstileToken: 'tok' });
    expect(captchaCalls).toHaveLength(1);
    expect(reviewsChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: UUID, status: 'pending' })
    );
    expect(res.status).toBe(201);
  });

  it('keeps the cheap honeypot check FIRST (422, no siteverify, no captcha spend)', async () => {
    const { createReview } = await loadActions();
    const res = await createReview(input(), { honeypot: 'bot-bait', turnstileToken: 'tok' });
    expect(res.status).toBe(422);
    expect(captchaCalls).toHaveLength(0);
    expect(reviewsChain.insert).not.toHaveBeenCalled();
  });
});
