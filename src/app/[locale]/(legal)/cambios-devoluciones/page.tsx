import { cuitForDisplay, getMerchantIdentity } from '@/lib/merchant/identity';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { routing } from '@/i18n/routing';

// Fetches via the cookie-bound supabase server client (session-aware), so it
// cannot be prerendered; force-dynamic keeps the static export from attempting it.
export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `https://trino.com.ar/${l}/cambios-devoluciones`;
  return {
    title: `Cambios y devoluciones — ${locale}`,
    description: 'Política de cambios 10 días Ley 24.240 art.34',
    alternates: { canonical: `https://trino.com.ar/${locale}/cambios-devoluciones`, languages },
    openGraph: { locale },
  };
}
export default async function CambiosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let policy: Record<string, unknown> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('global_settings')
      .select('return_policy_by_tipo')
      .limit(1)
      .maybeSingle();
    policy =
      (data as { return_policy_by_tipo?: Record<string, unknown> })?.return_policy_by_tipo ?? {};
  } catch (e) {
    logger.warn('legal policy fallback to static content', {
      route: 'legal/cambios',
      error: String(e),
    });
    policy = {};
  }
  const { cuit } = await getMerchantIdentity();
  const global_settings = 'global_settings.return_policy_by_tipo';
  return (
    <main lang={locale} className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Cambios y devoluciones — Ley 24.240 art.34 10 días</h1>
      <p className="mt-2 text-sm">
        global_settings return_policy_by_tipo CMS-01 never hardcoded {global_settings}
      </p>
      <section className="mt-6 space-y-3 text-sm leading-relaxed">
        <p>
          Tenés 10 días corridos desde la compra para arrepentirte (art.34 Ley 24.240, Res.424/2020,
          Res.244/21). Botón de arrepentimiento disponible en footer.
        </p>
        <p>
          Política por tipo: {JSON.stringify(policy)} — {cuitForDisplay(cuit)} — domicilio CABA
          Argentina — 0800-666-1518 Defensa del Consumidor.
        </p>
        <p>
          Condiciones: producto sin uso, embalaje original. Reintegro en mismo medio de pago. Costo
          de envío de devolución a cargo según tipo.
        </p>
        <p>Contacto: reclamos@santisimatrinidad.com.ar — 0800-666-1518.</p>
      </section>
      <p className="mt-4 text-xs text-zinc-600">
        hreflang alternates languages {routing.locales.join(', ')}
      </p>
    </main>
  );
}
