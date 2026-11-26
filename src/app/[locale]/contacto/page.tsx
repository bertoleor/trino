import * as Icons from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { StitchShell } from '@/components/layout/stitch-shell';
import { StorefrontFooter } from '@/components/storefront/storefront-footer';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { getTranslations } from 'next-intl/server';
import { localizedUrl } from '@/lib/seo/site';

const CARD = 'border-ink bg-cream shadow-pop border-[3px] p-5';
// prettier-ignore
const TAG = 'font-label border-ink bg-lemon text-ink shadow-pop-sm inline-block border-2 px-3 py-1 text-[10px] font-black tracking-wider uppercase';
// prettier-ignore
const BTN = 'font-label border-ink bg-ink text-cream shadow-pop-sm inline-flex min-h-11 items-center justify-center gap-2 border-2 px-5 text-xs font-bold uppercase';
// prettier-ignore
const LEMON = 'font-label border-ink bg-lemon text-ink shadow-pop-sm inline-flex min-h-11 items-center justify-between gap-2 border-2 px-4 text-xs font-bold uppercase';
const AQUA =
  'font-label border-ink bg-aqua shadow-pop-sm border-2 px-3 py-1 text-[11px] font-bold uppercase';
const LABEL = 'font-label text-ink text-xs font-bold uppercase';
const EYEBROW = 'font-label text-cobalt text-xs font-black tracking-widest uppercase';
// prettier-ignore
const INPUT = 'border-ink bg-cream text-ink placeholder:text-ink/60 min-h-11 w-full border-2 px-3 disabled:opacity-100';
// prettier-ignore
const SUMMARY = 'font-label flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-xs font-bold uppercase';
const CHANNELS = [
  { key: 'order', href: 'envios', Icon: Icons.Package },
  { key: 'changes', href: 'cambios-devoluciones', Icon: Icons.RefreshCcw },
  { key: 'partner', href: 'contacto#consulta', Icon: Icons.Store },
] as const;
const TOPICS = ['topicOrder', 'topicChanges', 'topicBrands'] as const;
const OPTIONS = [
  'formTopicDefault',
  'formTopicOrder',
  'formTopicProduct',
  'formTopicPartner',
  'formTopicOther',
] as const;
const FAQ = [
  { id: 'pedido', q: 'faqOrderQ', a: 'faqOrderA' },
  { id: 'entrega', q: 'faqDeliveryQ', a: 'faqDeliveryA' },
  { id: 'cambios', q: 'faqChangesQ', a: 'faqChangesA' },
  { id: 'colaboraciones', q: 'faqWholesaleQ', a: 'faqWholesaleA' },
  { id: 'tonos', q: 'faqToneQ', a: 'faqToneA' },
] as const;

