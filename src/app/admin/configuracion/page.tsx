import Link from 'next/link';

export default function ConfiguracionPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Configuración del Sistema</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Autenticación</h3>
          <p className="text-body-sm text-zinc-500">2FA requerido: Sí</p>
          <p className="text-body-sm text-zinc-500">Intentos fallidos: 0</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Notificaciones</h3>
          <p className="text-body-sm text-zinc-500">Email: Activado</p>
          <p className="text-body-sm text-zinc-500">SMS: Activado</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Integraciones</h3>
          <p className="text-body-sm text-zinc-500">Supabase: Conectado</p>
          <p className="text-body-sm text-zinc-500">Upstash: Conectado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Horario de Corte</h3>
          <p className="text-body-sm text-zinc-500">16:30 HS - Lunes a Sábado</p>
          <p className="text-body-sm text-zinc-500">Último corte: Hoy 16:25</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Zonas de Entrega</h3>
          <p className="text-body-sm text-zinc-500">CABA, Vicente López, San Isidro</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-primary rounded-lg">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Modo Mantenimiento</h3>
          <p className="text-body-sm text-zinc-500">Desactivado</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/usuarios" className="inline-block bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider">
          Usuarios y Staff
        </Link>
      </div>
    </div>
  );
}