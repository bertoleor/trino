import Link from 'next/link';

export default function EtiquetasPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Escaneo de Etiquetas y Remitos</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Pedientes de Despacho
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">3</p>
          <p className="text-sm text-zinc-500">En cola de espera</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Etiquetas Hoy
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">14</p>
          <p className="text-sm text-zinc-500">Generadas y listo</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Escaneos Exitosos
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">98%</p>
          <p className="text-sm text-zinc-500">Porcentaje de éxito</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Último Escaneo
          </h3>
          <p className="text-body-sm text-zinc-500">TR-88219 - Camila</p>
          <p className="text-body-sm text-zinc-500">Hace 10 minutos</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Tipos de Documentos
          </h3>
          <p className="text-body-sm text-zinc-500">Remito: 45</p>
          <p className="text-body-sm text-zinc-500">Orden: 32</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Dispositivos
          </h3>
          <p className="text-body-sm text-zinc-500">Móvil: 8</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/remito-scanner"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase"
        >
          Abrir Scanner Manual
        </Link>
      </div>
    </div>
  );
}
