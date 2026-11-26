import Link from 'next/link';

export default function UsuariosPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Usuarios y Staff</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Staff Activo
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">3</p>
          <p className="text-sm text-zinc-500">Usuarios con acceso</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">Rol Admin</h3>
          <p className="text-primary mt-1 text-3xl font-bold">1</p>
          <p className="text-sm text-zinc-500">Super administrador</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Rol Vendedor
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">2</p>
          <p className="text-sm text-zinc-500">Acceso a catálogo y ventas</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">Permisos</h3>
          <p className="text-body-sm text-zinc-500">Fulfillment: 2</p>
          <p className="text-body-sm text-zinc-500">Picking: 2</p>
          <p className="text-body-sm text-zinc-500">Finance: 1</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Último inicio
          </h3>
          <p className="text-body-sm text-zinc-500">Hace 15 min</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Sesiones activas
          </h3>
          <p className="text-body-sm text-zinc-500">2</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/usuarios/agregar"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase"
        >
          Agregar Nuevo Usuario
        </Link>
      </div>
    </div>
  );
}
