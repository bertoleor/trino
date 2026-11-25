import Link from 'next/link';

export default function UsuariosPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Usuarios y Staff</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Staff Activo</h3>
          <p className="text-3xl font-bold text-primary mt-1">3</p>
          <p className="text-sm text-zinc-500">Usuarios con acceso</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Rol Admin</h3>
          <p className="text-3xl font-bold text-primary mt-1">1</p>
          <p className="text-sm text-zinc-500">Super administrador</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Rol Vendedor</h3>
          <p className="text-3xl font-bold text-primary mt-1">2</p>
          <p className="text-sm text-zinc-500">Acceso a catálogo y ventas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Permisos</h3>
          <p className="text-body-sm text-zinc-500">Fulfillment: 2</p>
          <p className="text-body-sm text-zinc-500">Picking: 2</p>
          <p className="text-body-sm text-zinc-500">Finance: 1</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Último inicio</h3>
          <p className="text-body-sm text-zinc-500">Hace 15 min</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Sesiones activas</h3>
          <p className="text-body-sm text-zinc-500">2</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/usuarios/agregar" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider">
          Agregar Nuevo Usuario
        </Link>
      </div>
    </div>
  );
}