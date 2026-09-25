/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const signInWithPassword = vi.hoisted(() => vi.fn());
const signUp = vi.hoisted(() => vi.fn());
const verifyTurnstile = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: signInWithPassword,
      signUp: signUp,
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  })),
}));

vi.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('MOCK_REDIRECT');
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/proxy/turnstile', () => ({
  verifyTurnstile: verifyTurnstile,
}));

function fd(email = 'a@b.com', password = 'pass123', turnstile?: string): FormData {
  const d = new FormData();
  d.set('email', email);
  d.set('password', password);
  if (turnstile) d.set('cf-turnstile-response', turnstile);
  return d;
}

// A-01: Turnstile must be verified on the auth login/signup flow (CWE-799 /
// OWASP A07:2021 brute-force). Without a valid token the attempt is rejected and
// it must never reach the Supabase auth call.
describe('T-A01 auth flow verifies Turnstile (login/signup brute-force)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // fresh module per test so mock call state never leaks between cases
    vi.resetModules();
    await import('@/app/auth/actions');
  });

  it('login without a turnstile token is rejected and never calls signInWithPassword', async () => {
    verifyTurnstile.mockResolvedValue(false);
    const { login } = await import('@/app/auth/actions');
    const res = await login({}, fd());
    expect(res.error).toBeTruthy();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('login with an invalid turnstile token is rejected', async () => {
    verifyTurnstile.mockResolvedValue(false);
    const { login } = await import('@/app/auth/actions');
    const res = await login({}, fd('a@b.com', 'pass123', 'bad-token'));
    expect(res.error).toBeTruthy();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('login with a valid turnstile token proceeds to signInWithPassword', async () => {
    verifyTurnstile.mockResolvedValue(true);
    signInWithPassword.mockResolvedValue({ error: null });
    const { login } = await import('@/app/auth/actions');
    await expect(login({}, fd('a@b.com', 'pass123', 'good-token'))).rejects.toThrow(
      'MOCK_REDIRECT'
    );
    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });

  it('signup without a turnstile token is rejected and never calls signUp', async () => {
    verifyTurnstile.mockResolvedValue(false);
    const { signup } = await import('@/app/auth/actions');
    const res = await signup({}, fd('a@b.com', 'pass123'));
    expect(res.error).toBeTruthy();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('signup with a valid turnstile token proceeds to signUp', async () => {
    verifyTurnstile.mockResolvedValue(true);
    signUp.mockResolvedValue({ error: null });
    const { signup } = await import('@/app/auth/actions');
    const res = await signup({}, fd('a@b.com', 'pass123', 'good-token'));
    expect(res.ok).toBe(true);
    expect(signUp).toHaveBeenCalledTimes(1);
  });

  it('repeated login attempts without a token are all rejected (brute-force blocked)', async () => {
    verifyTurnstile.mockResolvedValue(false);
    const { login } = await import('@/app/auth/actions');
    for (let i = 0; i < 10; i++) {
      const res = await login({}, fd(`u${i}@b.com`, 'pass123'));
      expect(res.error).toBeTruthy();
    }
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});