import Link from 'next/link';

export default function RegistrarSociaPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Registrar Nueva Socia</h1>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre Completo</label>
          <input className="appearance-none rounded-lg border-2 border-primary w-full py-3 px-4 text-primary leading-tight focus:outline-none focus:border-primary" type="text" placeholder="Ej: Clara Rossi" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email Institucional</label>
          <input className="appearance-none rounded-lg border-2 border-primary w-full py-3 px-4 text-primary leading-tight focus:outline-none focus:border-primary" type="email" placeholder="clara@trinobeauty.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nivel de Club</label>
          <div className="grid grid-cols-3 gap-2">
            <button className="p-3 rounded border-2 border-primary bg-primary text-on-primary">Gold VIP</button>
            <button className="p-3 rounded border-2 border-primary bg-secondary text-on-secondary-fixed">Silver Activas</button>
            <button className="p-3 rounded border-2 border-primary bg-error text-on-error-container">Bronce Nuevas</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Permisos</label>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-3 rounded border-2 border-primary bg-primary text-on-primary">Fulfillment & Picking</button>
            <button className="p-3 rounded border-2 border-primary bg-primary text-on-primary">Mesa de Despacho</button>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <Link href="/admin/usuarios" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all">
          ← Volver a Usuarios
        </Link>
        <button className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider ml-2 hover:opacity-95 active:scale-[0.99] transition-all">
          Registrar Socia
        </button>
      </div>
    </div>
  );
}