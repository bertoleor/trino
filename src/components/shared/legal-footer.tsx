import { cuitForDisplay, getMerchantIdentity, valueForDisplay } from '@/lib/merchant/identity';
import Link from 'next/link';

export default async function LegalFooter() {
  const identity = await getMerchantIdentity();
  const razonSocial = valueForDisplay(identity.razonSocial);
  const cuit = cuitForDisplay(identity.cuit);
  const domicilio = valueForDisplay(identity.domicilioLegal);
  return (
    <footer className="border-t bg-zinc-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/es-AR/cambios-devoluciones" className="underline" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>cambios-devoluciones</Link>
          <Link href="/es-AR/envios" className="underline" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>envios</Link>
          <Link href="/es-AR/garantia" className="underline" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>garantia</Link>
          <Link href="/es-AR/terms" className="underline" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>terms</Link>
          <Link href="/es-AR/defensa-consumidor" className="underline" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>defensa-consumidor</Link>
        </div>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-bold">botón de arrepentimiento — Ley 24.240 art.34 — 10 días para arrepentirse art 34 10d Res.424/2020 Res.244/21</p>
          <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" className="mt-2 inline-flex min-h-[44px] items-center rounded-full bg-black px-6 text-sm text-white">arrepentimiento — solicitar cancelación en 10 días</a>
          <p className="mt-2 text-sm font-semibold">0800-666-1518 — Defensa del Consumidor</p>
          <p className="text-xs text-zinc-600">
            {razonSocial} — {cuit} — {domicilio} — marbete
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          {razonSocial} {cuit} {domicilio} 0800-666-1518
        </p>
      </div>
    </footer>
  );
}