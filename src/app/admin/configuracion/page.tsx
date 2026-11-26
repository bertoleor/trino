import Link from 'next/link';

export default function ConfiguracionPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Configuración del Sistema</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Autenticación
          </h3>
          <p className="text-body-sm text-zinc-500">2FA requerido: Sí</p>
          <p className="text-body-sm text-zinc-500">Intentos fallidos: 0</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Notificaciones
          </h3>
          <p className="text-body-sm text-zinc-500">Email: Activado</p>
          <p className="text-body-sm text-zinc-500">SMS: Activado</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Integraciones
          </h3>
          <p className="text-body-sm text-zinc-500">Supabase: Conectado</p>
          <p className="text-body-sm text-zinc-500">Upstash: Conectado</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Horario de Corte
          </h3>
          <p className="text-body-sm text-zinc-500">16:30 HS - Lunes a Sábado</p>
          <p className="text-body-sm text-zinc-500">Último corte: Hoy 16:25</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Zonas de Entrega
          </h3>
          <p className="text-body-sm text-zinc-500">CABA, Vicente López, San Isidro</p>
        </div>
        <div className="bg-surface-container-lowest border-primary rounded-lg border p-4">
          <h3 className="text-primary text-sm font-semibold tracking-wider uppercase">
            Modo Mantenimiento
          </h3>
          <p className="text-body-sm text-zinc-500">Desactivado</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/usuarios"
          className="bg-primary text-on-primary inline-block rounded-lg px-4 py-2 text-sm font-medium tracking-wider uppercase"
        >
          Usuarios y Staff
        </Link>
      </div>
    </div>
  );
}
