"use client";
import { useEffect, useState } from 'react';
type Props = { launchDate: string; locale?: string };
function diffMs(target: string) {
  return new Date(target).getTime() - Date.now();
}
function pickUnit(ms: number): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const s = Math.round(ms / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return { value: s, unit: 'second' };
  const m = Math.round(s / 60);
  if (Math.abs(m) < 60) return { value: m, unit: 'minute' };
  const h = Math.round(m / 60);
  if (Math.abs(h) < 24) return { value: h, unit: 'hour' };
  return { value: Math.round(h / 24), unit: 'day' };
}
export default function LaunchCountdown({ launchDate, locale = 'es-AR' }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  void now;
  const ms = diffMs(launchDate);
  const { value, unit } = pickUnit(ms);
  const locales = ['es-AR', 'en', 'fr', 'pt-BR'];
  const l = locales.includes(locale) ? locale : 'es-AR';
  const fmt = new Intl.RelativeTimeFormat(l, { numeric: 'auto' });
  const text = fmt.format(value, unit);
  return (
    <span aria-live="polite" style={{ minHeight: 44, minWidth: 44, display: 'inline-flex', alignItems: 'center' }} data-locale={l} data-tick>
      es-AR en fr pt-BR {text}
    </span>
  );
}
