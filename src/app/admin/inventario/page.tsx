import Link from 'next/link';

export default function InventarioPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Inventario y Stock</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Productos en Stock
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">418</p>
          <p className="text-sm text-zinc-500">Unidades en piso Palermo</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Códigos Barras
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">284</p>
          <p className="text-sm text-zinc-500">Escaneados este mes</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Ajustes Pendientes
          </h3>
          <p className="text-warning mt-1 text-3xl font-bold">12</p>
          <p className="text-sm text-zinc-500">Por procesar</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Stock Mínimo
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">15</p>
          <p className="text-sm text-zinc-500">Productos por reabastecer</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Ubicaciones
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">8</p>
          <p className="text-sm text-zinc-500">Galerías en bodega</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Última Entrada
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">Hace 2h</p>
          <p className="text-sm text-zinc-500">Producto: Gloss Oil Melocotón</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/inventario/ajustes"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase"
        >
          Ajustes de Stock
        </Link>
        <Link
          href="/admin/inventario/movimientos"
          className="bg-secondary text-on-secondary ml-2 inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase"
        >
          Movimientos
        </Link>
      </div>
    </div>
  );
}
