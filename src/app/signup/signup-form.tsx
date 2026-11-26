'use client';

import { type AuthState, signup } from '@/app/auth/actions';
import { useActionState, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthScreenFrame } from '@/components/storefront/auth-screen-frame';
import Link from 'next/link';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signup, {});
  // A-01: same fail-closed turnstile flow as login — see login-form.tsx.
  const [token, setToken] = useState('');
  const [widgetKey, setWidgetKey] = useState(0);
  const [lastErrorHandled, setLastErrorHandled] = useState<string | null>(null);

  if (state.error && state.error !== lastErrorHandled) {
    setLastErrorHandled(state.error);
    setToken('');
    setWidgetKey((k) => k + 1);
  }

  if (state.ok) {
    return (
      <AuthScreenFrame mode="signup">
        <div data-purpose="auth-signup-success">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">
            Cuenta creada<span className="text-pink">.</span>
          </h1>
          <p className="font-body text-ink/80 mt-4 text-sm">{state.message}</p>
          <Link
            href="/login"
            className="bg-ink text-cream border-ink shadow-pop-sm font-label rounded-control mt-8 flex h-14 items-center justify-center gap-2 border-2 text-xs font-bold uppercase"
          >
            Ir a iniciar sesión
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </AuthScreenFrame>
    );
  }

  return (
    <AuthScreenFrame mode="signup">
      <div data-purpose="auth-signup">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          Unite al Trino Club<span className="text-pink">.</span>
        </h1>
        <p className="font-body text-ink/80 mt-2 text-sm">
          Creá tu perfil para guardar tus favoritos y seguir tus pedidos.
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-email"
              className="font-label text-ink text-[11px] font-bold tracking-wider uppercase"
            >
              Correo electrónico
            </label>
            <input
              id="signup-email"
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
                htmlFor="signup-password"
                className="font-label text-ink text-[11px] font-bold tracking-wider uppercase"
              >
                Crear contraseña
              </label>
              <span className="font-label text-ink/60 text-[10px] font-bold uppercase">
                Mínimo 6 caracteres
              </span>
            </div>
            <input
              id="signup-password"
              type="password"
              name="password"
              required
              minLength={6}
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
            className="bg-ink text-cream border-ink shadow-pop-sm font-label hover:shadow-pop rounded-control flex h-14 items-center justify-center gap-3 border-2 text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Creando…' : 'Crear mi cuenta'}
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </form>

        <p className="font-body text-ink/70 mt-8 border-t-2 pt-4 text-center text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-ink hover:text-pink font-bold underline decoration-2">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </AuthScreenFrame>
  );
}
