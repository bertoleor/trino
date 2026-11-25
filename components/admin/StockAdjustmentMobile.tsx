/** 
 * Ajuste de Stock Móvil Neo-Pop
 * Convertido de Stitch HTML a Next.js + Tailwind
 * 
 * Referencia original: modal_ajuste_r_pido_de_stock_mobile_neo_pop_oficial
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const StockAdjustmentMobile = () => {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState('');

  return (
    <div className={`bg-surface text-on-surface font-body-md text-body-md antialiased flex flex-col min-h-screen ${inter.className}`}>
      {/* Header Fijo */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
        <div className="h-16 px-gutter-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button aria-label="Volver al Panel de Gestión" className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors" onClick={() => history.back()}>
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase leading-none">Panel de Gestión</span>
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">Escaner Codigo De Barras</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="px-space-sm py-space-xs rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-label-md uppercase tracking-wider">Palermo Soho</div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-10">
          {/* Operational Subheader */}
          <section className="px-gutter-mobile py-space-sm flex flex-col gap-space-sm bg-surface-bright border-b-2 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary"><span className="material-symbols-outlined text-[18px]">tune</span></span>
                <h1 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">Ajustar Stock</h1>
              </div>
              <span className="font-label-ticker text-label-ticker text-tertiary-container bg-tertiary-fixed px-gutter-mobile py-space-xs rounded-full">trino.</span>
            </div>
          </section>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-space-xs p-1 bg-surface-container border-2 border-primary">
            <button className="flex items-center justify-center gap-space-xs py-space-xs bg-primary text-on-primary font-label-lg text-label-lg uppercase tracking-wide shadow-[2px_2px_0px_#1d1a21] transition-all" onClick={() => setMode('add')}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Agregar Stock</span>
            </button>
            <button className="flex items-center justify-center gap-space-xs py-space-xs bg-surface text-on-surface font-label-lg text-label-lg uppercase tracking-wide hover:bg-surface-variant transition-colors" onClick={() => setMode('remove')}>
              <span className="material-symbols-outlined text-[18px]">remove</span>
              <span>Restar Stock</span>
            </button>
          </div>

          {/* Location & Piso Status */}
          <div className="flex items-center justify-between px-gutter-mobile py-space-xs bg-secondary-container text-on-secondary-fixed text-body-sm font-body-sm border border-primary">
            <div className="flex items-center gap-1.5 truncate"><span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container animate-pulse inline-block"/><span className="font-bold truncate">Palermo Hub</span><span>·</span><span className="truncate">418 unidades en piso</span></div><span className="font-label-md text-label-md uppercase tracking-wider text-on-secondary-fixed-variant">Online</span>
          </div>

          {/* Stock Adjustment Form */}
          <section className="px-gutter-mobile flex flex-col gap-space-sm">
            {/* Product Selection */}
            <div className="bg-surface-container-lowest p-4 border-2 border-primary rounded-lg shadow-md mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Producto</span>
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </div>
              <div className="flex items-center gap-2">
                <input className="flex-1 bg-surface-bright border-2 border-primary rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:outline-none focus:bg-surface-container-lowest" type="text" placeholder="Buscar producto..."/>
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">search</span>
              </div>
            </div>

            {/* Quantity Control */}
            <div className="bg-surface-container-lowest p-4 border-2 border-primary rounded-lg shadow-md mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Cantidad</span>
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-12 w-12 rounded-lg bg-surface-container-lowest border-2 border-primary font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <input className="w-16 bg-surface-bright border-2 border-primary font-headline-sm text-headline-sm text-primary text-center focus:outline-none focus:bg-surface-container-lowest" type="number" min="1" value={quantity} readOnly/>
                <button className="h-12 w-12 rounded-lg bg-surface-container-lowest border-2 border-primary font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Unidades disponibles: 418</p>
            </div>

            {/* Reason & Notes */}
            <div className="bg-surface-container-lowest p-4 border-2 border-primary rounded-lg shadow-md mb-4">
              <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Motivo del Ajuste</label>
              <textarea className="w-full bg-surface-bright border-2 border-primary rounded-lg p-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowish resize-none" rows={2} placeholder="Motivo del ajuste de stock..."/>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button className="w-full py-3.5 bg-primary text-on-primary font-headline-sm text-label-lg uppercase tracking-wider border-2 border-primary shadow-[4px_4px_0px_#1d1a21] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>Ajustar Stock</span>
              </button>
              <button className="w-full py-3 bg-surface-container text-on-surface font-headline-sm text-body-md uppercase font-bold tracking-wide border-2 border-primary shadow-[3px_3px_0px_#1d1a21] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all">
                <span className="material-symbols-outlined text-[20px]">close</span>
                <span>Cancelar</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};