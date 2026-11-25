import Link from 'next/link';

export default function DropsPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Gestión de Drops y Campañas</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Drops Activos</h3>
          <p className="text-3xl font-bold text-primary mt-1">5</p>
          <p className="text-sm text-zinc-500">Campañas vigentes</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Programados</h3>
          <p className="text-3xl font-bold text-primary mt-1">2</p>
          <p className="text-sm text-zinc-500">Fechas futuras</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Finalizados</h3>
          <p className="text-3xl font-bold text-primary mt-1">12</p>
          <p className="text-sm text-zinc-500">Campañas completadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Productos por Drop</h3>
          <p className="text-body-sm text-zinc-500">Promedio: 8 productos</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Fecha Inicio</h3>
          <p className="text-body-sm text-zinc-500">Próximo: 05/12</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Estado</h3>
          <p className="text-body-sm text-zinc-500">5 Activos, 2 Programados</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/crear-drop" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider">
            Crear Nuevo Drop
        </Link>
      </div>
    </div>
  );
}