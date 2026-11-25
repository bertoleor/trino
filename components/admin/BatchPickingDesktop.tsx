/** 
 * Iniciar Batch Picking - Escritorio
 * Convertido de Stitch HTML a Next.js + Tailwind
 * 
 * Referencia original: modal_iniciar_batch_picking_trino._beauty_desktop
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const BatchPickingDesktop = () => {
  const [activeOrders, setActiveOrders] = useState(14);
  const [selectedCount, setSelectedCount] = useState(0);
  const [readyCount, setReadyCount] = useState(9);

  return (
    <div className={`bg-surface font-body-md text-on-surface flex min-h-screen ${inter.className}`}>
      {/* Header */}
      <header className="border-b-2 border-primary bg-surface-container-lowest">
        <div className="h-16 px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-headline-md font-black tracking-tight text-primary">trino.</span>
            <span className="font-label-md text-label-md uppercase text-on-secondary-fixed">.HQ</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded border-2 border-primary hover:bg-secondary-fixed transition-colors" onClick={() => history.back()}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <button className="p-2.5 rounded border-2 border-primary bg-primary text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </button>
          </div>
        </header>

      <main className="p-space-lg flex flex-col gap-lg">
        {/* Estado Actual */}
        <div className="p-4 bg-surface-container-lowest border-2 border-primary rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded">
              <span className="font-label-sm text-on-primary uppercase">Mesa Activa</span>
            </div>
            <div>
              <span className="font-headline-sm font-bold text-primary">14 Órdenes</span>
              <span className="font-body-sm text-on-surface-variant">Seleccionables</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-secondary-fixed border-2 border-primary rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <span>POR ARMAR / PICKING</span>
              <span className="font-bold text-primary">14</span>
            </div>
            <p className="text-xs text-on-surface-variant">4 VIP URGENTES</p>
          </div>
          <div className="p-3 bg-surface-container-lowest border-2 border-primary rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <span>EMPACADOS / LISTOS</span>
              <span className="font-bold text-primary">09</span>
            </div>
            <p className="text-xs text-on-surface-variant">Listos para cadetería</p>
          </div>
        </div>

        {/* Selector de Órdenes */}
        <div className="p-3 bg-surface-container-lowest border-2 border-primary rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary">Seleccionar Órdenes</span>
            <input 
              className="w-4 h-4 rounded-none border-2 border-primary accent-primary cursor-pointer" 
              type="checkbox" 
              onChange={(e) => setSelectedCount(e.target.checked ? 14 : 0)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button className="flex-1 py-2 rounded bg-primary text-on-primary text-center">TODAS (14)</button>
            <button className="flex-1 py-2 rounded bg-secondary-fixed text-primary text-center">VIP (4)</button>
          </div>
        </div>

        {/* Píldoras de Filtro */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="px-3 py-1.5 rounded-full border-2 border-primary bg-surface text-on-surface font-label-md text-label-md uppercase tracking-wider hover:bg-secondary-fixed transition-all">TODOS (194)</button>
          <button className="px-3 py-1.5 rounded-full border-2 border-primary bg-primary text-on-primary font-black uppercase tracking-wider shadow-[3px_3px_0px_#1d1a21] flex items-center gap-1.5">POR ARMAR (14)</button>
          <button className="px-3 py-1.5 rounded-full border-2 border-primary bg-surface text-on-primary font-bold uppercase tracking-wider hover:bg-secondary-fixed">LISTOS PARA DESPACHO (9)</button>
          <button className="px-3 py-1.5 rounded-full border-2 border-primary bg-error-container text-on-error-container font-black uppercase tracking-wider hover:bg-error/20">INCIDENCIAS (2)</button>
        </div>

        {/* Tabla de Órdenes Pendientes */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b-2 border-primary font-label-md text-label-md uppercase tracking-wider text-primary">
                <th className="py-3 px-3 w-10 text-center"><span className="sr-only">Seleccionar</span><input className="w-3 h-3 rounded-none border-2 border-primary cursor-pointer" type="checkbox"/></th>
                <th className="py-3 px-3">Pedido</th>
                <th className="py-3 px-4">Socia / Cliente</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-surface-container transition-colors cursor-pointer">
                <td className="py-3.5 px-3 text-center"><input className="w-3 h-3 rounded-none border-2 border-primary accent-primary cursor-pointer" type="checkbox"/></td>
                <td className="py-3.5 px-3"><span className="font-bold text-primary">#TR-8942</span></td>
                <td className="py-3.5 px-4"><span className="font-bold text-primary">Valentina Morales</span></td>
                <td className="py-3.5 px-3 text-right"><span className="font-headline-sm text-[1rem] font-black text-primary">$48.200</span></td>
                <td className="py-3.5 px-3"><span className="px-2.5 py-1 rounded-full bg-tertiary-container text-tertiary-fixed border border-primary font-label-md text-[10px] font-black uppercase tracking-wider">POR ARMAR</span></td>
                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded border-2 border-primary bg-surface-container-lowest hover:bg-secondary-fixed transition-colors" title="Ver Detalle"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
                    <button className="p-1.5 rounded border-2 border-primary bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-[2px_2px_0px_#1d1a21]" title="Imprimir Etiqueta"><span className="material-symbols-outlined text-[16px]">print</span></button>
                  </div>
                </td>
              </tr>
              {/* More rows would follow... */}
            </tbody>
          </table>
        </div>

        {/* Acciones Masivas */}
        <div className="p-3 bg-surface-container-lowest border-t-2 border-primary">
          <button className="w-full py-3.5 bg-primary text-on-primary font-label-lg text-label-lg uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20x]">local_printshop</span>
            <span>IMPRIMIR TODAS LAS ETIQUETAS</span>
          </button>
          <button className="w-full py-3.5 bg-secondary-container text-on-secondary-fixed font-label-lg text-label-lg uppercase tracking-wider hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            <span>ASIGNAR RIDERS MASIVOS</span>
          </button>
        </div>
      </main>
    </div>
  );
};