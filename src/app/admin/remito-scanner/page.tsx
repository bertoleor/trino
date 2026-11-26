export default function RemitoScannerPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Scanner Manual de Remito</h1>

      <p className="text-body-sm mb-4 text-zinc-500">
        Tipeá los dígitos del remito físico, guía o número de orden si el láser no lee el sticker.
      </p>

      <div className="bg-surface-container-lowest mb-4 rounded-lg p-4">
        <p className="text-body-sm text-zinc-500">
          Código actual: <strong className="text-primary">TR-88219</strong>
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Pendientes
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">3</p>
          <p className="text-sm text-zinc-500">En cola de espera</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Escaneos de Hoy
          </h3>
          <p className="text-primary mt-1 text-3xl font-bold">12</p>
          <p className="text-sm text-zinc-500">Registrados hoy</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">Éxito</h3>
          <p className="text-primary mt-1 text-3xl font-bold">98%</p>
          <p className="text-sm text-zinc-500">Porcentaje de éxito</p>
        </div>
      </div>

      <div className="mt-6">
        <button className="bg-primary text-on-primary w-full rounded-lg px-4 py-3 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-95 active:scale-[0.99]">
          Iniciar Escaneo Manual
        </button>
        <div className="mt-4 text-center text-sm text-zinc-500">
          Escaneá con el leaser o ingresá manualmente el código
        </div>
      </div>
    </div>
  );
}
