import Link from 'next/link';

export default function RegistrarSociaPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Registrar Nueva Socia</h1>

      <form className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Nombre Completo</label>
          <input
            className="border-primary text-primary focus:border-primary w-full appearance-none rounded-lg border-2 px-4 py-3 leading-tight focus:outline-none"
            type="text"
            placeholder="Ej: Clara Rossi"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Email Institucional</label>
          <input
            className="border-primary text-primary focus:border-primary w-full appearance-none rounded-lg border-2 px-4 py-3 leading-tight focus:outline-none"
            type="email"
            placeholder="clara@trinobeauty.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Nivel de Club</label>
          <div className="grid grid-cols-3 gap-2">
            <button className="border-primary bg-primary text-on-primary rounded border-2 p-3">
              Gold VIP
            </button>
            <button className="border-primary bg-secondary text-on-secondary-fixed rounded border-2 p-3">
              Silver Activas
            </button>
            <button className="border-primary bg-error text-on-error-container rounded border-2 p-3">
              Bronce Nuevas
            </button>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Permisos</label>
          <div className="grid grid-cols-2 gap-2">
            <button className="border-primary bg-primary text-on-primary rounded border-2 p-3">
              Fulfillment & Picking
            </button>
            <button className="border-primary bg-primary text-on-primary rounded border-2 p-3">
              Mesa de Despacho
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <Link
          href="/admin/usuarios"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-95 active:scale-[0.99]"
        >
          ← Volver a Usuarios
        </Link>
        <button className="bg-primary text-on-primary ml-2 inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-95 active:scale-[0.99]">
          Registrar Socia
        </button>
      </div>
    </div>
  );
}
