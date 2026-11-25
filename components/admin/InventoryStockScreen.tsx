/**
 * Consulta de Inventario por Código de Barras
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: trino._beauty_consulta_de_stock_por_c_digo_de_barras_mobile
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const InventoryStockScreen = () => {
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);

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
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-space-lg gap-lg flex flex-col">
        {/* Código de Barras */}
        <div className="mx-auto max-w-xl">
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Código de Barras
            </label>
            <div className="relative">
              <span className="text-on-surface-variant absolute top-1/2 left-3 -translate-y-1/2 text-[10px] uppercase">
                #
              </span>
              <input
                className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 pl-10 focus:outline-none"
                type="text"
                placeholder="Escaneá o ingresá código de barras"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <span className="material-symbols-outlined text-primary text-[20px]">search</span>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-1 gap-4">
            {results.map((item, index) => (
              <div
                key={index}
                className="bg-surface-container-low border-primary flex items-center gap-3 rounded-lg border-2 p-3"
              >
                <div className="bg-primary font-label-md text-label-md flex h-10 w-10 items-center justify-center rounded">
                  {item.code?.slice(0, 3)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-primary truncate font-bold">{item.name}</p>
                  <p className="text-on-surface-variant text-[10px]">Stock: {item.stock} u.</p>
                </div>
                <div className="w-16 text-center">
                  <span className="font-body-sm text-on-surface-variant">{item.qty}u</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
