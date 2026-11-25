/**
 * Crear Nuevo Drop - Escritorio
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: modal_crear_nuevo_drop_trino._beauty_desktop
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const CrearDropDesktop = () => {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [productos, setProductos] = useState([]);

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
        {/* Formulario de Drop */}
        <div className="mx-auto max-w-2xl">
          {/* Campo Nombre */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Nombre del Drop
            </label>
            <input
              className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 focus:outline-none"
              type="text"
              placeholder="Nombre de la campaña"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Fecha */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Fecha
            </label>
            <input
              className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 focus:outline-none"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {/* Productos */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Productos Incluidos
            </label>
            <div className="bg-surface-container-lowest border-primary rounded-lg border-2 p-4">
              <p className="text-body-sm text-on-surface-variant">
                Arrastra y selecciona los productos
              </p>
              <button className="bg-primary text-on-primary flex w-full items-center justify-center gap-2 rounded-lg py-3 tracking-wider uppercase shadow-[4px_4px_0px_#1d1a21] transition-all hover:opacity-95 active:scale-[0.99]">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Añadir Productos</span>
              </button>
            </div>
          </div>

          {/* Estado */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Estado
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button className="border-primary bg-primary text-on-primary rounded border-2 p-3">
                Activo
              </button>
              <button className="border-primary bg-secondary-container text-on-secondary-fixed rounded border-2 p-3">
                Programado
              </button>
              <button className="border-primary bg-tertiary-container text-on-tertiary rounded border-2 p-3">
                Finalizado
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button className="px-space-md bg-primary text-on-primary font-label-lg text-label-lg flex flex-1 items-center justify-center gap-2 rounded-xl py-3 tracking-wider uppercase shadow-lg transition-all hover:opacity-95 active:scale-[0.99]">
              <span>GUARDAR DROP</span>
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
