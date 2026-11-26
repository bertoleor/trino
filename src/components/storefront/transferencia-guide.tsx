import { ArrowRight, Compass, MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const STEPS = [
  {
    badge: '01',
    tone: 'bg-ink',
    text: 'text-cream',
    Icon: Compass,
    titleKey: 'steps.one.title',
    bodyKey: 'steps.one.body',
  },
  {
    badge: '02',
    tone: 'bg-orange',
    text: 'text-ink',
    Icon: ArrowRight,
    titleKey: 'steps.two.title',
    bodyKey: 'steps.two.body',
  },
  {
    badge: '03',
    tone: 'bg-aqua',
    text: 'text-ink',
    Icon: MessageCircle,
    titleKey: 'steps.three.title',
    bodyKey: 'steps.three.body',
  },
] as const;

export async function TransferenciaGuide({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'transferencia.guide' });

  return (
    <section
      data-purpose="transferencia-guide"
      aria-labelledby="transferencia-guide-title"
      className="border-ink bg-cream shadow-pop border-[3px] p-6"
    >
      <div className="border-ink flex items-center gap-2 border-b-[3px] pb-3">
        <Compass aria-hidden="true" className="text-ink h-5 w-5" />
        <h2 id="transferencia-guide-title" className="font-display text-sm font-semibold uppercase">
          {t('title')}
        </h2>
      </div>
      <ol className="mt-4 grid gap-3 md:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.badge} className="border-ink bg-lemon shadow-pop-sm border-2 p-3">
            <span
              aria-hidden="true"
              className={`border-ink ${step.tone} ${step.text} shadow-pop-sm flex h-8 w-8 items-center justify-center border-2 text-[10px] font-bold`}
            >
              {step.badge}
            </span>
            <h3 className="font-display text-ink mt-3 text-xs font-semibold uppercase">
              {t(step.titleKey)}
            </h3>
            <p className="font-body mt-1 text-[11px]">{t(step.bodyKey)}</p>
            <step.Icon aria-hidden="true" className="text-ink mt-3 h-4 w-4" />
          </li>
        ))}
      </ol>
    </section>
  );
}
