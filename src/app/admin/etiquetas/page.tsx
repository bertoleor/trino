import Link from 'next/link';

export default function EtiquetasPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Escaneo de Etiquetas y Remitos</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Pedientes de Despacho</h3>
          <p className="text-3xl font-bold text-primary mt-1">3</p>
          <p className="text-sm text-zinc-500">En cola de espera</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Etiquetas Hoy</h3>
          <p className="text-3xl font-bold text-primary mt-1">14</p>
          <p className="text-sm text-zinc-500">Generadas y listo</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Escaneos Exitosos</h3>
          <p className="text-3xl font-bold text-primary mt-1">98%</p>
          <p className="text-sm text-zinc-500">Porcentaje de éxito</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Último Escaneo</h3>
          <p className="text-body-sm text-zinc-500">TR-88219 - Camila</p>
          <p className="text-body-sm text-zinc-500">Hace 10 minutos</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Tipos de Documentos</h3>
          <p className="text-body-sm text-zinc-500">Remito: 45</p>
          <p className="text-body-sm text-zinc-500">Orden: 32</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Dispositivos</h3>
          <p className="text-body-sm text-zinc-500">Móvil: 8</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/remito-scanner" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider">
          Abrir Scanner Manual
        </Link>
      </div>
    </div>
  );
}