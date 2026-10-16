'use server';

import { enqueueSecurityAudit, verifyTurnstile } from '@/lib/proxy/turnstile';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthState = { error?: string; ok?: boolean; message?: string };

// A-01: Server Actions post to the page URL, so the proxy cannot gate them by
// path — the Turnstile check must run INSIDE the action, fail-closed, before
// any credential check. Without this, the only brake on credential
// brute-force was the 5/15m auth rate-limit tier (bypassable via header
// spoofing per A-03/A-04). Source: audit A-01 (CWE-799 / OWASP A07:2021).

async function verifyAuthTurnstile(token: string): Promise<boolean> {
  const ok = await verifyTurnstile(token);
  if (!ok) {
    const hdrs = await headers();
    const ip = hdrs.get('x-forwarded-for') ?? 'unknown';
    const path = hdrs.get('x-matched-path') ?? '/login';
    enqueueSecurityAudit('turnstile_403', { ip, path }, process.env.NEXT_PUBLIC_SITE_URL);
  }
  return ok;
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  // Fail-closed: no token / invalid token => no signIn attempt, no user enum.
  const turnstileOk = await verifyAuthTurnstile(
    String(formData.get('cf-turnstile-response') ?? '')
  );
  if (!turnstileOk) return { error: 'Verificación captcha fallida. Intentá de nuevo.' };

  const supabase = await createClient();

  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/account');
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  // Fail-closed: no token / invalid token => no signUp attempt (blocks
  // scripted account-creation floods that the 5/15m tier alone would allow).
  const turnstileOk = await verifyAuthTurnstile(
    String(formData.get('cf-turnstile-response') ?? '')
  );
  if (!turnstileOk) return { error: 'Verificación captcha fallida. Intentá de nuevo.' };

  const supabase = await createClient();

  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  return { ok: true, message: 'Revisa tu email para confirmar la cuenta.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
}
