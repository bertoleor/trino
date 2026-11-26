import {
  Crop,
  LayoutDashboard,
  Package,
  ReceiptText,
  ScanLine,
  SlidersHorizontal,
  Smartphone,
  UserRound,
  UserRoundPlus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Panel de Administración</h1>

      <p className="mb-6 text-zinc-500">
        Bienvenido al panel de control. Selecciona una de las siguientes opciones para gestionar tu
        tienda TRINO.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <LayoutDashboard aria-hidden="true" className="text-primary h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Resumen General</h3>
          <p className="text-sm text-zinc-500">Ver estadísticas generales</p>
        </div>
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <ReceiptText aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Órdenes</h3>
          <p className="text-sm text-zinc-500">Gestionar pedidos</p>
        </div>
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <Package aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Inventario</h3>
          <p className="text-sm text-zinc-500">Control de stock</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <UserRoundPlus aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Usuarios</h3>
          <p className="text-sm text-zinc-500">Gestionar staff</p>
        </div>
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <SlidersHorizontal aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Configuración</h3>
          <p className="text-sm text-zinc-500">Ajustes del sistema</p>
        </div>
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <ScanLine aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Etiquetas</h3>
          <p className="text-sm text-zinc-500">Escaneos y remitos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <Crop aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Drops</h3>
          <p className="text-sm text-zinc-500">Campañas y promociones</p>
        </div>
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <UserRound aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Perfil</h3>
          <p className="text-sm text-zinc-500">Configuración personal</p>
        </div>
        <div className="bg-surface-container-lowest border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-6 transition-colors">
          <div className="mb-3 flex items-center gap-3">
            <Smartphone aria-hidden="true" className="h-[24px] w-[24px]" />
          </div>
          <h3 className="text-primary font-semibold tracking-wider uppercase">Remito Scanner</h3>
          <p className="text-sm text-zinc-500">Scanner manual de remitos</p>
        </div>
      </div>
    </div>
  );
}
