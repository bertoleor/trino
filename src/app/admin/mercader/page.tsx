import Link from 'next/link';

export default function MercaderPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Mercader y Remito Proveedor</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Alias Registrado
          </h3>
          <p className="text-body-sm text-zinc-500">TRINO.BEAUTY.PAGOS</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">CBU/CVU</h3>
          <p className="text-body-sm text-zinc-500">0720194888000037194821</p>
          <button className="text-primary mt-2 text-xs underline">Copiar CBU</button>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Sincronía Bancaria
          </h3>
          <p className="text-body-sm text-zinc-500">Webhook Santander: En desarrollo</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">WhatsApp</h3>
          <p className="text-body-sm text-zinc-500">+54 9 11 4982-1133</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Email Pagos
          </h3>
          <p className="text-body-sm text-zinc-500">pagos@trinobeauty.com</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">Estado</h3>
          <p className="text-body-sm text-zinc-500">Sincronización activa</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/usuarios"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-95 active:scale-[0.99]"
        >
          ← Volver a Usuarios
        </Link>
      </div>
    </div>
  );
}
