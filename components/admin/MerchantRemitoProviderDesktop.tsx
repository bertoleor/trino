/**
 * Ingreso de Mercader y Remito Proveedor - Escritorio
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: modal_ingreso_de_mercader_a_y_remito_proveedor_trino._beauty_desktop
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const MerchantRemitoProviderDesktop = () => {
  const [chained, setChained] = useState(false);
  const [entity, setEntity] = useState('');
  const [cbu, setCBU] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className={`bg-surface font-body-md text-on-surface flex min-h-screen ${inter.className}`}>
      {/* Header */}
      <header className="border-primary bg-surface-container-lowest border-b-2">
        <div className="px-space-lg flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-headline-md text-primary font-black tracking-tight">trino.</span>
            <span className="font-label-md text-label-md text-on-secondary-fixed uppercase">
              .HQ
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="border-primary hover:bg-secondary-fixed rounded border-2 p-2.5 transition-colors"
              onClick={() => history.back()}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <button className="border-primary bg-primary text-on-primary rounded border-2 p-2.5 transition-colors">
              <span className="material-symbols-outlined text-[18px]">save</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-space-lg gap-lg flex flex-col">
        {/* Formulario de Ingreso de Mercader */}
        <div className="mx-auto max-w-2xl">
          {/* Campo Alias de Pago */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Alias de Pago Registrado
            </label>
            <div className="relative">
              <span className="text-on-surface-variant absolute top-1/2 left-3 -translate-y-1/2 text-[10px] uppercase">
                @
              </span>
              <input
                className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 pl-10 focus:outline-none"
                type="text"
                placeholder="TRINO.BEAUTY.PAGOS"
                value={chained ? 'TRINO.BEAUTY.PAGOS' : ''}
                onChange={(e) => setCBU(e.target.value)}
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
              </div>
            </div>
          </div>

          {/* Campo CBU / CVU */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              CBU / CVU Oficial (22 dígitos)
            </label>
            <div className="relative">
              <input
                className="bg-surface-container border-primary font-body-sm text-body-sm text-primary w-full rounded-lg border-2 border-r-0 p-3 pl-3 font-bold select-all"
                readonly
                type="text"
                value={cbu || '0720194888000037194821'}
                onChange={(e) => setCBU(e.target.value)}
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  content_copy
                </span>
              </div>
              <button className="bg-primary text-on-primary border-primary hover:bg-secondary absolute top-1/2 right-0 -translate-y-1/2 rounded-lg border-2 px-3 py-2 text-[10px] font-bold uppercase transition-all">
                COPIAR
              </button>
            </div>
            <p className="text-on-surface-variant mt-1 text-xs">Formato: 22 dígitos numéricos</p>
          </div>

          {/* Campo WhatsApp */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              WhatsApp Recepción de Comprobantes
            </label>
            <input
              className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 focus:outline-none"
              type="text"
              placeholder="+54 9 11 4982-1133"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo Email Pagos */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Correo Electrónico de Recepción
            </label>
            <input
              className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 focus:outline-none"
              type="email"
              placeholder="pagos@trinobeauty.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Switch Sync Bancario */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Sync Bancario Automático
            </label>
            <div className="relative">
              <div className="bg-surface-container-low border-primary flex items-center justify-between border-2 p-3">
                <div>
                  <span className="font-label-md text-label-md text-primary leading-tight uppercase">
                    Sync Bancario Automático
                  </span>
                  <span className="font-body-sm text-on-surface-variant text-[12px]">
                    Webhook Santander en desarrollo
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input checked className="peer sr-only" type="checkbox" />
                  <div className="bg-surface-dim border-primary peer peer-checked:after:border-primary after:bg-primary after:border-primary peer-checked:bg-secondary-container h-6 w-12 border-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:border after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button className="px-space-md bg-primary text-on-primary font-label-lg text-label-lg flex flex-1 items-center justify-center gap-2 rounded-xl py-3 tracking-wider uppercase shadow-lg transition-all hover:opacity-95 active:scale-[0.99]">
              <span>GUARDAR CONFIGURACIÓN</span>
              <span className="material-symbols-outlined text-[20px]">save</span>
            </button>
            <button className="px-space-md bg-surface text-on-surface font-label-md text-label-md hover:bg-surface-container-high flex flex-1 items-center justify-center gap-2 rounded-xl py-3 tracking-wider uppercase transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
              <span>CANCELAR</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
