/**
 * Detalle de Pedido y Etiqueta - Escritorio
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: modal_detalle_de_pedido_etiqueta_de_env_o_trino._beauty_desktop
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const OrderDetailDesktop = () => {
  const [order, setOrder] = useState('#TR-8942');
  const [items, setItems] = useState([
    { name: '1x Gloss Oil Melocotón', qty: 1, lot: '04', sku: 'TR-GLO-08' },
    { name: '1x Lip Tint Rojo Neon', qty: 1, lot: '04', sku: 'TR-LIP-01' },
  ]);

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
              <span className="material-symbols-outlined text-[18px]">print</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-space-lg gap-lg flex flex-col">
        {/* Información de la Orden */}
        <div className="bg-surface-container-lowest border-primary mb-6 rounded-lg border-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-primary font-black tracking-tight">
                Detalle de Pedido
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                #TR-8942 - Valentina Morales
              </p>
            </div>
            <span className="bg-primary text-on-primary rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
              URGENTE
            </span>
          </div>
          {/* Checklist de Verificación */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-secondary-fixed border-primary rounded border p-2">
              <span className="font-label-sm text-on-primary uppercase">Seleccionado</span>
              <span className="bg-primary h-3 w-3 animate-pulse rounded-full"></span>
            </div>
            <div className="bg-secondary-fixed border-primary rounded border p-2">
              <span className="font-label-sm text-on-primary uppercase">Pick List</span>
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            </div>
          </div>
        </div>

        {/* Resumen de Productos */}
        <div className="mb-6 grid grid-cols-1 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-surface-container-low border-primary flex items-center gap-3 rounded-lg border-2 p-3"
            >
              <div className="bg-secondary-fixed font-label-md text-label-md flex h-10 w-10 items-center justify-center rounded">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-primary truncate font-bold">{item.name}</p>
                <p className="text-on-surface-variant text-[10px]">
                  Lote {item.lot} · SKU: {item.sku}
                </p>
              </div>
              <div className="w-16 text-center">
                <input
                  className="bg-surface-bright border-primary font-body-sm text-body-sm text-primary w-full rounded-lg border-2 p-1 focus:outline-none"
                  type="number"
                  min="1"
                  value={item.qty}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button className="px-space-md bg-primary text-on-primary font-label-lg text-label-lg flex flex-1 items-center justify-center gap-2 rounded-xl py-3 tracking-wider uppercase shadow-lg transition-all hover:opacity-95 active:scale-[0.99]">
            <span className="material-symbols-outlined text-[20px]">print</span>
            <span>IMPRIMIR ETIQUETA TÉRMICA</span>
          </button>
          <button className="px-space-md bg-secondary-container text-on-secondary-fixed font-label-md text-label-md hover:bg-primary-container flex flex-1 items-center justify-center gap-2 rounded-xl py-3 tracking-wider uppercase transition-colors">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>IMPRIMIR REMITO</span>
          </button>
          <button
            className="px-space-md bg-tertiary-container text-on-tertiary font-label-md text-label-md hover:bg-primary-container flex-1 rounded-xl py-3 tracking-wider uppercase transition-colors"
            disabled
          >
            <span className="material-symbols-outlined text-[18px]">local_printshop</span>
            <span>LOTES MASIVOS</span>
          </button>
        </div>

        {/* Historial Rápido */}
        <div className="bg-surface-container-lowest border-primary border-t-2 p-3">
          <p className="font-body-sm text-on-surface-variant text-[11px] font-medium">
            Últimas modificaciones: 14:25 · Asignado a Mesa de Picking (Almacén Central) · 14:23 ·
            Notificación enviada a socia
          </p>
        </div>
      </main>
    </div>
  );
};
