import Link from 'next/link';
import { UserRound } from 'lucide-react';

export default function PerfilPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Mi Perfil</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <div className="mb-4 text-center">
            <div className="bg-primary mx-auto h-20 w-20 rounded-full">
              <UserRound aria-hidden="true" className="text-on-primary h-[48px] w-[48px]" />
            </div>
            <h2 className="text-primary text-xl font-bold">Administrador TRINO</h2>
          </div>
          <p className="text-body-sm text-zinc-500">Administrador del sistema e-commerce</p>
          <p className="text-body-sm text-zinc-500">Rol: Administrador</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Información de Contacto
          </h3>
          <p className="text-body-sm text-zinc-500">Email: admin@trinobeauty.com</p>
          <p className="text-body-sm text-zinc-500">Teléfono: +54 9 11 4827-1933</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Última Actividad
          </h3>
          <p className="text-body-sm text-zinc-500">Hace 15 minutos</p>
          <p className="text-body-sm text-zinc-500">Actualización de configuración de 2FA</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/ configuracion"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-95 active:scale-[0.99]"
        >
          Configuración del Sistema
        </Link>
        <Link
          href="/admin/usuarios"
          className="bg-secondary text-on-secondary ml-2 inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-95 active:scale-[0.99]"
        >
          Usuarios y Staff
        </Link>
        <button className="bg-error text-on-error mt-2 inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-95 active:scale-[0.99]">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
