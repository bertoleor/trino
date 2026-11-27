import { BadgeCheck, LockKeyhole } from 'lucide-react';
import { destinationAfterLogin, safeRedirect } from '@/lib/auth/safe-redirect';
import { StaffLoginForm } from './staff-login-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type StaffLoginPageProps = { searchParams: Promise<{ redirect?: string | string[] }> };

export default async function StaffLoginPage({ searchParams }: StaffLoginPageProps) {
  const params = await searchParams;
  const requested =
    safeRedirect(Array.isArray(params.redirect) ? params.redirect[0] : params.redirect) ?? '/admin';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(destinationAfterLogin(requested, user.app_metadata?.role as string | undefined));
  }

  return (
    <main data-purpose="staff-login-page" className="bg-cream text-ink flex min-h-screen flex-col">
      <header className="border-ink bg-cream flex flex-wrap items-center justify-between gap-3 border-b-2 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-label text-xl font-extrabold tracking-tight uppercase">trino.</span>
          <span className="border-ink bg-ink text-cream font-label px-2 py-0.5 text-[10px] font-bold uppercase">
            HQ interno
          </span>
        </div>
        <p className="font-label text-ink/70 text-[10px] font-bold tracking-wider uppercase">
          Acceso restringido · solo equipo operativo
        </p>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="bg-lilac/10 pointer-events-none absolute inset-0 opacity-40" />

        <div className="border-ink bg-pink text-cream font-label shadow-pop hidden items-center gap-2 border-2 px-3 py-1 text-[10px] font-bold uppercase lg:absolute lg:top-8 lg:left-10 lg:flex lg:-rotate-2">
          <BadgeCheck aria-hidden="true" className="h-4 w-4" />
          Solo staff
        </div>
        <div className="border-ink bg-lilac text-ink font-label shadow-pop hidden items-center gap-2 border-2 px-3 py-1 text-[10px] font-bold uppercase lg:absolute lg:right-10 lg:bottom-8 lg:flex lg:rotate-2">
          <LockKeyhole aria-hidden="true" className="h-4 w-4" />
          Sesión auditada
        </div>

        <section className="border-ink bg-cream shadow-pop-lg rounded-card relative z-10 w-full max-w-xl border-4 p-6 sm:p-8">
          <div className="border-ink mb-6 flex flex-wrap items-center justify-between gap-2 border-b-2 pb-3">
            <span className="border-ink font-label flex items-center gap-2 rounded-full border-2 px-3 py-0.5 text-[10px] font-bold uppercase">
              <span className="bg-orange h-2 w-2 rounded-full" />
              Acceso restringido · HQ
            </span>
            <span className="font-label text-ink/70 text-[10px] font-bold uppercase">
              Catálogo · Stock · Logística
            </span>
          </div>

          <h1 className="font-label text-3xl leading-tight font-extrabold tracking-tight">
            Ingresar al HQ<span className="text-pink">.</span>
          </h1>
          <p className="font-body text-ink/80 mt-2 text-sm">
            Mesa de control de catálogo multimarca, stock en vivo, pedidos y logística de{' '}
            <strong className="text-ink font-bold">trino. beauty</strong>.
          </p>

          <StaffLoginForm redirectTo={requested} />
        </section>
      </div>

      <footer className="border-ink bg-cream flex flex-col gap-2 border-t-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-label text-ink/70 text-[10px] font-bold tracking-wider uppercase">
          Acceso restringido · equipo operativo y admin HQ
        </p>
        <p className="font-label text-ink/70 text-[10px] font-bold tracking-wider uppercase">
          © 2026 trino. beauty · Buenos Aires
        </p>
      </footer>
    </main>
  );
}
