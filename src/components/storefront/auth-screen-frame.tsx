import { BadgeCheck, Check, LockKeyhole, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

const TICKER_ITEMS = [
  'CLUB TRINO · TU ESPACIO DE BELLEZA',
  'NOVEDADES Y FAVORITOS EN UN SOLO LUGAR',
  'ACCESO A TU CUENTA',
];

function BrandPanel() {
  return (
    <section
      data-purpose="auth-brand-panel"
      className="bg-pink border-ink text-ink flex flex-col justify-between gap-8 border-b-4 p-6 lg:col-span-5 lg:border-r-4 lg:border-b-0 lg:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="border-ink bg-cream shadow-pop-sm font-label rounded-control border-2 px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase">
          Club Trino
        </span>
        <BadgeCheck aria-hidden="true" className="text-ink size-7" />
      </div>

      <div
        aria-hidden="true"
        data-purpose="auth-brand-art"
        className="border-ink bg-lemon shadow-pop rounded-card relative h-52 overflow-hidden border-2"
      >
        <span className="border-ink bg-cream shadow-pop rounded-control absolute top-6 left-6 size-24 border-2" />
        <span className="border-ink bg-aqua shadow-pop absolute right-8 bottom-8 size-28 rotate-12 border-2" />
        <span className="border-ink bg-cobalt shadow-pop rounded-control absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 border-2" />
      </div>

      <div>
        <h2 className="font-display text-3xl leading-none">Belleza que hace ruido.</h2>
        <p className="font-body mt-2 text-sm">
          Ingresá para ver tus favoritos, tus pedidos y las novedades de tu cuenta.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {[
          'Tus favoritos en un solo lugar',
          'Novedades de drops y lanzamientos',
          'Seguimiento de tus pedidos',
        ].map((perk) => (
          <li key={perk} className="flex items-start gap-2.5">
            <Check
              aria-hidden="true"
              className="bg-lemon border-ink rounded-control mt-0.5 size-5 shrink-0 border-2 p-0.5"
            />
            <span className="font-body text-sm font-bold">{perk}</span>
          </li>
        ))}
      </ul>

      <p className="border-ink bg-cream shadow-pop-sm font-label rounded-control flex min-h-11 items-center gap-2 border-2 px-3 py-2 text-[11px] font-bold uppercase">
        <LockKeyhole aria-hidden="true" className="size-4 shrink-0" />
        Tu cuenta, siempre a mano
      </p>
    </section>
  );
}

export function AuthScreenFrame({
  mode,
  children,
}: {
  mode: 'login' | 'signup';
  children: ReactNode;
}) {
  const loginActive = mode === 'login';
  return (
    <div
      data-shell-type="web_standard"
      data-purpose="auth-frame"
      className="bg-cream text-ink w-full"
    >
      <div className="border-ink bg-ink text-cream border-b-2 px-4 py-2">
        <p className="font-label mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 text-[11px] font-bold tracking-widest uppercase">
          {TICKER_ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="text-lemon size-3.5" />
              {item}
            </span>
          ))}
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="border-ink bg-cream shadow-pop-lg rounded-card w-full max-w-5xl overflow-hidden border-4">
          <div className="border-ink bg-lemon flex items-center gap-2 border-b-4 px-6 py-3">
            <Sparkles aria-hidden="true" className="size-5 shrink-0" />
            <p className="font-label text-xs font-bold tracking-wider uppercase">
              Club Trino · Tus formularios, favoritos y pedidos en un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <BrandPanel />
            <section
              data-purpose="auth-form-panel"
              className="flex flex-col justify-between p-6 lg:col-span-7 lg:p-10"
            >
              <nav
                aria-label="Ingresar o crear cuenta"
                className="border-ink bg-cream shadow-pop rounded-control mb-8 grid grid-cols-2 gap-1 border-2 p-1"
              >
                <Link
                  href="/login"
                  aria-current={loginActive ? 'page' : undefined}
                  className={`font-label rounded-control flex min-h-11 items-center justify-center px-4 text-xs font-bold tracking-wider uppercase ${
                    loginActive ? 'bg-ink text-cream' : 'text-ink hover:bg-lemon'
                  }`}
                >
                  Ingresar
                </Link>
                <Link
                  href="/signup"
                  aria-current={loginActive ? undefined : 'page'}
                  className={`font-label rounded-control flex min-h-11 items-center justify-center px-4 text-xs font-bold tracking-wider uppercase ${
                    loginActive ? 'text-ink hover:bg-lemon' : 'bg-ink text-cream'
                  }`}
                >
                  Crear cuenta
                </Link>
              </nav>

              {children}

              <p className="font-body text-ink/70 mt-8 border-t-2 pt-4 text-center text-[11px]">
                Al continuar aceptás los términos y condiciones de trino. beauty.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
