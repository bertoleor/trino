import { Check, KeyRound, type LucideIcon, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthTicker({ items }: { items: readonly string[] }) {
  return (
    <div data-purpose="auth-ticker" className="border-ink bg-ink text-cream border-b-2 px-4 py-2">
      <div className="font-label mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] font-bold tracking-widest uppercase">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="text-lemon size-3.5 shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AuthStepper({
  active,
  labels,
}: {
  active: 1 | 2 | 3;
  labels: readonly [string, string, string];
}) {
  return (
    <ol
      data-purpose="auth-stepper"
      className="font-label flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase"
    >
      {labels.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        const current = step === active;
        return (
          <li
            key={label}
            aria-current={current ? 'step' : undefined}
            className={`border-ink flex min-h-11 items-center gap-1.5 border-2 px-2.5 py-1.5 ${
              current ? 'bg-lemon text-ink shadow-pop-sm' : 'bg-cream text-ink/60'
            }`}
          >
            {current ? (
              <KeyRound aria-hidden="true" className="size-3.5" />
            ) : (
              <Check aria-hidden="true" className="size-3.5" />
            )}
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function AuthStepList({ steps }: { steps: readonly { title: string; body: string }[] }) {
  return (
    <ol className="mt-4 flex flex-col gap-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="border-ink bg-cream shadow-pop-sm rounded-card border-2 p-3"
        >
          <div className="flex items-start gap-3">
            <span className="border-ink bg-ink text-cream font-label flex size-7 shrink-0 items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <div>
              <h3 className="font-label text-ink text-xs font-bold uppercase">{step.title}</h3>
              <p className="font-body text-ink/80 mt-1 text-xs">{step.body}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function AuthInfoCard({
  icon: Icon,
  title,
  children,
  tone = 'bg-cream',
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  tone?: 'bg-cream' | 'bg-aqua' | 'bg-lemon' | 'bg-lilac';
}) {
  return (
    <div className={`border-ink ${tone} shadow-pop rounded-card border-2 p-5`}>
      <Icon aria-hidden="true" className="size-6" />
      <h2 className="font-display mt-3 text-lg">{title}</h2>
      <p className="font-body mt-2 text-xs font-bold">{children}</p>
    </div>
  );
}
