'use client';
import type { FxTarget } from '@/lib/money/fx';
import { formatFx } from '@/lib/money/fx';
import { useState } from 'react';
type Props = { centsArs: number; locale?: string };
const options = ['ARS', 'USD', 'EUR', 'BRL'] as const;
type CurrencyOption = (typeof options)[number];
export function isCurrencyTarget(value: string): value is FxTarget {
  return value === 'USD' || value === 'EUR' || value === 'BRL';
}
function narrowCurrencyOption(value: string): CurrencyOption {
  if (isCurrencyTarget(value) || value === 'ARS') return value;
  return 'ARS';
}
export default function CurrencySwitcher({ centsArs, locale = 'es-AR' }: Props) {
  const [target, setTarget] = useState<CurrencyOption>('ARS');
  const [rate] = useState(0.001);
  const display =
    target === 'ARS'
      ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS' }).format(centsArs / 100)
      : formatFx(centsArs, target, rate, locale);
  return (
    <div className="flex items-center gap-2">
      <select
        value={target}
        onChange={(e) => setTarget(narrowCurrencyOption(e.target.value))}
        className="rounded border px-3 py-2"
        style={{ minHeight: 44, minWidth: 44 }}
        aria-label="currency switcher ARS USD EUR BRL"
      >
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
