import { ArrowRight, CreditCard, MapPin, PackageCheck, Sparkles, Truck } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function StorefrontFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'storefront' });
  const legal = [
    { key: 'footer.terms', href: `/${locale}/terms` },
    { key: 'footer.privacy', href: `/${locale}/privacy` },
    { key: 'footer.shipping', href: `/${locale}/envios` },
    { key: 'footer.returns', href: `/${locale}/cambios-devoluciones` },
  ];
  const catalog = [
    { key: 'nav.drops', href: `/${locale}/tienda` },
    { key: 'nav.lips', href: `/${locale}/tienda?category=labios` },
    { key: 'nav.face', href: `/${locale}/tienda?category=rostro` },
  ];
  return (
    <div id="contacto" className="grid gap-8 md:grid-cols-4">
      <div>
        <p className="font-display text-3xl font-semibold">
          trino<span className="text-pink">.</span>
        </p>
        <p className="font-body mt-3 max-w-xs text-sm">{t('footer.about')}</p>
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold uppercase">{t('footer.catalogTitle')}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {catalog.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className="inline-flex min-h-11 items-center gap-2">
                <ArrowRight aria-hidden="true" />
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold uppercase">{t('footer.helpTitle')}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {legal.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className="inline-flex min-h-11 items-center gap-2">
                <ArrowRight aria-hidden="true" />
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold uppercase">
          {t('footer.servicesTitle')}
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <Truck aria-hidden="true" />
            {t('trust.shipping.label')}
          </li>
          <li className="flex items-start gap-2">
            <MapPin aria-hidden="true" />
            {t('trust.pickup.label')}
          </li>
          <li className="flex items-start gap-2">
            <PackageCheck aria-hidden="true" />
            {t('trust.packaging.label')}
          </li>
          <li className="flex items-start gap-2">
            <CreditCard aria-hidden="true" />
            {t('trust.installments.label')}
          </li>
          <li className="flex items-start gap-2">
            <Sparkles aria-hidden="true" />
            {t('footer.aboutShort')}
          </li>
        </ul>
      </div>
      <p className="border-ink col-span-full border-t-2 pt-4 text-xs">{t('footer.copyright')}</p>
    </div>
  );
}
