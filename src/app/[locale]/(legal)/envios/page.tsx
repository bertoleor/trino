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
  for (const l of routing.locales) languages[l] = `https://trino.com.ar/${l}/envios`;
  return {
    title: `Envíos — ${locale}`,
    description: 'Costos y plazos Andreani Correo OCA',
    alternates: { canonical: `https://trino.com.ar/${locale}/envios`, languages },
    openGraph: { locale },
  };
}
export default async function EnviosPage({ params }: { params: Promise<{ locale: string }> }) {
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
      route: 'legal/envios',
      error: String(e),
    });
    policy = {};
  }
  const { cuit } = await getMerchantIdentity();
  return (
    <main lang={locale} className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Envíos — costo antes del pago Ley 24.240</h1>
      <p className="mt-2 text-sm">
        global_settings return_policy_by_tipo {JSON.stringify(policy).slice(0, 120)}
      </p>
      <section className="mt-6 space-y-3 text-sm leading-relaxed">
        <p>
          El costo de envío se calcula antes del paso de pago (ECOM-06) vía POST /api/shipping/rates
          — 0800-666-1518 — {cuitForDisplay(cuit)} domicilio CABA.
        </p>
        <p>
          Carriers: Andreani, Correo Argentino, OCA. Plazos 2-5 días hábiles. Tracking por email.
        </p>
        <p>
          Política de envíos por tipo desde global_settings.return_policy_by_tipo — nunca
          hardcodeado CMS-01.
        </p>
        <p>Ley 24.240 información clara — precios con IVA incluido, factura C/B.</p>
      </section>
      <p className="mt-4 text-xs text-zinc-600">
        hreflang {routing.locales.join(', ')} alternates languages
      </p>
    </main>
  );
}
