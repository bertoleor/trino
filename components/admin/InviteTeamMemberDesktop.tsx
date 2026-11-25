/**
 * Invitar Nuevo Miembro al Equipo - Escritorio
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: modal_invitar_nuevo_miembro_al_equipo_trino._beauty_desktop
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const InviteTeamMemberDesktop = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'fulfillment' | 'concierge' | 'auditor'>(
    'fulfillment'
  );
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
        {/* Formulario de Invitación */}
        <div className="mx-auto max-w-xl">
          {/* Campo Nombre */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Nombre Completo
            </label>
            <input
              className="bg-surface-bright border-primary font-body-md text-body-md text-primary focus:bg-surface-container-lowest w-full rounded-lg border-2 p-3 focus:outline-none"
              type="text"
              placeholder="Ej: Gastón Baires"
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
              placeholder="contable.gaston@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Rol de Acceso */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Rol Asignado
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`border-primary rounded border-2 p-3 ${role === 'admin' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setRole('admin')}
              >
                <span className="text-primary font-bold">ADMIN GENERAL</span>
                <span className="text-[10px]">Acceso Total</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${role === 'fulfillment' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setRole('fulfillment')}
              >
                <span className="text-primary font-bold">FULFILLMENT & PICKING</span>
                <span className="text-[10px]">Mesa de Despacho</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`border-primary rounded border-2 p-3 ${role === 'concierge' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setRole('concierge')}
              >
                <span className="text-primary font-bold">CONCIERGE & ATENCIÓN</span>
                <span className="text-[10px]">Socias y Test de Tonos</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${role === 'auditor' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setRole('auditor')}
              >
                <span className="text-primary font-bold">AUDITOR CONTABLE</span>
                <span className="text-[10px]">Solo Lectura</span>
              </div>
            </div>
          </div>

          {/* Permisos Detallados */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Permisos Detallados
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'fulfillment' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('fulfillment')}
              >
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                <span>Fulfillment & Picking</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'pickings' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('pickings')}
              >
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                <span>Mesa de Despacho</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'finance' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('finance')}
              >
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                <span>Finanzas</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'catalog' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('catalog')}
              >
                <span className="material-symbols-outlined text-[16px]">inventory</span>
                <span>Catálogo</span>
              </div>
              <div
                className={`border-primary rounded border-2 p-3 ${permissions === 'reports' ? 'bg-primary text-on-primary' : 'bg-surface-container border-primary text-on-surface'}`}
                onClick={() => setPermissions('reports')}
              >
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                <span>Reportes</span>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Información Adicional
            </label>
            <textarea
              className="bg-surface-bright border-primary font-body-sm text-body-sm text-on-surface focus:bg-surface-container-lowish w-full resize-none rounded-lg border-2 p-2 focus:outline-none"
              rows={3}
              placeholder="Motivo de la invitación y permisos especiales..."
            />
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button className="px-space-md bg-primary text-on-primary font-label-lg text-label-lg flex flex-1 items-center justify-center gap-2 rounded-xl py-3 tracking-wider uppercase shadow-lg transition-all hover:opacity-95 active:scale-[0.99]">
              <span>ENVIAR INVITACIÓN</span>
              <span className="material-symbols-outlined text-[20px]">send</span>
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
