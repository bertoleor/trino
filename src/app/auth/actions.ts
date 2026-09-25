'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { verifyTurnstile } from '@/lib/proxy/turnstile'

export type AuthState = { error?: string; ok?: boolean; message?: string }

// A-01 (CWE-799 / OWASP A07:2021): brute-force protection. login/signup are
// Server Actions and previously never ran Turnstile, so an attacker could
// hammer credentials with only the weak per-IP auth rate-limit in between. Pull
// the token from the `cf-turnstile-response` field the client Turnstile widget
// writes and fail-closed: no valid token means no auth attempt.
const TURNSTILE_FIELD = 'cf-turnstile-response'

async function turnstileBlocked(formData: FormData): Promise<boolean> {
  const token = String(formData.get(TURNSTILE_FIELD) ?? '')
  return !(await verifyTurnstile(token))
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (await turnstileBlocked(formData)) {
    return { error: 'Verificación anti-bot fallida. Intentá de nuevo.' }
  }

  const supabase = await createClient()

  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (await turnstileBlocked(formData)) {
    return { error: 'Verificación anti-bot fallida. Intentá de nuevo.' }
  }

  const supabase = await createClient()

  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  return { ok: true, message: 'Revisa tu email para confirmar la cuenta.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })
  if (error) return { error: error.message }
}
