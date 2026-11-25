/**
 * Dashboard de Órdenes y Despachos - Móvil
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: trino._beauty_gesti_n_de_pedidos_y_despachos_mobile
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const MobileOrdersDashboard = () => {
  const [checkAll, setCheckAll] = useState(false);
  const [activeOrders, setActiveOrders] = useState(14);
  const [kpiData] = useState({
    pending: 14,
    ready: 9,
    inTransit: 28,
    national: 45,
    delivered: 98,
  });

  return (
    <div
      className={`bg-surface font-body-md text-on-surface flex min-h-screen flex-col ${inter.className}`}
    >
      {/* Header */}
      <header className="pt-safe bg-surface/80 fixed top-0 z-50 w-full backdrop-blur-xl">
        <div className="px-margin-mobile flex h-16 items-center justify-between">
          <div className="gap-space-xs flex items-center">
            <button
              aria-label="Volver al Panel"
              className="bg-surface-container-low text-on-surface hover:bg-surface-container-high flex h-11 w-11 items-center justify-center rounded-full transition-colors"
              onClick={() => history.back()}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex flex-col">
              <div className="gap-space-xs flex items-center">
                <span className="font-label-md text-label-md text-on-surface tracking-wider uppercase">
                  HQ ADMIN
                </span>
                <span className="px-space-xs bg-secondary-container text-on-secondary-fixed font-label-md inline-flex items-center rounded-full py-[2px] text-[10px] font-bold tracking-tight uppercase">
                  <span className="bg-on-tertiary-container mr-1 h-1.5 w-1.5 animate-pulse rounded-full"></span>
                  Palermo Soho
                </span>
              </div>
              <div className="bg-surface-container-high flex items-center gap-1 rounded-full px-2.5 py-1">
                <span className="bg-on-tertiary-container h-1.5 w-1.5 animate-pulse rounded-full"></span>
                <span className="font-label-md text-label-md text-on-surface-variant max-w-[110px] truncate tracking-wider uppercase">
                  Palermo Soho
                </span>
              </div>
            </div>
            <div className="gap-space-xs flex items-center">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-surface relative flex min-h-screen w-full flex-col pt-16 pb-24">
        <div className="px-margin-mobile pb-space-2xl gap-space-md flex w-full flex-col">
          {/* Live Operations Status Banner */}
          <div className="gap-space-xs mt-space-sm flex flex-col">
            <div className="flex items-center justify-between">
              <div className="bg-primary text-on-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-[2px_2px_0px_#1d1a21]">
                <span className="bg-on-tertiary-container h-2 w-2 animate-ping rounded-full"></span>
                <span className="font-label-ticker text-[10px] tracking-wider uppercase">
                  TURNO TARDE · EN VIVO
                </span>
              </div>
              <button className="bg-surface-container-highest text-on-surface inline-flex items-center gap-1 rounded-full px-3 py-1 shadow-[2px_2px_0px_#1d1a21] transition-transform active:translate-y-0.5">
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                <span className="font-label-md text-label-md">Palermo Hub</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight uppercase">
                Fulfillment
              </h1>
              <span className="font-label-ticker text-label-ticker bg-secondary-container text-on-secondary-container rounded-sm px-2 py-0.5">
                CORTE 16:30 HS
              </span>
            </div>
          </div>

          {/* Live KPI Metrics Block Grid */}
          <div className="gap-space-xs grid grid-cols-2">
            {/* Card 1: Por Armar (Urgent) */}
            <div className="bg-primary text-on-primary relative flex flex-col overflow-hidden rounded-lg p-3 shadow-[3px_3px_0px_#1d1a21]">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-label-ticker text-tertiary-fixed-dim text-[11px] tracking-wider uppercase">
                  Por Armar
                </span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">
                  inventory
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md tracking-tight">14</span>
                <span className="font-body-sm text-tertiary-fixed-dim text-[11px] font-bold">
                  pedidos
                </span>
              </div>
              <div className="bg-error text-on-error mt-2 inline-flex items-center gap-1 self-start rounded-sm px-1.5 py-0.5">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                <span className="font-label-ticker text-[9px] tracking-wide uppercase">
                  Corte 16:30 hs
                </span>
              </div>
            </div>

            {/* Card 2: Moto Express Hoy */}
            <div className="bg-secondary-container text-on-secondary-fixed flex flex-col rounded-lg p-3 shadow-[3px_3px_0px_#1d1a21]">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-label-ticker text-on-secondary-fixed-variant text-[11px] tracking-wider uppercase">
                  Moto Express Hoy
                </span>
                <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md tracking-tight">28</span>
                <span className="font-body-sm text-on-secondary-fixed-variant text-[11px] font-bold">
                  CABA
                </span>
              </div>
              <div className="bg-primary text-on-primary mt-2 inline-flex items-center gap-1 self-start rounded-sm px-1.5 py-0.5">
                <span className="font-label-ticker text-[9px] tracking-wide uppercase">
                  SLA 98.4%
                </span>
              </div>
            </div>

            {/* Card 3: Nacional Correo */}
            <div className="bg-surface-container-high text-on-surface flex flex-col rounded-lg p-3 shadow-[3px_3px_0px_#1d1a21]">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-label-ticker text-on-surface-variant text-[11px] tracking-wider uppercase">
                  Correo Arg.
                </span>
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md tracking-tight">73</span>
                <span className="font-body-sm text-on-surface-variant text-[11px] font-bold">
                  en camino
                </span>
              </div>
              <span className="font-body-sm text-on-surface-variant mt-2 text-[10px]">
                Retiro 17:00 hs
              </span>
            </div>

            {/* Card 4: Incidencias / Alertas */}
            <div className="bg-error-container text-on-error-container flex flex-col rounded-lg p-3 shadow-[3px_3px_0px_#1d1a21]">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-label-ticker text-[11px] tracking-wider uppercase">
                  Validaciones
                </span>
                <span className="material-symbols-outlined text-error text-[18px]">warning</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-error tracking-tight">
                  2
                </span>
                <span className="font-body-sm text-on-error-container text-[11px] font-bold">
                  alertas
                </span>
              </div>
              <span className="font-body-sm text-error mt-2 text-[10px] font-bold">
                Pagos por revisar
              </span>
            </div>
          </div>

          {/* Primary Administrative CTA Bar */}
          <div className="gap-space-xs mt-1 flex flex-col">
            <button className="bg-primary text-on-primary flex w-full items-center justify-between rounded-lg px-4 py-3.5 shadow-[4px_4px_0px_#1d1a21] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#1d1a21]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[22px]">
                  bolt
                </span>
                <span className="font-headline-sm text-headline-sm tracking-tight uppercase">
                  INICIAR BATCH PICKING
                </span>
              </div>
              <span className="bg-on-tertiary text-primary font-label-ticker text-label-ticker rounded-full px-2.5 py-0.5">
                14 ORDS
              </span>
            </button>
            <div className="gap-space-xs grid grid-cols-2">
              <button className="bg-surface-container-highest text-on-surface flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 shadow-[3px_3px_0px_#1d1a21] transition-all active:translate-x-0.5 active:translate-y-0.5">
                <span className="material-symbols-outlined text-[16px]">filter</span>
                <span>FILTRAR</span>
              </button>
              <button className="bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-bold tracking-wider whitespace-nowrap uppercase shadow-[3px_3px_0px_#1d1a21] transition-all active:translate-x-0.5 active:translate-y-0.5">
                ASIGNAR RIDER EXTRA (+1)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
