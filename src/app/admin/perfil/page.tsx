import Link from 'next/link';

export default function PerfilPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary mx-auto">
              <span className="material-symbols-outlined text-[48px] text-on-primary">person</span>
            </div>
            <h2 className="text-xl font-bold text-primary">Administrador TRINO</h2>
          </div>
          <p className="text-body-sm text-zinc-500">Administrador del sistema e-commerce</p>
          <p className="text-body-sm text-zinc-500">Rol: Administrador</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Información de Contacto</h3>
          <p className="text-body-sm text-zinc-500">Email: admin@trinobeauty.com</p>
          <p className="text-body-sm text-zinc-500">Teléfono: +54 9 11 4827-1933</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Última Actividad</h3>
          <p className="text-body-sm text-zinc-500">Hace 15 minutos</p>
          <p className="text-body-sm text-zinc-500">Actualización de configuración de 2FA</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/ configuracion" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all">
          Configuración del Sistema
        </Link>
        <Link href="/admin/usuarios" className="inline-block bg-secondary text-on-secondary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider ml-2 hover:opacity-95 active:scale-[0.99] transition-all">
          Usuarios y Staff
        </Link>
        <button className="inline-block bg-error text-on-error rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider mt-2 hover:opacity-95 active:scale-[0.99] transition-all">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}