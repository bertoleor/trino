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
    delivered: 98
  });

  return (
    <div className={`bg-surface font-body-md text-on-surface flex flex-col min-h-screen ${inter.className}`}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button aria-label="Volver al Panel" className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors" onClick={() => history.back()}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">HQ ADMIN</span>
                <span className="inline-flex items-center px-space-xs py-[2px] rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-[10px] uppercase font-bold tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container mr-1 animate-pulse"></span>Palermo Soho
                </span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-high rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant truncate max-w-[110px]">Palermo Soho</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
          <div className="flex flex-col w-full px-margin-mobile pb-space-2xl gap-space-md">
            
          {/* Live Operations Status Banner */}
          <div className="flex flex-col gap-space-xs mt-space-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-on-primary rounded-full shadow-[2px_2px_0px_#1d1a21]">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-ping"></span>
                <span className="font-label-ticker text-[10px] tracking-wider uppercase">TURNO TARDE · EN VIVO</span>
              </div>
              <button className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-highest text-on-surface rounded-full shadow-[2px_2px_0px_#1d1a21] active:translate-y-0.5 transition-transform">
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                <span className="font-label-md text-label-md">Palermo Hub</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface uppercase">Fulfillment</h1>
              <span className="font-label-ticker text-label-ticker px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-sm">CORTE 16:30 HS</span>
            </div>
          </div>

          {/* Live KPI Metrics Block Grid */}
          <div className="grid grid-cols-2 gap-space-xs">
            {/* Card 1: Por Armar (Urgent) */}
            <div className="flex flex-col p-3 bg-primary text-on-primary rounded-lg shadow-[3px_3px_0px_#1d1a21] relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-ticker text-[11px] text-tertiary-fixed-dim uppercase tracking-wider">Por Armar</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">inventory</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md tracking-tight">14</span>
                <span className="font-body-sm text-[11px] text-tertiary-fixed-dim font-bold">pedidos</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-error text-on-error rounded-sm self-start">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                <span className="font-label-ticker text-[9px] uppercase tracking-wide">Corte 16:30 hs</span>
              </div>
            </div>

            {/* Card 2: Moto Express Hoy */}
            <div className="flex flex-col p-3 bg-secondary-container text-on-secondary-fixed rounded-lg shadow-[3px_3px_0px_#1d1a21]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-ticker text-[11px] uppercase tracking-wider text-on-secondary-fixed-variant">Moto Express Hoy</span>
                <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md tracking-tight">28</span>
                <span className="font-body-sm text-[11px] text-on-secondary-fixed-variant font-bold">CABA</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary text-on-primary rounded-sm self-start">
                <span className="font-label-ticker text-[9px] uppercase tracking-wide">SLA 98.4%</span>
              </div>
            </div>

            {/* Card 3: Nacional Correo */}
            <div className="flex flex-col p-3 bg-surface-container-high text-on-surface rounded-lg shadow-[3px_3px_0px_#1d1a21]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-ticker text-[11px] uppercase tracking-wider text-on-surface-variant">Correo Arg.</span>
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md tracking-tight">73</span>
                <span className="font-body-sm text-[11px] text-on-surface-variant font-bold">en camino</span>
              </div>
              <span className="font-body-sm text-[10px] text-on-surface-variant mt-2">Retiro 17:00 hs</span>
            </div>

            {/* Card 4: Incidencias / Alertas */}
            <div className="flex flex-col p-3 bg-error-container text-on-error-container rounded-lg shadow-[3px_3px_0px_#1d1a21]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-ticker text-[11px] uppercase tracking-wider">Validaciones</span>
                <span className="material-symbols-outlined text-[18px] text-error">warning</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md tracking-tight text-error">2</span>
                <span className="font-body-sm text-[11px] font-bold text-on-error-container">alertas</span>
              </div>
              <span className="font-body-sm text-[10px] text-error font-bold mt-2">Pagos por revisar</span>
            </div>
          </div>

          {/* Primary Administrative CTA Bar */}
          <div className="flex flex-col gap-space-xs mt-1">
            <button className="w-full flex items-center justify-between px-4 py-3.5 bg-primary text-on-primary rounded-lg shadow-[4px_4px_0px_#1d1a21] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#1d1a21] transition-all">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-tertiary-fixed-dim">bolt</span>
                <span className="font-headline-sm text-headline-sm uppercase tracking-tight">INICIAR BATCH PICKING</span>
              </div>
              <span className="px-2.5 py-0.5 bg-on-tertiary text-primary rounded-full font-label-ticker text-label-ticker">14 ORDS</span>
            </button>
            <div className="grid grid-cols-2 gap-space-xs">
              <button className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-surface-container-highest text-on-surface rounded-lg shadow-[3px_3px_0px_#1d1a21] active:translate-x-0.5 active:translate-y-0.5 transition-all">
                <span className="material-symbols-outlined text-[16px]">filter</span>
                <span>FILTRAR</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg font-bold uppercase tracking-wider hover:bg-primary-container transition-all shadow-[3px_3px_0px_#1d1a21] active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap">
                ASIGNAR RIDER EXTRA (+1)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};