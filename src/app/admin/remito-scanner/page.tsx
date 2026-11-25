import Link from 'next/link';

export default function RemitoScannerPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Scanner Manual de Remito</h1>
      
      <p className="text-body-sm text-zinc-500 mb-4">
        Tipeá los dígitos del remito físico, guía o número de orden si el láser no lee el sticker.
      </p>
      
      <div className="bg-surface-container-lowest rounded-lg p-4 mb-4">
        <p className="text-body-sm text-zinc-500">Código actual: <strong className="text-primary">TR-88219</strong></p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Pendientes</h3>
          <p className="text-3xl font-bold text-primary mt-1">3</p>
          <p className="text-sm text-zinc-500">En cola de espera</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Escaneos de Hoy</h3>
          <p className="text-3xl font-bold text-primary mt-1">12</p>
          <p className="text-sm text-zinc-500">Registrados hoy</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Éxito</h3>
          <p className="text-3xl font-bold text-primary mt-1">98%</p>
          <p className="text-sm text-zinc-500">Porcentaje de éxito</p>
        </div>
      </div>

      <div className="mt-6">
        <button className="w-full bg-primary text-on-primary rounded-lg py-3 px-4 text-sm font-medium uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all">
          Iniciar Escaneo Manual
        </button>
        <div className="mt-4 text-center text-sm text-zinc-500">
            Escaneá con el leaser o ingresá manualmente el código
        </div>
      </div>
    </div>
  );
}