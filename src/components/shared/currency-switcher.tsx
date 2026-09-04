"use client";
import { useState } from 'react';
import { formatFx } from '@/lib/money/fx';
type Props = { centsArs: number; locale?: string };
const options = ['ARS', 'USD', 'EUR', 'BRL'] as const;
export default function CurrencySwitcher({ centsArs, locale = 'es-AR' }: Props) {
  const [target, setTarget] = useState<(typeof options)[number]>('ARS');
  const [rate] = useState(0.001);
  const display = target === 'ARS' ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' }).format(centsArs / 100) : formatFx(centsArs, target as never, rate, locale);
  return (
    <div className="flex items-center gap-2">
      <select value={target} onChange={(e) => setTarget(e.target.value as never)} className="rounded border px-3 py-2" style={{ minHeight: 44, minWidth: 44 }} aria-label="currency switcher ARS USD EUR BRL">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{display}</span>
    </div>
  );
}
