import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PedidosPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Panel de Órdenes</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Pedidos Pendientes</h3>
          <p className="text-3xl font-bold text-primary mt-1">14</p>
          <p className="text-sm text-zinc-500">Por armar</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Listos para Despacho</h3>
          <p className="text-3xl font-bold text-primary mt-1">09</p>
          <p className="text-sm text-zinc-500">Listos para cadetería</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Entregados Hoy</h3>
          <p className="text-3xl font-bold text-primary mt-1">98</p>
          <p className="text-sm text-zinc-500">Clientes satisfechos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-error uppercase tracking-wider">Incidencias</h3>
          <p className="text-3xl font-bold text-error mt-1">2</p>
          <p className="text-sm text-zinc-500">Pagos por revisar</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-success uppercase tracking-wider">Moto Express</h3>
          <p className="text-3xl font-bold text-success mt-1">28</p>
          <p className="text-sm text-zinc-500">En CABA</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Nacional</h3>
          <p className="text-3xl font-bold text-primary mt-1">73</p>
          <p className="text-sm text-zinc-500">En camino</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/pedidos/detalle" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider">
          Ver todo el detalle de pedidos
        </Link>
      </div>
    </div>
  );
}