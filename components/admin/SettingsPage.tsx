/**
 * Configuración de Administrador - 2FA y Cuentas de Staff
 * Convertido de Stitch HTML a Next.js + Tailwind
 *
 * Referencia original: trino._beauty_ajustes_del_administrador_desktop_alias_equipo_y_seguridad_2fa
 */

import { Inter, useState, useEffect } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const SettingsPage = () => {
  const [phone, setPhone] = useState('+54 9 11 4827-1933');
  const [email, setEmail] = useState('admin@trinobeauty.com');
  const [TwoFaEnabled, setTwoFaEnabled] = useState(true);

  useEffect(() => {
    // Inicialización de datos
    document.querySelectorAll('input[name="2faCode"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        // Validación de código 2FA
      });
    });
  }, []);

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
        {/* Configuración de 2FA */}
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Autenticación de Dos Factores
            </label>
            <div className="bg-surface-container-lowest border-primary rounded-lg border-2 p-4">
              <p className="text-body-sm text-on-surface-variant">Protege tu cuenta con 2FA</p>
              <p className="text-body-sm text-on-surface-variant">
                Número de teléfono registrado: +54 9 11 4827-1933
              </p>
              <button className="bg-primary text-on-primary flex w-full items-center justify-center gap-2 rounded-lg py-3 tracking-wider uppercase shadow-[4px_4px_0px_#1d1a21] transition-all hover:opacity-95 active:scale-[0.99]">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>Configurar 2FA</span>
              </button>
            </div>
          </div>

          {/* Cuentas de Staff */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Usuarios de Staff
            </label>
            <div className="bg-surface-container-lowest border-primary rounded-lg border-2 p-4">
              <p className="text-body-sm text-on-surface-variant">3 usuarios activos</p>
              <button className="bg-secondary-container text-on-secondary-fixed hover:bg-primary-container flex w-full items-center justify-center gap-2 rounded-lg py-3 tracking-wider uppercase transition-all">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Añadir Usuario</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
