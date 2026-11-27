'use server';

import {
  type SecurityAuditEvent,
  enqueueSecurityAudit,
  verifyTurnstile,
} from '@/lib/proxy/turnstile';
import { destinationAfterLogin, safeRedirect } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthState = { error?: string; ok?: boolean; message?: string };

// Friendly messages for the Supabase errors users actually hit. The proxy owns
// the 5/15m auth rate limit; never duplicate it in module state (per-instance
// counters give a false sense of protection on serverless).
const AUTH_ERRORS: ReadonlyArray<[RegExp, string]> = [
  [
    /invalid (?:login )?credentials/,
    'Email o contraseña incorrectos. Por favor, verificá tus datos e intentá de nuevo.',
  ],
  [
    /email not confirmed/,
    'Primero tenés que confirmar tu email. Revisá tu bandeja de entrada o pedí un nuevo enlace.',
  ],
  [
    /too many failed attempts|rate limit/,
    'Tu cuenta está bloqueada por demasiados intentos fallidos. Esperá 15 minutos e intentá de nuevo.',
  ],
  [
    /user not found/,
    'No encontré una cuenta con ese email. ¿Te podés haber registrado con otro correo?',
  ],
  [/weak password/, 'La contraseña es demasiado débil. Elegí una de al menos 6 caracteres.'],
];

function mapSupabaseAuthError(message: string): string {
  const match = AUTH_ERRORS.find(([pattern]) => pattern.test(message.toLowerCase()));
  if (match) return match[1];
  return message.length > 100 ? `${message.slice(0, 100)}...` : message || 'Error desconocido.';
}

async function audit(event: SecurityAuditEvent): Promise<void> {
  const hdrs = await headers();
  enqueueSecurityAudit(
    event,
    {
      ip: hdrs.get('x-forwarded-for') ?? 'unknown',
      path: hdrs.get('x-matched-path') ?? '/auth',
    },
    process.env.NEXT_PUBLIC_SITE_URL
  );
}

// A-01: Server Actions post to the page URL, so the Turnstile check must run
// INSIDE the action, fail-closed, before any credential check.
async function verifyAuthTurnstile(token: string): Promise<boolean> {
  const ok = await verifyTurnstile(token);
  if (!ok) await audit('turnstile_403');
  return ok;
}

const CAPTCHA_ERROR = 'Verificación captcha fallida. Intentá de nuevo.';

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!(await verifyAuthTurnstile(String(formData.get('cf-turnstile-response') ?? '')))) {
    await audit('auth_login_failed_captcha');
    return { error: CAPTCHA_ERROR };
  }

  const supabase = await createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await audit('auth_login_failed_password');
    return { error: mapSupabaseAuthError(error.message) };
  }

  const role = data?.user?.app_metadata?.role as string | undefined;
  const requested = safeRedirect(String(formData.get('redirect') ?? ''));
  const destination = destinationAfterLogin(requested, role);

  await audit('auth_login_success');
  revalidatePath('/', 'layout');
  redirect(destination);
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!(await verifyAuthTurnstile(String(formData.get('cf-turnstile-response') ?? '')))) {
    await audit('auth_signup_failed_captcha');
    return { error: CAPTCHA_ERROR };
  }

  const supabase = await createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    await audit('auth_signup_failed');
    return { error: mapSupabaseAuthError(error.message) };
  }

  await audit('auth_signup_success');
  return { ok: true, message: 'Revisa tu email para confirmar la cuenta.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await audit('auth_signout');
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

  await audit('auth_google_oauth_attempt');
}
