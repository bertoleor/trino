import Link from 'next/link';

export default function DropsPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Gestión de Drops y Campañas</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Drops Activos
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">5</p>
          <p className="text-sm text-zinc-500">Campañas vigentes</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Programados
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">2</p>
          <p className="text-sm text-zinc-500">Fechas futuras</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Finalizados
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">12</p>
          <p className="text-sm text-zinc-500">Campañas completadas</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Productos por Drop
          </h3>
          <p className="text-body-sm text-zinc-500">Promedio: 8 productos</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Fecha Inicio
          </h3>
          <p className="text-body-sm text-zinc-500">Próximo: 05/12</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">Estado</h3>
          <p className="text-body-sm text-zinc-500">5 Activos, 2 Programados</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/crear-drop"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase"
        >
          Crear Nuevo Drop
        </Link>
      </div>
    </div>
  );
}
