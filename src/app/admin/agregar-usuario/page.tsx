import Link from 'next/link';

export default function AgregarUsuarioPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-6">Agregar Nuevo Usuario</h1>
      
      <form className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre Completo</label>
          <input className="appearance-none rounded-lg border-2 border-primary w-full py-3 px-4 text-primary leading-tight focus:outline-none focus:border-primary" type="text" placeholder="Ej: María González" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email Institucional</label>
          <input className="appearance-none rounded-lg border-2 border-primary w-full py-3 px-4 text-primary leading-tight focus:outline-none focus:border-primary" type="email" placeholder="maria@trinobeauty.com" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rol</label>
            <select className="appearance-none rounded-lg border-2 border-primary w-full py-3 px-4 text-primary leading-tight focus:outline-none focus:border-primary">
              <option value="admin">Administrador General</option>
              <option value="vendedor">Vendedor</option>
              <option value="fulfillment">Fulfillment & Picking</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Permisos</label>
            <select className="appearance-none rounded-lg border-2 border-primary w-full py-3 px-4 text-primary leading-tight focus:outline-none focus:border-primary">
              <option value="full">Todos los permisos</option>
              <option value="pick">Solo picking</option>
              <option value="view">Solo visualización</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Fecha de inicio</label>
          <input className="appearance-none rounded-lg border-2 border-primary w-full py-3 px-4 text-primary leading-tight focus:outline-none focus:border-primary" type="date" required />
        </div>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button className="flex-1 bg-secondary text-on-secondary rounded-lg py-3 px-4 text-sm font-medium uppercase tracking-wider hover:bg-primary text-on-primary">
          Cancelar
        </button>
        <button className="flex-1 bg-primary text-on-primary rounded-lg py-3 px-4 text-sm font-medium uppercase tracking-wider">
            Agregar Usuario
        </button>
      </div>
    </div>
  );
}