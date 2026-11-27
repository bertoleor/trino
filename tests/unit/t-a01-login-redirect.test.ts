import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Login must send admins to the protected panel, but never trust a redirect
// supplied by a caller when the signed-in user lacks the admin role.

type AuthFnMock = {
  auth: { signInWithPassword: ReturnType<typeof vi.fn> };
};

describe('A-01 login redirect after successful sign-in', () => {
  let supabaseMock: AuthFnMock;

  const loadLogin = async (role: string) => {
    vi.resetModules();
    supabaseMock = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { app_metadata: { role } } },
          error: null,
        }),
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
    vi.doMock('next/cache', () => ({ revalidatePath: vi.fn() }));
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown) => {
        if (!String(input).includes('challenges.cloudflare.com/turnstile')) {
          return new Response('{}', { status: 200 });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      })
    );
    return (await import('@/app/auth/actions')).login;
  };

  const formWith = (fields: Record<string, string>) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    return fd;
  };

  const redirectedTo = async (
    login: (state: { error?: string }, form: FormData) => Promise<unknown>,
    fields: Record<string, string>
  ): Promise<string | null> => {
    try {
      await login({}, formWith(fields));
      return null;
    } catch (err) {
      return String((err as Error).message).match(/NEXT_REDIRECT:(.*)/)?.[1] ?? null;
    }
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

  it('sends an admin to the validated, locale-stripped admin destination', async () => {
    const login = await loadLogin('admin');
    expect(
      await redirectedTo(login, {
        email: 'admin@b.com',
        password: 'secret123',
        'cf-turnstile-response': 'tok',
        redirect: '/es-AR/admin',
      })
    ).toBe('/admin');
  });

  it('ignores an admin redirect when the signed-in user is not an admin', async () => {
    const login = await loadLogin('viewer');
    expect(
      await redirectedTo(login, {
        email: 'viewer@b.com',
        password: 'secret123',
        'cf-turnstile-response': 'tok',
        redirect: '/es-AR/admin',
      })
    ).toBe('/account');
  });
});
