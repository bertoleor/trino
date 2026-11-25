/**
 * Ajuste de Stock Móvil Trino (Variante)
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: modal_ajuste_r_pido_de_stock_mobile_trino._beauty
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const AjustarStockMobileTrino = () => {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className={`bg-surface font-body-md text-on-surface flex min-h-screen flex-col ${inter.className}`}
    >
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
        {/* modo selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            className="border-primary bg-primary text-on-primary rounded border-2 p-3 tracking-wider uppercase shadow-[2px_2px_0px_#1d1a21] transition-all"
            onClick={() => setMode('add')}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Agregar</span>
          </button>
          <button
            className="border-primary bg-surface text-on-surface hover:bg-surface-variant rounded border-2 p-3 tracking-wider uppercase transition-colors"
            onClick={() => setMode('remove')}
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
            <span>Restar</span>
          </button>
        </div>

        {/* producto info */}
        <div className="bg-surface-container-lowest border-primary mb-4 rounded-lg border-2 p-4">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Producto
            </span>
            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Selecciona un producto para ajustar stock
          </p>
        </div>

        {/* cantidad */}
        <div className="bg-surface-container-lowest border-primary mb-4 rounded-lg border-2 p-4">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Cantidad
            </span>
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="bg-surface-container-lowest border-primary font-headline-sm text-headline-sm flex h-12 w-12 items-center justify-center rounded-lg border-2 shadow-sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <input
              className="bg-surface-bright border-primary font-headline-sm text-headline-sm text-primary w-16 border-2 text-center focus:outline-none"
              type="number"
              min="1"
              value={quantity}
              readOnly
            />
            <button
              className="bg-surface-container-lowest border-primary font-headline-sm text-headline-sm flex h-12 w-12 items-center justify-center rounded-lg border-2 shadow-sm"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
          <p className="text-on-surface-variant text-xs">Stock actual: 418 unidades</p>
        </div>

        {/* acciones */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-primary text-on-primary flex items-center justify-center rounded-lg py-3 tracking-wider uppercase shadow-[4px_4px_0px_#1d1a21] transition-all hover:opacity-95 active:scale-[0.99]">
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span>Ajustar</span>
          </button>
          <button className="bg-surface text-on-surface hover:bg-surface-container-high flex items-center justify-center rounded-lg py-3 tracking-wider uppercase transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span>Cancelar</span>
          </button>
        </div>
      </main>
    </div>
  );
};
