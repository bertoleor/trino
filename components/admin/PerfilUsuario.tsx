/**
 * Perfil de Usuario - Administrador
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: patrones de perfil de administrador
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const PerfilUsuario = () => {
  const [nombre, setNombre] = useState('Clara Rossi');
  const [email, setEmail] = useState('clara@trinobeauty.com');
  const [rol, setRol] = useState('admin');

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
        {/* Información de Perfil */}
        <div className="mx-auto max-w-2xl">
          {/* Foto de perfil */}
          <div className="mb-6 text-center">
            <div className="bg-primary mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-on-primary text-[48px]">person</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-center text-primary">
              Perfil de Administrador
            </h2>
          </div>

          {/* Datos del Usuario */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <div className="bg-surface-container-lowest border-primary rounded-lg border-2 p-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                Datos de Contacto
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-primary font-bold">Nombre:</span>
                  <span className="text-on-surface">{nombre}</span>
                </div>
                <div>
                  <span className="text-primary font-bold">Email:</span>
                  <span className="text-on-surface">{email}</span>
                </div>
              </div>
            </div>

            {/* Rol del Usuario */}
            <div className="bg-surface-container-lowest border-primary rounded-lg border-2 p-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                Rol y Permisos
              </h3>
              <div className="flex items-center gap-2">
                <span className="bg-primary text-on-primary rounded px-2 py-1 text-[10px] uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Acceso total a configuraciones, stocks, órdenes y reportes
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button className="bg-primary text-on-primary flex items-center justify-center gap-2 rounded-lg py-3 tracking-wider uppercase shadow-[4px_4px_0px_#1d1a21] transition-all hover:opacity-95 active:scale-[0.99]">
              <span className="material-symbols-outlined text-[20px]">tune</span>
              <span>Actualizar Perfil</span>
            </button>
            <button className="bg-secondary-container text-on-secondary-fixed hover:bg-primary-container flex items-center justify-center gap-2 rounded-lg py-3 tracking-wider uppercase transition-colors">
              <span className="material-symbols-outlined text-[18px]">security</span>
              <span>Seguridad de Cuenta</span>
            </button>
            <button className="bg-tertiary-container text-on-tertiary hover:bg-primary-container flex items-center justify-center gap-2 rounded-lg py-3 tracking-wider uppercase transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Historial de Sesiones */}
          <div className="bg-surface-container-lowest border-primary border-t-2 p-4">
            <h4 className="font-label-sm text-label-md text-primary mb-3 tracking-wider uppercase">
              Última actividad
            </h4>
            <div className="space-y-2">
              <div className="bg-surface-container rounded border p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">access_time</span>
                  <span className="font-body-sm text-on-surface-variant">Hace 10 minutos</span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Actualización de configuración de 2FA
                </p>
              </div>
              <div className="bg-surface-container rounded border p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span className="font-body-sm text-on-surface-variant">Hace 2 horas</span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Cierre de sesión en dispositivo móvil
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
