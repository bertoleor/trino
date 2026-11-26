import Link from 'next/link';

export default function PedidosPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Panel de Órdenes</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Pedidos Pendientes
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">14</p>
          <p className="text-sm text-zinc-500">Por armar</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Listos para Despacho
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">09</p>
          <p className="text-sm text-zinc-500">Listos para cadetería</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Entregados Hoy
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">98</p>
          <p className="text-sm text-zinc-500">Clientes satisfechos</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-error text-sm font-semibold tracking-wider uppercase">Incidencias</h3>
          <p className="text-error mt-1 text-3xl font-bold">2</p>
          <p className="text-sm text-zinc-500">Pagos por revisar</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-success text-sm font-semibold tracking-wider uppercase">
            Moto Express
          </h3>
          <p className="text-success mt-1 text-3xl font-bold">28</p>
          <p className="text-sm text-zinc-500">En CABA</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">Nacional</h3>
          <p className="text-primary mt-1 text-3xl font-bold">73</p>
          <p className="text-sm text-zinc-500">En camino</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/pedidos/detalle"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase"
        >
          Ver todo el detalle de pedidos
        </Link>
      </div>
    </div>
  );
}
