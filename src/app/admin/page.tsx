import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      <p className="text-zinc-500 mb-6">
        Bienvenido al panel de control. Selecciona una de las siguientes opciones para gestionar tu tienda TRINO.
      </p>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px] text-primary">dashboard</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Resumen General</h3>
          <p className="text-sm text-zinc-500">Ver estadísticas generales</p>
        </div>
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Órdenes</h3>
          <p className="text-sm text-zinc-500">Gestionar pedidos</p>
        </div>
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">inventory</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Inventario</h3>
          <p className="text-sm text-zinc-500">Control de stock</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">person_add</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Usuarios</h3>
          <p className="text-sm text-zinc-500">Gestionar staff</p>
        </div>
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">tune</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Configuración</h3>
          <p className="text-sm text-zinc-500">Ajustes del sistema</p>
        </div>
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">barcode_reader</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Etiquetas</h3>
          <p className="text-sm text-zinc-500">Escaneos y remitos</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">crop_square</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Drops</h3>
          <p className="text-sm text-zinc-500">Campañas y promociones</p>
        </div>
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Perfil</h3>
          <p className="text-sm text-zinc-500">Configuración personal</p>
        </div>
        <div className="p-6 bg-surface-container-lowest border border-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[24px]">phone_android</span>
          </div>
          <h3 className="font-semibold text-primary uppercase tracking-wider">Remito Scanner</h3>
          <p className="text-sm text-zinc-500">Scanner manual de remitos</p>
        </div>
      </div>
    </div>
  );
}