function Field({
  label,
  placeholder,
  type = 'text',
  wide,
  area,
}: {
  label: string;
  placeholder: string;
  type?: 'text' | 'email';
  wide?: boolean;
  area?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-2${wide ? 'sm:col-span-2' : ''}`}>
      <span className={LABEL}>{label}</span>
      {area ? (
        <textarea rows={4} placeholder={placeholder} disabled className={`${INPUT} p-3`} />
      ) : (
        <input type={type} placeholder={placeholder} disabled className={INPUT} />
      )}
    </label>
  );
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.meta.contacto' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localizedUrl(locale, 'contacto') },
  };
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'storefrontExtra.contacto' });
  // prettier-ignore
  return (
    <StitchShell shellType="web_standard" header={<StorefrontHeader locale={locale} active="home" />} footer={<StorefrontFooter locale={locale} />} contentClassName="grid grid-cols-12 gap-6 px-6 py-10">
      <section data-purpose="contacto-hero" className={`${CARD} col-span-12 text-center md:p-10`}>
        <span className={TAG}>{t('badge')}</span>
        <h1 className="font-display mt-5 text-3xl font-semibold sm:text-5xl">{t('title')}</h1>
        <p className="font-body mx-auto mt-3 max-w-2xl text-sm">{t('description')}</p>
        <form className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
          <label className="flex-1 text-left"><span className="sr-only">{t('searchLabel')}</span><input type="search" placeholder={t('searchPlaceholder')} disabled className={INPUT} /></label>
          <button type="button" disabled className={BTN}><Icons.Search aria-hidden="true" className="h-4 w-4" />{t('searchLabel')}</button>
        </form>
        <p className="font-label mt-3 text-xs font-bold uppercase">{t('searchHint')}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">{TOPICS.map((key) => <Link key={key} href="#faq" className={AQUA}>{t(key)}</Link>)}</div>
      </section>
      <section data-purpose="contacto-canales" aria-labelledby="contacto-canales-titulo" className={`${CARD} col-span-12`}>
        <p className={EYEBROW}>{t('channelsEyebrow')}</p>
        <h2 id="contacto-canales-titulo" className="font-display mt-1 text-2xl font-semibold">{t('channelsTitle')}</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {CHANNELS.map(({ key, href, Icon }) => <article key={key} className={`${CARD} flex flex-col gap-3`}><Icon aria-hidden="true" className="text-cobalt h-6 w-6" /><h3 className="font-display text-xl font-semibold">{t(`${key}ChannelTitle`)}</h3><p className="font-body flex-1 text-sm">{t(`${key}ChannelBody`)}</p><Link href={`/${locale}/${href}`} className={LEMON}>{t(`${key}ChannelAction`)}<Icons.ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></article>)}
        </div>
      </section>
      <section data-purpose="contacto-consulta" id="consulta" className={`${CARD} col-span-12 lg:col-span-7`}>
        <p className={EYEBROW}>{t('formEyebrow')}</p>
        <h2 className="font-display mt-1 text-2xl font-semibold">{t('formTitle')}</h2>
        <p className="font-body mt-1 text-sm">{t('formDescription')}</p>
        <form className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2"><span className={LABEL}>{t('formTopicLabel')}</span><select disabled className="border-ink bg-cream min-h-11 w-full border-2 px-3">{OPTIONS.map((key) => <option key={key}>{t(key)}</option>)}</select></label>
          <Field label={t('formNameLabel')} placeholder={t('formNamePlaceholder')} />
          <Field label={t('formEmailLabel')} placeholder={t('formEmailPlaceholder')} type="email" />
          <Field label={t('formOrderLabel')} placeholder={t('formOrderPlaceholder')} />
          <Field label={t('formMessageLabel')} placeholder={t('formMessagePlaceholder')} wide area />
          <button type="button" disabled className={`${BTN} min-h-12 sm:col-span-2`}><Icons.Mail aria-hidden="true" className="h-4 w-4" />{t('formSubmit')}</button>
          <p className="font-body text-sm sm:col-span-2">{t('formNote')}</p>
        </form>
      </section>
      <section data-purpose="contacto-faq" id="faq" aria-labelledby="contacto-faq-titulo" className={`${CARD} col-span-12 lg:col-span-5`}>
        <p className={EYEBROW}>{t('faqEyebrow')}</p>
        <h2 id="contacto-faq-titulo" className="font-display mt-1 text-2xl font-semibold">{t('faqTitle')}</h2>
        <p className="font-body mt-1 text-sm">{t('faqDescription')}</p>
        <div className="mt-5 space-y-3">{FAQ.map((item, index) => <details key={item.id} id={`faq-${item.id}`} className="border-ink bg-cream border-2"><summary className={SUMMARY}><span className="text-cobalt">{String(index + 1).padStart(2, '0')}</span>{t(item.q)}</summary><p className="font-body border-ink border-t-2 p-3 text-sm">{t(item.a)}</p></details>)}</div>
      </section>
      <section data-purpose="contacto-cta" className={`${CARD} bg-cobalt text-cream col-span-12 md:flex md:items-center md:justify-between`}>
        <div><h2 className="font-display text-2xl font-semibold">{t('ctaTitle')}</h2><p className="font-body mt-1 text-sm">{t('ctaBody')}</p></div>
        <Link href={`/${locale}/tienda`} className={LEMON}>{t('ctaAction')}<Icons.ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </section>
    </StitchShell>
  );
}
