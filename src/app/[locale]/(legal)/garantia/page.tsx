import { cuitForDisplay, getMerchantIdentity } from '@/lib/merchant/identity';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { routing } from '@/i18n/routing';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `https://trino.com.ar/${l}/garantia`;
  return {
    title: `Garantía — ${locale}`,
    description: 'Garantía legal 6 meses Ley 24.240',
    alternates: { canonical: `https://trino.com.ar/${locale}/garantia`, languages },
    openGraph: { locale },
  };
}
export default async function GarantiaPage({ params }: { params: Promise<{ locale: string }> }) {
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
      route: 'legal/garantia',
      error: String(e),
    });
    policy = {};
  }
  const { cuit } = await getMerchantIdentity();
  return (
    <main lang={locale} className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Garantía — Ley 24.240 6 meses</h1>
      <p className="mt-2 text-sm">
        global_settings return_policy_by_tipo {JSON.stringify(policy).slice(0, 120)}
      </p>
      <section className="mt-6 space-y-3 text-sm leading-relaxed">
        <p>
          Garantía legal mínima 6 meses (Ley 24.240). Falla de fabricación sin costo. 0800-666-1518
          — {cuitForDisplay(cuit)} domicilio CABA.
        </p>
        <p>
          Exclusiones: mal uso, desgaste normal. Ver por tipo en
          global_settings.return_policy_by_tipo CMS-01.
        </p>
        <p>Canje o reintegro. Botón arrepentimiento art.34 10 días aplicable.</p>
        <p>Contacto garantía: garantia@santisimatrinidad.com.ar</p>
      </section>
      <p className="mt-4 text-xs text-zinc-600">
        hreflang alternates languages {routing.locales.join(', ')}
      </p>
    </main>
  );
}
