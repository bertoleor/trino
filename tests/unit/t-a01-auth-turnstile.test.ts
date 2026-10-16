import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A-01: brute-force auth — Turnstile fail-closed verification inside the login/signup
// Server Actions + client widget wiring. Server Actions post to the page URL, so the
// proxy cannot gate them by path; the check must live inside the action (defense in
// depth with the 5/15m auth rate-limit tier that the proxy already enforces).

type CaptchaCall = { secret: string; response: string };

type AuthFnMock = {
  auth: { signInWithPassword: ReturnType<typeof vi.fn>; signUp: ReturnType<typeof vi.fn> };
};

describe('A-01 auth Server Actions verify Turnstile fail-closed', () => {
  const captchaCalls: CaptchaCall[] = [];
  let supabaseMock: AuthFnMock;

  const loadActions = async () => {
    vi.resetModules();
    captchaCalls.length = 0;
    supabaseMock = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        signUp: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn().mockResolvedValue(supabaseMock),
    }));
    vi.doMock('next/navigation', () => ({
      redirect: vi.fn((to: string) => {
        throw new Error(`NEXT_REDIRECT:${to}`);
      }),
    }));
    vi.doMock('next/headers', () => ({
      headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '203.0.113.10' })),
    }));
    vi.doMock('next/cache', () => ({
      revalidatePath: vi.fn(),
    }));
    // Siteverify fetch spy: default fail-closed unless the test flips it to success.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown, init?: RequestInit) => {
        const body = String(init?.body ?? '');
        const params = new URLSearchParams(body);
        captchaCalls.push({
          secret: params.get('secret') ?? '',
          response: params.get('response') ?? '',
        });
        return new Response(JSON.stringify({ success: false }), { status: 200 });
      })
    );
    return import('@/app/auth/actions');
  };

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
  });

  afterEach(() => {
    vi.doUnmock('@/lib/supabase/server');
    vi.doUnmock('next/navigation');
    vi.doUnmock('next/headers');
    vi.doUnmock('next/cache');
    vi.unstubAllGlobals();
    delete process.env.TURNSTILE_SECRET_KEY;
    vi.restoreAllMocks();
  });

  const formWith = (fields: Record<string, string>) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    return fd;
  };

  it('login rejects when the turnstile token is missing (fail-closed, no signIn call)', async () => {
    const { login } = await loadActions();
    const res = await login({}, formWith({ email: 'a@b.com', password: 'secret123' }));
    expect(res.error).toBeTruthy();
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(captchaCalls).toHaveLength(0);
  });

  it('login rejects when siteverify answers success:false (fail-closed, no signIn call)', async () => {
    const { login } = await loadActions();
    const res = await login(
      {},
      formWith({ email: 'a@b.com', password: 'secret123', 'cf-turnstile-response': 'tok' })
    );
    expect(res.error).toBeTruthy();
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(captchaCalls).toHaveLength(1);
    expect(captchaCalls[0]).toMatchObject({ secret: 'test-secret', response: 'tok' });
  });

  it('login proceeds to signInWithPassword only after a valid token (siteverify success:true)', async () => {
    const { login } = await loadActions();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      captchaCalls.push({ secret: 'test-secret', response: 'tok' });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });
    let redirected: string | null = null;
    try {
      await login(
        {},
        formWith({ email: 'a@b.com', password: 'secret123', 'cf-turnstile-response': 'tok' })
      );
    } catch (err) {
      redirected = String((err as Error).message).match(/NEXT_REDIRECT:(.*)/)?.[1] ?? null;
    }
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'secret123',
    });
    expect(redirected).toBe('/account');
  });

  it('signup rejects when the turnstile token is missing (fail-closed, no signUp call)', async () => {
    const { signup } = await loadActions();
    const res = await signup({}, formWith({ email: 'a@b.com', password: 'secret123' }));
    expect(res.error).toBeTruthy();
    expect(supabaseMock.auth.signUp).not.toHaveBeenCalled();
    expect(captchaCalls).toHaveLength(0);
  });

  it('signup rejects when siteverify answers success:false (fail-closed, no signUp call)', async () => {
    const { signup } = await loadActions();
    const res = await signup(
      {},
      formWith({ email: 'a@b.com', password: 'secret123', 'cf-turnstile-response': 'tok' })
    );
    expect(res.error).toBeTruthy();
    expect(supabaseMock.auth.signUp).not.toHaveBeenCalled();
    expect(captchaCalls).toHaveLength(1);
  });

  it('signup proceeds only after a valid token', async () => {
    const { signup } = await loadActions();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      captchaCalls.push({ secret: 'test-secret', response: 'tok' });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });
    const res = await signup(
      {},
      formWith({ email: 'a@b.com', password: 'secret123', 'cf-turnstile-response': 'tok' })
    );
    expect(supabaseMock.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'secret123',
    });
    expect(res.ok).toBe(true);
  });

  it('login is immune to the client honeypot trick — server verifies the real siteverify, not a dummy', async () => {
    // Regression: review-form sent 'dummy-turnstile' and proxy header check was the only gate.
    // The auth action must never accept a placeholder token without calling siteverify.
    const { login } = await loadActions();
    const res = await login(
      {},
      formWith({ email: 'a@b.com', password: 'secret123', 'cf-turnstile-response': 'dummy' })
    );
    expect(res.error).toBeTruthy();
    expect(captchaCalls).toHaveLength(1);
  });
});
