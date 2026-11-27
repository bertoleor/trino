'use client';

import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { type AuthState, login } from '@/app/auth/actions';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';

const INPUT =
  'border-ink bg-cream text-ink placeholder:text-ink/50 font-body rounded-none border-2 focus-visible:outline-none';
const LABEL = 'font-label text-ink text-[11px] font-bold tracking-wider uppercase';

export function StaffLoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});
  const [token, setToken] = useState('');
  const [widgetKey, setWidgetKey] = useState(0);
  const [lastErrorHandled, setLastErrorHandled] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (state.error && state.error !== lastErrorHandled) {
    setLastErrorHandled(state.error);
    setToken('');
    setWidgetKey((k) => k + 1);
  }

  return (
    <>
      <form action={formAction} className="mt-7 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="staff-email" className={LABEL}>
              Correo operativo <span className="text-orange">*</span>
            </label>
            <span className="font-label text-ink/60 text-[10px]">@trinobeauty.com</span>
          </div>
          <div className="relative flex items-center">
            <span aria-hidden="true" className="text-ink/60 absolute left-3 text-xs font-bold">
              @
            </span>
            <input
              id="staff-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="vos@trinobeauty.com"
              className={`${INPUT} h-12 py-2 pr-4 pl-8`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="staff-password" className={LABEL}>
              Contraseña maestra <span className="text-orange">*</span>
            </label>
            <Link
              href="/es-AR/recuperar-contrasea"
              className="font-label text-ink text-[10px] font-bold uppercase underline decoration-2"
            >
              ¿Olvidaste tu clave?
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              id="staff-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Ingresá tu contraseña"
              className={`${INPUT} h-12 py-2 pr-12 pl-4 tracking-wider`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="hover:bg-cream absolute right-2 flex h-9 w-9 items-center justify-center"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="text-ink h-5 w-5" />
              ) : (
                <Eye aria-hidden="true" className="text-ink h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <input type="hidden" name="cf-turnstile-response" value={token} />
        <input type="hidden" name="redirect" value={redirectTo} />
        <TurnstileWidget
          key={widgetKey}
          onVerify={setToken}
          onExpire={() => setToken('')}
          onError={() => setToken('')}
        />

        {state.error ? (
          <p
            role="alert"
            className="border-orange bg-orange/10 text-orange font-body rounded-none border-2 p-3 text-xs font-bold"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="border-ink bg-ink text-cream hover:shadow-pop font-label flex w-full items-center justify-center gap-2 rounded-none border-2 px-6 py-3 text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-60"
        >
          {pending ? 'Validando...' : 'Ingresar al Panel Operativo'}
          {pending ? null : <ArrowRight aria-hidden="true" className="h-4 w-4" />}
        </button>
      </form>

      <div className="border-ink mt-6 flex items-start gap-3 border-2 p-4">
        <ShieldCheck aria-hidden="true" className="text-ink mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className={LABEL}>Verificación activa</p>
          <p className="font-body text-ink/80 mt-1 text-xs">
            Captcha y permisos por rol validados en el servidor antes de habilitar el panel.
          </p>
        </div>
      </div>

      <div className="border-ink/20 mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <span className="font-label text-ink/60 text-[10px] font-bold uppercase">
          ¿Sos clienta?
        </span>
        <Link
          href="/login"
          className="font-label text-ink text-[10px] font-bold uppercase underline"
        >
          Ir al acceso de clientas
        </Link>
      </div>
    </>
  );
}
