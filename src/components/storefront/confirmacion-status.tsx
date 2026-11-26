import { Box, Check, MapPin, Package, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const STEPS = [
  {
    marker: 'bg-aqua',
    time: 'bg-aqua',
    Icon: Check,
    titleKey: 'timeline.step1Title',
    timeKey: 'timeline.step1Time',
    bodyKey: 'timeline.step1Body',
  },
  {
    marker: 'bg-lemon',
    time: 'bg-orange',
    Icon: Package,
    titleKey: 'timeline.step2Title',
    timeKey: 'timeline.step2Time',
    bodyKey: 'timeline.step2Body',
  },
  {
    marker: 'bg-cream',
    time: 'bg-cream',
    Icon: Truck,
    titleKey: 'timeline.step3Title',
    timeKey: 'timeline.step3Time',
    bodyKey: 'timeline.step3Body',
  },
  {
    marker: 'bg-cream',
    time: 'bg-cream',
    Icon: Box,
    titleKey: 'timeline.step4Title',
    timeKey: 'timeline.step4Time',
    bodyKey: 'timeline.step4Body',
  },
] as const;

export async function ConfirmacionStatus({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkoutExtra.status' });

  return (
    <section
      data-purpose="confirmacion-status"
      aria-labelledby="confirmacion-status-title"
      className="border-ink bg-cream shadow-pop border-[3px] p-6"
    >
      <div className="border-ink flex flex-wrap items-center justify-between gap-3 border-b-[3px] pb-4">
        <div className="flex items-center gap-3">
          <span className="border-ink bg-lemon shadow-pop-sm flex h-12 w-12 shrink-0 items-center justify-center border-2">
            <Box aria-hidden="true" className="text-ink h-6 w-6" />
          </span>
          <div>
            <h2 id="confirmacion-status-title" className="font-display text-xl font-semibold">
              {t('title')}
            </h2>
            <p className="font-body text-xs opacity-80">{t('subtitle')}</p>
          </div>
        </div>
        <span className="font-label border-ink bg-lilac text-ink border-2 px-2 py-1 text-[10px] font-bold uppercase">
          {t('badge')}
        </span>
      </div>

      <ol className="before:bg-ink relative mt-6 space-y-6 pl-6 before:absolute before:top-3 before:bottom-3 before:left-3 before:w-[3px]">
        {STEPS.map((step) => (
          <li key={step.titleKey} className="relative flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`border-ink ${step.marker} rounded-control absolute -left-6 flex h-7 w-7 items-center justify-center border-2`}
            >
              <step.Icon className="text-ink h-4 w-4" />
            </span>
            <div className="border-ink bg-cream flex-1 border-2 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold">{t(step.titleKey)}</h3>
                <span
                  className={`font-label text-ink border-ink ${step.time} border px-2 py-0.5 text-[10px] font-bold uppercase`}
                >
                  {t(step.timeKey)}
                </span>
              </div>
              <p className="font-body mt-1 text-xs opacity-80">{t(step.bodyKey)}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-ink mt-6 grid gap-4 border-t-[3px] pt-5 md:grid-cols-2">
        <div className="border-ink bg-lemon border-2 p-4">
          <span className="font-label text-ink block text-[10px] font-bold uppercase">
            {t('delivery.title')}
          </span>
          <p className="font-display mt-2 text-sm font-semibold">{t('delivery.empty')}</p>
          <p className="font-body mt-1 text-xs">{t('delivery.hint')}</p>
          <MapPin aria-hidden="true" className="text-ink mt-3 h-5 w-5" />
        </div>
        <div className="border-ink bg-lemon border-2 p-4">
          <span className="font-label text-ink block text-[10px] font-bold uppercase">
            {t('operator.title')}
          </span>
          <p className="font-display mt-2 text-sm font-semibold">{t('operator.value')}</p>
          <p className="font-body mt-1 text-xs">{t('operator.hint')}</p>
          <span className="font-label border-ink bg-aqua text-ink mt-3 inline-block border px-2 py-0.5 text-[10px] font-bold uppercase">
            {t('operator.tag')}
          </span>
        </div>
      </div>
    </section>
  );
}
