'use client';

import { type AuthState, login } from '@/app/auth/actions';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});
  // A-01: the server verifies cf-turnstile-response fail-closed; the hidden
  // input carries the token the widget produced. Tokens are single-use, so
  // after a failed attempt we clear the token and remount the widget (key
  // bump) to force a fresh challenge. React-sanctioned "adjust state when a
  // tracked value changes" during render — no effect, no cascading renders.
  const [token, setToken] = useState('');
  const [widgetKey, setWidgetKey] = useState(0);
  const [lastErrorHandled, setLastErrorHandled] = useState<string | null>(null);

  if (state.error && state.error !== lastErrorHandled) {
    setLastErrorHandled(state.error);
    setToken('');
    setWidgetKey((k) => k + 1);
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-zinc-600">
        ¿No tenés cuenta?{' '}
        <Link href="/signup" className="underline">
          Registrate
        </Link>
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Contraseña</span>
          <input
            type="password"
            name="password"
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <input type="hidden" name="cf-turnstile-response" value={token} />
        <TurnstileWidget
          key={widgetKey}
          onVerify={setToken}
          onExpire={() => setToken('')}
          onError={() => setToken('')}
        />
        {state.error ? (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || !token}
          className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </>
  );
}
