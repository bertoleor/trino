import Link from 'next/link';

export default function InventarioPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Inventario y Stock</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Productos en Stock</h3>
          <p className="text-3xl font-bold text-primary mt-1">418</p>
          <p className="text-sm text-zinc-500">Unidades en piso Palermo</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Códigos Barras</h3>
          <p className="text-3xl font-bold text-primary mt-1">284</p>
          <p className="text-sm text-zinc-500">Escaneados este mes</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Ajustes Pendientes</h3>
          <p className="text-3xl font-bold text-warning mt-1">12</p>
          <p className="text-sm text-zinc-500">Por procesar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Stock Mínimo</h3>
          <p className="text-3xl font-bold text-primary mt-1">15</p>
          <p className="text-sm text-zinc-500">Productos por reabastecer</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Ubicaciones</h3>
          <p className="text-3xl font-bold text-primary mt-1">8</p>
          <p className="text-sm text-zinc-500">Galerías en bodega</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Última Entrada</h3>
          <p className="text-3xl font-bold text-primary mt-1">Hace 2h</p>
          <p className="text-sm text-zinc-500">Producto: Gloss Oil Melocotón</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/inventario/ajustes" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider">
          Ajustes de Stock
        </Link>
        <Link href="/admin/inventario/movimientos" className="inline-block bg-secondary text-on-secondary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider ml-2">
          Movimientos
        </Link>
      </div>
    </div>
  );
}