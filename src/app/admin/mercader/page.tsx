import Link from 'next/link';

export default function MercaderPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Mercader y Remito Proveedor</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Alias Registrado</h3>
          <p className="text-body-sm text-zinc-500">TRINO.BEAUTY.PAGOS</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">CBU/CVU</h3>
          <p className="text-body-sm text-zinc-500">0720194888000037194821</p>
          <button className="text-xs text-primary underline mt-2">Copiar CBU</button>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Sincronía Bancaria</h3>
          <p className="text-body-sm text-zinc-500">Webhook Santander: En desarrollo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">WhatsApp</h3>
          <p className="text-body-sm text-zinc-500">+54 9 11 4982-1133</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Email Pagos</h3>
          <p className="text-body-sm text-zinc-500">pagos@trinobeauty.com</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Estado</h3>
          <p className="text-body-sm text-zinc-500">Sincronización activa</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/usuarios" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all">
          ← Volver a Usuarios
        </Link>
      </div>
    </div>
  );
}