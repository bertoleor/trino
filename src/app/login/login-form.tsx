'use client';

import { type AuthState, login } from '@/app/auth/actions';
import { useActionState, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthScreenFrame } from '@/components/storefront/auth-screen-frame';
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
    <AuthScreenFrame mode="login">
      <div data-purpose="auth-login">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          Bienvenida de vuelta<span className="text-pink">.</span>
        </h1>
        <p className="font-body text-ink/80 mt-2 text-sm">
          Ingresá tu correo y contraseña para acceder a tu cuenta.
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="font-label text-ink text-[11px] font-bold tracking-wider uppercase"
            >
              Tu email registrado
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              required
              placeholder="vos@ejemplo.com"
              className="border-ink bg-cream shadow-pop-sm text-ink placeholder:text-ink/50 focus:shadow-pop rounded-control font-body h-12 border-2 px-4"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="login-password"
                className="font-label text-ink text-[11px] font-bold tracking-wider uppercase"
              >
                Contraseña
              </label>
              <Link
                href="/es-AR/recuperar-contrasea"
                className="font-label text-ink hover:text-pink text-[10px] font-bold uppercase underline decoration-2"
              >
                ¿Olvidaste tu clave?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              name="password"
              required
              className="border-ink bg-cream shadow-pop-sm text-ink placeholder:text-ink/50 focus:shadow-pop rounded-control font-body h-12 border-2 px-4"
            />
          </div>

          <input type="hidden" name="cf-turnstile-response" value={token} />
          <TurnstileWidget
            key={widgetKey}
            onVerify={setToken}
            onExpire={() => setToken('')}
            onError={() => setToken('')}
          />

          {state.error ? (
            <p
              role="alert"
              className="border-ink bg-lemon shadow-pop-sm font-body rounded-control border-2 p-3 text-xs font-bold"
            >
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || !token}
            className="bg-ink text-cream border-ink shadow-pop-sm font-label hover:shadow-pop rounded-control flex h-14 min-h-11 items-center justify-center gap-3 border-2 text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Entrando…' : 'Continuar a mi cuenta'}
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </form>

        <p className="font-body text-ink/70 mt-8 border-t-2 pt-4 text-center text-sm">
          ¿No tenés cuenta?{' '}
          <Link
            href="/signup"
            className="text-ink hover:text-pink font-bold underline decoration-2"
          >
            Creá tu perfil
          </Link>
        </p>
      </div>
    </AuthScreenFrame>
  );
}
