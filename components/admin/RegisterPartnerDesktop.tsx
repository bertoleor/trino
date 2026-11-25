/**
 * Registrar Socia Manual - Escritorio
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: modal_registrar_socia_manual_trino._beauty_desktop
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const RegisterPartnerDesktop = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [clubLevel, setClubLevel] = useState<'gold' | 'silver' | 'bronze'>('gold');
  const [permissions, setPermissions] = useState<
    'fulfillment' | 'pickings' | 'finance' | 'catalog'
  >('fulfillment');

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
        {/* Formulario de Registro */}
        <div className="mx-auto max-w-2xl">
          {/* Campo Nombre */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Nombre Completo
            </label>
            <input
              className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 focus:outline-none"
              type="text"
              placeholder="Ej: Clara Rossi"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Campo Email */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Email Institucional
            </label>
            <input
              className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 focus:outline-none"
              type="email"
              placeholder="clara@trinobeauty.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Nivel de Club */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Nivel de Club Trino
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`border-primary rounded border-2 p-3 ${clubLevel === 'gold' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setClubLevel('gold')}
              >
                <span className="text-primary font-bold">Gold</span>
                <span className="text-[10px]">Socias VIP</span>
              </label>
              <label
                className={`border-primary rounded border-2 p-3 ${clubLevel === 'silver' ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setClubLevel('silver')}
              >
                <span className="text-secondary-fixed font-bold">Silver</span>
                <span className="text-[10px]">Socias Activas</span>
              </label>
              <label
                className={`border-primary rounded border-2 p-3 ${clubLevel === 'bronze' ? 'bg-error-container text-on-error-container' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setClubLevel('bronze')}
              >
                <span className="text-error font-bold">Bronze</span>
                <span className="text-[10px]">Socias Nuevas</span>
              </label>
            </div>
          </div>

          {/* Permisos de Acceso */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Permisos de Acceso
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'fulfillment' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('fulfillment')}
              >
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                <span>Fulfillment & Picking</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'pickings' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('pickings')}
              >
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                <span>Mesa de Despacho</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'finance' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('finance')}
              >
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
                <span>Finanzas</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'catalog' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('catalog')}
              >
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                <span>Catálogo</span>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button className="px-space-md bg-primary text-on-primary font-label-lg text-label-lg flex flex-1 items-center justify-center gap-2 rounded-xl py-3 tracking-wider uppercase shadow-lg transition-all hover:opacity-95 active:scale-[0.99]">
              <span>GUARDAR SOCIA</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
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
